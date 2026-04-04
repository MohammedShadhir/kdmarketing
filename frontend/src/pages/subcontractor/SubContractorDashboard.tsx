import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useProjectsStore } from '@/store/projects.store';
import { useSubContractorsStore } from '@/store/subcontractors.store';
import { formatCurrency } from '@/lib/dates';
import { SubContractorProjectCard } from '@/components/subcontractor/SubContractorProjectCard';

export function SubContractorDashboard() {
  const user = useAuthStore((s) => s.user);
  const { projects, fetchProjects, loading } = useProjectsStore();
  const { subContractors, fetchSubContractors } = useSubContractorsStore();

  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');

  useEffect(() => {
    if (user?.subContractorId) {
      fetchProjects(user.subContractorId);
      fetchSubContractors();
    }
  }, [user, fetchProjects, fetchSubContractors]);

  const subContractor = useMemo(() => {
    return subContractors.find((sc) => sc.id === user?.subContractorId);
  }, [subContractors, user]);

  const visibleProjects = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];

    return projects.filter((project) => {
      if (project.subContractorId !== user?.subContractorId) return false;

      if (project.visibility === 'private') return false;

      if (project.startDate && project.startDate > today) return false;

      if (filter === 'active') {
        return project.status === 'Active' || project.status === 'On Hold';
      } else if (filter === 'completed') {
        return project.status === 'Completed';
      }

      return true;
    });
  }, [projects, user, filter]);

  const paymentSummary = useMemo(() => {
    let totalAllocated = 0;
    let totalPaid = 0;

    visibleProjects.forEach((project) => {
      const allocated = project.projectPrice * (project.subcontractorPercentage / 100);
      totalAllocated += allocated;

      if (Array.isArray(project.payments)) {
        project.payments.forEach((payment) => {
          if (
            payment.paymentType === 'subcontractor_payment' ||
            payment.paymentType === 'subcontractor_check_collected'
          ) {
            totalPaid += payment.amount;
          }
        });
      }
    });

    return {
      totalAllocated,
      totalPaid,
      remaining: totalAllocated - totalPaid,
    };
  }, [visibleProjects]);

  if (!user?.subContractorId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">No sub-contractor account found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 sm:p-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Welcome, {subContractor?.name || 'Sub-Contractor'}!</h1>
          {subContractor?.companyName && (
            <p className="text-blue-100 text-lg">{subContractor.companyName}</p>
          )}
          <div className="mt-4 text-blue-100 text-sm">
            <p>View and manage your assigned projects</p>
          </div>
        </div>
      </div>

      {}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md border-2 border-blue-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Total Allocated</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600">{formatCurrency(paymentSummary.totalAllocated)}</p>
            <p className="text-sm text-gray-500 mt-1">From all projects</p>
          </div>

          <div className="bg-white rounded-xl shadow-md border-2 border-green-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Total Paid</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(paymentSummary.totalPaid)}</p>
            <p className="text-sm text-gray-500 mt-1">Received payments</p>
          </div>

          <div className="bg-white rounded-xl shadow-md border-2 border-orange-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Remaining</h3>
            </div>
            <p className="text-3xl font-bold text-orange-600">{formatCurrency(paymentSummary.remaining)}</p>
            <p className="text-sm text-gray-500 mt-1">Yet to be paid</p>
          </div>
        </div>

        {}
        <div className="flex items-center gap-2 mb-6 bg-white p-2 rounded-lg shadow-sm">
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'active'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Active Projects
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'completed'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All Projects
          </button>
        </div>

        {}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading projects...</p>
          </div>
        ) : visibleProjects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 text-lg font-medium">No projects found</p>
            <p className="text-gray-400 text-sm mt-2">You don't have any {filter !== 'all' ? filter : ''} projects yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {visibleProjects.map((project) => (
              <SubContractorProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
