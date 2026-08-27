const express = require('express');
const router = express.Router();
const commandService = require('../services/commandService');

// POST /api/shipment/create
router.post('/create', async (req, res) => {
  try {
    const { aggregateId, payload } = req.body;
    const event = await commandService.createShipment({ aggregateId, payload });
    return res.status(201).json(event);
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({
      error: true,
      message: err.message || 'Internal server error while creating shipment stream.'
    });
  }
});

// POST /api/shipment/move
router.post('/move', async (req, res) => {
  try {
    const { aggregateId, eventType, payload } = req.body;
    const event = await commandService.appendEvent({ aggregateId, eventType, payload });
    return res.status(200).json(event);
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({
      error: true,
      message: err.message || 'Internal server error while appending event.'
    });
  }
});

module.exports = router;
