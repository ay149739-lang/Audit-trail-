import axios from 'axios';
import {
  ShipmentAggregate,
  IEvent,
  CreateShipmentDto,
  MoveShipmentDto,
  RecordEventDto,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const shipmentApi = {
  // Queries
  getShipments: async (): Promise<ShipmentAggregate[]> => {
    const res = await api.get('/shipments');
    return res.data.data;
  },

  getShipmentById: async (id: string): Promise<ShipmentAggregate> => {
    const res = await api.get(`/shipments/${id}`);
    return res.data.data;
  },

  getShipmentEvents: async (id: string): Promise<IEvent[]> => {
    const res = await api.get(`/shipments/${id}/events`);
    return res.data.data;
  },

  // Commands
  createShipment: async (dto: CreateShipmentDto): Promise<IEvent> => {
    const res = await api.post('/shipments', dto);
    return res.data.data;
  },

  moveShipment: async (id: string, dto: MoveShipmentDto): Promise<IEvent> => {
    const res = await api.post(`/shipments/${id}/move`, dto);
    return res.data.data;
  },

  recordEvent: async (id: string, dto: RecordEventDto): Promise<IEvent> => {
    const res = await api.post(`/shipments/${id}/events`, dto);
    return res.data.data;
  },
};
