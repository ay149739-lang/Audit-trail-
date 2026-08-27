/**
 * Pure replay/folding engine.
 * Computes current aggregate state by applying events chronologically.
 */

const eventReducers = {
  CONTAINER_CREATED: (state, payload, event) => ({
    ...state,
    status: 'CREATED',
    location: payload.origin || payload.location || 'Origin Terminal',
    origin: payload.origin || 'N/A',
    destination: payload.destination || 'N/A',
    carrier: payload.carrier || 'Unassigned',
    cargoDescription: payload.cargoDescription || payload.cargo || 'General Cargo',
    maxTempThreshold: payload.maxTempThreshold ?? 25,
    createdTimestamp: event.timestamp
  }),

  LOADED_ON_SHIP: (state, payload) => ({
    ...state,
    status: 'IN_TRANSIT',
    vesselName: payload.vesselName || payload.vessel || 'Sea Vessel',
    location: payload.vesselName ? `In Transit (${payload.vesselName})` : (payload.port || 'In Transit')
  }),

  TEMPERATURE_SPIKE: (state, payload, event) => {
    const newAlert = {
      timestamp: event.timestamp,
      currentTemp: payload.currentTemp,
      threshold: payload.threshold || state.maxTempThreshold,
      unit: payload.unit || '°C',
      sensorId: payload.sensorId || 'TEMP-SENSOR-01',
      severity: payload.severity || (payload.currentTemp > 30 ? 'CRITICAL' : 'WARNING')
    };

    return {
      ...state,
      temperatureAlerts: [...state.temperatureAlerts, newAlert],
      hasActiveAlert: true,
      lastAlertTemp: payload.currentTemp
    };
  },

  ARRIVED_AT_PORT: (state, payload) => ({
    ...state,
    status: 'ARRIVED_AT_PORT',
    location: payload.port || payload.destination || state.destination || 'Destination Port',
    terminal: payload.terminal || 'Main Container Terminal',
    berth: payload.berth || 'Berth 1'
  }),

  CUSTOMS_CLEARED: (state, payload) => ({
    ...state,
    status: 'CUSTOMS_CLEARED',
    customsStatus: 'CLEARED',
    clearanceCode: payload.clearanceId || payload.clearanceCode || 'CLR-PASS-APPROVED'
  })
};

/**
 * Replays an array of chronological events to reconstruct aggregate state.
 * @param {Array} events - Ordered list of event objects
 * @returns {Object} Computed state
 */
function replayEvents(events = []) {
  if (!Array.isArray(events) || events.length === 0) {
    return null;
  }

  // Ensure chronological order by version ascending
  const sortedEvents = [...events].sort((a, b) => a.version - b.version);

  const initialState = {
    aggregateId: sortedEvents[0].aggregateId,
    status: 'UNKNOWN',
    location: 'UNKNOWN',
    origin: null,
    destination: null,
    carrier: null,
    cargoDescription: null,
    vesselName: null,
    maxTempThreshold: 25,
    temperatureAlerts: [],
    hasActiveAlert: false,
    history: []
  };

  const finalState = sortedEvents.reduce((acc, event) => {
    const reducer = eventReducers[event.eventType];
    let nextState = acc;

    if (typeof reducer === 'function') {
      nextState = reducer(acc, event.payload, event);
    }

    // Append to audit trail history trace
    nextState.history.push({
      version: event.version,
      eventType: event.eventType,
      timestamp: event.timestamp,
      location: nextState.location,
      status: nextState.status
    });

    return nextState;
  }, initialState);

  return finalState;
}

module.exports = { replayEvents, eventReducers };
