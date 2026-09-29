import { Router } from 'express';
import { ShipmentController } from '../controllers/shipmentController';
import {
  validateBody,
  createShipmentSchema,
  moveShipmentSchema,
  recordEventSchema,
} from '../validation/shipmentValidation';

const router = Router();

// --- CQRS COMMAND ENDPOINTS (with Zod validation) ---
router.post('/shipments', validateBody(createShipmentSchema), ShipmentController.createShipment);
router.post('/shipments/:id/move', validateBody(moveShipmentSchema), ShipmentController.moveShipment);
router.post('/shipments/:id/events', validateBody(recordEventSchema), ShipmentController.recordEvent);

// --- CQRS QUERY ENDPOINTS ---
router.get('/shipments', ShipmentController.getShipments);
// Support both query param (?version=...) and path param (/:version) for state-at-version time rewind
router.get('/shipments/:id/state-at/:version', ShipmentController.getShipmentStateAt);
router.get('/shipments/:id/state-at', ShipmentController.getShipmentStateAt);
router.get('/shipments/:id', ShipmentController.getShipmentById);
router.get('/shipments/:id/events', ShipmentController.getEvents);

export default router;
