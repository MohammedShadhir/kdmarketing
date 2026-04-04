import { useEffect, useState } from 'react';
import { Calendar, MessageSquare, Upload, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { getProjectsBySubContractor, updateProject } from '@/services/supabase';
import { Project, ProjectVisibility } from '@/types/domain';
import { format } from 'date-fns';

interface Props {
  subcontractorId: string;
}

export function SubContractorScheduleView({ subcontractorId }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [addingComment, setAddingComment] = useState(false);
  const [updatingReview, setUpdatingReview] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await getProjectsBySubContractor(subcontractorId);
      const visibleProjects = data.filter(p => p.visibility !== 'private');
      setProjects(visibleProjects);
    } catch (error) {
      } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [subcontractorId]);

  const handleAddComment = async () => {
    if (!comment.trim()) {
      alert('Please enter a comment');
      return;
    }

    try {
      setAddingComment(true);
      alert('Comment feature will be implemented with database storage');
      setComment('');
      setSelectedProject(null);
    } catch (error) {
      alert('Failed to add comment. Please try again.');
    } finally {
      setAddingComment(false);
    }
  };

  const handleReviewChange = async (projectId: string, value: boolean) => {
    setUpdatingReview(projectId);
    try {
      await updateProject(projectId, { reviewCollected: value });
      await fetchProjects();
    } catch (error) {
      alert('Failed to update review status. Please try again.');
    } finally {
      setUpdatingReview(null);
    }
  };

  const getProjectInfo = (project: Project) => {
    const visibility = project.visibility || 'public';

    if (visibility === 'unlisted') {
      return {
        showDetails: false,
        message: 'Unlisted Project - Only dates visible'
      };
    }

    return {
      showDetails: true,
      message: null
    };
  };

  const getVisibilityIcon = (visibility: ProjectVisibility) => {
    switch (visibility) {
      case 'public':
        return <Eye className="w-4 h-4" />;
      case 'unlisted':
        return <EyeOff className="w-4 h-4" />;
      default:
        return <Eye className="w-4 h-4" />;
    }
  };

  const getVisibilityColor = (visibility: ProjectVisibility) => {
    switch (visibility) {
      case 'public':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'unlisted':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your schedule...</p>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center py-20">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Projects Scheduled</h3>
          <p className="text-gray-600">You don't have any projects assigned yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Scheduled Projects</h2>
        <p className="text-gray-600">{projects.length} projects assigned to you</p>
      </div>

      {}
      <div className="space-y-4">
        {projects.map((project) => {
          const { showDetails, message } = getProjectInfo(project);
          const isAddingComment = selectedProject === project.id;

          return (
            <div key={project.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-6">
                {}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getVisibilityColor(project.visibility || 'public')}`}
                  >
                    {getVisibilityIcon(project.visibility || 'public')}
                    {(project.visibility || 'public').charAt(0).toUpperCase() + (project.visibility || 'public').slice(1)}
                  </span>
                </div>

                {}
                {showDetails ? (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{project.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-4">
                      <span>{project.customerName || 'No customer'}</span>
                      {project.salesPerson && (
                        <>
                          <span>•</span>
                          <span className="font-medium">{project.salesPerson}</span>
                        </>
                      )}
                    </div>

                    {}
                    <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                      <div>
                        <span className="text-gray-600">Start: </span>
                        <span className="font-semibold text-gray-900">
                          {project.startDate ? format(new Date(project.startDate), 'MMM dd, yyyy') : 'Not set'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">End: </span>
                        <span className="font-semibold text-gray-900">
                          {project.endDate ? format(new Date(project.endDate), 'MMM dd, yyyy') : 'Not set'}
                        </span>
                      </div>
                    </div>

                    {}
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-gray-600" />
                          <span className="font-semibold text-gray-700">Review Collected</span>
                        </div>
                        {updatingReview === project.id ? (
                          <span className="text-sm text-gray-500">Saving...</span>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleReviewChange(project.id, true)}
                              disabled={updatingReview !== null}
                              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
                                project.reviewCollected === true
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-300'
                              }`}
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => handleReviewChange(project.id, false)}
                              disabled={updatingReview !== null}
                              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
                                project.reviewCollected !== true
                                  ? 'bg-gray-600 text-white'
                                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              No
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {}
                    {project.description && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{project.description}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <EyeOff className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Unlisted Project</h3>
                    <p className="text-sm text-gray-600 mb-4">{message}</p>

                    {}
                    <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Start: </span>
                        <span className="font-semibold text-gray-900">
                          {project.startDate ? format(new Date(project.startDate), 'MMM dd, yyyy') : 'Not set'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">End: </span>
                        <span className="font-semibold text-gray-900">
                          {project.endDate ? format(new Date(project.endDate), 'MMM dd, yyyy') : 'Not set'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {}
                {showDetails && (
                  <div className="pt-4 border-t border-gray-200 mt-4">
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => setSelectedProject(isAddingComment ? null : project.id)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                      >
                        <MessageSquare className="w-4 h-4" />
                        {isAddingComment ? 'Cancel Comment' : 'Add Comment'}
                      </button>
                      <button
                        className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-2"
                        onClick={() => alert('Media upload feature coming soon!')}
                      >
                        <Upload className="w-4 h-4" />
                        Add Media Files
                      </button>
                    </div>

                    {}
                    {isAddingComment && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Add Comment
                        </label>
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                          rows={3}
                          placeholder="Enter your comment..."
                        />
                        <div className="flex justify-end gap-2 mt-3">
                          <button
                            onClick={() => {
                              setComment('');
                              setSelectedProject(null);
                            }}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors text-sm"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleAddComment}
                            disabled={addingComment}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors text-sm flex items-center gap-2"
                          >
                            {addingComment ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Adding...
                              </>
                            ) : (
                              <>
                                <MessageSquare className="w-4 h-4" />
                                Add Comment
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
