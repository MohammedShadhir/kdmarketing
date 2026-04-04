import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useProjectsStore } from '@/store/projects.store';
import { useSubContractorsStore } from '@/store/subcontractors.store';
import { SubContractorProjectDetail } from '@/components/subcontractor/SubContractorProjectDetail';
import { Project } from '@/types/domain';
import { Calendar, Clock, MapPin } from 'lucide-react';

export function SubContractorSchedulePage() {
  const user = useAuthStore((s) => s.user);
  const { projects, fetchProjects, loading } = useProjectsStore();
  const { subContractors, fetchSubContractors } = useSubContractorsStore();

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<'upcoming' | 'ongoing' | 'all'>('upcoming');

  useEffect(() => {
    if (user?.subContractorId) {
      fetchProjects(user.subContractorId);
      fetchSubContractors();
    }
  }, [user, fetchProjects, fetchSubContractors]);

  const subContractor = useMemo(() => {
    return subContractors.find((sc) => sc.id === user?.subContractorId);
  }, [subContractors, user]);

  const filteredProjects = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];

    let filtered = projects.filter((project) => {
      if (project.subContractorId !== user?.subContractorId) return false;

      if (project.visibility === 'private') return false;

      if (project.status === 'Cancelled') return false;

      return true;
    });

    if (viewMode === 'upcoming') {
      filtered = filtered.filter((p) => p.startDate && p.startDate > today);
    } else if (viewMode === 'ongoing') {
      filtered = filtered.filter((p) => {
        if (!p.startDate) return false;
        const hasStarted = p.startDate <= today;
        const notEnded = !p.endDate || p.endDate >= today;
        return hasStarted && notEnded && p.status !== 'Completed';
      });
    }

    return filtered.sort((a, b) => {
      if (!a.startDate) return 1;
      if (!b.startDate) return -1;
      return a.startDate.localeCompare(b.startDate);
    });
  }, [projects, user, viewMode]);

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
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 sm:p-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-8 h-8" />
            <h1 className="text-3xl sm:text-4xl font-bold">My Schedule</h1>
          </div>
          {subContractor?.companyName && (
            <p className="text-purple-100 text-lg">{subContractor.companyName}</p>
          )}
          <div className="mt-4 text-purple-100 text-sm">
            <p>View all your assigned projects and their timelines</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {}
        <div className="flex items-center gap-2 mb-6 bg-white p-2 rounded-lg shadow-sm">
          <button
            onClick={() => setViewMode('upcoming')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors min-h-[44px] ${
              viewMode === 'upcoming'
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setViewMode('ongoing')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors min-h-[44px] ${
              viewMode === 'ongoing'
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Ongoing
          </button>
          <button
            onClick={() => setViewMode('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors min-h-[44px] ${
              viewMode === 'all'
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All Projects
          </button>
        </div>

        {}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading schedule...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">No projects found</p>
            <p className="text-gray-400 text-sm mt-2">
              {viewMode === 'upcoming' && 'You have no upcoming projects'}
              {viewMode === 'ongoing' && 'You have no ongoing projects'}
              {viewMode === 'all' && 'You have no projects assigned yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProjects.map((project) => {
              const isUnlisted = project.visibility === 'unlisted';
              const statusColors = {
                Active: 'bg-green-100 text-green-700 border-green-200',
                Completed: 'bg-blue-100 text-blue-700 border-blue-200',
                'On Hold': 'bg-yellow-100 text-yellow-700 border-yellow-200',
                Cancelled: 'bg-red-100 text-red-700 border-red-200',
              };
              const statusColor = statusColors[project.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-700 border-gray-200';

              const startDate = project.startDate ? new Date(project.startDate) : null;
              const endDate = project.endDate ? new Date(project.endDate) : null;
              const today = new Date();
              today.setHours(0, 0, 0, 0);

              let timelineStatus = 'Not Started';
              let timelineColor = 'text-gray-600';

              if (startDate && endDate) {
                if (today < startDate) {
                  const daysUntil = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  timelineStatus = `Starts in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`;
                  timelineColor = 'text-blue-600';
                } else if (today >= startDate && today <= endDate) {
                  const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  timelineStatus = `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`;
                  timelineColor = 'text-orange-600';
                } else {
                  timelineStatus = 'Completed';
                  timelineColor = 'text-green-600';
                }
              }

              if (isUnlisted) {
                return (
                  <div
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer border-2 border-purple-100 hover:border-purple-300"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Upcoming Project</h3>
                      </div>

                      {}
                      <div className="lg:w-80 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                        <div className="flex items-center gap-2 mb-3">
                          <Clock className="w-5 h-5 text-purple-600" />
                          <span className={`font-semibold ${timelineColor}`}>{timelineStatus}</span>
                        </div>

                        <div className="space-y-2">
                          {project.startDate && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-700 font-medium">Start Date:</span>
                              <span className="text-gray-900 font-semibold">
                                {new Date(project.startDate).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                          )}
                          {project.endDate && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-700 font-medium">End Date:</span>
                              <span className="text-gray-900 font-semibold">
                                {new Date(project.endDate).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                          )}

                          {}
                          {startDate && endDate && (
                            <div className="pt-2 mt-2 border-t border-purple-200">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-700 font-medium">Duration:</span>
                                <span className="text-purple-700 font-bold">
                                  {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <button className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center gap-1">
                        View Details
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer border-2 border-gray-100 hover:border-purple-200"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    {}
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{project.title}</h3>
                          {project.customerName && (
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {project.customerName}
                            </p>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex-shrink-0 ${statusColor}`}>
                          {project.status || 'Active'}
                        </span>
                      </div>

                      {project.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{project.description}</p>
                      )}

                      {}
                      {project.addressLine1 && (
                        <div className="text-sm text-gray-600 mb-3">
                          <p className="font-medium text-gray-700">Project Location:</p>
                          <p>{project.addressLine1}</p>
                          {project.addressLine2 && <p>{project.addressLine2}</p>}
                          <p>
                            {project.city && `${project.city}, `}
                            {project.state && `${project.state} `}
                            {project.zipcode}
                          </p>
                        </div>
                      )}
                    </div>

                    {}
                    <div className="lg:w-80 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Clock className="w-5 h-5 text-purple-600" />
                        <span className={`font-semibold ${timelineColor}`}>{timelineStatus}</span>
                      </div>

                      <div className="space-y-2">
                        {project.startDate && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-700 font-medium">Start Date:</span>
                            <span className="text-gray-900 font-semibold">
                              {new Date(project.startDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        )}
                        {project.endDate && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-700 font-medium">End Date:</span>
                            <span className="text-gray-900 font-semibold">
                              {new Date(project.endDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        )}

                        {}
                        {startDate && endDate && (
                          <div className="pt-2 mt-2 border-t border-purple-200">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-700 font-medium">Duration:</span>
                              <span className="text-purple-700 font-bold">
                                {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center gap-1">
                      View Full Details
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {}
      {selectedProject && (
        <SubContractorProjectDetail
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
}
