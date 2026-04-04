import { supabase } from './supabase';
import type {
  SubcontractorLocation,
  LocationTrail,
  LocationUpdatePayload,
} from '@/types/location';

const TEN_MINUTES_MS = 10 * 60 * 1000;

export async function sendLocationUpdate(
  payload: LocationUpdatePayload
): Promise<{ success: boolean; recordedAt: string }> {
  const { data, error } = await supabase.functions.invoke('location-update', {
    body: payload,
  });

  if (error) {
    throw new Error(error.message || 'Failed to send location update');
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data;
}

export async function getSubcontractorsWithLocation(): Promise<SubcontractorLocation[]> {
  const { data, error } = await supabase
    .from('subcontractors')
    .select('id, name, company_name, profile_picture_url, last_known_lat, last_known_lng, last_seen_at')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const tenMinutesAgo = new Date(Date.now() - TEN_MINUTES_MS).toISOString();

  return data.map((row) => ({
    subcontractorId: row.id,
    name: row.name,
    companyName: row.company_name,
    profilePictureUrl: row.profile_picture_url,
    lastKnownLat: row.last_known_lat,
    lastKnownLng: row.last_known_lng,
    lastSeenAt: row.last_seen_at,
    isOnline: row.last_seen_at ? row.last_seen_at > tenMinutesAgo : false,
  }));
}

export async function getLocationTrail(
  subcontractorId: string,
  date: string
): Promise<LocationTrail> {
  const startOfDay = `${date}T00:00:00.000Z`;
  const endOfDay = `${date}T23:59:59.999Z`;

  const { data, error } = await supabase
    .from('location_logs')
    .select('latitude, longitude, recorded_at')
    .eq('subcontractor_id', subcontractorId)
    .gte('recorded_at', startOfDay)
    .lte('recorded_at', endOfDay)
    .order('recorded_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return {
    subcontractorId,
    date,
    points: data.map((row) => ({
      lat: row.latitude,
      lng: row.longitude,
      timestamp: row.recorded_at,
    })),
  };
}

export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function isOnline(lastSeenAt?: string): boolean {
  if (!lastSeenAt) return false;
  const tenMinutesAgo = Date.now() - TEN_MINUTES_MS;
  return new Date(lastSeenAt).getTime() > tenMinutesAgo;
}

export function formatLastSeen(lastSeenAt?: string): string {
  if (!lastSeenAt) return 'Never';

  const diff = Date.now() - new Date(lastSeenAt).getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
