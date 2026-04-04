import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GHLAccountDisplay } from '../types/domain';
import { supabase } from '../services/supabase';

interface GHLAccountsState {
  accounts: GHLAccountDisplay[];
  selectedAccount: GHLAccountDisplay | null;
  isLoading: boolean;
  error: string | null;

  fetchAccounts: () => Promise<void>;
  selectAccount: (account: GHLAccountDisplay) => void;
  setDefaultAccount: () => Promise<void>;
  refreshAccounts: () => Promise<void>;
}

export const useGHLAccountsStore = create<GHLAccountsState>()(
  persist(
    (set, get) => ({
      accounts: [],
      selectedAccount: null,
      isLoading: false,
      error: null,

      fetchAccounts: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('ghl_accounts')
            .select('id, account_name, location_id, calendar_id, pipeline_id, is_active, is_default, notes, created_at')
            .eq('is_active', true)
            .order('is_default', { ascending: false })
            .order('account_name', { ascending: true });

          if (error) throw error;

          const accounts: GHLAccountDisplay[] = (data || []).map((row: any) => ({
            id: row.id,
            accountName: row.account_name,
            locationId: row.location_id,
            calendarId: row.calendar_id,
            pipelineId: row.pipeline_id,
            isActive: row.is_active,
            isDefault: row.is_default,
            notes: row.notes,
            createdAt: row.created_at,
          }));

          set({ accounts, isLoading: false });

          const current = get().selectedAccount;
          if (!current && accounts.length > 0) {
            const defaultAccount = accounts.find(acc => acc.isDefault) || accounts[0];
            set({ selectedAccount: defaultAccount });
          }
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          }
      },

      selectAccount: (account: GHLAccountDisplay) => {
        set({ selectedAccount: account });
      },

      setDefaultAccount: async () => {
        const defaultAccount = get().accounts.find(acc => acc.isDefault);
        if (defaultAccount) {
          set({ selectedAccount: defaultAccount });
        } else {
          await get().fetchAccounts();
        }
      },

      refreshAccounts: async () => {
        await get().fetchAccounts();
      },
    }),
    {
      name: 'ghl-accounts-storage',
      partialize: (state: GHLAccountsState) => ({
        selectedAccount: state.selectedAccount,
      }),
    }
  )
);
