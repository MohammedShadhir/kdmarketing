import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, password, userType } = await req.json();

    if (!email || !password || !userType) {
      return new Response(
        JSON.stringify({ error: 'Email, password, and userType are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (userType === 'sales' || userType === 'admin') {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .eq('is_active', true)
        .single();

      if (userError || !userData) {
        return new Response(
          JSON.stringify({ error: 'Invalid credentials' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (password !== userData.password_hash) {
        return new Response(
          JSON.stringify({ error: 'Invalid credentials' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userData.id);

      return new Response(
        JSON.stringify({
          user: {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            default_sales_commission: userData.default_sales_commission,
            profilePictureUrl: userData.profile_picture_url,
            lastLogin: userData.last_login
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (userType === 'subcontractor') {
      const { data: subcontractorData, error: subcontractorError } = await supabase
        .from('subcontractors')
        .select('*')
        .eq('email', email.toLowerCase())
        .eq('is_active', true)
        .single();

      if (subcontractorError || !subcontractorData || !subcontractorData.password_hash) {
        return new Response(
          JSON.stringify({ error: 'Invalid credentials' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (password !== subcontractorData.password_hash) {
        return new Response(
          JSON.stringify({ error: 'Invalid credentials' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      await supabase
        .from('subcontractors')
        .update({ last_login: new Date().toISOString() })
        .eq('id', subcontractorData.id);

      return new Response(
        JSON.stringify({
          user: {
            id: subcontractorData.id,
            email: subcontractorData.email,
            name: subcontractorData.name,
            role: 'subcontractor',
            subContractorId: subcontractorData.id,
            profilePictureUrl: subcontractorData.profile_picture_url,
            lastLogin: subcontractorData.last_login
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid user type' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
