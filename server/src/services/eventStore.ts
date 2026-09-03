import mongoose from 'mongoose';
import { EventModel } from '../models/Event';
import { IEvent, EventType, ShipmentAggregate, EventPayload } from '../types';

// In-memory store fallback when DB is disconnected
const inMemoryStore: IEvent[] = [];

export class EventStoreService {
  /**
   * Append a new event to the aggregate stream.
   * Auto-increments event version and enforces append-only rule.
   */
  static async appendEvent(
    aggregateId: string,
    eventType: string | EventType,
    payload: EventPayload
  ): Promise<IEvent> {
    const isDbConnected = mongoose.connection.readyState === 1;

    let nextVersion = 1;
    if (isDbConnected) {
      const lastEvent = await EventModel.findOne({ aggregateId }).sort({ version: -1 });
      if (lastEvent) {
        nextVersion = lastEvent.version + 1;
      }
    } else {
      const aggregateEvents = inMemoryStore.filter((e) => e.aggregateId === aggregateId);
      if (aggregateEvents.length > 0) {
        nextVersion = Math.max(...aggregateEvents.map((e) => e.version)) + 1;
      }
    }

    const eventData: IEvent = {
      aggregateId: aggregateId.toUpperCase(),
      eventType,
      payload,
      timestamp: new Date(),
      version: nextVersion,
    };

    if (isDbConnected) {
      const doc = new EventModel(eventData);
      await doc.save();
      return doc.toObject() as unknown as IEvent;
    } else {
      inMemoryStore.push(eventData);
      return eventData;
    }
  }

  /**
   * Retrieve full chronological event stream for a single aggregateId
   */
  static async getEventsForAggregate(aggregateId: string): Promise<IEvent[]> {
    const normalizedId = aggregateId.toUpperCase();
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const docs = await EventModel.find({ aggregateId: normalizedId }).sort({ version: 1 }).lean();
      return docs as unknown as IEvent[];
    } else {
      return inMemoryStore
        .filter((e) => e.aggregateId === normalizedId)
        .sort((a, b) => a.version - b.version);
    }
  }

  /**
   * Retrieve list of all unique aggregateIds
   */
  static async getAllAggregateIds(): Promise<string[]> {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const ids = await EventModel.distinct('aggregateId');
      return ids as string[];
    } else {
      const unique = Array.from(new Set(inMemoryStore.map((e) => e.aggregateId)));
      return unique;
    }
  }

  /**
   * Rebuild aggregate state (ShipmentAggregate) by projecting its event stream
   */
  static async getShipmentProjection(aggregateId: string): Promise<ShipmentAggregate | null> {
    const events = await this.getEventsForAggregate(aggregateId);
    if (events.length === 0) return null;

    let origin = 'Unknown Origin';
    let destination = 'Unknown Destination';
    let carrier = 'Global Express Logistics';
    let vessel = 'MV TransOcean';
    let currentLocation = 'In Transit';
    let status: ShipmentAggregate['status'] = 'CREATED';
    let lastTemperature: number | undefined = undefined;

    for (const event of events) {
      const p = event.payload || {};

      if (event.eventType === EventType.CONTAINER_CREATED || event.eventType === 'CONTAINER_CREATED') {
        origin = p.origin || origin;
        destination = p.destination || destination;
        carrier = p.carrier || carrier;
        vessel = p.vessel || vessel;
        currentLocation = p.origin || currentLocation;
        status = 'CREATED';
      }

      if (event.eventType === EventType.LOADED_ON_SHIP || event.eventType === 'LOADED_ON_SHIP') {
        vessel = p.vessel || vessel;
        currentLocation = p.location || `Port of ${origin}`;
        status = 'IN_TRANSIT';
      }

      if (event.eventType === EventType.MOVED_LOCATION || event.eventType === 'MOVED_LOCATION') {
        currentLocation = p.location || currentLocation;
        status = 'IN_TRANSIT';
      }

      if (event.eventType === EventType.TEMPERATURE_SPIKE || event.eventType === 'TEMPERATURE_SPIKE') {
        lastTemperature = p.temperature !== undefined ? p.temperature : lastTemperature;
        status = 'WARNING';
      }

      if (event.eventType === EventType.ARRIVED_AT_PORT || event.eventType === 'ARRIVED_AT_PORT') {
        currentLocation = p.location || destination;
        status = 'AT_PORT';
      }

      if (event.eventType === EventType.CUSTOMS_CLEARED || event.eventType === 'CUSTOMS_CLEARED') {
        status = 'CUSTOMS_CLEARED';
      }

      if (event.eventType === EventType.DELIVERED || event.eventType === 'DELIVERED') {
        currentLocation = p.location || destination;
        status = 'DELIVERED';
      }

      if (p.temperature !== undefined) {
        lastTemperature = p.temperature;
      }
    }

    const latestEvent = events[events.length - 1];

    return {
      aggregateId: aggregateId.toUpperCase(),
      origin,
      destination,
      carrier,
      vessel,
      currentLocation,
      status,
      lastTemperature,
      eventCount: events.length,
      latestVersion: latestEvent.version,
      updatedAt: latestEvent.timestamp,
      events,
    };
  }

  /**
   * Rebuild aggregate projections for all shipments in the event store
   */
  static async getAllShipmentProjections(): Promise<ShipmentAggregate[]> {
    const ids = await this.getAllAggregateIds();
    const projections: ShipmentAggregate[] = [];

    for (const id of ids) {
      const proj = await this.getShipmentProjection(id);
      if (proj) projections.push(proj);
    }

    return projections.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }
}
