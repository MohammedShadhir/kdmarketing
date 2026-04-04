import { useEffect, useState } from 'react';
import { MapPin, Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { CreateGeofenceModal } from '@/components/location';
import { useGeofenceStore } from '@/store/geofence.store';
import { useProjectsStore } from '@/store/projects.store';
import type { GeofenceInput } from '@/types/location';

export function GeofenceManagementPage() {
  const {
    geofences,
    loading,
    error,
    fetchGeofencesWithProjects,
    addGeofence,
    updateGeofence,
    deleteGeofence,
    toggleActive,
  } = useGeofenceStore();

  const { projects, fetchProjects } = useProjectsStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGeofence, setEditingGeofence] = useState<{
    id: string;
    data: Partial<GeofenceInput>;
  } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchGeofencesWithProjects();
    fetchProjects();
  }, []);

  const handleCreate = async (data: GeofenceInput) => {
    await addGeofence(data);
    setIsModalOpen(false);
  };

  const handleUpdate = async (data: GeofenceInput) => {
    if (editingGeofence) {
      await updateGeofence(editingGeofence.id, data);
      setEditingGeofence(null);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteGeofence(id);
    setDeleteConfirm(null);
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    await toggleActive(id, !currentStatus);
  };

  const openEditModal = (geofence: typeof geofences[0]) => {
    setEditingGeofence({
      id: geofence.id,
      data: {
        name: geofence.name,
        projectId: geofence.projectId,
        centerLat: geofence.centerLat,
        centerLng: geofence.centerLng,
        radiusMeters: geofence.radiusMeters,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Geofence Management</h1>
            <p className="text-gray-600 mt-1">
              Define geographic boundaries for project sites
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Geofence
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subcontractor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Radius
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading && geofences.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Loading geofences...
                    </td>
                  </tr>
                ) : geofences.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      No geofences created yet
                    </td>
                  </tr>
                ) : (
                  geofences.map((geofence) => (
                    <tr key={geofence.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-amber-500" />
                          <span className="font-medium text-gray-900">
                            {geofence.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {geofence.projectTitle || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {geofence.subcontractorName || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {geofence.radiusMeters}m
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggle(geofence.id, geofence.isActive)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                            geofence.isActive
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {geofence.isActive ? (
                            <>
                              <ToggleRight className="w-3.5 h-3.5" />
                              Active
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-3.5 h-3.5" />
                              Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(geofence)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          {deleteConfirm === geofence.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(geofence.id)}
                                className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(geofence.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
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

      <CreateGeofenceModal
        isOpen={isModalOpen || editingGeofence !== null}
        onClose={() => {
          setIsModalOpen(false);
          setEditingGeofence(null);
        }}
        onSubmit={editingGeofence ? handleUpdate : handleCreate}
        projects={projects}
        initialData={editingGeofence?.data}
      />
    </div>
  );
}
