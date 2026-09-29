import mongoose from 'mongoose';
import { EventModel } from '../models/Event';
import { ShipmentReadModel, inMemoryReadModelStore, IShipmentReadModel } from '../models/ShipmentReadModel';
import { ProjectionCheckpoint, inMemoryCheckpointStore, IProjectionCheckpoint } from '../models/ProjectionCheckpoint';
import { IEvent, EventType } from '../types';
import { EventStoreService } from './eventStore';
import { reduceShipmentState, createInitialShipmentState } from '../domain/shipmentReducer';

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
   * Returns true if the event was projected, false if skipped by idempotency guard
   */
  static async projectEvent(event: IEvent): Promise<boolean> {
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

    // Idempotency Guard: Skip if this event version was already applied to the read model
    if (readModel && readModel.lastProcessedVersion !== undefined && event.version <= readModel.lastProcessedVersion) {
      return false;
    }

    if (!readModel) {
      readModel = createInitialShipmentState(aggregateId, event) as IShipmentReadModel;
    }

    // Apply deterministic projection state rules via shared domain reducer
    const updatedState = reduceShipmentState(readModel, event);
    readModel = {
      ...readModel,
      ...updatedState,
      lastProcessedVersion: event.version,
    };

    if (isDbConnected) {
      await ShipmentReadModel.findOneAndUpdate({ aggregateId }, readModel, { upsert: true, new: true });
    } else {
      inMemoryReadModelStore.set(aggregateId, readModel);
    }

    return true;
  }

  /**
   * Run projection worker batch: fetch unprojected events & update Read Model + Checkpoint
   */
  static async runProjectionBatch(): Promise<number> {
    const isDbConnected = mongoose.connection.readyState === 1;
    const checkpoint = await this.getCheckpoint();

    let allEvents: IEvent[] = [];
    const lastCheckTime = checkpoint.lastProcessedTimestamp ? new Date(checkpoint.lastProcessedTimestamp).getTime() : 0;

    if (isDbConnected) {
      const query: any = {};
      if (checkpoint.lastProcessedTimestamp && lastCheckTime > 0) {
        query.timestamp = { $gte: new Date(checkpoint.lastProcessedTimestamp) };
      }
      const docs = await EventModel.find(query).sort({ timestamp: 1, version: 1 }).lean();
      allEvents = docs as unknown as IEvent[];
    } else {
      allEvents = await EventStoreService.getAllEventsInMemory();
    }

    // Sort events chronologically
    const sortedEvents = allEvents.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    let processedCount = 0;
    let maxVersion = checkpoint.lastProcessedVersion;
    let lastEventId: string | undefined = checkpoint.lastProcessedEventId;
    let lastTimestamp: Date | undefined = checkpoint.lastProcessedTimestamp;

    for (const event of sortedEvents) {
      const eventTime = new Date(event.timestamp).getTime();
      const eventId = (event as any)._id ? String((event as any)._id) : `${event.aggregateId}-${event.version}`;

      if (eventTime < lastCheckTime) continue;

      try {
        const wasProjected = await this.projectEvent(event);
        if (wasProjected) {
          processedCount++;
          maxVersion = Math.max(maxVersion, event.version);
          lastEventId = eventId;
          lastTimestamp = new Date(event.timestamp);
        }
      } catch (err: any) {
        console.error(`[ProjectionService] Error projecting event ${eventId} for aggregate ${event.aggregateId}:`, err);
        break;
      }
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
   * Fetch paginated shipments from Read Model collection/store
   */
  static async getReadModelShipmentsPaged(
    page?: number,
    limit?: number
  ): Promise<{ readModels: IShipmentReadModel[]; total: number }> {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const total = await ShipmentReadModel.countDocuments({});
      let query = ShipmentReadModel.find({}).sort({ updatedAt: -1 });
      if (page !== undefined && limit !== undefined) {
        const p = Math.max(1, page);
        const l = Math.max(1, limit);
        const skip = (p - 1) * l;
        query = query.skip(skip).limit(l);
      } else if (limit !== undefined) {
        query = query.limit(Math.max(1, limit));
      }
      const docs = await query.lean();
      return { readModels: docs as unknown as IShipmentReadModel[], total };
    } else {
      const all = Array.from(inMemoryReadModelStore.values()).sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      const total = all.length;
      if (page !== undefined && limit !== undefined) {
        const p = Math.max(1, page);
        const l = Math.max(1, limit);
        const skip = (p - 1) * l;
        return { readModels: all.slice(skip, skip + l), total };
      } else if (limit !== undefined) {
        return { readModels: all.slice(0, Math.max(1, limit)), total };
      }
      return { readModels: all, total };
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
