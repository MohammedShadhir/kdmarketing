import { create } from 'zustand';
import { Project } from '@/types/domain';
import { projectIntersectsMonth } from '@/lib/dates';
import {
  getProjects,
  createProject as createProjectAPI,
  updateProject as updateProjectAPI,
  deleteProject as deleteProjectAPI,
} from '@/services/supabase';

type ProjectsState = {
  projects: Project[];
  loading: boolean;
  error: string | null;
  fetchProjects: (subContractorId?: string) => Promise<void>;
  addProject: (input: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Project>;
  updateProject: (id: string, patch: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  listBySubContractor: (subContractorId: string) => Project[];
  listBySubContractorAndMonth: (subContractorId: string, yearMonth: string) => Project[];
};

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: [],
  loading: false,
  error: null,

  fetchProjects: async (subContractorId?: string) => {
    set({ loading: true, error: null });
    try {
      const projects = await getProjects(subContractorId);
      set({ projects, loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch projects', loading: false });
    }
  },

  addProject: async (input) => {
    set({ loading: true, error: null });
    try {
      const newProject = await createProjectAPI(input);
      set((state) => ({
        projects: [...state.projects, newProject],
        loading: false,
      }));
      return newProject;
    } catch (error: any) {
      set({ error: error.message || 'Failed to create project', loading: false });
      throw error;
    }
  },

  updateProject: async (id, patch) => {
    set({ loading: true, error: null });
    try {
      const updated = await updateProjectAPI(id, patch);
      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === id ? updated : p
        ),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to update project', loading: false });
      throw error;
    }
  },

  deleteProject: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteProjectAPI(id);
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete project', loading: false });
      throw error;
    }
  },

  listBySubContractor: (subContractorId) => {
    return get().projects.filter((p) => p.subContractorId === subContractorId);
  },

  listBySubContractorAndMonth: (subContractorId, yearMonth) => {
    return get().projects.filter(
      (p) =>
        p.subContractorId === subContractorId &&
        projectIntersectsMonth(p.startDate, p.endDate, yearMonth)
    );
  },
}));
