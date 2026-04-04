import { supabase } from './supabase';
import type { Geofence, GeofenceInput } from '@/types/location';
import { calculateDistance } from './location';

function mapGeofenceFromDB(data: any): Geofence {
  return {
    id: data.id,
    projectId: data.project_id,
    name: data.name,
    centerLat: data.center_lat,
    centerLng: data.center_lng,
    radiusMeters: data.radius_meters,
    isActive: data.is_active,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

function mapGeofenceToDB(data: Partial<GeofenceInput>): Record<string, unknown> {
  const dbData: Record<string, unknown> = {};

  if (data.projectId !== undefined) dbData.project_id = data.projectId;
  if (data.name !== undefined) dbData.name = data.name;
  if (data.centerLat !== undefined) dbData.center_lat = data.centerLat;
  if (data.centerLng !== undefined) dbData.center_lng = data.centerLng;
  if (data.radiusMeters !== undefined) dbData.radius_meters = data.radiusMeters;
  if (data.isActive !== undefined) dbData.is_active = data.isActive;

  return dbData;
}

export async function getGeofences(projectId?: string): Promise<Geofence[]> {
  let query = supabase
    .from('geofences')
    .select('*')
    .order('created_at', { ascending: false });

  if (projectId) {
    query = query.eq('project_id', projectId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data.map(mapGeofenceFromDB);
}

export async function getGeofence(id: string): Promise<Geofence | null> {
  const { data, error } = await supabase
    .from('geofences')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapGeofenceFromDB(data) : null;
}

export async function createGeofence(input: GeofenceInput): Promise<Geofence> {
  const dbData = mapGeofenceToDB(input);

  const { data, error } = await supabase
    .from('geofences')
    .insert([dbData])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapGeofenceFromDB(data);
}

export async function updateGeofence(
  id: string,
  updates: Partial<GeofenceInput>
): Promise<Geofence> {
  const dbData = mapGeofenceToDB(updates);

  const { data, error } = await supabase
    .from('geofences')
    .update(dbData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapGeofenceFromDB(data);
}

export async function deleteGeofence(id: string): Promise<void> {
  const { error } = await supabase
    .from('geofences')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function toggleGeofenceActive(id: string, isActive: boolean): Promise<Geofence> {
  return updateGeofence(id, { isActive });
}

export function isPointInGeofence(
  lat: number,
  lng: number,
  geofence: Geofence
): boolean {
  const distance = calculateDistance(lat, lng, geofence.centerLat, geofence.centerLng);
  return distance <= geofence.radiusMeters;
}

export interface GeofenceWithProject extends Geofence {
  projectTitle?: string;
  subcontractorName?: string;
}

export async function getGeofencesWithProjects(): Promise<GeofenceWithProject[]> {
  const { data, error } = await supabase
    .from('geofences')
    .select(`
      *,
      projects:project_id (
        title,
        subcontractors:subcontractor_id (
          name
        )
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data.map((row) => ({
    ...mapGeofenceFromDB(row),
    projectTitle: row.projects?.title,
    subcontractorName: row.projects?.subcontractors?.name,
  }));
}
