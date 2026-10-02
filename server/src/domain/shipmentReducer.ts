import { EventType, IEvent } from '../types';

export interface ShipmentState {
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
  lastProcessedVersion?: number;
  updatedAt: Date;
}

/**
 * Creates a default initial state for a new shipment aggregate before any events are applied
 */
export function createInitialShipmentState(aggregateId: string, event?: IEvent): ShipmentState {
  const p = event?.payload || {};
  return {
    aggregateId: aggregateId.toUpperCase(),
    origin: p.origin || 'Unknown Origin',
    destination: p.destination || 'Unknown Destination',
    carrier: p.carrier || 'Global Express Logistics',
    vessel: p.vessel || 'MV TransOcean',
    currentLocation: p.origin || 'In Transit',
    status: 'CREATED',
    lastTemperature: p.temperature !== undefined ? Number(p.temperature) : undefined,
    eventCount: 0,
    latestVersion: 0,
    lastProcessedVersion: 0,
    updatedAt: event?.timestamp ? new Date(event.timestamp) : new Date(),
  };
}

/**
 * Single Source of Truth for Pure Event-to-State Reduction across:
 * 1. Read Model Projection (ProjectionService)
 * 2. Event Store Aggregate Reconstruction (EventStoreService)
 * 3. Historical Point-in-Time Scrubbing (ShipmentQueryHandler)
 */
export function reduceShipmentState(currentState: ShipmentState, event: IEvent): ShipmentState {
  const p = event.payload || {};
  const eventTypeStr = String(event.eventType);

  // Return a fresh cloned state to guarantee pure function contract
  const nextState: ShipmentState = { ...currentState };

  if (eventTypeStr === EventType.CONTAINER_CREATED || eventTypeStr === 'CONTAINER_CREATED') {
    nextState.origin = p.origin || nextState.origin;
    nextState.destination = p.destination || nextState.destination;
    nextState.carrier = p.carrier || nextState.carrier;
    nextState.vessel = p.vessel || nextState.vessel;
    nextState.currentLocation = p.origin || nextState.currentLocation;
    nextState.status = 'CREATED';
  } else if (eventTypeStr === EventType.LOADED_ON_SHIP || eventTypeStr === 'LOADED_ON_SHIP') {
    nextState.vessel = p.vessel || nextState.vessel;
    nextState.currentLocation = p.location || `Port of ${nextState.origin}`;
    nextState.status = 'IN_TRANSIT';
  } else if (eventTypeStr === EventType.MOVED_LOCATION || eventTypeStr === 'MOVED_LOCATION') {
    nextState.currentLocation = p.location || nextState.currentLocation;
    nextState.status = 'IN_TRANSIT';
  } else if (eventTypeStr === EventType.TEMPERATURE_SPIKE || eventTypeStr === 'TEMPERATURE_SPIKE') {
    if (p.temperature !== undefined) {
      nextState.lastTemperature = Number(p.temperature);
    }
    nextState.status = 'WARNING';
  } else if (eventTypeStr === EventType.ARRIVED_AT_PORT || eventTypeStr === 'ARRIVED_AT_PORT') {
    nextState.currentLocation = p.location || nextState.destination;
    nextState.status = 'AT_PORT';
  } else if (eventTypeStr === EventType.CUSTOMS_CLEARED || eventTypeStr === 'CUSTOMS_CLEARED') {
    nextState.status = 'CUSTOMS_CLEARED';
  } else if (eventTypeStr === EventType.INSPECTION_PASSED || eventTypeStr === 'INSPECTION_PASSED') {
    nextState.status = (p.status as ShipmentState['status']) || 'CUSTOMS_CLEARED';
  } else if (eventTypeStr === EventType.DELIVERED || eventTypeStr === 'DELIVERED') {
    nextState.currentLocation = p.location || nextState.destination;
    nextState.status = 'DELIVERED';
  }

  // Any event payload with a temperature reading updates the sensor telemetry cache
  if (p.temperature !== undefined) {
    nextState.lastTemperature = Number(p.temperature);
  }

  nextState.eventCount = (nextState.eventCount || 0) + 1;
  nextState.latestVersion = Math.max(nextState.latestVersion || 0, event.version);
  nextState.lastProcessedVersion = event.version;
  nextState.updatedAt = event.timestamp ? new Date(event.timestamp) : new Date();

  return nextState;
}
