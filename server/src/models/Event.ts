import mongoose, { Schema, Document } from 'mongoose';
import { IEvent } from '../types';

export interface IEventDocument extends Omit<IEvent, '_id'>, Document {}

const EventSchema: Schema = new Schema(
  {
    aggregateId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    eventType: {
      type: String,
      required: true,
      trim: true,
    },
    payload: {
      type: Schema.Types.Mixed,
      required: true,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
    version: {
      type: Number,
      required: true,
      immutable: true,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

// Ensure aggregateId + version is unique for event order integrity
EventSchema.index({ aggregateId: 1, version: 1 }, { unique: true });
EventSchema.index({ timestamp: -1 });

// Disable mutation methods to guarantee Append-Only behavior
EventSchema.pre('updateOne', function () {
  throw new Error('IMMUTABLE_STORE_VIOLATION: Updates are prohibited in an Event Store.');
});

EventSchema.pre('findOneAndUpdate', function () {
  throw new Error('IMMUTABLE_STORE_VIOLATION: Updates are prohibited in an Event Store.');
});

EventSchema.pre('deleteOne', function () {
  throw new Error('IMMUTABLE_STORE_VIOLATION: Deletions are prohibited in an Event Store.');
});

EventSchema.pre('findOneAndDelete', function () {
  throw new Error('IMMUTABLE_STORE_VIOLATION: Deletions are prohibited in an Event Store.');
});

export const EventModel = mongoose.model<IEventDocument>('Event', EventSchema);
