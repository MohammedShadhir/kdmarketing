import { useState, useEffect } from 'react';
import { X, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Circle, useMapEvents } from 'react-leaflet';
import type { GeofenceInput } from '@/types/location';
import type { Project } from '@/types/domain';

interface CreateGeofenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: GeofenceInput) => Promise<void>;
  projects: Project[];
  initialData?: Partial<GeofenceInput>;
}

function LocationPicker({
  position,
  radius,
  onPositionChange,
}: {
  position: [number, number] | null;
  radius: number;
  onPositionChange: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onPositionChange(e.latlng.lat, e.latlng.lng);
    },
  });

  if (!position) return null;

  return (
    <Circle
      center={position}
      radius={radius}
      pathOptions={{
        color: '#f59e0b',
        fillColor: '#f59e0b',
        fillOpacity: 0.2,
      }}
    />
  );
}

export function CreateGeofenceModal({
  isOpen,
  onClose,
  onSubmit,
  projects,
  initialData,
}: CreateGeofenceModalProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [projectId, setProjectId] = useState(initialData?.projectId || '');
  const [centerLat, setCenterLat] = useState<number | null>(initialData?.centerLat || null);
  const [centerLng, setCenterLng] = useState<number | null>(initialData?.centerLng || null);
  const [radiusMeters, setRadiusMeters] = useState(initialData?.radiusMeters || 500);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || '');
      setProjectId(initialData?.projectId || '');
      setCenterLat(initialData?.centerLat || null);
      setCenterLng(initialData?.centerLng || null);
      setRadiusMeters(initialData?.radiusMeters || 500);
      setError(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handlePositionChange = (lat: number, lng: number) => {
    setCenterLat(lat);
    setCenterLng(lng);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    if (!projectId) {
      setError('Please select a project');
      return;
    }

    if (centerLat === null || centerLng === null) {
      setError('Please click on the map to set the geofence center');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        name: name.trim(),
        projectId,
        centerLat,
        centerLng,
        radiusMeters,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create geofence');
    } finally {
      setIsSubmitting(false);
    }
  };

  const position: [number, number] | null =
    centerLat !== null && centerLng !== null ? [centerLat, centerLng] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="w-6 h-6 text-white" />
              <h2 className="text-xl font-semibold text-white">
                {initialData ? 'Edit Geofence' : 'Create Geofence'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-80px)]">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Job Site Boundary"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="">Select a project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Radius (meters)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="50"
                max="2000"
                step="50"
                value={radiusMeters}
                onChange={(e) => setRadiusMeters(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm font-medium w-20 text-right">
                {radiusMeters}m
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location (click on map to set center)
            </label>
            <div className="h-64 rounded-lg overflow-hidden border">
              <MapContainer
                center={position || [39.8283, -98.5795]}
                zoom={position ? 14 : 4}
                className="h-full w-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationPicker
                  position={position}
                  radius={radiusMeters}
                  onPositionChange={handlePositionChange}
                />
              </MapContainer>
            </div>
            {position && (
              <p className="text-xs text-gray-500 mt-1">
                Center: {centerLat?.toFixed(6)}, {centerLng?.toFixed(6)}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
