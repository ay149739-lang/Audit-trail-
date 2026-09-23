import { EventStoreService } from '../services/eventStore';
import { ProjectionService } from '../services/projectionService';
import { ShipmentAggregate, IEvent, EventType } from '../types';

export class ShipmentQueryHandler {
  /**
   * Query: Get list of all projected shipment aggregates from the Read Model
   */
  static async  handleGetAllShipments(): Promise<ShipmentAggregate[]> {
    // Ensure recent events are projected into the Read Model
    await ProjectionService.runProjectionBatch();

    const readModels = await ProjectionService.getReadModelShipments(); 

    if (readModels.length === 0) {
      // Fallback if read models are empty
      return await EventStoreService.getAllShipmentProjections();
    }

    const result: ShipmentAggregate[] = [];
    for (const rm of readModels) {
      const events = await EventStoreService.getEventsForAggregate(rm.aggregateId);
      result.push({
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
      });
    }

    return result;
  }

  /**
   * Query: Get a single projected shipment aggregate by ID from the Read Model
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

    // Fold/replay filtered events to calculate historical state
    let origin = 'Unknown Origin';
    let destination = 'Unknown Destination';
    let carrier = 'Global Express Logistics';
    let vessel = 'MV TransOcean';
    let currentLocation = 'In Transit';
    let status: ShipmentAggregate['status'] = 'CREATED';
    let lastTemperature: number | undefined = undefined;

    for (const event of filteredEvents) {
      const p = event.payload || {};
      const eventTypeStr = String(event.eventType);

      if (eventTypeStr === EventType.CONTAINER_CREATED || eventTypeStr === 'CONTAINER_CREATED') {
        origin = p.origin || origin;
        destination = p.destination || destination;
        carrier = p.carrier || carrier;
        vessel = p.vessel || vessel;
        currentLocation = p.origin || currentLocation;
        status = 'CREATED';
      } else if (eventTypeStr === EventType.LOADED_ON_SHIP || eventTypeStr === 'LOADED_ON_SHIP') {
        vessel = p.vessel || vessel;
        currentLocation = p.location || `Port of ${origin}`;
        status = 'IN_TRANSIT';
      } else if (eventTypeStr === EventType.MOVED_LOCATION || eventTypeStr === 'MOVED_LOCATION') {
        currentLocation = p.location || currentLocation;
        status = 'IN_TRANSIT';
      } else if (eventTypeStr === EventType.TEMPERATURE_SPIKE || eventTypeStr === 'TEMPERATURE_SPIKE') {
        if (p.temperature !== undefined) lastTemperature = p.temperature;
        status = 'WARNING';
      } else if (eventTypeStr === EventType.ARRIVED_AT_PORT || eventTypeStr === 'ARRIVED_AT_PORT') {
        currentLocation = p.location || destination;
        status = 'AT_PORT';
      } else if (eventTypeStr === EventType.CUSTOMS_CLEARED || eventTypeStr === 'CUSTOMS_CLEARED') {
        status = 'CUSTOMS_CLEARED';
      } else if (eventTypeStr === EventType.INSPECTION_PASSED || eventTypeStr === 'INSPECTION_PASSED') {
        status = (p.status as ShipmentAggregate['status']) || status || 'CUSTOMS_CLEARED';
      } else if (eventTypeStr === EventType.DELIVERED || eventTypeStr === 'DELIVERED') {
        currentLocation = p.location || destination;
        status = 'DELIVERED';
      }

      if (p.temperature !== undefined) {
        lastTemperature = p.temperature;
      }
    }

    const latestFilteredEvent = filteredEvents[filteredEvents.length - 1];

    return {
      aggregateId: normalizedId,
      origin,
      destination,
      carrier,
      vessel,
      currentLocation,
      status,
      lastTemperature,
      eventCount: filteredEvents.length,
      latestVersion: latestFilteredEvent.version,
      updatedAt: latestFilteredEvent.timestamp,
      events: filteredEvents,
      isHistorical: true,
      requestedVersion: targetVersion,
      requestedTimestamp: targetTimestamp,
    };
  }
}
