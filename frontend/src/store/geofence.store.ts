import { create } from 'zustand';
import type { Geofence, GeofenceInput } from '@/types/location';
import {
  getGeofences,
  getGeofencesWithProjects,
  createGeofence as createGeofenceAPI,
  updateGeofence as updateGeofenceAPI,
  deleteGeofence as deleteGeofenceAPI,
  toggleGeofenceActive as toggleGeofenceActiveAPI,
  type GeofenceWithProject,
} from '@/services/geofence';

interface GeofenceState {
  geofences: GeofenceWithProject[];
  selectedGeofenceId: string | null;
  loading: boolean;
  error: string | null;

  fetchGeofences: (projectId?: string) => Promise<void>;
  fetchGeofencesWithProjects: () => Promise<void>;
  addGeofence: (input: GeofenceInput) => Promise<Geofence>;
  updateGeofence: (id: string, updates: Partial<GeofenceInput>) => Promise<void>;
  deleteGeofence: (id: string) => Promise<void>;
  toggleActive: (id: string, isActive: boolean) => Promise<void>;
  setSelectedGeofence: (id: string | null) => void;
  clearError: () => void;
}

export const useGeofenceStore = create<GeofenceState>((set) => ({
  geofences: [],
  selectedGeofenceId: null,
  loading: false,
  error: null,

  fetchGeofences: async (projectId?: string) => {
    set({ loading: true, error: null });
    try {
      const geofences = await getGeofences(projectId);
      set({ geofences, loading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch geofences';
      set({ error: message, loading: false });
    }
  },

  fetchGeofencesWithProjects: async () => {
    set({ loading: true, error: null });
    try {
      const geofences = await getGeofencesWithProjects();
      set({ geofences, loading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch geofences';
      set({ error: message, loading: false });
    }
  },

  addGeofence: async (input: GeofenceInput) => {
    set({ loading: true, error: null });
    try {
      const newGeofence = await createGeofenceAPI(input);
      set((state) => ({
        geofences: [newGeofence, ...state.geofences],
        loading: false,
      }));
      return newGeofence;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create geofence';
      set({ error: message, loading: false });
      throw error;
    }
  },

  updateGeofence: async (id: string, updates: Partial<GeofenceInput>) => {
    set({ loading: true, error: null });
    try {
      const updated = await updateGeofenceAPI(id, updates);
      set((state) => ({
        geofences: state.geofences.map((g) =>
          g.id === id ? { ...g, ...updated } : g
        ),
        loading: false,
      }));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update geofence';
      set({ error: message, loading: false });
      throw error;
    }
  },

  deleteGeofence: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await deleteGeofenceAPI(id);
      set((state) => ({
        geofences: state.geofences.filter((g) => g.id !== id),
        selectedGeofenceId: state.selectedGeofenceId === id ? null : state.selectedGeofenceId,
        loading: false,
      }));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete geofence';
      set({ error: message, loading: false });
      throw error;
    }
  },

  toggleActive: async (id: string, isActive: boolean) => {
    set({ loading: true, error: null });
    try {
      await toggleGeofenceActiveAPI(id, isActive);
      set((state) => ({
        geofences: state.geofences.map((g) =>
          g.id === id ? { ...g, isActive } : g
        ),
        loading: false,
      }));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to toggle geofence';
      set({ error: message, loading: false });
      throw error;
    }
  },

  setSelectedGeofence: (id: string | null) => {
    set({ selectedGeofenceId: id });
  },

  clearError: () => {
    set({ error: null });
  },
}));
