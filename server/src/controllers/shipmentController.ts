import { Request, Response, NextFunction } from 'express';
import { ShipmentCommandHandler } from '../commands/shipmentCommands';
import { ShipmentQueryHandler } from '../queries/shipmentQueries';

export class ShipmentController {
  /**
   * POST /api/shipments
   * Dispatches CreateShipmentCommand with validated schema
   */
  static async createShipment(req: Request, res: Response, next: NextFunction) {
    try {
      const { aggregateId, origin, destination, carrier, vessel, operator, expectedVersion } = req.body;
      const event = await ShipmentCommandHandler.handleCreateShipment({
        aggregateId,
        origin,
        destination,
        carrier,
        vessel,
        operator,
        expectedVersion: expectedVersion !== undefined ? Number(expectedVersion) : undefined,
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
   * Dispatches MoveShipmentCommand with OCC validation
   */
  static async moveShipment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { location, vessel, status, operator, notes, expectedVersion } = req.body;

      const event = await ShipmentCommandHandler.handleMoveShipment({
        aggregateId: id,
        location,
        vessel,
        status,
        operator,
        notes,
        expectedVersion: expectedVersion !== undefined ? Number(expectedVersion) : undefined,
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
   * Dispatches RecordEventCommand (Generic Append Event with OCC)
   */
  static async recordEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { eventType, payload, operator, expectedVersion } = req.body;

      const event = await ShipmentCommandHandler.handleRecordEvent({
        aggregateId: id,
        eventType,
        payload,
        operator,
        expectedVersion: expectedVersion !== undefined ? Number(expectedVersion) : undefined,
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
   * Executes GetAllShipments query without N+1 event queries.
   * Supports optional pagination: ?page=1&limit=20
   */
  static async getShipments(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(String(req.query.page), 10) : undefined;
      const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : undefined;

      const result = await ShipmentQueryHandler.handleGetAllShipments(page, limit);

      res.status(200).json({
        success: true,
        count: result.shipments.length,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / (result.limit || 1)) || 1,
        data: result.shipments,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/shipments/:id
   * Executes GetShipmentById query (detailed view including full event history)
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

  /**
   * GET /api/shipments/:id/state-at
   * and GET /api/shipments/:id/state-at/:version
   * Executes Historical State Scrubbing Query without altering live state
   */
  static async getShipmentStateAt(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const rawVersion = req.params.version ?? req.query.version;
      const timestamp = req.query.timestamp;

      const parsedVersion =
        rawVersion !== undefined && rawVersion !== '' ? parseInt(String(rawVersion), 10) : undefined;
      const parsedTimestamp = timestamp ? String(timestamp) : undefined;

      const historicalState = await ShipmentQueryHandler.handleGetShipmentStateAt(
        id,
        parsedVersion,
        parsedTimestamp
      );

      if (!historicalState) {
        return res.status(404).json({
          success: false,
          error: `No historical state found for shipment ${id} at specified point`,
        });
      }

      res.status(200).json({
        success: true,
        data: historicalState,
      });
    } catch (error) {
      next(error);
    }
  }
}
