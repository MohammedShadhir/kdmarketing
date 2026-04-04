import React, { useEffect, useState } from 'react';
import { Plus, Building2, Trash2, Edit, Star, AlertCircle } from 'lucide-react';
import { useGHLAccountsStore } from '@/store/ghlAccounts.store';
import { supabase } from '@/services/supabase';
import type { GHLAccountInput } from '@/types/domain';

export const GHLAccountsPage: React.FC = () => {
  let accounts, fetchAccounts, selectedAccount, selectAccount, isLoading, storeError;

  try {
    const store = useGHLAccountsStore();
    accounts = store.accounts;
    fetchAccounts = store.fetchAccounts;
    selectedAccount = store.selectedAccount;
    selectAccount = store.selectAccount;
    isLoading = store.isLoading;
    storeError = store.error;
    } catch (err) {
    return <div className="p-8 text-red-600">ERROR: Failed to load store: {String(err)}</div>;
  }

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  useEffect(() => {
    }, [accounts, isLoading, storeError]);

  const handleAddAccount = () => {
    setEditingAccount(null);
    setIsAddModalOpen(true);
  };

  const handleEditAccount = (account: any) => {
    setEditingAccount(account);
    setIsAddModalOpen(true);
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm('Are you sure you want to delete this GHL account? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from('ghl_accounts')
        .delete()
        .eq('id', accountId);

      if (deleteError) throw deleteError;

      setSuccess('Account deleted successfully');
      fetchAccounts();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (accountId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from('ghl_accounts')
        .update({ is_default: true })
        .eq('id', accountId);

      if (updateError) throw updateError;

      setSuccess('Default account updated');
      fetchAccounts();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {}
      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm font-mono">DEBUG: Component is rendering</p>
        <p className="text-sm font-mono">Accounts count: {accounts.length}</p>
        <p className="text-sm font-mono">Is loading: {String(isLoading)}</p>
        <p className="text-sm font-mono">Error: {storeError || 'none'}</p>
      </div>

      {}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">GHL Accounts</h1>
        <p className="text-gray-600">Manage your GoHighLevel sub-account connections</p>
      </div>

      {}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-800">
          <AlertCircle className="w-5 h-5" />
          {success}
        </div>
      )}
      {(error || storeError) && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800">
          <AlertCircle className="w-5 h-5" />
          {error || storeError}
        </div>
      )}

      {}
      {isLoading && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 text-blue-800">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-800"></div>
          Loading accounts...
        </div>
      )}

      {}
      <div className="mb-6">
        <button
          onClick={handleAddAccount}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add New Account
        </button>
      </div>

      {}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => (
          <div
            key={account.id}
            className={`bg-white border rounded-lg p-6 hover:shadow-md transition-shadow ${
              selectedAccount?.id === account.id ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-gray-200'
            }`}
          >
            {}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-semibold text-gray-900">{account.accountName}</h3>
              </div>
              {account.isDefault && (
                <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                  <Star className="w-3 h-3 fill-current" />
                  Default
                </span>
              )}
            </div>

            {}
            <div className="space-y-2 mb-4">
              <div>
                <p className="text-xs text-gray-500">Location ID</p>
                <p className="text-sm font-mono text-gray-700">{account.locationId}</p>
              </div>
              {account.calendarId && (
                <div>
                  <p className="text-xs text-gray-500">Calendar ID</p>
                  <p className="text-sm font-mono text-gray-700">{account.calendarId}</p>
                </div>
              )}
              {account.notes && (
                <div>
                  <p className="text-xs text-gray-500">Notes</p>
                  <p className="text-sm text-gray-700">{account.notes}</p>
                </div>
              )}
            </div>

            {}
            <div className="flex gap-2 pt-4 border-t border-gray-100">
              <button
                onClick={() => selectAccount(account)}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  selectedAccount?.id === account.id
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {selectedAccount?.id === account.id ? 'Selected' : 'Select'}
              </button>
              {!account.isDefault && (
                <button
                  onClick={() => handleSetDefault(account.id)}
                  className="px-3 py-2 text-sm font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  title="Set as default"
                >
                  <Star className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => handleEditAccount(account)}
                className="px-3 py-2 text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                title="Edit account"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteAccount(account.id)}
                className="px-3 py-2 text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                title="Delete account"
                disabled={loading}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {accounts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No GHL accounts configured</h3>
          <p className="text-gray-600 mb-4">Add your first GoHighLevel sub-account to get started</p>
          <button
            onClick={handleAddAccount}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Account
          </button>
        </div>
      )}

      {}
      {isAddModalOpen && (
        <AccountFormModal
          account={editingAccount}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingAccount(null);
          }}
          onSuccess={() => {
            setIsAddModalOpen(false);
            setEditingAccount(null);
            fetchAccounts();
            setSuccess(editingAccount ? 'Account updated successfully' : 'Account added successfully');
            setTimeout(() => setSuccess(null), 3000);
          }}
        />
      )}
    </div>
  );
};

interface AccountFormModalProps {
  account: any | null;
  onClose: () => void;
  onSuccess: () => void;
}

const AccountFormModal: React.FC<AccountFormModalProps> = ({ account, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<GHLAccountInput>({
    accountName: account?.accountName || '',
    locationId: account?.locationId || '',
    apiToken: account?.apiToken || '',
    calendarId: account?.calendarId || '',
    pipelineId: account?.pipelineId || '',
    notes: account?.notes || '',
    isActive: account?.isActive ?? true,
    isDefault: account?.isDefault ?? false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (account) {
        const { error: updateError } = await supabase
          .from('ghl_accounts')
          .update({
            account_name: formData.accountName,
            location_id: formData.locationId,
            api_token: formData.apiToken,
            calendar_id: formData.calendarId || null,
            pipeline_id: formData.pipelineId || null,
            notes: formData.notes || null,
            is_active: formData.isActive,
            is_default: formData.isDefault,
          })
          .eq('id', account.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('ghl_accounts')
          .insert({
            account_name: formData.accountName,
            location_id: formData.locationId,
            api_token: formData.apiToken,
            calendar_id: formData.calendarId || null,
            pipeline_id: formData.pipelineId || null,
            notes: formData.notes || null,
            is_active: formData.isActive,
            is_default: formData.isDefault,
          });

        if (insertError) throw insertError;
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900">
            {account ? 'Edit GHL Account' : 'Add New GHL Account'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Name *
              </label>
              <input
                type="text"
                value={formData.accountName}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="e.g., All Pro Fence"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location ID *
              </label>
              <input
                type="text"
                value={formData.locationId}
                onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-sm"
                placeholder="fRrcVKjOTccYItbX9inw"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Token *
              </label>
              <input
                type="password"
                value={formData.apiToken}
                onChange={(e) => setFormData({ ...formData, apiToken: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-sm"
                placeholder="pit-xxxxx-xxxxx-xxxxx"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Calendar ID
              </label>
              <input
                type="text"
                value={formData.calendarId}
                onChange={(e) => setFormData({ ...formData, calendarId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-sm"
                placeholder="Optional: g7AcDupqIOtCPefWyhLo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pipeline ID
              </label>
              <input
                type="text"
                value={formData.pipelineId}
                onChange={(e) => setFormData({ ...formData, pipelineId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-sm"
                placeholder="Optional: 1234"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                rows={3}
                placeholder="Optional notes about this account"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Set as Default</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saving...' : account ? 'Update Account' : 'Add Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
