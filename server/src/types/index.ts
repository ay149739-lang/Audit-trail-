export enum EventType {
  CONTAINER_CREATED = 'CONTAINER_CREATED',
  LOADED_ON_SHIP = 'LOADED_ON_SHIP',
  TEMPERATURE_SPIKE = 'TEMPERATURE_SPIKE',
  ARRIVED_AT_PORT = 'ARRIVED_AT_PORT',
  CUSTOMS_CLEARED = 'CUSTOMS_CLEARED',
  INSPECTION_PASSED = 'INSPECTION_PASSED',
  DELIVERED = 'DELIVERED',
  MOVED_LOCATION = 'MOVED_LOCATION'
}

export interface EventPayload {
  origin?: string;
  destination?: string;
  carrier?: string;
  vessel?: string;
  location?: string;
  temperature?: number;
  humidity?: number;
  operator?: string;
  notes?: string;
  status?: string;
  [key: string]: any;
}

export interface IEvent {
  _id?: string;
  aggregateId: string;
  eventType: EventType | string;
  payload: EventPayload;
  timestamp: Date;
  version: number;
}

export interface ShipmentAggregate {
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
  updatedAt: Date;
  events: IEvent[];
}

export interface CreateShipmentCommand {
  aggregateId: string;
  origin: string;
  destination: string;
  carrier: string;
  vessel?: string;
  operator?: string;
}

export interface MoveShipmentCommand {
  aggregateId: string;
  location: string;
  vessel?: string;
  status?: string;
  operator?: string;
  notes?: string;
}

export interface RecordEventCommand {
  aggregateId: string;
  eventType: string;
  payload: EventPayload;
  operator?: string;
}
