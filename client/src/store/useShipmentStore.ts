import { create } from 'zustand';
import { ShipmentAggregate, IEvent, CreateShipmentDto, MoveShipmentDto, RecordEventDto } from '../types';
import { shipmentApi } from '../api/shipments';

interface ShipmentState {
  shipments: ShipmentAggregate[];
  selectedShipment: ShipmentAggregate | null;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchShipments: () => Promise<void>;
  fetchShipmentById: (id: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  createShipment: (dto: CreateShipmentDto) => Promise<void>;
  moveShipment: (id: string, dto: MoveShipmentDto) => Promise<void>;
  recordEvent: (id: string, dto: RecordEventDto) => Promise<void>;
  clearSelectedShipment: () => void;
}

export const useShipmentStore = create<ShipmentState>((set, get) => ({
  shipments: [],
  selectedShipment: null,
  searchQuery: '',
  isLoading: false,
  error: null,

  fetchShipments: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await shipmentApi.getShipments();
      set({ shipments: data, isLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.error || 'Failed to fetch shipments from Event Store',
        isLoading: false,
      });
    }
  },

  fetchShipmentById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await shipmentApi.getShipmentById(id);
      set({ selectedShipment: data, isLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.error || `Shipment ${id} not found`,
        isLoading: false,
        selectedShipment: null,
      });
    }
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  createShipment: async (dto: CreateShipmentDto) => {
    set({ isLoading: true, error: null });
    try {
      await shipmentApi.createShipment(dto);
      await get().fetchShipments();
      await get().fetchShipmentById(dto.aggregateId);
    } catch (err: any) {
      set({
        error: err.response?.data?.error || 'Failed to create shipment aggregate',
        isLoading: false,
      });
      throw err;
    }
  },

  moveShipment: async (id: string, dto: MoveShipmentDto) => {
    set({ isLoading: true, error: null });
    try {
      await shipmentApi.moveShipment(id, dto);
      await get().fetchShipments();
      await get().fetchShipmentById(id);
    } catch (err: any) {
      set({
        error: err.response?.data?.error || `Failed to move shipment ${id}`,
        isLoading: false,
      });
      throw err;
    }
  },

  recordEvent: async (id: string, dto: RecordEventDto) => {
    set({ isLoading: true, error: null });
    try {
      await shipmentApi.recordEvent(id, dto);
      await get().fetchShipments();
      await get().fetchShipmentById(id);
    } catch (err: any) {
      set({
        error: err.response?.data?.error || `Failed to record event for ${id}`,
        isLoading: false,
      });
      throw err;
    }
  },

  clearSelectedShipment: () => {
    set({ selectedShipment: null });
  },
}));
