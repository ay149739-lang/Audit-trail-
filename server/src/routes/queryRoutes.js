const express = require('express');
const router = express.Router();
const queryService = require('../services/queryService');

// GET /api/shipments/recent
router.get('/shipments/recent', async (req, res) => {
  try {
    const recent = await queryService.getRecentShipments();
    return res.status(200).json(recent);
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({
      error: true,
      message: err.message || 'Error fetching recent shipments.'
    });
  }
});

// GET /api/shipment/:id/events
router.get('/shipment/:id/events', async (req, res) => {
  try {
    const { id } = req.params;
    const events = await queryService.getShipmentEvents(id);
    return res.status(200).json(events);
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({
      error: true,
      message: err.message || `Error fetching events for shipment ${req.params.id}`
    });
  }
});

// GET /api/shipment/:id
router.get('/shipment/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const state = await queryService.getShipmentState(id);
    return res.status(200).json(state);
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({
      error: true,
      message: err.message || `Error fetching state for shipment ${req.params.id}`
    });
  }
});

module.exports = router;
