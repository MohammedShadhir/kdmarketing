import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationBellProps {
  unreadCount: number;
  onClick: () => void;
  className?: string;
}

export function NotificationBell({
  unreadCount,
  onClick,
  className,
}: NotificationBellProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors',
        className
      )}
      title={`${unreadCount} unread notifications`}
    >
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-xs font-medium rounded-full px-1">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
}
