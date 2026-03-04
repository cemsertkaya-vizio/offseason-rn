import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const body = await req.json();
    console.log('terra-webhook - Received event:', JSON.stringify(body).slice(0, 500));

    const eventType = body?.type;

    // Acknowledge all events Terra sends (auth, deauth, data, etc.)
    if (eventType === 'auth') {
      const terraUserId = body?.user?.user_id;
      const referenceId = body?.user?.reference_id ?? body?.reference_id;
      const provider = body?.user?.provider;

      console.log(
        'terra-webhook - Auth event for terra_user_id:',
        terraUserId,
        'reference_id:',
        referenceId,
        'provider:',
        provider,
      );

      // Update the wearable_connections row with the terra_user_id if we have it
      if (referenceId && terraUserId) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const { error } = await supabase
          .from('wearable_connections')
          .update({ terra_user_id: terraUserId })
          .eq('user_id', referenceId)
          .eq('is_active', true);

        if (error) {
          console.log('terra-webhook - Error updating terra_user_id:', error.message);
        } else {
          console.log('terra-webhook - Updated terra_user_id for user:', referenceId);
        }
      }
    }

    if (eventType === 'deauth') {
      const referenceId = body?.user?.reference_id ?? body?.reference_id;
      console.log('terra-webhook - Deauth event for reference_id:', referenceId);

      if (referenceId) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        await supabase
          .from('wearable_connections')
          .update({ is_active: false })
          .eq('user_id', referenceId);
      }
    }

    // Always return 200 to acknowledge the webhook
    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('terra-webhook - Error:', error);
    // Still return 200 so Terra doesn't keep retrying
    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
