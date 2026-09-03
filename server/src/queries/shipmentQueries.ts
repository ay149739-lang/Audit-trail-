import { EventStoreService } from '../services/eventStore';
import { ShipmentAggregate, IEvent } from '../types';

export class ShipmentQueryHandler {
  /**
   * Query: Get list of all projected shipment aggregates
   */
  static async handleGetAllShipments(): Promise<ShipmentAggregate[]> {
    return await EventStoreService.getAllShipmentProjections();
  }

  /**
   * Query: Get a single projected shipment aggregate by ID
   */
  static async handleGetShipmentById(aggregateId: string): Promise<ShipmentAggregate | null> {
    return await EventStoreService.getShipmentProjection(aggregateId);
  }

  /**
   * Query: Get raw chronological immutable events stream for a shipment
   */
  static async handleGetShipmentEvents(aggregateId: string): Promise<IEvent[]> {
    return await EventStoreService.getEventsForAggregate(aggregateId);
  }
}
