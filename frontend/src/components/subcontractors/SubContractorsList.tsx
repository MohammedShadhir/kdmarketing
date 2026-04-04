import { useState, useEffect } from 'react';
import { useSubContractorsStore } from '@/store/subcontractors.store';
import { AddSubContractorModal } from './AddSubContractorModal';

export function SubContractorsList() {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const subContractors = useSubContractorsStore((s) => s.subContractors);
  const loading = useSubContractorsStore((s) => s.loading);
  const error = useSubContractorsStore((s) => s.error);
  const selectedSubContractorId = useSubContractorsStore((s) => s.selectedSubContractorId);
  const setSelectedSubContractorId = useSubContractorsStore((s) => s.setSelectedSubContractorId);
  const fetchSubContractors = useSubContractorsStore((s) => s.fetchSubContractors);

  useEffect(() => {
    fetchSubContractors();
  }, [fetchSubContractors]);

  const filtered = subContractors.filter((sc) =>
    sc.name.toLowerCase().includes(search.toLowerCase()) ||
    sc.email?.toLowerCase().includes(search.toLowerCase()) ||
    sc.companyName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="bg-white">
        {}
        <div className="p-3 sm:p-4 border-b border-gray-200 bg-gradient-to-b from-white to-gray-50">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <div className="flex items-center justify-between sm:justify-start gap-2 flex-1">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse"></span>
                Sub-Contractors
                {subContractors.length > 0 && (
                  <span className="text-xs text-gray-500 font-normal">
                    ({subContractors.length})
                  </span>
                )}
              </h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary text-xs sm:text-sm py-2 px-3 flex items-center gap-1 flex-shrink-0"
                title="Add Sub-Contractor"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Add</span>
              </button>
            </div>

            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field w-full sm:w-64 text-sm"
              disabled={loading}
            />
          </div>
        </div>

        {}
        {error && (
          <div className="p-3 mx-3 mt-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <strong>Error:</strong> {error}
            <button
              onClick={() => fetchSubContractors()}
              className="ml-2 text-red-600 underline hover:text-red-800"
            >
              Retry
            </button>
          </div>
        )}

        {}
        <div className="overflow-x-auto overflow-y-hidden">
          {}
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600 text-sm">Loading...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {subContractors.length === 0 ? (
                <div>
                  <div className="text-4xl mb-2">👷</div>
                  <p className="font-medium mb-1 text-sm">No sub-contractors yet</p>
                  <p className="text-xs mb-3">Add your first sub-contractor</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="btn-primary text-sm"
                  >
                    + Add Sub-Contractor
                  </button>
                </div>
              ) : (
                <p className="text-sm">No results found</p>
              )}
            </div>
          ) : (
            <div className="flex gap-2 p-3 min-h-[120px]">
              {filtered.map((subContractor) => (
                <button
                  key={subContractor.id}
                  onClick={() => setSelectedSubContractorId(subContractor.id)}
                  className={[
                    'flex-shrink-0 w-[200px] sm:w-[240px] text-left p-3 rounded-lg border-2 transition-all duration-200',
                    selectedSubContractorId === subContractor.id
                      ? 'bg-emerald-50 border-emerald-600 shadow-md ring-2 ring-emerald-200'
                      : 'bg-white border-gray-200 hover:border-emerald-300 hover:shadow-sm',
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-semibold text-sm text-gray-900 truncate pr-2 flex-1">
                      {subContractor.name}
                    </div>
                    {selectedSubContractorId === subContractor.id && (
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                      </div>
                    )}
                  </div>
                  {subContractor.companyName && (
                    <div className="text-xs text-gray-500 truncate mb-1">
                      {subContractor.companyName}
                    </div>
                  )}
                  <div className="text-xs text-gray-600 truncate">
                    {subContractor.email || 'No email'}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {}
      {showAddModal && (
        <AddSubContractorModal onClose={() => setShowAddModal(false)} />
      )}
    </>
  );
}
