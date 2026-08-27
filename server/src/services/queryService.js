const Event = require('../models/Event');
const { replayEvents } = require('../utils/replayEvents');

/**
 * Retrieves raw ordered event stream for an aggregateId.
 */
const getShipmentEvents = async (aggregateId) => {
  const events = await Event.find({ aggregateId: aggregateId.trim() })
    .sort({ version: 1 })
    .lean()
    .exec();

  if (!events || events.length === 0) {
    throw { status: 404, message: `Shipment with aggregateId '${aggregateId}' not found.` };
  }

  return events;
};

/**
 * Replays events on-demand to fold and return computed state.
 */
const getShipmentState = async (aggregateId) => {
  const events = await getShipmentEvents(aggregateId);
  const currentState = replayEvents(events);
  const lastEvent = events[events.length - 1];

  return {
    aggregateId,
    currentState,
    lastUpdated: lastEvent ? lastEvent.timestamp : null,
    eventCount: events.length
  };
};

/**
 * Helper to fetch last 5 distinct aggregate IDs with their latest event timestamp.
 */
const getRecentShipments = async () => {
  const recentList = await Event.aggregate([
    {
      $sort: { timestamp: -1 }
    },
    {
      $group: {
        _id: '$aggregateId',
        latestEvent: { $first: '$eventType' },
        lastUpdated: { $first: '$timestamp' },
        eventCount: { $sum: 1 }
      }
    },
    {
      $sort: { lastUpdated: -1 }
    },
    {
      $limit: 5
    },
    {
      $project: {
        _id: 0,
        aggregateId: '$_id',
        latestEvent: 1,
        lastUpdated: 1,
        eventCount: 1
      }
    }
  ]);

  return recentList;
};

module.exports = {
  getShipmentEvents,
  getShipmentState,
  getRecentShipments
};
