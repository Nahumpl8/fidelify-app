/**
 * Supabase Edge Function: Generate Apple Wallet Pass
 * Genera un archivo .pkpass firmado para Apple Wallet
 *
 * Requiere los siguientes secrets:
 * - APPLE_TEAM_ID
 * - APPLE_PASS_TYPE_IDENTIFIER
 * - APPLE_CERTIFICATE_P12_BASE64
 * - APPLE_CERTIFICATE_PASSWORD
 * - APPLE_WWDR_CERTIFICATE_BASE64
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { crypto } from 'https://deno.land/std@0.177.0/crypto/mod.ts';
import { encode as base64Encode } from 'https://deno.land/std@0.177.0/encoding/base64.ts';
import { decode as base64Decode } from 'https://deno.land/std@0.177.0/encoding/base64.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

interface GeneratePassRequest {
  cardId: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Obtener configuración de Apple Wallet
    const APPLE_TEAM_ID = Deno.env.get('APPLE_TEAM_ID');
    const APPLE_PASS_TYPE_ID = Deno.env.get('APPLE_PASS_TYPE_IDENTIFIER');
    const APPLE_CERT_P12_BASE64 = Deno.env.get('APPLE_CERTIFICATE_P12_BASE64');
    const APPLE_CERT_PASSWORD = Deno.env.get('APPLE_CERTIFICATE_PASSWORD');
    const APPLE_WWDR_BASE64 = Deno.env.get('APPLE_WWDR_CERTIFICATE_BASE64');

    // Verificar credenciales
    if (!APPLE_TEAM_ID || !APPLE_PASS_TYPE_ID) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Apple Wallet credentials not configured',
          error_code: 'CREDENTIALS_MISSING',
          hint: 'Configure APPLE_TEAM_ID and APPLE_PASS_TYPE_IDENTIFIER secrets',
        }),
        {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Verificar certificados
    if (!APPLE_CERT_P12_BASE64 || !APPLE_CERT_PASSWORD || !APPLE_WWDR_BASE64) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Apple certificates not configured',
          error_code: 'CERTIFICATES_MISSING',
          hint: 'Configure APPLE_CERTIFICATE_P12_BASE64, APPLE_CERTIFICATE_PASSWORD, and APPLE_WWDR_CERTIFICATE_BASE64',
        }),
        {
          status: 503,
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
        client:clients (id, full_name, email, phone),
        business:businesses (
          id, name, slug, logo_url, icon_url, strip_image_url,
          brand_color, background_color, label_color,
          program_type, target_value, reward_text,
          program_config, wallet_settings, back_fields
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

    // Generar serial number si no existe
    let serialNumber = card.apple_serial_number;
    if (!serialNumber) {
      const randomBytes = new Uint8Array(16);
      crypto.getRandomValues(randomBytes);
      serialNumber = Array.from(randomBytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    }

    // Construir pass.json
    const passJson = {
      formatVersion: 1,
      passTypeIdentifier: APPLE_PASS_TYPE_ID,
      serialNumber: serialNumber,
      teamIdentifier: APPLE_TEAM_ID,
      organizationName: card.business.name,
      description: `Tarjeta de lealtad - ${card.business.name}`,
      logoText: card.business.name,

      // Colores (convertir HEX a rgb())
      foregroundColor: hexToRgb(card.business.brand_color || '#000000'),
      backgroundColor: hexToRgb(card.business.background_color || '#FFFFFF'),
      labelColor: hexToRgb(card.business.label_color || '#666666'),

      // Barcode
      barcodes: [
        {
          format: 'PKBarcodeFormatQR',
          message: card.id,
          messageEncoding: 'iso-8859-1',
          altText: serialNumber.substring(0, 8).toUpperCase(),
        },
      ],

      // Tipo de pase: generic (para loyalty)
      generic: {
        primaryFields: [
          {
            key: 'balance',
            label: getBalanceLabel(card.business.program_type),
            value: formatBalance(
              card.current_balance,
              card.business.program_type,
              card.business.target_value
            ),
          },
        ],
        secondaryFields: [
          {
            key: 'member',
            label: 'MIEMBRO',
            value: card.client?.full_name || 'Cliente',
          },
        ],
        auxiliaryFields: [
          {
            key: 'reward',
            label: 'PREMIO',
            value: card.business.reward_text || 'Recompensa',
          },
          {
            key: 'progress',
            label: 'PROGRESO',
            value: `${card.current_balance}/${card.business.target_value}`,
          },
        ],
        backFields: [
          {
            key: 'terms',
            label: 'Términos y Condiciones',
            value:
              card.business.back_fields?.terms_and_conditions ||
              'Programa de lealtad. Acumula puntos con cada compra.',
          },
          {
            key: 'contact',
            label: 'Contacto',
            value:
              card.business.back_fields?.contact_email ||
              card.business.back_fields?.contact_phone ||
              '',
          },
          {
            key: 'cardId',
            label: 'ID de Tarjeta',
            value: card.id,
          },
        ],
      },

      // Web service para actualizaciones (opcional)
      // webServiceURL: `${supabaseUrl}/functions/v1/apple-wallet-callback`,
      // authenticationToken: generateAuthToken(card.id),
    };

    // Crear el archivo .pkpass (ZIP con estructura específica)
    const passFiles: Record<string, Uint8Array> = {};

    // 1. pass.json
    passFiles['pass.json'] = new TextEncoder().encode(
      JSON.stringify(passJson, null, 2)
    );

    // 2. Descargar imágenes si existen
    if (card.business.logo_url) {
      try {
        const logoResponse = await fetch(card.business.logo_url);
        if (logoResponse.ok) {
          const logoData = new Uint8Array(await logoResponse.arrayBuffer());
          passFiles['logo.png'] = logoData;
          passFiles['logo@2x.png'] = logoData;
        }
      } catch (e) {
        console.error('Error downloading logo:', e);
      }
    }

    if (card.business.icon_url) {
      try {
        const iconResponse = await fetch(card.business.icon_url);
        if (iconResponse.ok) {
          const iconData = new Uint8Array(await iconResponse.arrayBuffer());
          passFiles['icon.png'] = iconData;
          passFiles['icon@2x.png'] = iconData;
        }
      } catch (e) {
        console.error('Error downloading icon:', e);
      }
    }

    if (card.business.strip_image_url) {
      try {
        const stripResponse = await fetch(card.business.strip_image_url);
        if (stripResponse.ok) {
          const stripData = new Uint8Array(await stripResponse.arrayBuffer());
          passFiles['strip.png'] = stripData;
          passFiles['strip@2x.png'] = stripData;
        }
      } catch (e) {
        console.error('Error downloading strip:', e);
      }
    }

    // 3. Crear manifest.json (hash SHA-1 de cada archivo)
    const manifest: Record<string, string> = {};
    for (const [filename, content] of Object.entries(passFiles)) {
      const hashBuffer = await crypto.subtle.digest('SHA-1', content);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      manifest[filename] = hashHex;
    }
    passFiles['manifest.json'] = new TextEncoder().encode(
      JSON.stringify(manifest, null, 2)
    );

    // 4. Firmar el manifest (crear signature)
    // NOTA: La firma PKCS#7 requiere una librería especializada
    // En producción, usar un servicio externo o librería como node-forge
    // Por ahora, retornamos los datos del pase sin firma

    // Actualizar la tarjeta con el serial number
    if (!card.apple_serial_number) {
      await supabaseAdmin
        .from('loyalty_cards')
        .update({
          apple_serial_number: serialNumber,
          apple_pass_type_identifier: APPLE_PASS_TYPE_ID,
          apple_last_updated: new Date().toISOString(),
        })
        .eq('id', cardId);
    }

    // Por ahora, retornar los datos del pase
    // En producción, aquí iría la generación del ZIP firmado
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Apple Wallet pass data generated',
        passData: passJson,
        serialNumber: serialNumber,
        card: {
          id: card.id,
          balance: card.current_balance,
          businessName: card.business.name,
        },
        // TODO: En producción, generar el .pkpass y subirlo a Storage
        // downloadUrl: `${supabaseUrl}/storage/v1/object/public/wallet-passes/${card.id}.pkpass`,
        hint: 'PKCS#7 signing requires additional implementation. Consider using a signing service.',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[generate-apple-pass] Error:', error);
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

// Helper: Convert HEX to rgb() format for Apple Wallet
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return 'rgb(0, 0, 0)';
  return `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})`;
}

// Helper: Get balance label based on program type
function getBalanceLabel(programType: string): string {
  switch (programType) {
    case 'seals':
      return 'SELLOS';
    case 'points':
      return 'PUNTOS';
    case 'cashback':
      return 'CASHBACK';
    case 'levels':
      return 'XP';
    default:
      return 'BALANCE';
  }
}

// Helper: Format balance for display
function formatBalance(
  balance: number,
  programType: string,
  target: number
): string {
  switch (programType) {
    case 'seals':
      return `${balance}/${target}`;
    case 'points':
      return balance.toLocaleString();
    case 'cashback':
      return `$${(balance / 100).toFixed(2)}`;
    case 'levels':
      return balance.toLocaleString();
    default:
      return balance.toString();
  }
}
