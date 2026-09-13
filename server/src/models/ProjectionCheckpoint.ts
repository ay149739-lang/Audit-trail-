import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectionCheckpoint {
  projectionName: string;
  lastProcessedVersion: number;
  lastProcessedEventId?: string;
  lastProcessedTimestamp?: Date;
  updatedAt: Date;
}

export interface IProjectionCheckpointDocument extends Omit<IProjectionCheckpoint, '_id'>, Document {}

const ProjectionCheckpointSchema: Schema = new Schema(
  {
    projectionName: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    lastProcessedVersion: {
      type: Number,
      required: true,
      default: 0,
    },
    lastProcessedEventId: {
      type: String,
    },
    lastProcessedTimestamp: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const ProjectionCheckpoint = mongoose.model<IProjectionCheckpointDocument>(
  'ProjectionCheckpoint',
  ProjectionCheckpointSchema
);

// Transient in-memory store for non-DB fallback mode
export const inMemoryCheckpointStore = new Map<string, IProjectionCheckpoint>();
