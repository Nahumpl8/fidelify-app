/**
 * Supabase Edge Function: Add Stamp
 * Fidelify - Server-side stamp addition with push notifications
 *
 * Esta Edge Function es una alternativa a llamar directamente al RPC.
 * Úsala cuando necesites:
 * - Enviar push notifications a Apple/Google Wallet
 * - Validar permisos del empleado antes de la operación
 * - Logging adicional o analytics
 *
 * Deploy: supabase functions deploy add-stamp
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AddStampRequest {
  cardId: string;
  amount?: number;
  description?: string;
  locationName?: string;
}

interface AddStampResponse {
  success: boolean;
  transaction_id?: string;
  card_id?: string;
  previous_balance?: number;
  new_balance?: number;
  lifetime_balance?: number;
  target_value?: number;
  progress_percentage?: number;
  reward_unlocked?: boolean;
  rewards_earned?: number;
  reward_text?: string;
  new_tier?: string;
  tier_changed?: boolean;
  requires_wallet_update?: boolean;
  error?: string;
  error_code?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role for server operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Client with user's JWT for authentication
    const authHeader = req.headers.get('Authorization')!;
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Service client for operations that bypass RLS
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized', error_code: 'AUTH_ERROR' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body: AddStampRequest = await req.json();
    const { cardId, amount = 1, description, locationName } = body;

    // Validation
    if (!cardId) {
      return new Response(
        JSON.stringify({ success: false, error: 'cardId is required', error_code: 'VALIDATION_ERROR' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user has permission (is an employee of the business)
    const { data: card } = await supabaseAdmin
      .from('loyalty_cards')
      .select('business_id')
      .eq('id', cardId)
      .single();

    if (!card) {
      return new Response(
        JSON.stringify({ success: false, error: 'Card not found', error_code: 'NOT_FOUND' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: employee } = await supabaseAdmin
      .from('employees')
      .select('id, permissions')
      .eq('business_id', card.business_id)
      .eq('auth_user_id', user.id)
      .eq('is_active', true)
      .single();

    if (!employee) {
      return new Response(
        JSON.stringify({ success: false, error: 'Not authorized for this business', error_code: 'FORBIDDEN' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!employee.permissions?.can_add_stamps) {
      return new Response(
        JSON.stringify({ success: false, error: 'No permission to add stamps', error_code: 'FORBIDDEN' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call the RPC function
    const { data: result, error: rpcError } = await supabaseAdmin.rpc('add_stamp', {
      p_card_id: cardId,
      p_amount: amount,
      p_description: description || null,
      p_created_by: user.id,
      p_location_name: locationName || null,
    });

    if (rpcError) {
      console.error('[add-stamp] RPC Error:', rpcError);
      return new Response(
        JSON.stringify({ success: false, error: rpcError.message, error_code: 'RPC_ERROR' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const response = result as AddStampResponse;

    // If wallet update is required, trigger push notifications
    if (response.success && response.requires_wallet_update) {
      // Get wallet tokens
      const { data: cardWithTokens } = await supabaseAdmin
        .from('loyalty_cards')
        .select('apple_push_token, google_object_id')
        .eq('id', cardId)
        .single();

      if (cardWithTokens) {
        // Queue push notification jobs (implement based on your push infrastructure)
        // This is a placeholder - implement with your actual push service
        if (cardWithTokens.apple_push_token) {
          console.log('[add-stamp] Would send Apple push to:', cardWithTokens.apple_push_token);
          // await sendApplePushUpdate(cardWithTokens.apple_push_token);
        }

        if (cardWithTokens.google_object_id) {
          console.log('[add-stamp] Would update Google object:', cardWithTokens.google_object_id);
          // await updateGoogleWalletObject(cardWithTokens.google_object_id);
        }
      }
    }

    // Return success response
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[add-stamp] Unexpected error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        error_code: 'INTERNAL_ERROR',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
