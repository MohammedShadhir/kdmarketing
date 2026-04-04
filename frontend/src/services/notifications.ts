import { supabase } from './supabase';
import type { Notification, NotificationType } from '@/types/location';

function mapNotificationFromDB(data: any): Notification {
  return {
    id: data.id,
    type: data.type as NotificationType,
    title: data.title,
    message: data.message,
    subcontractorId: data.subcontractor_id,
    projectId: data.project_id,
    geofenceId: data.geofence_id,
    metadata: data.metadata,
    isRead: data.is_read,
    createdAt: data.created_at,
  };
}

export interface GetNotificationsOptions {
  unreadOnly?: boolean;
  limit?: number;
  type?: NotificationType;
}

export async function getNotifications(
  options?: GetNotificationsOptions
): Promise<Notification[]> {
  let query = supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false });

  if (options?.unreadOnly) {
    query = query.eq('is_read', false);
  }

  if (options?.type) {
    query = query.eq('type', options.type);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data.map(mapNotificationFromDB);
}

export async function getNotification(id: string): Promise<Notification | null> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapNotificationFromDB(data) : null;
}

export async function getUnreadCount(): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('is_read', false);

  if (error) {
    throw new Error(error.message);
  }

  return count || 0;
}

export async function markNotificationAsRead(id: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function markAllAsRead(): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('is_read', false);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteNotification(id: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteAllReadNotifications(): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('is_read', true);

  if (error) {
    throw new Error(error.message);
  }
}

export interface NotificationWithDetails extends Notification {
  subcontractorName?: string;
  projectTitle?: string;
  geofenceName?: string;
}

export async function getNotificationsWithDetails(
  options?: GetNotificationsOptions
): Promise<NotificationWithDetails[]> {
  let query = supabase
    .from('notifications')
    .select(`
      *,
      subcontractors:subcontractor_id (name),
      projects:project_id (title),
      geofences:geofence_id (name)
    `)
    .order('created_at', { ascending: false });

  if (options?.unreadOnly) {
    query = query.eq('is_read', false);
  }

  if (options?.type) {
    query = query.eq('type', options.type);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data.map((row) => ({
    ...mapNotificationFromDB(row),
    subcontractorName: row.subcontractors?.name,
    projectTitle: row.projects?.title,
    geofenceName: row.geofences?.name,
  }));
}
