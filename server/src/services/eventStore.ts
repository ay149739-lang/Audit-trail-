import mongoose from 'mongoose';
import { EventModel } from '../models/Event';
import { IEvent, EventType, ShipmentAggregate, EventPayload } from '../types';
import { reduceShipmentState, createInitialShipmentState } from '../domain/shipmentReducer';

// In-memory store fallback when DB is disconnected
const inMemoryStore: IEvent[] = [];

export class ConcurrencyError extends Error {
  public statusCode: number = 409;
  public aggregateId: string;
  public expectedVersion: number;
  public currentVersion: number;

  constructor(aggregateId: string, expectedVersion: number, currentVersion: number) {
    super('Shipment has been modified by another operation. Refresh the shipment and try again.');
    this.name = 'ConcurrencyError';
    this.aggregateId = aggregateId;
    this.expectedVersion = expectedVersion;
    this.currentVersion = currentVersion;
    Object.setPrototypeOf(this, ConcurrencyError.prototype);
  }
}

export class EventStoreService {
  /**
   * Append a new event to the aggregate stream.
   * Auto-increments event version and enforces append-only rule.
   * Enforces Optimistic Concurrency Control (OCC) when expectedVersion is provided.
   */
  static async appendEvent(
    aggregateId: string,
    eventType: string | EventType,
    payload: EventPayload,
    expectedVersion?: number
  ): Promise<IEvent> {
    const normalizedId = aggregateId.toUpperCase();
    const isDbConnected = mongoose.connection.readyState === 1;

    let currentVersion = 0;
    if (isDbConnected) {
      const lastEvent = await EventModel.findOne({ aggregateId: normalizedId }).sort({ version: -1 });
      if (lastEvent) {
        currentVersion = lastEvent.version;
      }
    } else {
      const aggregateEvents = inMemoryStore.filter((e) => e.aggregateId === normalizedId);
      if (aggregateEvents.length > 0) {
        currentVersion = Math.max(...aggregateEvents.map((e) => e.version));
      }
    }

    // Optimistic Concurrency Control (OCC) Validation
    if (expectedVersion !== undefined && expectedVersion !== null) {
      if (expectedVersion !== currentVersion) {
        throw new ConcurrencyError(normalizedId, expectedVersion, currentVersion);
      }
    }

    const nextVersion = currentVersion + 1;

    const eventData: IEvent = {
      aggregateId: normalizedId,
      eventType,
      payload,
      timestamp: new Date(),
      version: nextVersion,
    };

    if (isDbConnected) {
      try {
        const doc = new EventModel(eventData);
        await doc.save();
        return doc.toObject() as unknown as IEvent;
      } catch (err: any) {
        // Handle race conditions where another writer committed at the same version
        if (err.code === 11000) {
          const freshEvent = await EventModel.findOne({ aggregateId: normalizedId }).sort({ version: -1 });
          const freshVersion = freshEvent ? freshEvent.version : nextVersion;
          throw new ConcurrencyError(normalizedId, expectedVersion ?? currentVersion, freshVersion);
        }
        throw err;
      }
    } else {
      // In-memory race condition protection
      if (inMemoryStore.some((e) => e.aggregateId === normalizedId && e.version === nextVersion)) {
        const freshEvents = inMemoryStore.filter((e) => e.aggregateId === normalizedId);
        const freshVersion = Math.max(...freshEvents.map((e) => e.version));
        throw new ConcurrencyError(normalizedId, expectedVersion ?? currentVersion, freshVersion);
      }
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
   * Retrieve all events stored in memory
   */
  static async getAllEventsInMemory(): Promise<IEvent[]> {
    return [...inMemoryStore];
  }

  /**
   * Rebuild aggregate state (ShipmentAggregate) by projecting its event stream
   */
  static async getShipmentProjection(aggregateId: string): Promise<ShipmentAggregate | null> {
    const events = await this.getEventsForAggregate(aggregateId);
    if (events.length === 0) return null;

    let state = createInitialShipmentState(aggregateId, events[0]);

    for (const event of events) {
      state = reduceShipmentState(state, event);
    }

    return {
      ...state,
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
