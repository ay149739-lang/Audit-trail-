import { create } from 'zustand';
import {
  ShipmentAggregate,
  IEvent,
  CreateShipmentDto,
  MoveShipmentDto,
  RecordEventDto,
  ConcurrencyConflictInfo,
} from '../types';
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
  concurrencyConflict: ConcurrencyConflictInfo | null;

  fetchShipments: () => Promise<void>;
  fetchShipmentById: (id: string) => Promise<void>;
  fetchShipmentStateAt: (id: string, version: number) => Promise<void>;
  resetToLiveState: () => void;
  setSearchQuery: (query: string) => void;
  createShipment: (dto: CreateShipmentDto) => Promise<void>;
  moveShipment: (id: string, dto: MoveShipmentDto) => Promise<void>;
  recordEvent: (id: string, dto: RecordEventDto) => Promise<void>;
  clearSelectedShipment: () => void;
  clearConcurrencyConflict: () => void;
  refreshShipment: (id: string) => Promise<void>;
}

let activeStateRequestId = 0;

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
  concurrencyConflict: null,


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
    const currentRequestId = ++activeStateRequestId;

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
      if (currentRequestId !== activeStateRequestId) {
        // Discard stale response
        return;
      }
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
      if (currentRequestId !== activeStateRequestId) return;
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
    const { liveShipment, selectedShipment } = get();
    const currentVersion = liveShipment?.latestVersion || selectedShipment?.latestVersion || 1;
    const expectedVersion = dto.expectedVersion !== undefined ? dto.expectedVersion : currentVersion;

    try {
      await shipmentApi.moveShipment(id, { ...dto, expectedVersion });
      set({ concurrencyConflict: null });
      await get().fetchShipments();
      await get().fetchShipmentById(id);
    } catch (err: any) {
      if (err.response?.status === 409 || err.response?.data?.code === 'CONCURRENCY_CONFLICT') {
        const conflictData: ConcurrencyConflictInfo = {
          isConflict: true,
          message:
            err.response?.data?.error ||
            'Shipment has been modified by another operation. Refresh the shipment and try again.',
          expectedVersion: err.response?.data?.expectedVersion ?? expectedVersion,
          currentVersion: err.response?.data?.currentVersion ?? (currentVersion + 1),
          aggregateId: id,
        };
        set({
          concurrencyConflict: conflictData,
          isLoading: false,
          error: conflictData.message,
        });
      } else {
        set({
          error: err.response?.data?.error || `Failed to move shipment ${id}`,
          isLoading: false,
        });
      }
      throw err;
    }
  },

  recordEvent: async (id: string, dto: RecordEventDto) => {
    set({ isLoading: true, error: null });
    const { liveShipment, selectedShipment } = get();
    const currentVersion = liveShipment?.latestVersion || selectedShipment?.latestVersion || 1;
    const expectedVersion = dto.expectedVersion !== undefined ? dto.expectedVersion : currentVersion;

    try {
      await shipmentApi.recordEvent(id, { ...dto, expectedVersion });
      set({ concurrencyConflict: null });
      await get().fetchShipments();
      await get().fetchShipmentById(id);
    } catch (err: any) {
      if (err.response?.status === 409 || err.response?.data?.code === 'CONCURRENCY_CONFLICT') {
        const conflictData: ConcurrencyConflictInfo = {
          isConflict: true,
          message:
            err.response?.data?.error ||
            'Shipment has been modified by another operation. Refresh the shipment and try again.',
          expectedVersion: err.response?.data?.expectedVersion ?? expectedVersion,
          currentVersion: err.response?.data?.currentVersion ?? (currentVersion + 1),
          aggregateId: id,
        };
        set({
          concurrencyConflict: conflictData,
          isLoading: false,
          error: conflictData.message,
        });
      } else {
        set({
          error: err.response?.data?.error || `Failed to record event for ${id}`,
          isLoading: false,
        });
      }
      throw err;
    }
  },

  clearConcurrencyConflict: () => {
    set({ concurrencyConflict: null });
  },

  refreshShipment: async (id: string) => {
    set({ concurrencyConflict: null, isLoading: true });
    await get().fetchShipmentById(id);
    await get().fetchShipments();
  },

  clearSelectedShipment: () => {
    set({
      selectedShipment: null,
      liveShipment: null,
      historicalState: null,
      isHistoricalView: false,
      selectedVersion: null,
      concurrencyConflict: null,
    });
  },
}));

