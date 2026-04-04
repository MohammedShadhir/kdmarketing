import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { SubcontractorLocation } from '@/types/location';
import { formatLastSeen, isOnline } from '@/services/location';

interface SubcontractorMarkerProps {
  subcontractor: SubcontractorLocation;
  isSelected?: boolean;
  onClick?: () => void;
}

function createMarkerIcon(online: boolean, isSelected: boolean): L.DivIcon {
  const color = online ? '#10b981' : '#9ca3af';
  const borderColor = isSelected ? '#3b82f6' : color;
  const size = isSelected ? 16 : 12;

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border: 3px solid ${borderColor};
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [size + 6, size + 6],
    iconAnchor: [(size + 6) / 2, (size + 6) / 2],
  });
}

export function SubcontractorMarker({
  subcontractor,
  isSelected = false,
  onClick,
}: SubcontractorMarkerProps) {
  const { lastKnownLat, lastKnownLng, name, companyName, lastSeenAt } = subcontractor;

  if (lastKnownLat === undefined || lastKnownLng === undefined) {
    return null;
  }

  const online = isOnline(lastSeenAt);
  const icon = createMarkerIcon(online, isSelected);

  return (
    <Marker
      position={[lastKnownLat, lastKnownLng]}
      icon={icon}
      eventHandlers={{
        click: () => onClick?.(),
      }}
    >
      <Popup>
        <div className="min-w-[150px]">
          <div className="font-semibold text-gray-900">{name}</div>
          {companyName && (
            <div className="text-sm text-gray-500">{companyName}</div>
          )}
          <div className="flex items-center gap-1.5 mt-2">
            <span
              className={`w-2 h-2 rounded-full ${online ? 'bg-green-500' : 'bg-gray-400'}`}
            />
            <span className="text-xs text-gray-600">
              {online ? 'Online' : formatLastSeen(lastSeenAt)}
            </span>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
