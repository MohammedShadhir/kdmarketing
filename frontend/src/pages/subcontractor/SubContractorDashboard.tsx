import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useProjectsStore } from '@/store/projects.store';
import { useSubContractorsStore } from '@/store/subcontractors.store';
import { formatCurrency } from '@/lib/dates';
import { SubContractorProjectCard } from '@/components/subcontractor/SubContractorProjectCard';
import { useCityStore } from '@/store/city.store';
import { locations, MainLocation } from '@/data/locations';

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

  const { selectedCity } = useCityStore();

  const visibleProjects = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const subLocations: string[] = selectedCity
      ? (locations[selectedCity as MainLocation] || []).map((loc) =>
        loc.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim()
      )
      : [];

    return projects.filter((project) => {
      if (project.subContractorId !== user?.subContractorId) return false;

      if (project.visibility === 'private') return false;

      if (project.startDate && project.startDate > today) return false;

      if (selectedCity && project.city) {
        const projectCity = project.city.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();

        // Partial match: check if any sub-location is included in project city
        const matches = subLocations.some((loc) => projectCity.includes(loc) || loc.includes(projectCity));

        if (!matches) return false;
      }

      if (filter === 'active') {
        return project.status === 'Active' || project.status === 'On Hold';
      } else if (filter === 'completed') {
        return project.status === 'Completed';
      }

      return true;
    });
  }, [projects, user, filter, selectedCity]);

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
      { }
      <div className="p-6 text-white shadow-lg bg-gradient-to-r from-blue-600 to-blue-700 sm:p-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-2 text-3xl font-bold sm:text-4xl">Welcome, {subContractor?.name || 'Sub-Contractor'}!</h1>
          {subContractor?.companyName && (
            <p className="text-lg text-blue-100">{subContractor.companyName}</p>
          )}
          <div className="mt-4 text-sm text-blue-100">
            <p>View and manage your assigned projects</p>
          </div>
        </div>
      </div>

      { }
      <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6">
        <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-3">
          <div className="p-6 bg-white border-2 border-blue-200 shadow-md rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-sm font-bold tracking-wider text-gray-700 uppercase">Total Allocated</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600">{formatCurrency(paymentSummary.totalAllocated)}</p>
            <p className="mt-1 text-sm text-gray-500">From all projects</p>
          </div>

          <div className="p-6 bg-white border-2 border-green-200 shadow-md rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-sm font-bold tracking-wider text-gray-700 uppercase">Total Paid</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(paymentSummary.totalPaid)}</p>
            <p className="mt-1 text-sm text-gray-500">Received payments</p>
          </div>

          <div className="p-6 bg-white border-2 border-orange-200 shadow-md rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-sm font-bold tracking-wider text-gray-700 uppercase">Remaining</h3>
            </div>
            <p className="text-3xl font-bold text-orange-600">{formatCurrency(paymentSummary.remaining)}</p>
            <p className="mt-1 text-sm text-gray-500">Yet to be paid</p>
          </div>
        </div>

        { }
        {/* <div className="flex items-center gap-2 p-2 mb-6 bg-white rounded-lg shadow-sm">
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'active'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            Active Projects
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'completed'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            All Projects
          </button>
        </div> */}

        <div className="flex items-center gap-2 p-2 mb-6 bg-white rounded-lg shadow-sm">

          {/* Status Filter Buttons */}
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'active' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            Active Projects
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'completed' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            All Projects
          </button>
        </div>

        { }
        {loading ? (
          <div className="py-12 text-center">
            <p className="text-gray-500">Loading projects...</p>
          </div>
        ) : visibleProjects.length === 0 ? (
          <div className="py-12 text-center bg-white shadow-sm rounded-xl">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg font-medium text-gray-500">No projects found</p>
            <p className="mt-2 text-sm text-gray-400">You don't have any {filter !== 'all' ? filter : ''} projects yet</p>
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
