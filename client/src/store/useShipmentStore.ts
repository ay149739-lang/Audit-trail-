import { create } from 'zustand';
import { ShipmentAggregate, IEvent, CreateShipmentDto, MoveShipmentDto, RecordEventDto } from '../types';
import { shipmentApi } from '../api/shipments';

interface ShipmentState {
  shipments: ShipmentAggregate[];
  selectedShipment: ShipmentAggregate | null;
  liveShipment: ShipmentAggregate | null;
  historicalState: ShipmentAggregate | null;
  isHistoricalView: boolean;
  selectedVersion: number | null;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchShipments: () => Promise<void>;
  fetchShipmentById: (id: string) => Promise<void>;
  fetchShipmentStateAt: (id: string, version: number) => Promise<void>;
  resetToLiveState: () => void;
  setSearchQuery: (query: string) => void;
  createShipment: (dto: CreateShipmentDto) => Promise<void>;
  moveShipment: (id: string, dto: MoveShipmentDto) => Promise<void>;
  recordEvent: (id: string, dto: RecordEventDto) => Promise<void>;
  clearSelectedShipment: () => void;
}

export const useShipmentStore = create<ShipmentState>((set, get) => ({
  shipments: [],
  selectedShipment: null,
  liveShipment: null,
  historicalState: null,
  isHistoricalView: false,
  selectedVersion: null,
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
      set({
        selectedShipment: data,
        liveShipment: data,
        historicalState: null,
        isHistoricalView: false,
        selectedVersion: data?.latestVersion || 1,
        isLoading: false,
      });
    } catch (err: any) {
      set({
        error: err.response?.data?.error || `Shipment ${id} not found`,
        isLoading: false,
        selectedShipment: null,
        liveShipment: null,
        historicalState: null,
        isHistoricalView: false,
        selectedVersion: null,
      });
    }
  },

  fetchShipmentStateAt: async (id: string, version: number) => {
    const { liveShipment } = get();

    // If target version is equal to live latest version, restore live state
    if (liveShipment && version >= liveShipment.latestVersion) {
      set({
        selectedShipment: liveShipment,
        historicalState: null,
        isHistoricalView: false,
        selectedVersion: liveShipment.latestVersion,
      });
      return;
    }

    try {
      const data = await shipmentApi.getShipmentStateAt(id, version);
      set({
        selectedShipment: {
          ...data,
          // Preserve full events list from live shipment so timeline displays all events
          events: liveShipment?.events || data.events,
        },
        historicalState: data,
        isHistoricalView: true,
        selectedVersion: version,
      });
    } catch (err: any) {
      console.error(`Failed to fetch state at version ${version} for shipment ${id}:`, err);
    }
  },

  resetToLiveState: () => {
    const { liveShipment } = get();
    if (liveShipment) {
      set({
        selectedShipment: liveShipment,
        historicalState: null,
        isHistoricalView: false,
        selectedVersion: liveShipment.latestVersion,
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
    set({
      selectedShipment: null,
      liveShipment: null,
      historicalState: null,
      isHistoricalView: false,
      selectedVersion: null,
    });
  },
}));
