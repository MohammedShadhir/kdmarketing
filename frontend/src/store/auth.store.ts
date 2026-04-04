import { create } from 'zustand';
import { User, SalesLoginCredentials, SubContractorLoginCredentials } from '@/types/auth';
import { loginAsSales, loginAsSubContractor, logout as logoutService, getCurrentUser } from '@/services/auth';

type AuthState = {
  user: User | null;
  initialized: boolean;
  loading: boolean;
  error: string | null;
  initialize: () => void;
  loginSales: (credentials: SalesLoginCredentials) => Promise<void>;
  loginSubContractor: (credentials: SubContractorLoginCredentials) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  setUser: (user: User) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  initialized: false,
  loading: false,
  error: null,

  initialize: () => {
    const user = getCurrentUser();
    set({ user, initialized: true });
  },

  loginSales: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const user = await loginAsSales(credentials);
      set({ user, loading: false, initialized: true });
      } catch (error: any) {
      set({ error: error.message || 'Login failed', loading: false });
      throw error;
    }
  },

  loginSubContractor: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const user = await loginAsSubContractor(credentials);
      set({ user, loading: false, initialized: true });
    } catch (error: any) {
      set({ error: error.message || 'Login failed', loading: false });
      throw error;
    }
  },

  logout: () => {
    logoutService();
    set({ user: null, error: null, initialized: true });
  },

  clearError: () => {
    set({ error: null });
  },

  setUser: (user: User) => {
    set({ user });
    const session = { user, timestamp: Date.now() };
    sessionStorage.setItem('auth_session', JSON.stringify(session));
  }
}));
