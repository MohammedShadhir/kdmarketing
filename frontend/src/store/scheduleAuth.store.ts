import { create } from 'zustand';
import { supabase } from '@/services/supabase';

interface ScheduleUser {
  id: string;
  email: string;
  name: string;
  role: 'sales' | 'subcontractor';
  subcontractorId?: string;
}

interface ScheduleAuthState {
  user: ScheduleUser | null;
  loading: boolean;
  initialized: boolean;
  login: (email: string, password: string, userType: 'sales' | 'subcontractor') => Promise<void>;
  logout: () => void;
  initialize: () => Promise<void>;
}

export const useScheduleAuthStore = create<ScheduleAuthState>((set) => ({
  user: null,
  loading: false,
  initialized: false,

  initialize: async () => {
    try {
      const stored = localStorage.getItem('schedule_auth_user');
      if (stored) {
        const user = JSON.parse(stored);
        set({ user, initialized: true });
      } else {
        set({ initialized: true });
      }
    } catch (error) {
      set({ initialized: true });
    }
  },

  login: async (email: string, password: string, userType: 'sales' | 'subcontractor') => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.functions.invoke('auth-login', {
        body: { email, password, userType }
      });

      if (error || !data?.user) {
        throw new Error('Invalid credentials');
      }

      const userData = data.user;
      const scheduleUser: ScheduleUser = {
        id: userData.id,
        email: userData.email,
        name: userData.name || userData.email,
        role: userType,
        subcontractorId: userData.subcontractorId || userData.id
      };

      localStorage.setItem('schedule_auth_user', JSON.stringify(scheduleUser));
      set({ user: scheduleUser, loading: false });
    } catch (error: any) {
      set({ loading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('schedule_auth_user');
    set({ user: null });
  }
}));

useScheduleAuthStore.getState().initialize();
