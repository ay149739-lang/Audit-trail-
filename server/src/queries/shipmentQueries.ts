import { EventStoreService } from '../services/eventStore';
import { ProjectionService } from '../services/projectionService';
import { ShipmentAggregate, IEvent } from '../types';
import { IShipmentReadModel } from '../models/ShipmentReadModel';
import { reduceShipmentState, createInitialShipmentState } from '../domain/shipmentReducer';

export interface PaginatedShipmentsResult {
  shipments: IShipmentReadModel[];
  total: number;
  page: number;
  limit: number;
}

export class ShipmentQueryHandler {
  /**
   * Query: Get list of all projected shipment aggregates from the Read Model
   * Eliminates N+1 database queries by returning Read Model data without querying event streams.
   * Supports optional pagination (page, limit).
   */
  static async handleGetAllShipments(page?: number, limit?: number): Promise<PaginatedShipmentsResult> {
    // Ensure recent events are projected into the Read Model
    await ProjectionService.runProjectionBatch();

    const { readModels, total } = await ProjectionService.getReadModelShipmentsPaged(page, limit);

    if (readModels.length === 0 && total === 0) {
      // Fallback if read models are completely unpopulated
      const allAggregates = await EventStoreService.getAllShipmentProjections();
      const stripped: IShipmentReadModel[] = allAggregates.map(({ events, ...rest }) => ({
        ...rest,
        lastProcessedVersion: rest.latestVersion,
      }));
      const curPage = page && page > 0 ? page : 1;
      const curLimit = limit && limit > 0 ? limit : (stripped.length || 20);
      const paginated = stripped.slice((curPage - 1) * curLimit, curPage * curLimit);
      return {
        shipments: paginated,
        total: stripped.length,
        page: curPage,
        limit: curLimit,
      };
    }

    const curPage = page && page > 0 ? page : 1;
    const curLimit = limit && limit > 0 ? limit : (total || 20);

    return {
      shipments: readModels,
      total,
      page: curPage,
      limit: curLimit,
    };
  }

  /**
   * Query: Get a single projected shipment aggregate by ID from the Read Model
   * Detailed view includes full event history for this specific shipment
   */
  static async handleGetShipmentById(aggregateId: string): Promise<ShipmentAggregate | null> {
    const normalizedId = aggregateId.toUpperCase();
    await ProjectionService.runProjectionBatch();

    let rm = await ProjectionService.getReadModelShipmentById(normalizedId);
    if (!rm) {
      // Fallback if read model not yet present
      return await EventStoreService.getShipmentProjection(normalizedId);
    }

    const events = await EventStoreService.getEventsForAggregate(normalizedId);

    return {
      aggregateId: rm.aggregateId,
      origin: rm.origin,
      destination: rm.destination,
      carrier: rm.carrier,
      vessel: rm.vessel,
      currentLocation: rm.currentLocation,
      status: rm.status,
      lastTemperature: rm.lastTemperature,
      eventCount: rm.eventCount,
      latestVersion: rm.latestVersion,
      updatedAt: rm.updatedAt,
      events,
    };
  }

  /**
   * Query: Get raw chronological immutable events stream for a shipment
   */
  static async handleGetShipmentEvents(aggregateId: string): Promise<IEvent[]> {
    return await EventStoreService.getEventsForAggregate(aggregateId);
  }

  /**
   * Query: Reconstruct historical state of a shipment at a specified version or timestamp (State Scrubbing)
   * Uses the single source of truth reduceShipmentState domain reducer.
   * MUST NOT modify the Event Store or the Read Model.
   */
  static async handleGetShipmentStateAt(
    aggregateId: string,
    targetVersion?: number,
    targetTimestamp?: string
  ): Promise<(ShipmentAggregate & { isHistorical: boolean; requestedVersion?: number; requestedTimestamp?: string }) | null> {
    const normalizedId = aggregateId.toUpperCase();
    const allEvents = await EventStoreService.getEventsForAggregate(normalizedId);

    if (allEvents.length === 0) return null;

    // Filter events up to target version or timestamp
    let filteredEvents = allEvents;

    if (targetVersion !== undefined && !isNaN(targetVersion)) {
      filteredEvents = allEvents.filter((e) => e.version <= targetVersion);
    } else if (targetTimestamp) {
      const targetTime = new Date(targetTimestamp).getTime();
      filteredEvents = allEvents.filter((e) => new Date(e.timestamp).getTime() <= targetTime);
    }

    if (filteredEvents.length === 0) return null;

    // Fold/replay filtered events using shared pure domain reducer
    let state = createInitialShipmentState(normalizedId, filteredEvents[0]);
    for (const event of filteredEvents) {
      state = reduceShipmentState(state, event);
    }

    return {
      ...state,
      events: filteredEvents,
      isHistorical: true,
      requestedVersion: targetVersion,
      requestedTimestamp: targetTimestamp,
    };
  }
}
