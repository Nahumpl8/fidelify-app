/**
 * Supabase Edge Function: Generate Google Wallet Pass
 * Crea un loyalty object en Google Wallet API y devuelve el save URL
 *
 * Requiere los siguientes secrets:
 * - GOOGLE_WALLET_ISSUER_ID
 * - GOOGLE_SERVICE_ACCOUNT_JSON
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { encode as base64UrlEncode } from 'https://deno.land/std@0.177.0/encoding/base64url.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

const GOOGLE_WALLET_SAVE_URL = 'https://pay.google.com/gp/v/save';

interface GeneratePassRequest {
  cardId: string;
}

interface ServiceAccount {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Obtener configuración de Google Wallet
    const GOOGLE_ISSUER_ID = Deno.env.get('GOOGLE_WALLET_ISSUER_ID');
    const GOOGLE_SA_JSON = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON');

    // Verificar credenciales
    if (!GOOGLE_ISSUER_ID) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Google Wallet Issuer ID not configured',
          error_code: 'CREDENTIALS_MISSING',
          hint: 'Configure GOOGLE_WALLET_ISSUER_ID secret',
        }),
        {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!GOOGLE_SA_JSON) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Google Service Account not configured',
          error_code: 'CREDENTIALS_MISSING',
          hint: 'Configure GOOGLE_SERVICE_ACCOUNT_JSON secret',
        }),
        {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse service account
    let serviceAccount: ServiceAccount;
    try {
      serviceAccount = JSON.parse(GOOGLE_SA_JSON);
    } catch (e) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid service account JSON',
          error_code: 'INVALID_CREDENTIALS',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request
    const { cardId }: GeneratePassRequest = await req.json();

    if (!cardId) {
      return new Response(
        JSON.stringify({ success: false, error: 'cardId is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Obtener datos de la tarjeta
    const { data: card, error: cardError } = await supabaseAdmin
      .from('loyalty_cards')
      .select(
        `
        *,
        client:clients (id, full_name, email),
        business:businesses (
          id, name, slug, logo_url, strip_image_url,
          brand_color, background_color,
          program_type, target_value, reward_text,
          program_config, wallet_settings
        )
      `
      )
      .eq('id', cardId)
      .single();

    if (cardError || !card) {
      return new Response(
        JSON.stringify({ success: false, error: 'Card not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Generar IDs
    const classId = `${GOOGLE_ISSUER_ID}.${card.business.slug}_loyalty`;
    const objectId =
      card.google_object_id ||
      `${GOOGLE_ISSUER_ID}.${card.id.replace(/-/g, '')}`;

    // Construir Loyalty Class (plantilla del programa)
    const loyaltyClass = {
      id: classId,
      issuerName: card.business.name,
      programName: `${card.business.name} Rewards`,
      programLogo: card.business.logo_url
        ? {
            sourceUri: { uri: card.business.logo_url },
            contentDescription: {
              defaultValue: { language: 'es', value: 'Logo' },
            },
          }
        : undefined,
      hexBackgroundColor: card.business.background_color || '#FFFFFF',
      reviewStatus: 'UNDER_REVIEW',
      // Configuración adicional
      localizedIssuerName: {
        defaultValue: { language: 'es', value: card.business.name },
      },
      localizedProgramName: {
        defaultValue: {
          language: 'es',
          value: `Programa de Lealtad ${card.business.name}`,
        },
      },
    };

    // Construir Loyalty Object (instancia para este cliente)
    const loyaltyObject = {
      id: objectId,
      classId: classId,
      state: 'ACTIVE',
      accountId: card.client?.email || card.id,
      accountName: card.client?.full_name || 'Cliente',

      loyaltyPoints: {
        label: getPointsLabel(card.business.program_type),
        balance: {
          int: card.current_balance,
        },
      },

      barcode: {
        type: 'QR_CODE',
        value: card.id,
        alternateText: card.id.substring(0, 8).toUpperCase(),
      },

      heroImage: card.business.strip_image_url
        ? {
            sourceUri: { uri: card.business.strip_image_url },
            contentDescription: {
              defaultValue: { language: 'es', value: card.business.name },
            },
          }
        : undefined,

      textModulesData: [
        {
          header: 'Premio',
          body: card.business.reward_text || 'Recompensa especial',
          id: 'reward',
        },
        {
          header: 'Meta',
          body: `${card.business.target_value} ${getPointsLabel(card.business.program_type).toLowerCase()}`,
          id: 'target',
        },
      ],

      linksModuleData: {
        uris: [
          {
            uri: `${supabaseUrl.replace('.supabase.co', '')}/join/${card.business.slug}`,
            description: 'Ver mi tarjeta',
            id: 'view_card',
          },
        ],
      },
    };

    // Crear JWT firmado para "Add to Google Wallet"
    const jwt = await createSignedJwt(serviceAccount, {
      iss: serviceAccount.client_email,
      aud: 'google',
      typ: 'savetowallet',
      iat: Math.floor(Date.now() / 1000),
      origins: ['*'],
      payload: {
        loyaltyClasses: [loyaltyClass],
        loyaltyObjects: [loyaltyObject],
      },
    });

    // Construir URL de guardado
    const saveUrl = `${GOOGLE_WALLET_SAVE_URL}/${jwt}`;

    // Actualizar el google_object_id en la base de datos
    if (!card.google_object_id) {
      await supabaseAdmin
        .from('loyalty_cards')
        .update({
          google_object_id: objectId,
          google_class_id: classId,
          google_last_updated: new Date().toISOString(),
        })
        .eq('id', cardId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        saveUrl: saveUrl,
        objectId: objectId,
        classId: classId,
        card: {
          id: card.id,
          balance: card.current_balance,
          businessName: card.business.name,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[generate-google-pass] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

/**
 * Crear JWT firmado con RS256 usando la private key del service account
 */
async function createSignedJwt(
  serviceAccount: ServiceAccount,
  payload: Record<string, unknown>
): Promise<string> {
  // Header
  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };

  // Encode header y payload
  const encodedHeader = base64UrlEncode(
    new TextEncoder().encode(JSON.stringify(header))
  );
  const encodedPayload = base64UrlEncode(
    new TextEncoder().encode(JSON.stringify(payload))
  );

  // String a firmar
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  // Importar la private key
  const privateKey = await importPrivateKey(serviceAccount.private_key);

  // Firmar
  const signature = await crypto.subtle.sign(
    { name: 'RSASSA-PKCS1-v1_5' },
    privateKey,
    new TextEncoder().encode(signatureInput)
  );

  // Encode signature
  const encodedSignature = base64UrlEncode(new Uint8Array(signature));

  return `${signatureInput}.${encodedSignature}`;
}

/**
 * Importar private key PEM para uso con Web Crypto API
 */
async function importPrivateKey(pem: string): Promise<CryptoKey> {
  // Limpiar el PEM
  const pemContents = pem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '');

  // Decodificar de base64
  const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

  // Importar como CryptoKey
  return await crypto.subtle.importKey(
    'pkcs8',
    binaryDer,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    false,
    ['sign']
  );
}

// Helper: Get points label based on program type
function getPointsLabel(programType: string): string {
  switch (programType) {
    case 'seals':
      return 'Sellos';
    case 'points':
      return 'Puntos';
    case 'cashback':
      return 'Cashback';
    case 'levels':
      return 'XP';
    default:
      return 'Puntos';
  }
}
