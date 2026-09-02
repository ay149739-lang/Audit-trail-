import { create } from 'zustand';
import {
  fetchShipmentEvents,
  fetchShipmentState,
  fetchRecentShipments as  apiFetchRecent,
  appendShipmentEvent
} from '../lib/api';

export const useShipmentStore = create((set, get) => ({
  searchedId: '',
  events: null,
  currentState: null,
  recentShipments: [],
  isLoading: false,
  isAppending: false,
  error: null,

  // Fetch recent shipments pill list
  fetchRecentShipments: async () => {
    try {
      const data = await apiFetchRecent();
      set({ recentShipments: data || [] });
    } catch (err) {
      console.error('Failed to fetch recent shipments:', err);
    }
  },

  // Main search action fetching events & computed state concurrently
  searchShipment: async (id) => {
    const cleanedId = (id || '').trim();
    if (!cleanedId) return;

    set({ isLoading: true, error: null, searchedId: cleanedId });

    try {
      const [eventsData, stateData] = await Promise.all([
        fetchShipmentEvents(cleanedId),
        fetchShipmentState(cleanedId)
      ]);

      set({
        events: eventsData,
        currentState: stateData,
        isLoading: false,
        error: null
      });

      // Refresh recent list in background
      get().fetchRecentShipments();
    } catch (err) {
      console.error('Search error:', err);
      const errorMessage =
        err.response?.data?.message ||
        `Shipment ID "${cleanedId}" could not be found or loaded.`;

      set({
        events: null,
        currentState: null,
        isLoading: false,
        error: errorMessage
      });
    }
  },

  // Append new event command action
  appendEvent: async (eventType, payload) => {
    const { searchedId } = get();
    if (!searchedId) return;

    set({ isAppending: true, error: null });

    try {
      await appendShipmentEvent({
        aggregateId: searchedId,
        eventType,
        payload
      });

      // Refetch events and state to fold live updates
      await get().searchShipment(searchedId);
      set({ isAppending: false });
      return true;
    } catch (err) {
      console.error('Append event error:', err);
      const msg = err.response?.data?.message || 'Failed to append event to stream.';
      set({ error: msg, isAppending: false });
      return false;
    }
  },

  // Reset search state
  clearSearch: () => {
    set({
      searchedId: '',
      events: null,
      currentState: null,
      error: null,
      isLoading: false
    });
  }
}));
