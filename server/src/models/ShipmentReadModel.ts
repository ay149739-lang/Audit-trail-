import mongoose, { Schema, Document } from 'mongoose';
import { ShipmentAggregate } from '../types';

export interface IShipmentReadModel {
  aggregateId: string;
  origin: string;
  destination: string;
  carrier: string;
  vessel?: string;
  currentLocation: string;
  status: 'CREATED' | 'IN_TRANSIT' | 'AT_PORT' | 'CUSTOMS_CLEARED' | 'DELIVERED' | 'WARNING';
  lastTemperature?: number;
  eventCount: number;
  latestVersion: number;
  lastProcessedVersion: number;
  updatedAt: Date;
}

export interface IShipmentReadModelDocument extends Omit<IShipmentReadModel, '_id'>, Document {}

const ShipmentReadModelSchema: Schema = new Schema(
  {
    aggregateId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    origin: {
      type: String,
      required: true,
      default: 'Unknown Origin',
    },
    destination: {
      type: String,
      required: true,
      default: 'Unknown Destination',
    },
    carrier: {
      type: String,
      required: true,
      default: 'Global Express Logistics',
    },
    vessel: {
      type: String,
      default: 'MV TransOcean',
    },
    currentLocation: {
      type: String,
      required: true,
      default: 'In Transit',
    },
    status: {
      type: String,
      enum: ['CREATED', 'IN_TRANSIT', 'AT_PORT', 'CUSTOMS_CLEARED', 'DELIVERED', 'WARNING'],
      required: true,
      default: 'CREATED',
    },
    lastTemperature: {
      type: Number,
    },
    eventCount: {
      type: Number,
      required: true,
      default: 0,
    },
    latestVersion: {
      type: Number,
      required: true,
      default: 0,
    },
    lastProcessedVersion: {
      type: Number,
      required: true,
      default: 0,
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

export const ShipmentReadModel = mongoose.model<IShipmentReadModelDocument>(
  'ShipmentReadModel',
  ShipmentReadModelSchema
);

// Transient in-memory store for non-DB fallback mode
export const inMemoryReadModelStore = new Map<string, IShipmentReadModel>();
