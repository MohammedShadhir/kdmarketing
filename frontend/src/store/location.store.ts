import { create } from 'zustand';
import type { SubcontractorLocation, LocationTrail } from '@/types/location';
import {
  getSubcontractorsWithLocation,
  getLocationTrail,
} from '@/services/location';

interface LocationState {
  subcontractorLocations: SubcontractorLocation[];
  selectedSubcontractorId: string | null;
  selectedTrail: LocationTrail | null;
  selectedDate: string;
  loading: boolean;
  error: string | null;
  refreshIntervalId: number | null;

  fetchSubcontractorLocations: () => Promise<void>;
  fetchLocationTrail: (subcontractorId: string, date: string) => Promise<void>;
  setSelectedSubcontractor: (id: string | null) => void;
  setSelectedDate: (date: string) => void;
  clearTrail: () => void;
  startAutoRefresh: (intervalMs?: number) => void;
  stopAutoRefresh: () => void;
  clearError: () => void;
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

export const useLocationStore = create<LocationState>((set, get) => ({
  subcontractorLocations: [],
  selectedSubcontractorId: null,
  selectedTrail: null,
  selectedDate: getTodayDate(),
  loading: false,
  error: null,
  refreshIntervalId: null,

  fetchSubcontractorLocations: async () => {
    set({ loading: true, error: null });
    try {
      const locations = await getSubcontractorsWithLocation();
      set({ subcontractorLocations: locations, loading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch locations';
      set({ error: message, loading: false });
    }
  },

  fetchLocationTrail: async (subcontractorId: string, date: string) => {
    set({ loading: true, error: null });
    try {
      const trail = await getLocationTrail(subcontractorId, date);
      set({
        selectedTrail: trail,
        selectedSubcontractorId: subcontractorId,
        selectedDate: date,
        loading: false,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch location trail';
      set({ error: message, loading: false });
    }
  },

  setSelectedSubcontractor: (id: string | null) => {
    set({ selectedSubcontractorId: id });
    if (id) {
      const { selectedDate, fetchLocationTrail } = get();
      fetchLocationTrail(id, selectedDate);
    } else {
      set({ selectedTrail: null });
    }
  },

  setSelectedDate: (date: string) => {
    set({ selectedDate: date });
    const { selectedSubcontractorId, fetchLocationTrail } = get();
    if (selectedSubcontractorId) {
      fetchLocationTrail(selectedSubcontractorId, date);
    }
  },

  clearTrail: () => {
    set({ selectedTrail: null, selectedSubcontractorId: null });
  },

  startAutoRefresh: (intervalMs = 30000) => {
    const { fetchSubcontractorLocations, refreshIntervalId } = get();

    if (refreshIntervalId) {
      clearInterval(refreshIntervalId);
    }

    const id = window.setInterval(() => {
      fetchSubcontractorLocations();
    }, intervalMs);

    set({ refreshIntervalId: id });
  },

  stopAutoRefresh: () => {
    const { refreshIntervalId } = get();
    if (refreshIntervalId) {
      clearInterval(refreshIntervalId);
      set({ refreshIntervalId: null });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
