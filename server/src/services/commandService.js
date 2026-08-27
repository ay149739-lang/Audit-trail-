const Event = require('../models/Event');

/**
 * Creates a new shipment container event stream.
 * Event type must be CONTAINER_CREATED and version must be 1.
 */
const createShipment = async ({ aggregateId, payload }) => {
  if (!aggregateId || typeof aggregateId !== 'string') {
    throw { status: 400, message: 'aggregateId is required and must be a string.' };
  }

  if (!payload || typeof payload !== 'object') {
    throw { status: 400, message: 'payload is required and must be an object.' };
  }

  const existingEvent = await Event.findOne({ aggregateId });
  if (existingEvent) {
    throw { status: 400, message: `Shipment with aggregateId '${aggregateId}' already exists.` };
  }

  const event = new Event({
    aggregateId: aggregateId.trim(),
    eventType: 'CONTAINER_CREATED',
    payload,
    version: 1,
    timestamp: new Date()
  });

  await event.save();
  return event;
};

/**
 * Appends a new event to an existing shipment stream.
 * Validates aggregateId existence and increments version number atomically.
 */
const appendEvent = async ({ aggregateId, eventType, payload }) => {
  if (!aggregateId || typeof aggregateId !== 'string') {
    throw { status: 400, message: 'aggregateId is required and must be a string.' };
  }

  if (!eventType || typeof eventType !== 'string') {
    throw { status: 400, message: 'eventType is required and must be a string.' };
  }

  const allowedTypes = [
    'CONTAINER_CREATED',
    'LOADED_ON_SHIP',
    'TEMPERATURE_SPIKE',
    'ARRIVED_AT_PORT',
    'CUSTOMS_CLEARED'
  ];

  if (!allowedTypes.includes(eventType)) {
    throw { status: 400, message: `Invalid eventType '${eventType}'. Allowed types: ${allowedTypes.join(', ')}` };
  }

  if (!payload || typeof payload !== 'object') {
    throw { status: 400, message: 'payload is required and must be an object.' };
  }

  // Find latest event for this aggregate to calculate next version
  const lastEvent = await Event.findOne({ aggregateId: aggregateId.trim() })
    .sort({ version: -1 })
    .exec();

  if (!lastEvent) {
    throw { status: 404, message: `Shipment '${aggregateId}' not found. Cannot append event to non-existent shipment.` };
  }

  const nextVersion = lastEvent.version + 1;

  const newEvent = new Event({
    aggregateId: aggregateId.trim(),
    eventType,
    payload,
    version: nextVersion,
    timestamp: new Date()
  });

  await newEvent.save();
  return newEvent;
};

module.exports = {
  createShipment,
  appendEvent
};
