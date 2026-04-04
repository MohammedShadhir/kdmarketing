import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LocationUpdateRequest {
  subcontractorId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
}

interface GeofenceRow {
  id: string;
  project_id: string;
  name: string;
  center_lat: number;
  center_lng: number;
  radius_meters: number;
}

interface ProjectRow {
  id: string;
  title: string;
}

function calculateDistance(
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

async function checkGeofenceViolations(
  supabase: ReturnType<typeof createClient>,
  subcontractorId: string,
  subcontractorName: string,
  lat: number,
  lng: number
): Promise<void> {
  const { data: projects } = await supabase
    .from('projects')
    .select('id, title')
    .eq('subcontractor_id', subcontractorId)
    .eq('status', 'Active');

  if (!projects || projects.length === 0) {
    return;
  }

  const projectIds = projects.map((p: ProjectRow) => p.id);
  const projectMap = new Map(projects.map((p: ProjectRow) => [p.id, p.title]));

  const { data: geofences } = await supabase
    .from('geofences')
    .select('id, project_id, name, center_lat, center_lng, radius_meters')
    .in('project_id', projectIds)
    .eq('is_active', true);

  if (!geofences || geofences.length === 0) {
    return;
  }

  for (const geofence of geofences as GeofenceRow[]) {
    const distance = calculateDistance(
      lat,
      lng,
      geofence.center_lat,
      geofence.center_lng
    );
    const isOutside = distance > geofence.radius_meters;

    if (isOutside) {
      const projectTitle = projectMap.get(geofence.project_id) || 'Unknown Project';

      const { data: recentNotification } = await supabase
        .from('notifications')
        .select('id')
        .eq('subcontractor_id', subcontractorId)
        .eq('geofence_id', geofence.id)
        .eq('type', 'geofence_exit')
        .gte('created_at', new Date(Date.now() - 30 * 60 * 1000).toISOString())
        .limit(1);

      if (!recentNotification || recentNotification.length === 0) {
        await supabase.from('notifications').insert({
          type: 'geofence_exit',
          title: 'Geofence Alert',
          message: `${subcontractorName} has left the geofenced area "${geofence.name}" for project "${projectTitle}". Distance: ${Math.round(distance)}m from boundary.`,
          subcontractor_id: subcontractorId,
          project_id: geofence.project_id,
          geofence_id: geofence.id,
          metadata: {
            latitude: lat,
            longitude: lng,
            distance: Math.round(distance),
            geofenceName: geofence.name,
            projectTitle: projectTitle,
          },
        });
      }
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: LocationUpdateRequest = await req.json();
    const { subcontractorId, latitude, longitude, accuracy } = body;

    if (!subcontractorId || latitude === undefined || longitude === undefined) {
      return new Response(
        JSON.stringify({ error: 'subcontractorId, latitude, and longitude are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return new Response(
        JSON.stringify({ error: 'Invalid latitude or longitude values' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = new Date().toISOString();

    const { error: logError } = await supabase.from('location_logs').insert({
      subcontractor_id: subcontractorId,
      latitude,
      longitude,
      accuracy: accuracy || null,
      recorded_at: now,
    });

    if (logError) {
      throw new Error(`Failed to insert location log: ${logError.message}`);
    }

    const { data: subcontractorData, error: updateError } = await supabase
      .from('subcontractors')
      .update({
        last_known_lat: latitude,
        last_known_lng: longitude,
        last_seen_at: now,
      })
      .eq('id', subcontractorId)
      .select('name')
      .single();

    if (updateError) {
      throw new Error(`Failed to update subcontractor location: ${updateError.message}`);
    }

    const subcontractorName = subcontractorData?.name || 'Unknown';
    await checkGeofenceViolations(supabase, subcontractorId, subcontractorName, latitude, longitude);

    return new Response(
      JSON.stringify({ success: true, recordedAt: now }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
