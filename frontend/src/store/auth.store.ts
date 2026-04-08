import { create } from "zustand";
import {
  User,
  SalesLoginCredentials,
  SubContractorLoginCredentials,
} from "@/types/auth";
import {
  loginAsSales,
  loginAsSubContractor,
  logout as logoutService,
  getCurrentUser,
} from "@/services/auth";

type AuthState = {
  user: User | null;
  initialized: boolean;
  loading: boolean;
  error: string | null;
  initialize: () => void;
  loginSales: (credentials: SalesLoginCredentials) => Promise<void>;
  loginSubContractor: (
    credentials: SubContractorLoginCredentials,
  ) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  setUser: (user: User) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  initialized: false,
  loading: false,
  error: null,

  // Initialize store with current user if session exists
  initialize: () => {
    const user = getCurrentUser();
    set({ user, initialized: true });
  },

  // Sales login
  loginSales: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const user = await loginAsSales(credentials);
      set({ user, loading: false, initialized: true });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Sales login failed";
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  // Subcontractor login
  loginSubContractor: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const user = await loginAsSubContractor(credentials);
      set({ user, loading: false, initialized: true });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Subcontractor login failed";
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  // Logout
  logout: () => {
    logoutService();
    set({ user: null, error: null, initialized: true });
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Set user manually (for example after registration)
  setUser: (user: User) => {
    set({ user });
    const session = { user, timestamp: Date.now() };
    localStorage.setItem("pm_auth_session", JSON.stringify(session));
  },
}));
