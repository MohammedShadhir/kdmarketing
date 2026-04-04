import { cn } from '@/lib/utils';
import { formatLastSeen, isOnline } from '@/services/location';

interface OnlineStatusBadgeProps {
  lastSeenAt?: string;
  showLabel?: boolean;
  className?: string;
}

export function OnlineStatusBadge({
  lastSeenAt,
  showLabel = false,
  className,
}: OnlineStatusBadgeProps) {
  const online = isOnline(lastSeenAt);

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <span
        className={cn(
          'w-2.5 h-2.5 rounded-full flex-shrink-0',
          online ? 'bg-green-500' : 'bg-gray-400'
        )}
        title={online ? 'Online' : `Last seen: ${formatLastSeen(lastSeenAt)}`}
      />
      {showLabel && (
        <span className="text-xs text-gray-500">
          {online ? 'Online' : formatLastSeen(lastSeenAt)}
        </span>
      )}
    </div>
  );
}
