import { Polyline, CircleMarker, Tooltip } from 'react-leaflet';
import type { LocationTrail } from '@/types/location';

interface LocationTrailPolylineProps {
  trail: LocationTrail;
  showPoints?: boolean;
}

export function LocationTrailPolyline({
  trail,
  showPoints = true,
}: LocationTrailPolylineProps) {
  if (!trail.points || trail.points.length === 0) {
    return null;
  }

  const positions = trail.points.map((p) => [p.lat, p.lng] as [number, number]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <Polyline
        positions={positions}
        pathOptions={{
          color: '#3b82f6',
          weight: 3,
          opacity: 0.7,
          dashArray: '5, 10',
        }}
      />
      {showPoints &&
        trail.points.map((point, index) => {
          const isFirst = index === 0;
          const isLast = index === trail.points.length - 1;

          return (
            <CircleMarker
              key={`${point.timestamp}-${index}`}
              center={[point.lat, point.lng]}
              radius={isFirst || isLast ? 6 : 3}
              pathOptions={{
                color: isFirst ? '#22c55e' : isLast ? '#ef4444' : '#3b82f6',
                fillColor: isFirst ? '#22c55e' : isLast ? '#ef4444' : '#3b82f6',
                fillOpacity: 0.8,
                weight: 2,
              }}
            >
              <Tooltip>
                <div className="text-xs">
                  <div className="font-medium">
                    {isFirst ? 'Start' : isLast ? 'Latest' : `Point ${index + 1}`}
                  </div>
                  <div>{formatTime(point.timestamp)}</div>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
    </>
  );
}
