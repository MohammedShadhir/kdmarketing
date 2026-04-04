import { useState, useEffect } from 'react';
import { Project } from '@/types/domain';
import { formatCurrency } from '@/lib/dates';
import { calcProjectSaved } from '@/lib/calc';
import { useProjectsStore } from '@/store/projects.store';
import { getProjectMedia } from '@/services/supabase';
import { ViewMediaFilesModal } from './ViewMediaFilesModal';
import { ViewProjectModal } from './ViewProjectModal';

interface Props {
  projects: Project[];
  onEdit: (project: Project) => void;
}

export function ProjectsTable({ projects, onEdit }: Props) {
  const deleteProject = useProjectsStore((s) => s.deleteProject);
  const fetchProjects = useProjectsStore((s) => s.fetchProjects);
  const [viewingMedia, setViewingMedia] = useState<Project | null>(null);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);

  useEffect(() => {
    const fetchMedia = async () => {
      if (viewingMedia) {
        setLoadingMedia(true);
        try {
          const files = await getProjectMedia(viewingMedia.id);
          setMediaFiles(files);
        } catch (error) {
          } finally {
          setLoadingMedia(false);
        }
      }
    };

    fetchMedia();
  }, [viewingMedia?.id]);

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto relative">
        {}
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none z-10 md:hidden" aria-hidden="true"></div>
        <table className="table-base">
          <thead>
            <tr className="table-header">
              <th className="table-cell text-left">Title</th>
              <th className="table-cell text-left">Sales Person</th>
              <th className="table-cell text-right">Price</th>
              <th className="table-cell text-right">Subcon %</th>
              <th className="table-cell text-right">Sales %</th>
              <th className="table-cell text-right">Subcon $</th>
              <th className="table-cell text-right">Sales $</th>
              <th className="table-cell text-right">KD</th>
              <th className="table-cell text-left">Dates</th>
              <th className="table-cell text-center">Status</th>
              <th className="table-cell text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => {
              const calc = calcProjectSaved(p);
              return (
                <tr key={p.id} className="table-row">
                  <td className="table-cell">
                    <div className="font-semibold text-gray-900">{p.title}</div>
                    {p.description && (
                      <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                        {p.description}
                      </div>
                    )}
                  </td>
                  <td className="table-cell">
                    <span className="text-gray-700 text-sm">
                      {p.salesPerson || <span className="text-gray-400">N/A</span>}
                    </span>
                  </td>
                  <td className="table-cell text-right">
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(p.projectPrice)}
                    </span>
                    {p.advancePaymentAmount !== undefined && p.advancePaymentAmount > 0 && (
                      <div className="text-xs text-emerald-600 mt-1">
                        Advance: {formatCurrency(p.advancePaymentAmount)}
                      </div>
                    )}
                  </td>
                  <td className="table-cell text-right">
                    <span className="text-gray-700">{p.subcontractorPercentage.toFixed(1)}%</span>
                  </td>
                  <td className="table-cell text-right">
                    <span className="text-gray-700">{p.salesCommissionPercentage.toFixed(1)}%</span>
                  </td>
                  <td className="table-cell text-right">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-md bg-[#F59E0B]/10 text-[#F59E0B] font-semibold text-sm">
                      {formatCurrency(calc['subcon$'])}
                    </span>
                  </td>
                  <td className="table-cell text-right">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-md bg-[#3B82F6]/10 text-[#3B82F6] font-semibold text-sm">
                      {formatCurrency(calc['sales$'])}
                    </span>
                  </td>
                  <td className="table-cell text-right">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-md bg-[#10B981]/10 text-[#10B981] font-semibold text-sm">
                      {formatCurrency(calc['company$'])}
                    </span>
                  </td>
                  <td className="table-cell text-left">
                    <div className="text-sm text-gray-700">
                      {p.startDate && p.endDate ? (
                        <>
                          <div>{p.startDate}</div>
                          <div className="text-xs text-gray-500">to {p.endDate}</div>
                        </>
                      ) : (
                        <span className="text-gray-400">Not set</span>
                      )}
                    </div>
                  </td>
                  <td className="table-cell text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      p.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                      p.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                      p.status === 'On Hold' ? 'bg-yellow-100 text-yellow-800' :
                      p.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {p.status || 'Active'}
                    </span>
                  </td>
                  <td className="table-cell text-center">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
                      <button
                        onClick={() => setViewingProject(p)}
                        className="btn-ghost text-xs sm:text-sm flex items-center gap-1 min-h-[36px] sm:min-h-[44px]"
                        title="View project details"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span className="hidden sm:inline">View</span>
                      </button>
                      <button
                        onClick={() => setViewingMedia(p)}
                        className="btn-ghost text-xs sm:text-sm flex items-center gap-1 min-h-[36px] sm:min-h-[44px]"
                        title="View media files"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span className="hidden sm:inline">Media</span>
                        {p.mediaFiles && p.mediaFiles.length > 0 && (
                          <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold text-white bg-emerald-600 rounded-full">
                            {p.mediaFiles.length}
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => onEdit(p)}
                        className="btn-ghost text-xs sm:text-sm min-h-[36px] sm:min-h-[44px]"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete project "${p.title}"?`)) {
                            deleteProject(p.id);
                          }
                        }}
                        className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-md font-medium transition-all duration-200 min-h-[36px] sm:min-h-[44px]"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {}
      {viewingProject && (
        <ViewProjectModal
          project={viewingProject}
          onClose={() => setViewingProject(null)}
        />
      )}

      {}
      {viewingMedia && (
        <ViewMediaFilesModal
          projectId={viewingMedia.id}
          projectTitle={viewingMedia.title}
          mediaFiles={mediaFiles}
          loading={loadingMedia}
          onClose={() => {
            setViewingMedia(null);
            setMediaFiles([]);
            fetchProjects();
          }}
          onFileDeleted={async () => {
            try {
              const files = await getProjectMedia(viewingMedia.id);
              setMediaFiles(files);
              fetchProjects();
            } catch (error) {
              }
          }}
        />
      )}
    </div>
  );
}
