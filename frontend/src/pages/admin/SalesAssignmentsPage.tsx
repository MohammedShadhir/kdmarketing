import { useEffect, useState } from 'react';
import { Users, UserCircle, Check, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { getAllUsers, getSubContractors, getAllAssignments, bulkAssignSubcontractors } from '@/services/supabase';
import { SubContractor } from '@/types/domain';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
}

interface Assignment {
  id: string;
  salesUserId: string;
  subcontractorId: string;
  createdAt: string;
}

export function SalesAssignmentsPage() {
  const [salesUsers, setSalesUsers] = useState<User[]>([]);
  const [subContractors, setSubContractors] = useState<SubContractor[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [pendingChanges, setPendingChanges] = useState<Record<string, string[]>>({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, subContractorsData, assignmentsData] = await Promise.all([
        getAllUsers(),
        getSubContractors(),
        getAllAssignments()
      ]);

      setSalesUsers(usersData.filter(u => u.role === 'sales'));
      setSubContractors(subContractorsData);
      setAssignments(assignmentsData);
    } catch (error) {
      } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getAssignedSubcontractorIds = (salesUserId: string): string[] => {
    if (pendingChanges[salesUserId] !== undefined) {
      return pendingChanges[salesUserId];
    }
    return assignments
      .filter(a => a.salesUserId === salesUserId)
      .map(a => a.subcontractorId);
  };

  const hasAssignments = (salesUserId: string): boolean => {
    const assigned = getAssignedSubcontractorIds(salesUserId);
    return assigned.length > 0;
  };
  void hasAssignments;

  const toggleAssignment = (salesUserId: string, subcontractorId: string) => {
    const currentAssigned = getAssignedSubcontractorIds(salesUserId);
    let newAssigned: string[];

    if (currentAssigned.includes(subcontractorId)) {
      newAssigned = currentAssigned.filter(id => id !== subcontractorId);
    } else {
      newAssigned = [...currentAssigned, subcontractorId];
    }

    setPendingChanges(prev => ({
      ...prev,
      [salesUserId]: newAssigned
    }));
  };

  const selectAll = (salesUserId: string) => {
    setPendingChanges(prev => ({
      ...prev,
      [salesUserId]: subContractors.map(sc => sc.id)
    }));
  };

  const clearAll = (salesUserId: string) => {
    setPendingChanges(prev => ({
      ...prev,
      [salesUserId]: []
    }));
  };

  const saveChanges = async (salesUserId: string) => {
    const newAssignments = pendingChanges[salesUserId];
    if (newAssignments === undefined) return;

    try {
      setSaving(salesUserId);
      await bulkAssignSubcontractors(salesUserId, newAssignments);

      const updatedAssignments = await getAllAssignments();
      setAssignments(updatedAssignments);

      setPendingChanges(prev => {
        const newPending = { ...prev };
        delete newPending[salesUserId];
        return newPending;
      });

      alert('Assignments saved successfully!');
    } catch (error) {
      alert('Failed to save assignments. Please try again.');
    } finally {
      setSaving(null);
    }
  };

  const discardChanges = (salesUserId: string) => {
    setPendingChanges(prev => {
      const newPending = { ...prev };
      delete newPending[salesUserId];
      return newPending;
    });
  };

  const hasUnsavedChanges = (salesUserId: string): boolean => {
    return pendingChanges[salesUserId] !== undefined;
  };

  const filteredSubcontractors = subContractors.filter(sc =>
    sc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Sales Assignments</h1>
              <p className="text-gray-600 text-sm sm:text-base">Assign sub-contractors to sales users</p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> If a sales user has <strong>no assignments</strong>, they can see <strong>all sub-contractors</strong> (Full Access).
              Add specific assignments to restrict their view.
            </p>
          </div>
        </div>

        {}
        <div className="space-y-4">
          {salesUsers.map((user) => {
            const isExpanded = expandedUser === user.id;
            const assignedIds = getAssignedSubcontractorIds(user.id);
            const assignedCount = assignedIds.length;
            const hasPending = hasUnsavedChanges(user.id);
            const isSaving = saving === user.id;

            return (
              <div key={user.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                {}
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedUser(isExpanded ? null : user.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                      <UserCircle className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{user.name}</h3>
                        {hasPending && (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                            Unsaved
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {assignedCount === 0 ? (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-sm font-medium rounded-full">
                        Full Access
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                        {assignedCount} assigned
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>

                {}
                {isExpanded && (
                  <div className="border-t border-gray-200 p-4">
                    {}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                      <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search sub-contractors..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            selectAll(user.id);
                          }}
                          className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          Select All
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            clearAll(user.id);
                          }}
                          className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          Clear All (Full Access)
                        </button>
                      </div>
                    </div>

                    {}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[400px] overflow-y-auto mb-4">
                      {filteredSubcontractors.map((sc) => {
                        const isAssigned = assignedIds.includes(sc.id);
                        return (
                          <button
                            key={sc.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleAssignment(user.id, sc.id);
                            }}
                            className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                              isAssigned
                                ? 'border-emerald-500 bg-emerald-50'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <div
                              className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${
                                isAssigned
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-gray-200'
                              }`}
                            >
                              {isAssigned && <Check className="w-3.5 h-3.5" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900 truncate">{sc.name}</p>
                              {sc.companyName && (
                                <p className="text-xs text-gray-500 truncate">{sc.companyName}</p>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {}
                    {hasPending && (
                      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            discardChanges(user.id);
                          }}
                          disabled={isSaving}
                          className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                        >
                          Discard
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            saveChanges(user.id);
                          }}
                          disabled={isSaving}
                          className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          {isSaving ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Saving...
                            </>
                          ) : (
                            'Save Changes'
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {salesUsers.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No sales users found</p>
          </div>
        )}
      </div>
    </div>
  );
}
