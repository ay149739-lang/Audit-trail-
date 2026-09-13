import mongoose from 'mongoose';
import { EventModel } from '../models/Event';
import { ShipmentReadModel, inMemoryReadModelStore, IShipmentReadModel } from '../models/ShipmentReadModel';
import { ProjectionCheckpoint, inMemoryCheckpointStore, IProjectionCheckpoint } from '../models/ProjectionCheckpoint';
import { IEvent, EventType } from '../types';
import { EventStoreService } from './eventStore';

const PROJECTION_NAME = 'ShipmentReadModel';

export class ProjectionService {
  /**
   * Get the last saved projection checkpoint
   */
  static async getCheckpoint(): Promise<IProjectionCheckpoint> {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      let checkpoint = await ProjectionCheckpoint.findOne({ projectionName: PROJECTION_NAME });
      if (!checkpoint) {
        checkpoint = await ProjectionCheckpoint.create({
          projectionName: PROJECTION_NAME,
          lastProcessedVersion: 0,
          lastProcessedTimestamp: new Date(0),
          updatedAt: new Date(),
        });
      }
      return checkpoint.toObject() as unknown as IProjectionCheckpoint;
    } else {
      let checkpoint = inMemoryCheckpointStore.get(PROJECTION_NAME);
      if (!checkpoint) {
        checkpoint = {
          projectionName: PROJECTION_NAME,
          lastProcessedVersion: 0,
          lastProcessedTimestamp: new Date(0),
          updatedAt: new Date(),
        };
        inMemoryCheckpointStore.set(PROJECTION_NAME, checkpoint);
      }
      return checkpoint;
    }
  }

  /**
   * Update projection checkpoint
   */
  static async updateCheckpoint(lastVersion: number, lastEventId?: string, lastTimestamp?: Date): Promise<void> {
    const isDbConnected = mongoose.connection.readyState === 1;
    const timestamp = lastTimestamp || new Date();

    if (isDbConnected) {
      await ProjectionCheckpoint.findOneAndUpdate(
        { projectionName: PROJECTION_NAME },
        {
          lastProcessedVersion: lastVersion,
          lastProcessedEventId: lastEventId,
          lastProcessedTimestamp: timestamp,
          updatedAt: new Date(),
        },
        { upsert: true, new: true }
      );
    } else {
      inMemoryCheckpointStore.set(PROJECTION_NAME, {
        projectionName: PROJECTION_NAME,
        lastProcessedVersion: lastVersion,
        lastProcessedEventId: lastEventId,
        lastProcessedTimestamp: timestamp,
        updatedAt: new Date(),
      });
    }
  }

  /**
   * Project a single event onto the Read Model deterministically
   */
  static async projectEvent(event: IEvent): Promise<void> {
    const isDbConnected = mongoose.connection.readyState === 1;
    const aggregateId = event.aggregateId.toUpperCase();
    const p = event.payload || {};

    let readModel: IShipmentReadModel | null = null;

    if (isDbConnected) {
      const doc = await ShipmentReadModel.findOne({ aggregateId });
      if (doc) {
        readModel = doc.toObject() as IShipmentReadModel;
      }
    } else {
      readModel = inMemoryReadModelStore.get(aggregateId) || null;
    }

    if (!readModel) {
      readModel = {
        aggregateId,
        origin: p.origin || 'Unknown Origin',
        destination: p.destination || 'Unknown Destination',
        carrier: p.carrier || 'Global Express Logistics',
        vessel: p.vessel || 'MV TransOcean',
        currentLocation: p.origin || 'In Transit',
        status: 'CREATED',
        lastTemperature: p.temperature !== undefined ? p.temperature : undefined,
        eventCount: 0,
        latestVersion: event.version,
        lastProcessedVersion: event.version,
        updatedAt: event.timestamp ? new Date(event.timestamp) : new Date(),
      };
    }

    // Apply deterministic projection state rules
    const eventTypeStr = String(event.eventType);

    if (eventTypeStr === EventType.CONTAINER_CREATED || eventTypeStr === 'CONTAINER_CREATED') {
      readModel.origin = p.origin || readModel.origin;
      readModel.destination = p.destination || readModel.destination;
      readModel.carrier = p.carrier || readModel.carrier;
      readModel.vessel = p.vessel || readModel.vessel;
      readModel.currentLocation = p.origin || readModel.currentLocation;
      readModel.status = 'CREATED';
    } else if (eventTypeStr === EventType.LOADED_ON_SHIP || eventTypeStr === 'LOADED_ON_SHIP') {
      readModel.vessel = p.vessel || readModel.vessel;
      readModel.currentLocation = p.location || `Port of ${readModel.origin}`;
      readModel.status = 'IN_TRANSIT';
    } else if (eventTypeStr === EventType.MOVED_LOCATION || eventTypeStr === 'MOVED_LOCATION') {
      readModel.currentLocation = p.location || readModel.currentLocation;
      readModel.status = 'IN_TRANSIT';
    } else if (eventTypeStr === EventType.TEMPERATURE_SPIKE || eventTypeStr === 'TEMPERATURE_SPIKE') {
      if (p.temperature !== undefined) {
        readModel.lastTemperature = p.temperature;
      }
      readModel.status = 'WARNING';
    } else if (eventTypeStr === EventType.ARRIVED_AT_PORT || eventTypeStr === 'ARRIVED_AT_PORT') {
      readModel.currentLocation = p.location || readModel.destination;
      readModel.status = 'AT_PORT';
    } else if (eventTypeStr === EventType.CUSTOMS_CLEARED || eventTypeStr === 'CUSTOMS_CLEARED') {
      readModel.status = 'CUSTOMS_CLEARED';
    } else if (eventTypeStr === EventType.INSPECTION_PASSED || eventTypeStr === 'INSPECTION_PASSED') {
      readModel.status = (p.status as IShipmentReadModel['status']) || readModel.status || 'CUSTOMS_CLEARED';
    } else if (eventTypeStr === EventType.DELIVERED || eventTypeStr === 'DELIVERED') {
      readModel.currentLocation = p.location || readModel.destination;
      readModel.status = 'DELIVERED';
    }

    if (p.temperature !== undefined) {
      readModel.lastTemperature = p.temperature;
    }

    readModel.eventCount = (readModel.eventCount || 0) + 1;
    readModel.latestVersion = Math.max(readModel.latestVersion || 0, event.version);
    readModel.lastProcessedVersion = event.version;
    readModel.updatedAt = event.timestamp ? new Date(event.timestamp) : new Date();

    if (isDbConnected) {
      await ShipmentReadModel.findOneAndUpdate({ aggregateId }, readModel, { upsert: true, new: true });
    } else {
      inMemoryReadModelStore.set(aggregateId, readModel);
    }
  }

  /**
   * Run projection worker batch: fetch unprojected events & update Read Model + Checkpoint
   */
  static async runProjectionBatch(): Promise<number> {
    const isDbConnected = mongoose.connection.readyState === 1;
    const checkpoint = await this.getCheckpoint();

    let allEvents: IEvent[] = [];

    if (isDbConnected) {
      const docs = await EventModel.find({}).sort({ timestamp: 1, version: 1 }).lean();
      allEvents = docs as unknown as IEvent[];
    } else {
      allEvents = await EventStoreService.getAllEventsInMemory();
    }

    // Filter events after checkpoint timestamp / version
    const lastCheckTime = checkpoint.lastProcessedTimestamp ? new Date(checkpoint.lastProcessedTimestamp).getTime() : 0;
    
    // Sort all events chronologically
    const sortedEvents = allEvents.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    let processedCount = 0;
    let maxVersion = checkpoint.lastProcessedVersion;
    let lastEventId: string | undefined = checkpoint.lastProcessedEventId;
    let lastTimestamp: Date | undefined = checkpoint.lastProcessedTimestamp;

    for (const event of sortedEvents) {
      const eventTime = new Date(event.timestamp).getTime();
      const eventId = (event as any)._id ? String((event as any)._id) : `${event.aggregateId}-${event.version}`;

      // Skip already processed events
      if (eventTime < lastCheckTime) continue;
      if (eventTime === lastCheckTime && eventId === checkpoint.lastProcessedEventId) continue;

      await this.projectEvent(event);

      processedCount++;
      maxVersion = Math.max(maxVersion, event.version);
      lastEventId = eventId;
      lastTimestamp = new Date(event.timestamp);
    }

    if (processedCount > 0) {
      await this.updateCheckpoint(maxVersion, lastEventId, lastTimestamp);
    }

    return processedCount;
  }

  /**
   * Rebuild all read models from scratch (useful for initial worker boot or re-indexing)
   */
  static async rebuildAllReadModels(): Promise<void> {
    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected) {
      await ShipmentReadModel.deleteMany({});
      await ProjectionCheckpoint.deleteMany({});
    } else {
      inMemoryReadModelStore.clear();
      inMemoryCheckpointStore.clear();
    }

    await this.runProjectionBatch();
  }

  /**
   * Fetch all shipments from Read Model collection/store
   */
  static async getReadModelShipments(): Promise<IShipmentReadModel[]> {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const docs = await ShipmentReadModel.find({}).sort({ updatedAt: -1 }).lean();
      return docs as unknown as IShipmentReadModel[];
    } else {
      return Array.from(inMemoryReadModelStore.values()).sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    }
  }

  /**
   * Fetch a single shipment from Read Model collection/store
   */
  static async getReadModelShipmentById(aggregateId: string): Promise<IShipmentReadModel | null> {
    const normalizedId = aggregateId.toUpperCase();
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const doc = await ShipmentReadModel.findOne({ aggregateId: normalizedId }).lean();
      return doc as unknown as IShipmentReadModel | null;
    } else {
      return inMemoryReadModelStore.get(normalizedId) || null;
    }
  }
}
