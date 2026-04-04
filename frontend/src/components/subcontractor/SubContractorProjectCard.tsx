import { useState, useMemo } from 'react';
import { Project } from '@/types/domain';
import { formatCurrency } from '@/lib/dates';
import { SubContractorProjectDetail } from './SubContractorProjectDetail';

interface Props {
  project: Project;
}

export function SubContractorProjectCard({ project }: Props) {
  const [showDetails, setShowDetails] = useState(false);
  const isUnlisted = project.visibility === 'unlisted';

  const allocated = useMemo(() => {
    return project.projectPrice * (project.subcontractorPercentage / 100);
  }, [project]);

  const paid = useMemo(() => {
    let total = 0;
    if (Array.isArray(project.payments)) {
      project.payments.forEach((payment) => {
        if (
          payment.paymentType === 'subcontractor_payment' ||
          payment.paymentType === 'subcontractor_check_collected'
        ) {
          total += payment.amount;
        }
      });
    }
    return total;
  }, [project]);

  const statusColors = {
    Active: 'bg-green-100 text-green-700 border-green-200',
    Completed: 'bg-blue-100 text-blue-700 border-blue-200',
    'On Hold': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    Cancelled: 'bg-red-100 text-red-700 border-red-200',
  };

  const statusColor = statusColors[project.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-700 border-gray-200';

  if (isUnlisted) {
    return (
      <>
        <div
          onClick={() => setShowDetails(true)}
          className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer border-2 border-gray-100 hover:border-purple-200"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Upcoming Project</h3>

              <div className="flex flex-wrap gap-4 text-sm">
                {project.startDate && (
                  <div className="flex items-center gap-1 text-gray-600">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Start: {new Date(project.startDate).toLocaleDateString()}</span>
                  </div>
                )}
                {project.endDate && (
                  <div className="flex items-center gap-1 text-gray-600">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span>End: {new Date(project.endDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg">
              <p className="text-sm text-gray-600 text-center">Limited Information</p>
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

        {showDetails && (
          <SubContractorProjectDetail
            project={project}
            onClose={() => setShowDetails(false)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div
        onClick={() => setShowDetails(true)}
        className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer border-2 border-gray-100 hover:border-blue-200"
      >
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{project.title}</h3>
                {project.customerName && (
                  <p className="text-sm text-gray-600">Customer: {project.customerName}</p>
                )}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColor}`}>
                {project.status || 'Active'}
              </span>
            </div>

            {project.description && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{project.description}</p>
            )}

            <div className="flex flex-wrap gap-4 text-sm">
              {project.startDate && (
                <div className="flex items-center gap-1 text-gray-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Start: {new Date(project.startDate).toLocaleDateString()}</span>
                </div>
              )}
              {project.endDate && (
                <div className="flex items-center gap-1 text-gray-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span>End: {new Date(project.endDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-2">
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">Your Share</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(allocated)}</p>
            </div>
            <div className="flex gap-2 text-xs">
              <div className="bg-green-50 border border-green-200 px-3 py-1 rounded">
                <span className="text-green-700 font-semibold">Paid: {formatCurrency(paid)}</span>
              </div>
              <div className="bg-orange-50 border border-orange-200 px-3 py-1 rounded">
                <span className="text-orange-700 font-semibold">Due: {formatCurrency(allocated - paid)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1">
            View Details
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {showDetails && (
        <SubContractorProjectDetail
          project={project}
          onClose={() => setShowDetails(false)}
        />
      )}
    </>
  );
}
