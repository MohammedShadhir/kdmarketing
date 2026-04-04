import { useState, useEffect, useRef } from 'react';
import { Contact } from '@/services/supabaseGHL';
import { Search, X } from 'lucide-react';

interface ClientAutocompleteProps {
  customersByAccount: Array<{ accountName: string; locationId: string; contacts: Contact[]; totalContacts?: number }>;
  onSelect: (contact: Contact | null) => void;
  onManualEntry: () => void;
  onSearch?: (query: string) => Promise<void>;
  isLoading?: boolean;
  loadingProgress?: string;
  loadingMore?: boolean;
  isSearching?: boolean;
  onLoadMore?: () => void;
  placeholder?: string;
  defaultValue?: string;
}

export function ClientAutocomplete({
  customersByAccount,
  onSelect,
  onManualEntry,
  onSearch,
  isLoading = false,
  loadingProgress = '',
  loadingMore = false,
  isSearching = false,
  onLoadMore,
  placeholder = 'Start typing to search clients...',
  defaultValue = ''
}: ClientAutocompleteProps) {
  const [searchQuery, setSearchQuery] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [filteredResults, setFilteredResults] = useState<Array<{ accountName: string; contacts: Contact[] }>>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!searchQuery.trim()) {
      setFilteredResults([]);
      return;
    }

    if (onSearch) {
      searchTimeoutRef.current = setTimeout(() => {
        onSearch(searchQuery);
      }, 500);

      return () => {
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }
      };
    }

    const query = searchQuery.toLowerCase();
    const results: Array<{ accountName: string; contacts: Contact[] }> = [];

    customersByAccount.forEach((account) => {
      const matchingContacts = account.contacts.filter((contact) => {
        const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.toLowerCase();
        const email = (contact.email || '').toLowerCase();
        const phone = (contact.phone || '').toLowerCase();

        return fullName.includes(query) || email.includes(query) || phone.includes(query);
      });

      if (matchingContacts.length > 0) {
        results.push({
          accountName: account.accountName,
          contacts: matchingContacts
        });
      }
    });

    setFilteredResults(results);
  }, [searchQuery, customersByAccount, onSearch]);

  useEffect(() => {
    if (!searchQuery.trim() || !onSearch) {
      return;
    }

    const query = searchQuery.toLowerCase();
    const results: Array<{ accountName: string; contacts: Contact[] }> = [];

    customersByAccount.forEach((account) => {
      const matchingContacts = account.contacts.filter((contact) => {
        const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.toLowerCase();
        const email = (contact.email || '').toLowerCase();
        const phone = (contact.phone || '').toLowerCase();

        return fullName.includes(query) || email.includes(query) || phone.includes(query);
      });

      if (matchingContacts.length > 0) {
        results.push({
          accountName: account.accountName,
          contacts: matchingContacts
        });
      }
    });

    setFilteredResults(results);
  }, [customersByAccount, searchQuery, onSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsOpen(true);

    if (selectedContact) {
      setSelectedContact(null);
      onSelect(null);
    }
  };

  const handleSelectContact = (contact: Contact) => {
    const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
    setSearchQuery(fullName);
    setSelectedContact(contact);
    setIsOpen(false);
    onSelect(contact);
  };

  const handleClear = () => {
    setSearchQuery('');
    setSelectedContact(null);
    setIsOpen(false);
    onSelect(null);
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    if (searchQuery.trim()) {
      setIsOpen(true);
    }
  };

  const totalResults = filteredResults.reduce((sum, group) => sum + group.contacts.length, 0);

  return (
    <div className="relative">
      {}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Search className="w-5 h-5" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={isLoading ? (loadingProgress || 'Loading customers...') : isSearching ? 'Searching...' : placeholder}
          disabled={isLoading || isSearching}
          className="input-field w-full pl-10 pr-10"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {}
      {isOpen && searchQuery.trim() && (
        <>
          {}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {}
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden"
          >
            {filteredResults.length > 0 ? (
              <>
                {}
                <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-100">
                  <p className="text-xs font-semibold text-emerald-900">
                    {totalResults} {totalResults === 1 ? 'client' : 'clients'} found
                  </p>
                </div>

                {}
                <div className="overflow-y-auto max-h-80">
                  {filteredResults.map((group) => {
                    const accountData = customersByAccount.find(acc => acc.accountName === group.accountName);
                    const totalInAccount = accountData?.totalContacts || accountData?.contacts.length || 0;

                    return <div key={group.accountName}>
                      {}
                      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                            {group.accountName}
                          </p>
                          <p className="text-xs text-gray-500 font-normal">
                            {group.contacts.length} of {totalInAccount} contacts
                          </p>
                        </div>
                      </div>

                      {}
                      {group.contacts.map((contact) => (
                        <button
                          key={contact.id}
                          type="button"
                          onClick={() => handleSelectContact(contact)}
                          className="w-full text-left px-4 py-3 hover:bg-emerald-50 transition-colors border-b border-gray-100 last:border-0"
                        >
                          <div className="flex items-start gap-3">
                            {}
                            <div className="flex-shrink-0 mt-1">
                              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                                <span className="text-emerald-700 font-semibold text-sm">
                                  {(contact.firstName || contact.email || '?').charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>

                            {}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 truncate">
                                {contact.firstName || ''} {contact.lastName || ''}
                              </div>
                              {contact.email && (
                                <div className="text-sm text-gray-600 truncate">{contact.email}</div>
                              )}
                              {contact.phone && (
                                <div className="text-sm text-gray-500">{contact.phone}</div>
                              )}
                              {contact.address1 && (
                                <div className="text-xs text-gray-400 truncate mt-1">{contact.address1}</div>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  })}
                </div>

                {}
                <div className="border-t border-gray-200 bg-gray-50">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onManualEntry();
                    }}
                    className="w-full px-4 py-3 text-left text-emerald-700 hover:bg-emerald-50 font-semibold text-sm transition-colors flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Enter customer name manually
                  </button>
                </div>
              </>
            ) : (
              <>
                {}
                <div className="px-4 py-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium mb-1">No clients found</p>
                  <p className="text-sm text-gray-500">
                    Try searching by name, email, or phone number
                  </p>
                </div>

                {}
                <div className="border-t border-gray-200 bg-gray-50">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onManualEntry();
                    }}
                    className="w-full px-4 py-3 text-left text-emerald-700 hover:bg-emerald-50 font-semibold text-sm transition-colors flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Enter customer name manually
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {}
      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="text-xs text-gray-500 flex-1">
          {isLoading && loadingProgress ? (
            <span className="text-emerald-600 font-medium">{loadingProgress}</span>
          ) : isSearching ? (
            <span className="text-emerald-600 font-medium">
              🔍 Searching across all GHL accounts...
            </span>
          ) : loadingProgress ? (
            <span className="text-emerald-600 font-medium">{loadingProgress}</span>
          ) : searchQuery.trim() ? (
            selectedContact ? (
              '✓ Client selected - address will be auto-filled'
            ) : (
              `Type to search across all ${customersByAccount.length} GHL accounts`
            )
          ) : (
            <>
              Search by name, email, or phone number
              {customersByAccount.length > 0 && (
                <span className="ml-1 text-emerald-600 font-medium">
                  ({customersByAccount.reduce((sum, acc) => sum + acc.contacts.length, 0)} / {customersByAccount.reduce((sum, acc) => sum + (acc.totalContacts || acc.contacts.length), 0)} loaded)
                </span>
              )}
            </>
          )}
        </p>

        {}
        {!searchQuery.trim() && onLoadMore && customersByAccount.length > 0 && (
          (() => {
            const loadedCount = customersByAccount.reduce((sum, acc) => sum + acc.contacts.length, 0);
            const totalCount = customersByAccount.reduce((sum, acc) => sum + (acc.totalContacts || acc.contacts.length), 0);
            const hasMore = loadedCount < totalCount;

            return hasMore ? (
              <button
                type="button"
                onClick={onLoadMore}
                disabled={loadingMore}
                className="flex-shrink-0 px-3 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingMore ? (
                  <>
                    <svg className="inline-block w-3 h-3 mr-1 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Loading...
                  </>
                ) : (
                  `Load 50 More • ${loadedCount} / ${totalCount}`
                )}
              </button>
            ) : null;
          })()
        )}
      </div>
    </div>
  );
}
