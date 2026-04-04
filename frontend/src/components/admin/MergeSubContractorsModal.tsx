import { useState } from 'react';
import { SubContractor } from '@/types/domain';
import { X, AlertTriangle, ArrowRight } from 'lucide-react';

interface Props {
  subContractors: SubContractor[];
  projectCounts: Record<string, number>;
  onClose: () => void;
  onMerge: (keepId: string, mergeId: string) => Promise<void>;
}

export function MergeSubContractorsModal({ subContractors, projectCounts, onClose, onMerge }: Props) {
  const [keepId, setKeepId] = useState('');
  const [mergeId, setMergeId] = useState('');
  const [loading, setLoading] = useState(false);

  const keepSubContractor = subContractors.find(sc => sc.id === keepId);
  const mergeSubContractor = subContractors.find(sc => sc.id === mergeId);
  const keepProjects = projectCounts[keepId] || 0;
  const mergeProjects = projectCounts[mergeId] || 0;
  const totalProjects = keepProjects + mergeProjects;

  const handleMerge = async () => {
    if (!keepId || !mergeId) {
      alert('Please select both sub-contractors');
      return;
    }

    if (keepId === mergeId) {
      alert('Cannot merge a sub-contractor with itself');
      return;
    }

    if (!confirm(
      `Are you sure you want to merge these sub-contractors?\n\n` +
      `KEEP: ${keepSubContractor?.name} (${keepSubContractor?.email})\n` +
      `MERGE & DELETE: ${mergeSubContractor?.name} (${mergeSubContractor?.email})\n\n` +
      `This will move ${mergeProjects} projects from the duplicate to the original.\n` +
      `The duplicate will be permanently deleted.\n\n` +
      `This action CANNOT be undone!`
    )) {
      return;
    }

    setLoading(true);
    try {
      await onMerge(keepId, mergeId);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {}
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white p-6 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Merge Duplicate Sub-Contractors</h2>
              <p className="text-orange-100 text-sm">Combine duplicate entries by moving all projects to the original</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {}
        <div className="p-6 space-y-6">
          {}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-semibold mb-1">Warning: This action cannot be undone!</p>
                <p>The duplicate sub-contractor will be permanently deleted after merging.</p>
              </div>
            </div>
          </div>

          {}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Keep (Original)
              </label>
              <select
                value={keepId}
                onChange={(e) => setKeepId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Select original...</option>
                {subContractors.map((sc) => (
                  <option key={sc.id} value={sc.id}>
                    {sc.name} ({sc.email || 'No email'})
                  </option>
                ))}
              </select>
              {keepSubContractor && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                  <p className="font-semibold text-green-900">{keepSubContractor.name}</p>
                  <p className="text-green-700 text-xs">{keepSubContractor.email || 'N/A'}</p>
                  <p className="text-green-700 text-xs mt-1">Current projects: {keepProjects}</p>
                </div>
              )}
            </div>

            {}
            <div className="flex justify-center">
              <ArrowRight className="w-8 h-8 text-orange-600" />
            </div>

            {}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Merge & Delete (Duplicate)
              </label>
              <select
                value={mergeId}
                onChange={(e) => setMergeId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">Select duplicate...</option>
                {subContractors.map((sc) => (
                  <option key={sc.id} value={sc.id}>
                    {sc.name} ({sc.email || 'No email'})
                  </option>
                ))}
              </select>
              {mergeSubContractor && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                  <p className="font-semibold text-red-900">{mergeSubContractor.name}</p>
                  <p className="text-red-700 text-xs">{mergeSubContractor.email || 'N/A'}</p>
                  <p className="text-red-700 text-xs mt-1">Projects to move: {mergeProjects}</p>
                </div>
              )}
            </div>
          </div>

          {}
          {keepId && mergeId && keepId !== mergeId && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Merge Result Preview:</h3>
              <div className="space-y-1 text-sm text-blue-800">
                <p>• {keepSubContractor?.name} will have <strong>{totalProjects} projects</strong> ({keepProjects} existing + {mergeProjects} moved)</p>
                <p>• {mergeSubContractor?.name} will be <strong className="text-red-700">permanently deleted</strong></p>
                <p>• All projects will be reassigned to {keepSubContractor?.email}</p>
              </div>
            </div>
          )}
        </div>

        {}
        <div className="flex justify-end gap-3 p-6 pt-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 disabled:bg-gray-100 disabled:text-gray-400 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleMerge}
            disabled={loading || !keepId || !mergeId || keepId === mergeId}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Merging...
              </>
            ) : (
              'Merge Sub-Contractors'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
