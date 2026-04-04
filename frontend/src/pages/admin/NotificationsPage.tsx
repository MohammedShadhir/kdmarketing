import { useEffect, useState } from 'react';
import { Bell, Check, CheckCheck, Trash2, MapPin, AlertTriangle, Filter } from 'lucide-react';
import { useNotificationsStore } from '@/store/notifications.store';
import type { NotificationType } from '@/types/location';
import { cn } from '@/lib/utils';

type FilterType = 'all' | NotificationType;

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case 'geofence_exit':
    case 'geofence_enter':
      return <MapPin className="w-5 h-5 text-amber-500" />;
    case 'offline_alert':
      return <AlertTriangle className="w-5 h-5 text-red-500" />;
    default:
      return <Bell className="w-5 h-5 text-blue-500" />;
  }
}

function getNotificationTypeBadge(type: NotificationType) {
  switch (type) {
    case 'geofence_exit':
      return (
        <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700">
          Geofence Exit
        </span>
      );
    case 'geofence_enter':
      return (
        <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">
          Geofence Enter
        </span>
      );
    case 'offline_alert':
      return (
        <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700">
          Offline Alert
        </span>
      );
    default:
      return null;
  }
}

export function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotificationsStore();

  const [filterType, setFilterType] = useState<FilterType>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  const filteredNotifications = notifications.filter((n) => {
    if (showUnreadOnly && n.isRead) return false;
    if (filterType !== 'all' && n.type !== filterType) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-1">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                : 'All caught up'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all as read
            </button>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-4 border-b flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={cn(
                  'px-3 py-1.5 text-xs rounded-full transition-colors',
                  filterType === 'all'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('geofence_exit')}
                className={cn(
                  'px-3 py-1.5 text-xs rounded-full transition-colors',
                  filterType === 'geofence_exit'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                Geofence Exit
              </button>
              <button
                onClick={() => setFilterType('geofence_enter')}
                className={cn(
                  'px-3 py-1.5 text-xs rounded-full transition-colors',
                  filterType === 'geofence_enter'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                Geofence Enter
              </button>
              <button
                onClick={() => setFilterType('offline_alert')}
                className={cn(
                  'px-3 py-1.5 text-xs rounded-full transition-colors',
                  filterType === 'offline_alert'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                Offline
              </button>
            </div>
            <div className="ml-auto">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showUnreadOnly}
                  onChange={(e) => setShowUnreadOnly(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Unread only
              </label>
            </div>
          </div>

          <div className="divide-y">
            {loading && notifications.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                Loading notifications...
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                <Bell className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                <p>No notifications found</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'px-6 py-4 hover:bg-gray-50 transition-colors',
                    !notification.isRead && 'bg-blue-50/50'
                  )}
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3
                              className={cn(
                                'text-sm',
                                notification.isRead
                                  ? 'text-gray-700'
                                  : 'text-gray-900 font-semibold'
                              )}
                            >
                              {notification.title}
                            </h3>
                            {getNotificationTypeBadge(notification.type)}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                            <span>{formatDateTime(notification.createdAt)}</span>
                            {notification.subcontractorName && (
                              <span>{notification.subcontractorName}</span>
                            )}
                            {notification.projectTitle && (
                              <span>{notification.projectTitle}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
