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

    const url = new URL(req.url);
    const locationId = url.searchParams.get('locationId');
    const query = url.searchParams.get('query') || '';
    const fetchAll = url.searchParams.get('fetchAll') === 'true';

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

    const fetchPage = async (startAfterId?: string, startAfter?: string) => {
      let ghlUrl = `https://services.leadconnectorhq.com/contacts/?locationId=${accountLocationId}&limit=100`;

      if (startAfterId) {
        ghlUrl += `&startAfterId=${encodeURIComponent(startAfterId)}`;
      }
      if (startAfter) {
        ghlUrl += `&startAfter=${encodeURIComponent(startAfter)}`;
      }
      if (query) {
        ghlUrl += `&query=${encodeURIComponent(query)}`;
      }

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

      return await response.json();
    };

    if (fetchAll) {
      let allContacts: any[] = [];
      let startAfterId: string | undefined = undefined;
      let startAfter: string | undefined = undefined;
      let totalFetched = 0;
      let pageCount = 0;

      do {
        pageCount++;
        const data = await fetchPage(startAfterId, startAfter);

        const contacts = data.contacts || [];
        allContacts = allContacts.concat(contacts);
        totalFetched += contacts.length;

        startAfterId = data.meta?.startAfterId || data.meta?.nextPageUrl?.includes('startAfterId')
          ? new URL(data.meta.nextPageUrl).searchParams.get('startAfterId') || undefined
          : undefined;
        startAfter = data.meta?.startAfter || data.meta?.nextPageUrl?.includes('startAfter')
          ? new URL(data.meta.nextPageUrl).searchParams.get('startAfter') || undefined
          : undefined;

        if (!startAfterId && !startAfter) {
          break;
        }

        if (pageCount >= 100) {
          break;
        }

      } while (true);

      return new Response(
        JSON.stringify({
          contacts: allContacts,
          total: totalFetched,
          count: totalFetched,
          meta: {
            totalPages: pageCount,
            fetchedAll: true
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    } else {
      const data = await fetchPage();

      return new Response(
        JSON.stringify(data),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message,
        details: 'Failed to fetch contacts from GoHighLevel'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});
