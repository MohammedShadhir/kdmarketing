import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    if (req.method === 'GET') {
      const url = new URL(req.url);
      const locationId = url.searchParams.get('locationId');
      const startDate = url.searchParams.get('startDate');
      const endDate = url.searchParams.get('endDate');
      const calendarId = url.searchParams.get('calendarId');

      let accountLocationId = locationId;
      let apiToken = '';

      if (!accountLocationId) {
        const { data: defaultAccount } = await supabase
          .from('ghl_accounts')
          .select('location_id, api_token')
          .eq('is_default', true)
          .eq('is_active', true)
          .single()

        if (!defaultAccount) {
          throw new Error('No default GHL account found');
        }
        accountLocationId = defaultAccount.location_id;
        apiToken = defaultAccount.api_token;
      } else {
        const { data: account } = await supabase
          .from('ghl_accounts')
          .select('api_token')
          .eq('location_id', accountLocationId)
          .eq('is_active', true)
          .single()

        if (!account) {
          throw new Error('GHL account not found or inactive');
        }
        apiToken = account.api_token;
      }

      let ghlUrl = `https://services.leadconnectorhq.com/calendars/events?locationId=${accountLocationId}`;

      if (startDate) ghlUrl += `&startDate=${startDate}`;
      if (endDate) ghlUrl += `&endDate=${endDate}`;
      if (calendarId) ghlUrl += `&calendarId=${calendarId}`;

      const response = await fetch(ghlUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Version': '2021-07-28',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`GHL API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();

      return new Response(
        JSON.stringify(data),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    if (req.method === 'POST') {
      const body = await req.json();
      const {
        locationId,
        calendarId,
        contactId,
        startTime,
        endTime,
        title,
        appointmentStatus,
        notes
      } = body;

      if (!calendarId || !contactId || !startTime) {
        throw new Error('calendarId, contactId, and startTime are required');
      }

      let accountLocationId = locationId;
      let apiToken = '';

      if (!accountLocationId) {
        const { data: defaultAccount } = await supabase
          .from('ghl_accounts')
          .select('location_id, api_token')
          .eq('is_default', true)
          .eq('is_active', true)
          .single()

        if (!defaultAccount) {
          throw new Error('No default GHL account found');
        }
        accountLocationId = defaultAccount.location_id;
        apiToken = defaultAccount.api_token;
      } else {
        const { data: account } = await supabase
          .from('ghl_accounts')
          .select('api_token')
          .eq('location_id', accountLocationId)
          .eq('is_active', true)
          .single()

        if (!account) {
          throw new Error('GHL account not found or inactive');
        }
        apiToken = account.api_token;
      }

      const appointmentPayload: any = {
        calendarId,
        locationId: accountLocationId,
        contactId,
        startTime,
        title: title || 'Appointment'
      };

      if (endTime) appointmentPayload.endTime = endTime;
      if (appointmentStatus) appointmentPayload.appointmentStatus = appointmentStatus;
      if (notes) appointmentPayload.notes = notes;

      const response = await fetch(
        'https://services.leadconnectorhq.com/calendars/events/appointments',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Version': '2021-07-28',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(appointmentPayload)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`GHL API error (${response.status}): ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();

      return new Response(
        JSON.stringify({
          success: true,
          appointment: data
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message,
        details: 'Failed to process appointment request'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});
