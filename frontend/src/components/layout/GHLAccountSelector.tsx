import React, { useEffect } from 'react';
import { ChevronDown, Building2, CheckCircle2 } from 'lucide-react';
import { useGHLAccountsStore } from '@/store/ghlAccounts.store';
import { cn } from '@/lib/utils';

export const GHLAccountSelector: React.FC = () => {
  const { accounts, selectedAccount, isLoading, fetchAccounts, selectAccount } = useGHLAccountsStore();
  const [isOpen, setIsOpen] = React.useState(false);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  if (isLoading || accounts.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      {}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
      >
        <Building2 className="w-4 h-4 text-emerald-700" />
        <div className="text-left">
          <div className="text-xs font-medium text-emerald-900">
            {selectedAccount?.accountName || 'Select Account'}
          </div>
          <div className="text-[10px] text-emerald-600">GHL Account</div>
        </div>
        <ChevronDown className={cn(
          "w-4 h-4 text-emerald-700 transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>

      {}
      {isOpen && (
        <>
          {}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {}
          <div className="absolute right-0 mt-2 w-screen sm:w-72 max-w-[90vw] bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
            <div className="p-2 bg-emerald-50 border-b border-emerald-100">
              <p className="text-xs font-semibold text-emerald-900 px-2">Select GHL Account</p>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {accounts.map((account) => (
                <button
                  key={account.id}
                  onClick={() => {
                    selectAccount(account);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0",
                    selectedAccount?.id === account.id && "bg-emerald-50 hover:bg-emerald-100"
                  )}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {selectedAccount?.id === account.id ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Building2 className="w-5 h-5 text-gray-400" />
                    )}
                  </div>

                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        "font-medium text-sm",
                        selectedAccount?.id === account.id ? "text-emerald-900" : "text-gray-900"
                      )}>
                        {account.accountName}
                      </span>
                      {account.isDefault && (
                        <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-700 rounded">
                          DEFAULT
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 font-mono">ID: {account.locationId}</p>
                    {account.notes && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{account.notes}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="p-2 bg-gray-50 border-t border-gray-200">
              <p className="text-[10px] text-gray-500 text-center">
                {accounts.length} account{accounts.length !== 1 ? 's' : ''} available
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
