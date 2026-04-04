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

    const body = await req.json();
    const {
      locationId,
      firstName,
      lastName,
      email,
      phone,
      tags = [],
      customFields = {},
      source,
      country,
      address1,
      city,
      state,
      postalCode
    } = body;

    if (!firstName || !email) {
      throw new Error('firstName and email are required fields');
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

    const contactPayload: any = {
      firstName,
      email,
      locationId: accountLocationId
    };

    if (lastName) contactPayload.lastName = lastName;
    if (phone) contactPayload.phone = phone;
    if (tags.length > 0) contactPayload.tags = tags;
    if (Object.keys(customFields).length > 0) contactPayload.customFields = customFields;
    if (source) contactPayload.source = source;
    if (country) contactPayload.country = country;
    if (address1) contactPayload.address1 = address1;
    if (city) contactPayload.city = city;
    if (state) contactPayload.state = state;
    if (postalCode) contactPayload.postalCode = postalCode;

    const response = await fetch(
      'https://services.leadconnectorhq.com/contacts/',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Version': '2021-07-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contactPayload)
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
        contact: data
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message,
        details: 'Failed to create contact in GoHighLevel'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});
