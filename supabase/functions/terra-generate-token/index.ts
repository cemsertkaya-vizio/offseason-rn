import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('TERRA_API_KEY');
    const devId = Deno.env.get('TERRA_DEV_ID');

    if (!apiKey || !devId) {
      return new Response(
        JSON.stringify({ error: 'Terra credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const response = await fetch(
      'https://api.tryterra.co/v2/auth/generateAuthToken',
      {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'dev-id': devId,
        },
      },
    );

    if (!response.ok) {
      const text = await response.text();
      console.error('Terra API error:', response.status, text);
      return new Response(
        JSON.stringify({ error: 'Failed to generate Terra token' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const data = await response.json();

    return new Response(
      JSON.stringify({ token: data.token }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
