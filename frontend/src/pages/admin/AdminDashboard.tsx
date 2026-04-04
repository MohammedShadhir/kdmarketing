import { useEffect, useState } from 'react';
import { Users, Briefcase, UserCircle, UserCheck } from 'lucide-react';
import { getSubContractors, getAllUsers } from '@/services/supabase';
import { SubContractor } from '@/types/domain';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
}

export function AdminDashboard() {
  const [subContractors, setSubContractors] = useState<SubContractor[]>([]);
  const [salesUsers, setSalesUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subcontractorsData, usersData] = await Promise.all([
        getSubContractors(),
        getAllUsers()
      ]);

      setSubContractors(subcontractorsData);
      setSalesUsers(usersData.filter(u => u.role === 'sales'));
    } catch (error) {
      } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      fetchData();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Overview of your system</p>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2 min-h-[44px]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sub-Contractors</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{subContractors.length}</p>
              </div>
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-500">
                Total registered sub-contractors
              </p>
            </div>
          </div>

          {}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-emerald-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sales Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{salesUsers.length}</p>
              </div>
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center">
                <UserCircle className="w-8 h-8 text-emerald-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-500">
                Active: {salesUsers.filter(u => u.is_active).length}
              </p>
            </div>
          </div>

          {}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {subContractors.length + salesUsers.length}
                </p>
              </div>
              <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
                <Briefcase className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-500">
                Across all roles
              </p>
            </div>
          </div>
        </div>

        {}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => window.location.href = '/admin/user-management'}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-emerald-600" />
                <div>
                  <p className="font-semibold text-gray-900">User Management</p>
                  <p className="text-sm text-gray-600">View, edit, and delete sales & sub-contractor accounts</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => window.location.href = '/admin/sales-assignments'}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <UserCheck className="w-6 h-6 text-purple-600" />
                <div>
                  <p className="font-semibold text-gray-900">Sales Assignments</p>
                  <p className="text-sm text-gray-600">Assign sub-contractors to sales users</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => window.location.href = '/sales/sub-contractors'}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <Briefcase className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="font-semibold text-gray-900">View Sub-Contractors</p>
                  <p className="text-sm text-gray-600">Browse all sub-contractor profiles</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
