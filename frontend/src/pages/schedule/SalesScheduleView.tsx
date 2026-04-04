import { useEffect, useState } from 'react';
import { Calendar, Edit2, Eye, EyeOff, Upload, Save, X } from 'lucide-react';
import { getProjectsByCreator, updateProject } from '@/services/supabase';
import { Project, ProjectVisibility } from '@/types/domain';
import { format } from 'date-fns';

interface Props {
  userId: string;
}

interface EditingProject {
  id: string;
  startDate: string;
  endDate: string;
  visibility: ProjectVisibility;
}

export function SalesScheduleView({ userId }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<EditingProject | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await getProjectsByCreator(userId);
      setProjects(data);
    } catch (error) {
      } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [userId]);

  const handleEdit = (project: Project) => {
    setEditingProject({
      id: project.id,
      startDate: project.startDate || '',
      endDate: project.endDate || '',
      visibility: project.visibility || 'public'
    });
  };

  const handleSave = async () => {
    if (!editingProject) return;

    try {
      setSaving(true);
      await updateProject(editingProject.id, {
        startDate: editingProject.startDate,
        endDate: editingProject.endDate,
        visibility: editingProject.visibility
      });

      setProjects(prev => prev.map(p =>
        p.id === editingProject.id
          ? {
              ...p,
              startDate: editingProject.startDate,
              endDate: editingProject.endDate,
              visibility: editingProject.visibility
            }
          : p
      ));

      setEditingProject(null);
      alert('Project updated successfully!');
    } catch (error) {
      alert('Failed to update project. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingProject(null);
  };

  const getVisibilityIcon = (visibility: ProjectVisibility) => {
    switch (visibility) {
      case 'public':
        return <Eye className="w-4 h-4" />;
      case 'unlisted':
        return <EyeOff className="w-4 h-4" />;
      case 'private':
        return <X className="w-4 h-4" />;
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
      case 'private':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your projects...</p>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center py-20">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Projects Found</h3>
          <p className="text-gray-600">You haven't created any projects yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Projects</h2>
        <p className="text-gray-600">{projects.length} total projects</p>
      </div>

      {}
      <div className="space-y-4">
        {projects.map((project) => {
          const isEditing = editingProject?.id === project.id;

          return (
            <div key={project.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{project.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                      <span className="font-medium">{project.customerName || 'No customer'}</span>
                      {project.salesPerson && (
                        <>
                          <span>•</span>
                          <span>{project.salesPerson}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {!isEditing && (
                    <button
                      onClick={() => handleEdit(project)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit schedule"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {}
                {isEditing ? (
                  <div className="space-y-4 bg-blue-50 rounded-lg p-4">
                    {}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={editingProject.startDate}
                          onChange={(e) => setEditingProject({ ...editingProject, startDate: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={editingProject.endDate}
                          onChange={(e) => setEditingProject({ ...editingProject, endDate: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Visibility
                      </label>
                      <select
                        value={editingProject.visibility}
                        onChange={(e) => setEditingProject({ ...editingProject, visibility: e.target.value as ProjectVisibility })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="public">Public - Full details visible</option>
                        <option value="unlisted">Unlisted - Only dates visible</option>
                        <option value="private">Private - Hidden from sub-contractor</option>
                      </select>
                    </div>

                    {}
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={handleCancel}
                        disabled={saving}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-200 disabled:bg-gray-100 rounded-lg font-medium transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        {saving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {}
                    <div className="flex flex-wrap items-center gap-4 text-sm">
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
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getVisibilityColor(project.visibility || 'public')}`}
                      >
                        {getVisibilityIcon(project.visibility || 'public')}
                        {(project.visibility || 'public').charAt(0).toUpperCase() + (project.visibility || 'public').slice(1)}
                      </span>
                    </div>

                    {}
                    <div className="pt-3 border-t border-gray-200">
                      <button
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                        onClick={() => alert('Media upload feature coming soon!')}
                      >
                        <Upload className="w-4 h-4" />
                        Add Media Files
                      </button>
                    </div>
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
