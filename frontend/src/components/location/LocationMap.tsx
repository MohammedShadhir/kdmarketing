import { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { SubcontractorMarker } from './SubcontractorMarker';
import { LocationTrailPolyline } from './LocationTrailPolyline';
import { GeofenceCircle } from './GeofenceCircle';
import type { SubcontractorLocation, LocationTrail, Geofence } from '@/types/location';

interface LocationMapProps {
  subcontractors: SubcontractorLocation[];
  selectedSubcontractorId?: string | null;
  onSubcontractorSelect?: (id: string) => void;
  geofences?: Geofence[];
  trail?: LocationTrail | null;
  showGeofences?: boolean;
  className?: string;
}

function MapBoundsUpdater({
  subcontractors,
  selectedSubcontractorId,
}: {
  subcontractors: SubcontractorLocation[];
  selectedSubcontractorId?: string | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedSubcontractorId) {
      const selected = subcontractors.find(
        (s) => s.subcontractorId === selectedSubcontractorId
      );
      if (selected?.lastKnownLat && selected?.lastKnownLng) {
        map.setView([selected.lastKnownLat, selected.lastKnownLng], 14);
      }
    }
  }, [selectedSubcontractorId, subcontractors, map]);

  return null;
}

export function LocationMap({
  subcontractors,
  selectedSubcontractorId,
  onSubcontractorSelect,
  geofences = [],
  trail,
  showGeofences = true,
  className = '',
}: LocationMapProps) {
  const defaultCenter: [number, number] = [39.8283, -98.5795];

  // Filter out subcontractors without valid coordinates (handles both null and undefined)
  const validSubcontractors = subcontractors.filter(
    (s) => s.lastKnownLat != null && s.lastKnownLng != null
  );

  // Safely compute center, always falling back to default if no valid data
  const firstValid = validSubcontractors[0];
  const center: [number, number] =
    firstValid?.lastKnownLat != null && firstValid?.lastKnownLng != null
      ? [firstValid.lastKnownLat, firstValid.lastKnownLng]
      : defaultCenter;

  const zoom = validSubcontractors.length > 0 ? 10 : 4;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={`h-full w-full rounded-lg ${className}`}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapBoundsUpdater
        subcontractors={subcontractors}
        selectedSubcontractorId={selectedSubcontractorId}
      />

      {showGeofences &&
        geofences.map((geofence) => (
          <GeofenceCircle key={geofence.id} geofence={geofence} />
        ))}

      {trail && trail.points.length > 0 && (
        <LocationTrailPolyline trail={trail} />
      )}

      {validSubcontractors.map((sub) => (
        <SubcontractorMarker
          key={sub.subcontractorId}
          subcontractor={sub}
          isSelected={sub.subcontractorId === selectedSubcontractorId}
          onClick={() => onSubcontractorSelect?.(sub.subcontractorId)}
        />
      ))}
    </MapContainer>
  );
}
