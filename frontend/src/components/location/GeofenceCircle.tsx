import { Circle, Tooltip } from 'react-leaflet';
import type { Geofence } from '@/types/location';

interface GeofenceCircleProps {
  geofence: Geofence;
  isSelected?: boolean;
  onClick?: () => void;
}

export function GeofenceCircle({
  geofence,
  isSelected = false,
  onClick,
}: GeofenceCircleProps) {
  const { centerLat, centerLng, radiusMeters, name, isActive } = geofence;

  const color = isActive ? '#f59e0b' : '#9ca3af';
  const fillOpacity = isSelected ? 0.3 : 0.15;

  return (
    <Circle
      center={[centerLat, centerLng]}
      radius={radiusMeters}
      pathOptions={{
        color: isSelected ? '#3b82f6' : color,
        fillColor: color,
        fillOpacity,
        weight: isSelected ? 3 : 2,
        dashArray: isActive ? undefined : '5, 5',
      }}
      eventHandlers={{
        click: () => onClick?.(),
      }}
    >
      <Tooltip>
        <div className="text-xs">
          <div className="font-medium">{name}</div>
          <div className="text-gray-500">
            Radius: {radiusMeters}m
          </div>
          {!isActive && (
            <div className="text-gray-400 italic">Inactive</div>
          )}
        </div>
      </Tooltip>
    </Circle>
  );
}
