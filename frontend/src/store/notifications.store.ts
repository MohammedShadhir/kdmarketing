import { create } from 'zustand';
import {
  getNotificationsWithDetails,
  getUnreadCount,
  markNotificationAsRead,
  markAllAsRead as markAllAsReadAPI,
  deleteNotification as deleteNotificationAPI,
  type NotificationWithDetails,
  type GetNotificationsOptions,
} from '@/services/notifications';

interface NotificationsState {
  notifications: NotificationWithDetails[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  refreshIntervalId: number | null;

  fetchNotifications: (options?: GetNotificationsOptions) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  startAutoRefresh: (intervalMs?: number) => void;
  stopAutoRefresh: () => void;
  clearError: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  refreshIntervalId: null,

  fetchNotifications: async (options?: GetNotificationsOptions) => {
    set({ loading: true, error: null });
    try {
      const notifications = await getNotificationsWithDetails(options);
      set({ notifications, loading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch notifications';
      set({ error: message, loading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const count = await getUnreadCount();
      set({ unreadCount: count });
    } catch (error) {
      // Silently fail for count updates
    }
  },

  markAsRead: async (id: string) => {
    try {
      await markNotificationAsRead(id);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to mark as read';
      set({ error: message });
    }
  },

  markAllAsRead: async () => {
    try {
      await markAllAsReadAPI();
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to mark all as read';
      set({ error: message });
    }
  },

  deleteNotification: async (id: string) => {
    try {
      await deleteNotificationAPI(id);
      set((state) => {
        const notification = state.notifications.find((n) => n.id === id);
        const wasUnread = notification && !notification.isRead;
        return {
          notifications: state.notifications.filter((n) => n.id !== id),
          unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
        };
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete notification';
      set({ error: message });
    }
  },

  startAutoRefresh: (intervalMs = 60000) => {
    const { fetchUnreadCount, refreshIntervalId } = get();

    if (refreshIntervalId) {
      clearInterval(refreshIntervalId);
    }

    const id = window.setInterval(() => {
      fetchUnreadCount();
    }, intervalMs);

    set({ refreshIntervalId: id });
  },

  stopAutoRefresh: () => {
    const { refreshIntervalId } = get();
    if (refreshIntervalId) {
      clearInterval(refreshIntervalId);
      set({ refreshIntervalId: null });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
