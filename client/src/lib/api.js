import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL:  API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Fetch raw event stream for a shipment aggregate ID
 */
export const fetchShipmentEvents = async (aggregateId) => {
  const response = await api.get(`/api/shipment/${encodeURIComponent(aggregateId)}/events`);
  return response.data;
};

/**
 * Fetch computed current state (folded state) for a shipment aggregate ID
 */
export const fetchShipmentState = async (aggregateId) => {
  const response = await api.get(`/api/shipment/${encodeURIComponent(aggregateId)}`);
  return  response.data;
};


export const fetchRecentShipments = async () => {
  const response = await api.get('/api/shipments/recent');
  return response.data;
};

/**
 * Create a new shipment aggregate (appends CONTAINER_CREATED version 1)
 */
export const createShipment = async ({ aggregateId, payload }) => {
  const response = await api.post('/api/shipment/create', { aggregateId, payload });
  return response.data;
};

/**
 * Append a new event to an existing shipment stream
 */
export const appendShipmentEvent = async ({ aggregateId, eventType, payload }) => {
  const response = await api.post('/api/shipment/move', { aggregateId, eventType, payload });
  return response.data;
};

export default api;
