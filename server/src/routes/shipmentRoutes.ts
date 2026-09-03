import { Router } from 'express';
import { ShipmentController } from '../controllers/shipmentController';

const router = Router();

// --- CQRS COMMAND ENDPOINTS ---
router.post('/shipments', ShipmentController.createShipment);
router.post('/shipments/:id/move', ShipmentController.moveShipment);
router.post('/shipments/:id/events', ShipmentController.recordEvent);

// --- CQRS QUERY ENDPOINTS ---
router.get('/shipments', ShipmentController.getShipments);
router.get('/shipments/:id', ShipmentController.getShipmentById);
router.get('/shipments/:id/events', ShipmentController.getEvents);

export default router;
