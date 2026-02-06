/**
 * Supabase Edge Function: Generate Apple Wallet Pass
 * Genera datos para un pase de Apple Wallet
 *
 * Requiere los siguientes secrets:
 * - APPLE_TEAM_ID
 * - APPLE_PASS_TYPE_IDENTIFIER
 * - APPLE_CERTIFICATE_P12_BASE64
 * - APPLE_CERTIFICATE_PASSWORD
 * - APPLE_WWDR_CERTIFICATE_BASE64
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GeneratePassRequest {
  cardId: string
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const APPLE_TEAM_ID = Deno.env.get('APPLE_TEAM_ID')
    const APPLE_PASS_TYPE_ID = Deno.env.get('APPLE_PASS_TYPE_IDENTIFIER')
    const APPLE_CERT_P12_BASE64 = Deno.env.get('APPLE_CERTIFICATE_P12_BASE64')
    const APPLE_CERT_PASSWORD = Deno.env.get('APPLE_CERTIFICATE_PASSWORD')
    const APPLE_WWDR_BASE64 = Deno.env.get('APPLE_WWDR_CERTIFICATE_BASE64')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

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
      )
    }

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
      )
    }

    const { cardId }: GeneratePassRequest = await req.json()

    if (!cardId) {
      return new Response(
        JSON.stringify({ success: false, error: 'cardId is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Fetch card using REST API directly
    const cardRes = await fetch(
      `${SUPABASE_URL}/rest/v1/loyalty_cards?id=eq.${cardId}&select=*,client:clients(id,full_name,email,phone),business:businesses(id,name,slug,logo_url,icon_url,strip_image_url,brand_color,background_color,label_color,program_type,target_value,reward_text,program_config,wallet_settings,back_fields)`,
      {
        headers: {
          'apikey': SUPABASE_KEY!,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
      }
    )

    const cards = await cardRes.json()
    if (!cards || cards.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Card not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const card = cards[0]

    // Generate serial number if it doesn't exist
    let serialNumber = card.apple_serial_number
    if (!serialNumber) {
      const randomBytes = new Uint8Array(16)
      crypto.getRandomValues(randomBytes)
      serialNumber = Array.from(randomBytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
    }

    // Build pass.json
    const passJson = {
      formatVersion: 1,
      passTypeIdentifier: APPLE_PASS_TYPE_ID,
      serialNumber: serialNumber,
      teamIdentifier: APPLE_TEAM_ID,
      organizationName: card.business.name,
      description: `Tarjeta de lealtad - ${card.business.name}`,
      logoText: card.business.name,

      foregroundColor: hexToRgb(card.business.brand_color || '#000000'),
      backgroundColor: hexToRgb(card.business.background_color || '#FFFFFF'),
      labelColor: hexToRgb(card.business.label_color || '#666666'),

      barcodes: [
        {
          format: 'PKBarcodeFormatQR',
          message: card.id,
          messageEncoding: 'iso-8859-1',
          altText: serialNumber.substring(0, 8).toUpperCase(),
        },
      ],

      generic: {
        primaryFields: [
          {
            key: 'balance',
            label: getBalanceLabel(card.business.program_type),
            value: formatBalance(card.current_balance, card.business.program_type, card.business.target_value),
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
            value: card.business.back_fields?.terms_and_conditions || 'Programa de lealtad. Acumula puntos con cada compra.',
          },
          {
            key: 'contact',
            label: 'Contacto',
            value: card.business.back_fields?.contact_email || card.business.back_fields?.contact_phone || '',
          },
          {
            key: 'cardId',
            label: 'ID de Tarjeta',
            value: card.id,
          },
        ],
      },
    }

    // Update card with serial number if new
    if (!card.apple_serial_number) {
      await fetch(
        `${SUPABASE_URL}/rest/v1/loyalty_cards?id=eq.${cardId}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_KEY!,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({
            apple_serial_number: serialNumber,
            apple_pass_type_identifier: APPLE_PASS_TYPE_ID,
            apple_last_updated: new Date().toISOString(),
          }),
        }
      )
    }

    // Return pass data (full signing requires external service or Node.js)
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
        hint: 'PKCS#7 signing requires additional implementation. Consider using a signing service.',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('[generate-apple-pass] Error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return 'rgb(0, 0, 0)'
  return `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})`
}

function getBalanceLabel(programType: string): string {
  switch (programType) {
    case 'seals': return 'SELLOS'
    case 'points': return 'PUNTOS'
    case 'cashback': return 'CASHBACK'
    case 'levels': return 'XP'
    default: return 'BALANCE'
  }
}

function formatBalance(balance: number, programType: string, target: number): string {
  switch (programType) {
    case 'seals': return `${balance}/${target}`
    case 'points': return balance.toLocaleString()
    case 'cashback': return `$${(balance / 100).toFixed(2)}`
    case 'levels': return balance.toLocaleString()
    default: return balance.toString()
  }
}
