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
  containerId?: string;
  cargoType?: string;
  sealNumber?: string;
  clearanceCode?: string;
  [key: string]: any;
}

export interface IEvent {
  _id?: string;
  aggregateId: string;
  eventType: string;
  payload: EventPayload;
  timestamp: string;
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
  updatedAt: string;
  events: IEvent[];
}

export interface CreateShipmentDto {
  aggregateId: string;
  origin: string;
  destination: string;
  carrier: string;
  vessel?: string;
  operator?: string;
}

export interface MoveShipmentDto {
  location: string;
  vessel?: string;
  status?: string;
  operator?: string;
  notes?: string;
}

export interface RecordEventDto {
  eventType: string;
  payload: EventPayload;
  operator?: string;
}
