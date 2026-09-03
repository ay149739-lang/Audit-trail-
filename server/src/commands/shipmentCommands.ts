import { EventStoreService } from '../services/eventStore';
import {
  CreateShipmentCommand,
  MoveShipmentCommand,
  RecordEventCommand,
  EventType,
  IEvent,
} from '../types';

export class ShipmentCommandHandler {
  /**
   * Command: Create a new shipment aggregate
   */
  static async handleCreateShipment(cmd: CreateShipmentCommand): Promise<IEvent> {
    if (!cmd.aggregateId) throw new Error('Shipment aggregateId is required');

    const existingEvents = await EventStoreService.getEventsForAggregate(cmd.aggregateId);
    if (existingEvents.length > 0) {
      throw new Error(`Shipment ${cmd.aggregateId} already exists`);
    }

    const payload = {
      origin: cmd.origin || 'Port of Shanghai',
      destination: cmd.destination || 'Port of Rotterdam',
      carrier: cmd.carrier || 'Maersk Ocean Logistics',
      vessel: cmd.vessel || 'MV Atlantic Horizon',
      operator: cmd.operator || 'System Dispatch',
      status: 'CREATED',
    };

    return await EventStoreService.appendEvent(cmd.aggregateId, EventType.CONTAINER_CREATED, payload);
  }

  /**
   * Command: Record location movement for a shipment
   */
  static async handleMoveShipment(cmd: MoveShipmentCommand): Promise<IEvent> {
    if (!cmd.aggregateId) throw new Error('Shipment aggregateId is required');
    if (!cmd.location) throw new Error('Target location is required');

    const existingEvents = await EventStoreService.getEventsForAggregate(cmd.aggregateId);
    if (existingEvents.length === 0) {
      throw new Error(`Shipment ${cmd.aggregateId} does not exist`);
    }

    const payload = {
      location: cmd.location,
      vessel: cmd.vessel,
      status: cmd.status || 'IN_TRANSIT',
      operator: cmd.operator || 'Port Terminal Operator',
      notes: cmd.notes || `Shipment moved to ${cmd.location}`,
    };

    return await EventStoreService.appendEvent(cmd.aggregateId, EventType.MOVED_LOCATION, payload);
  }

  /**
   * Command: Record arbitrary domain event on shipment
   */
  static async handleRecordEvent(cmd: RecordEventCommand): Promise<IEvent> {
    if (!cmd.aggregateId) throw new Error('Shipment aggregateId is required');
    if (!cmd.eventType) throw new Error('Event type is required');

    const existingEvents = await EventStoreService.getEventsForAggregate(cmd.aggregateId);
    if (existingEvents.length === 0) {
      throw new Error(`Shipment ${cmd.aggregateId} does not exist`);
    }

    const payload = {
      ...cmd.payload,
      operator: cmd.operator || cmd.payload?.operator || 'Logistics Inspector',
    };

    return await EventStoreService.appendEvent(cmd.aggregateId, cmd.eventType, payload);
  }
}
