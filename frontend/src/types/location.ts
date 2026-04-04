import { ID, ISODateTime } from './domain';

export interface LocationLog {
  id: ID;
  subcontractorId: ID;
  latitude: number;
  longitude: number;
  accuracy?: number;
  recordedAt: ISODateTime;
  createdAt: ISODateTime;
}

export interface Geofence {
  id: ID;
  projectId: ID;
  name: string;
  centerLat: number;
  centerLng: number;
  radiusMeters: number;
  isActive: boolean;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface GeofenceInput {
  projectId: ID;
  name: string;
  centerLat: number;
  centerLng: number;
  radiusMeters: number;
  isActive?: boolean;
}

export type NotificationType = 'geofence_exit' | 'geofence_enter' | 'offline_alert';

export interface Notification {
  id: ID;
  type: NotificationType;
  title: string;
  message: string;
  subcontractorId?: ID;
  projectId?: ID;
  geofenceId?: ID;
  metadata?: Record<string, unknown>;
  isRead: boolean;
  createdAt: ISODateTime;
}

export interface SubcontractorLocation {
  subcontractorId: ID;
  name: string;
  companyName?: string;
  profilePictureUrl?: string;
  lastKnownLat?: number;
  lastKnownLng?: number;
  lastSeenAt?: ISODateTime;
  isOnline: boolean;
}

export interface LocationTrail {
  subcontractorId: ID;
  date: string;
  points: LocationPoint[];
}

export interface LocationPoint {
  lat: number;
  lng: number;
  timestamp: ISODateTime;
}

export interface LocationUpdatePayload {
  subcontractorId: ID;
  latitude: number;
  longitude: number;
  accuracy?: number;
}
