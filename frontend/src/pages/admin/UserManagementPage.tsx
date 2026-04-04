import { useEffect, useState } from 'react';
import { Users, UserCircle, Edit2, Trash2, Briefcase, GitMerge } from 'lucide-react';
import { getAllUsers, deleteUser, getSubContractors, deleteSubContractor, updateUser, updateSubContractor, getSubContractorProjectCounts, mergeSubContractors } from '@/services/supabase';
import { SubContractor } from '@/types/domain';
import { EditSalesUserModal } from '@/components/admin/EditSalesUserModal';
import { EditSubContractorModal } from '@/components/admin/EditSubContractorModal';
import { MergeSubContractorsModal } from '@/components/admin/MergeSubContractorsModal';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
  default_sales_commission?: number;
}

export function UserManagementPage() {
  const [salesUsers, setSalesUsers] = useState<User[]>([]);
  const [subContractors, setSubContractors] = useState<SubContractor[]>([]);
  const [projectCounts, setProjectCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [editingSalesUser, setEditingSalesUser] = useState<User | null>(null);
  const [editingSubContractor, setEditingSubContractor] = useState<SubContractor | null>(null);
  const [showMergeModal, setShowMergeModal] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, subContractorsData, projectCountsData] = await Promise.all([
        getAllUsers(),
        getSubContractors(),
        getSubContractorProjectCounts()
      ]);

      setSalesUsers(usersData.filter(u => u.role === 'sales'));
      setSubContractors(subContractorsData);
      setProjectCounts(projectCountsData);
    } catch (error) {
      } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteSalesUser = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the sales user "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteUser(id);
      setSalesUsers(prev => prev.filter(u => u.id !== id));
      alert('Sales user deleted successfully');
    } catch (error) {
      alert('Failed to delete sales user. Please try again.');
    }
  };

  const handleDeleteSubContractor = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the sub-contractor "${name}"? This will also delete all associated projects. This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteSubContractor(id);
      setSubContractors(prev => prev.filter(sc => sc.id !== id));
      alert('Sub-contractor deleted successfully');
    } catch (error) {
      alert('Failed to delete sub-contractor. Please try again.');
    }
  };

  const handleToggleUserStatus = async (user: User) => {
    try {
      await updateUser(user.id, { is_active: !user.is_active });
      setSalesUsers(prev => prev.map(u =>
        u.id === user.id ? { ...u, is_active: !u.is_active } : u
      ));
    } catch (error) {
      alert('Failed to update user status.');
    }
  };

  const handleMergeSubContractors = async (keepId: string, mergeId: string) => {
    try {
      const result = await mergeSubContractors(keepId, mergeId);
      alert(`Successfully merged! ${result.projectsMoved} projects moved to the original sub-contractor.`);
      setShowMergeModal(false);
      await fetchData();
    } catch (error) {
      alert('Failed to merge sub-contractors. Please try again.');
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">Manage sales users and sub-contractors</p>
          </div>
          <button
            onClick={() => window.location.href = '/admin/create-user'}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 min-h-[44px]"
          >
            <UserCircle className="w-5 h-5" />
            Create New User
          </button>
        </div>

        {}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <UserCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Sales Users</h2>
                <p className="text-xs sm:text-sm text-gray-600">{salesUsers.length} total users</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table-base">
                <thead>
                  <tr className="table-header">
                    <th className="table-header-cell">Name</th>
                    <th className="table-header-cell">Email</th>
                    <th className="table-header-cell text-center">Commission</th>
                    <th className="table-header-cell">Status</th>
                    <th className="table-header-cell text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {salesUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="table-cell text-center py-8 text-gray-500">
                        No sales users found
                      </td>
                    </tr>
                  ) : (
                    salesUsers.map((user) => (
                      <tr key={user.id} className="table-row">
                        <td className="table-cell">
                          <span className="font-semibold text-gray-900">{user.name}</span>
                        </td>
                        <td className="table-cell">
                          <span className="text-gray-700 text-sm">{user.email}</span>
                        </td>
                        <td className="table-cell text-center">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {user.default_sales_commission ?? 15}%
                          </span>
                        </td>
                        <td className="table-cell">
                          <button
                            onClick={() => handleToggleUserStatus(user)}
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                              user.is_active
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                          >
                            {user.is_active ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setEditingSalesUser(user)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit user"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteSalesUser(user.id, user.name)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete user"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {}
        <div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Sub-Contractors</h2>
                <p className="text-xs sm:text-sm text-gray-600">{subContractors.length} total sub-contractors</p>
              </div>
            </div>
            <button
              onClick={() => setShowMergeModal(true)}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 min-h-[44px]"
            >
              <GitMerge className="w-4 h-4" />
              Merge Duplicates
            </button>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table-base">
                <thead>
                  <tr className="table-header">
                    <th className="table-header-cell">Name</th>
                    <th className="table-header-cell">Email</th>
                    <th className="table-header-cell">Phone</th>
                    <th className="table-header-cell">Company</th>
                    <th className="table-header-cell text-center">Projects</th>
                    <th className="table-header-cell text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subContractors.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="table-cell text-center py-8 text-gray-500">
                        No sub-contractors found
                      </td>
                    </tr>
                  ) : (
                    subContractors.map((subContractor) => {
                      const projectCount = projectCounts[subContractor.id] || 0;
                      return (
                        <tr key={subContractor.id} className="table-row">
                          <td className="table-cell">
                            <span className="font-semibold text-gray-900">{subContractor.name}</span>
                          </td>
                          <td className="table-cell">
                            <span className="text-gray-700 text-sm">{subContractor.email || 'N/A'}</span>
                          </td>
                          <td className="table-cell">
                            <span className="text-gray-700 text-sm">{subContractor.phone || 'N/A'}</span>
                          </td>
                          <td className="table-cell">
                            <span className="text-gray-700 text-sm">{subContractor.companyName || 'N/A'}</span>
                          </td>
                          <td className="table-cell">
                            <div className="flex items-center justify-center gap-1.5">
                              <Briefcase className="w-4 h-4 text-blue-600" />
                              <span className={`font-semibold ${projectCount > 0 ? 'text-blue-700' : 'text-gray-500'}`}>
                                {projectCount}
                              </span>
                            </div>
                          </td>
                          <td className="table-cell">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => setEditingSubContractor(subContractor)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit sub-contractor"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteSubContractor(subContractor.id, subContractor.name)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete sub-contractor"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {}
      {editingSalesUser && (
        <EditSalesUserModal
          user={editingSalesUser}
          onClose={() => setEditingSalesUser(null)}
          onSave={async (updates) => {
            try {
              await updateUser(editingSalesUser.id, updates);
              await fetchData();
              setEditingSalesUser(null);
              alert('Sales user updated successfully');
            } catch (error) {
              alert('Failed to update sales user. Please try again.');
            }
          }}
        />
      )}

      {}
      {editingSubContractor && (
        <EditSubContractorModal
          subContractor={editingSubContractor}
          onClose={() => setEditingSubContractor(null)}
          onSave={async (updates) => {
            try {
              await updateSubContractor(editingSubContractor.id, updates);
              await fetchData();
              setEditingSubContractor(null);
              alert('Sub-contractor updated successfully');
            } catch (error) {
              alert('Failed to update sub-contractor. Please try again.');
            }
          }}
        />
      )}

      {}
      {showMergeModal && (
        <MergeSubContractorsModal
          subContractors={subContractors}
          projectCounts={projectCounts}
          onClose={() => setShowMergeModal(false)}
          onMerge={handleMergeSubContractors}
        />
      )}
    </div>
  );
}
