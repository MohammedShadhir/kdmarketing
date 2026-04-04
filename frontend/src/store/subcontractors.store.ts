import { create } from 'zustand';
import { SubContractor } from '@/types/domain';
import {
  getSubContractors,
  getSubContractorsForSalesUser,
  createSubContractor as createSubContractorAPI,
  updateSubContractor as updateSubContractorAPI,
  deleteSubContractor as deleteSubContractorAPI,
} from '@/services/supabase';

type SubContractorsState = {
  subContractors: SubContractor[];
  selectedSubContractorId: string | null;
  loading: boolean;
  error: string | null;
  setSelectedSubContractorId: (id: string | null) => void;
  fetchSubContractors: (salesUserId?: string) => Promise<void>;
  addSubContractor: (input: Omit<SubContractor, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateSubContractor: (id: string, patch: Partial<SubContractor>) => Promise<void>;
  deleteSubContractor: (id: string) => Promise<void>;
};

export const useSubContractorsStore = create<SubContractorsState>((set) => ({
  subContractors: [],
  selectedSubContractorId: null,
  loading: false,
  error: null,

  setSelectedSubContractorId: (id) => set({ selectedSubContractorId: id }),

  fetchSubContractors: async (salesUserId?: string) => {
    set({ loading: true, error: null });
    try {
      const subContractors = salesUserId
        ? await getSubContractorsForSalesUser(salesUserId)
        : await getSubContractors();
      set({ subContractors, loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch sub-contractors', loading: false });
    }
  },

  addSubContractor: async (input) => {
    set({ loading: true, error: null });
    try {
      const newSubContractor = await createSubContractorAPI(input);
      set((state) => ({
        subContractors: [...state.subContractors, newSubContractor],
        loading: false,
        selectedSubContractorId: newSubContractor.id,
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to create sub-contractor', loading: false });
      throw error;
    }
  },

  updateSubContractor: async (id, patch) => {
    set({ loading: true, error: null });
    try {
      const updated = await updateSubContractorAPI(id, patch);
      set((state) => ({
        subContractors: state.subContractors.map((sc) =>
          sc.id === id ? updated : sc
        ),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to update sub-contractor', loading: false });
      throw error;
    }
  },

  deleteSubContractor: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteSubContractorAPI(id);
      set((state) => ({
        subContractors: state.subContractors.filter((sc) => sc.id !== id),
        selectedSubContractorId: state.selectedSubContractorId === id ? null : state.selectedSubContractorId,
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete sub-contractor', loading: false });
      throw error;
    }
  },
}));
