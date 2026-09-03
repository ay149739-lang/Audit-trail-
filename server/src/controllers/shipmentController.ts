import { Request, Response, NextFunction } from 'express';
import { ShipmentCommandHandler } from '../commands/shipmentCommands';
import { ShipmentQueryHandler } from '../queries/shipmentQueries';

export class ShipmentController {
  // --- COMMAND CONTROLLERS ---

  /**
   * POST /api/shipments
   * Dispatches CreateShipmentCommand
   */
  static async createShipment(req: Request, res: Response, next: NextFunction) {
    try {
      const { aggregateId, origin, destination, carrier, vessel, operator } = req.body;
      const event = await ShipmentCommandHandler.handleCreateShipment({
        aggregateId,
        origin,
        destination,
        carrier,
        vessel,
        operator,
      });

      res.status(201).json({
        success: true,
        message: `Shipment ${aggregateId} created successfully via CONTAINER_CREATED event`,
        data: event,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/shipments/:id/move
   * Dispatches MoveShipmentCommand
   */
  static async moveShipment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { location, vessel, status, operator, notes } = req.body;

      const event = await ShipmentCommandHandler.handleMoveShipment({
        aggregateId: id,
        location,
        vessel,
        status,
        operator,
        notes,
      });

      res.status(200).json({
        success: true,
        message: `Shipment ${id} moved to ${location}`,
        data: event,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/shipments/:id/events
   * Dispatches RecordEventCommand (Generic Append Event)
   */
  static async recordEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { eventType, payload, operator } = req.body;

      const event = await ShipmentCommandHandler.handleRecordEvent({
        aggregateId: id,
        eventType,
        payload,
        operator,
      });

      res.status(201).json({
        success: true,
        message: `Event ${eventType} recorded for shipment ${id}`,
        data: event,
      });
    } catch (error) {
      next(error);
    }
  }

  // --- QUERY CONTROLLERS ---

  /**
   * GET /api/shipments
   * Executes GetAllShipments query
   */
  static async getShipments(_req: Request, res: Response, next: NextFunction) {
    try {
      const shipments = await ShipmentQueryHandler.handleGetAllShipments();
      res.status(200).json({
        success: true,
        count: shipments.length,
        data: shipments,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/shipments/:id
   * Executes GetShipmentById query
   */
  static async getShipmentById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const shipment = await ShipmentQueryHandler.handleGetShipmentById(id);

      if (!shipment) {
        return res.status(404).json({
          success: false,
          error: `Shipment ${id} not found`,
        });
      }

      res.status(200).json({
        success: true,
        data: shipment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/shipments/:id/events
   * Executes GetShipmentEvents query (Immutable Event Stream)
   */
  static async getEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const events = await ShipmentQueryHandler.handleGetShipmentEvents(id);

      res.status(200).json({
        success: true,
        aggregateId: id.toUpperCase(),
        count: events.length,
        data: events,
      });
    } catch (error) {
      next(error);
    }
  }
}
