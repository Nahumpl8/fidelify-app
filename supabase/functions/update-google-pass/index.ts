import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/** Validate that a URL is a real HTTPS URL (not base64, not null/empty) */
function isValidUrl(url: string | null | undefined): boolean {
  if (!url) return false
  if (url.startsWith('data:')) return false
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch {
    return false
  }
}

/**
 * Update Google Wallet Pass
 * Called when a client's balance changes to update their wallet pass
 * This updates the loyalty object with new balance and strip image
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const ISSUER_ID = Deno.env.get('GOOGLE_WALLET_ISSUER_ID')
    const SA_JSON = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!ISSUER_ID || !SA_JSON) {
      return new Response(JSON.stringify({ success: false, error: 'Credentials not configured' }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const sa = JSON.parse(SA_JSON)
    const { cardId } = await req.json()

    if (!cardId) {
      return new Response(JSON.stringify({ success: false, error: 'cardId required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Fetch card data
    const cardRes = await fetch(
      `${SUPABASE_URL}/rest/v1/loyalty_cards?id=eq.${cardId}&select=*`,
      {
        headers: {
          'apikey': SUPABASE_KEY!,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
      }
    )

    const cards = await cardRes.json()
    if (!cards || cards.length === 0) {
      return new Response(JSON.stringify({ success: false, error: 'Card not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const card = cards[0]

    // Check if card has Google Wallet object
    if (!card.google_object_id) {
      return new Response(JSON.stringify({ success: false, error: 'Card not linked to Google Wallet' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Fetch business data
    if (!card.business_id) {
      return new Response(JSON.stringify({ success: false, error: 'Card has no business_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const bizRes = await fetch(
      `${SUPABASE_URL}/rest/v1/businesses?id=eq.${card.business_id}&select=id,name,slug,logo_url,strip_image_url,hero_image_url,background_color,program_type,target_value,reward_text,program_config`,
      {
        headers: {
          'apikey': SUPABASE_KEY!,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
      }
    )
    const businesses = await bizRes.json()
    if (!businesses || businesses.length === 0) {
      return new Response(JSON.stringify({ success: false, error: 'Business not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const business = businesses[0]

    // Fetch client data (optional)
    let client = null
    if (card.client_id) {
      const clientRes = await fetch(
        `${SUPABASE_URL}/rest/v1/clients?id=eq.${card.client_id}&select=id,full_name,email`,
        {
          headers: {
            'apikey': SUPABASE_KEY!,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
          },
        }
      )
      const clients = await clientRes.json()
      if (clients && clients.length > 0) {
        client = clients[0]
      }
    }

    const objectId = card.google_object_id
    const classId = card.google_class_id

    // Get OAuth token
    const accessToken = await getGoogleAccessToken(sa)

    const targetValue = business.target_value || 10
    const currentBalance = card.current_balance || 0

    // Use custom strip/hero image from Storage — reject base64 URLs
    const heroImageUrl = isValidUrl(business.strip_image_url) ? business.strip_image_url : isValidUrl(business.hero_image_url) ? business.hero_image_url : null

    // Update the class with new hero image
    if (classId) {
      const defaultLogo = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(business.name) + '&size=256&background=4285F4&color=fff&bold=true'
      const logoUrl = isValidUrl(business.logo_url) ? business.logo_url : defaultLogo

      const loyaltyClass: Record<string, unknown> = {
        id: classId,
        issuerName: business.name,
        programName: `${business.name} Rewards`,
        programLogo: {
          sourceUri: { uri: logoUrl },
          contentDescription: { defaultValue: { language: 'es', value: business.name } }
        },
        hexBackgroundColor: business.background_color || '#4285F4',
        reviewStatus: 'UNDER_REVIEW',
        countryCode: 'MX',
      }

      // Only add hero image if we have a valid URL
      if (heroImageUrl) {
        loyaltyClass.heroImage = {
          sourceUri: { uri: heroImageUrl },
          contentDescription: { defaultValue: { language: 'es', value: `${business.name} Card` } }
        }
      }

      await updateClass(accessToken, classId, loyaltyClass)
    }

    // Update the object with new balance
    const label = business.program_type === 'seals' ? 'Sellos' : business.program_type === 'cashback' ? 'Cashback' : 'Puntos'

    const loyaltyObject = {
      id: objectId,
      classId: classId,
      state: 'ACTIVE',
      accountId: client?.email || card.id,
      accountName: client?.full_name || 'Cliente',
      loyaltyPoints: {
        label: label,
        balance: {
          int: currentBalance
        }
      },
      barcode: {
        type: 'QR_CODE',
        value: card.id,
        alternateText: card.id.substring(0, 8).toUpperCase()
      },
      textModulesData: [
        {
          header: 'Premio',
          body: business.reward_text || 'Recompensa especial',
          id: 'reward'
        },
        {
          header: 'Progreso',
          body: `${currentBalance} / ${targetValue}`,
          id: 'progress'
        }
      ],
    }

    await updateObject(accessToken, objectId, loyaltyObject)

    // Update last_updated timestamp
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
          google_last_updated: new Date().toISOString(),
        }),
      }
    )

    return new Response(JSON.stringify({
      success: true,
      objectId,
      newBalance: currentBalance,
      message: 'Google Wallet pass updated'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    console.error('Error:', e)
    return new Response(JSON.stringify({ success: false, error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

// Get Google OAuth access token
async function getGoogleAccessToken(sa: { client_email: string; private_key: string }): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const claims = {
    iss: sa.client_email,
    sub: sa.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/wallet_object.issuer'
  }

  const jwt = await signJwt(sa, claims)

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  })

  const tokenData = await tokenRes.json()
  if (!tokenData.access_token) {
    throw new Error(`Failed to get access token: ${JSON.stringify(tokenData)}`)
  }

  return tokenData.access_token
}

// Update Loyalty Class
async function updateClass(accessToken: string, classId: string, classData: Record<string, unknown>) {
  const res = await fetch(
    `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyClass/${classId}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(classData)
    }
  )
  if (!res.ok) {
    const data = await res.json()
    console.error('Failed to update class:', data)
  }
}

// Update Loyalty Object
async function updateObject(accessToken: string, objectId: string, objectData: Record<string, unknown>) {
  const res = await fetch(
    `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyObject/${objectId}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(objectData)
    }
  )
  if (!res.ok) {
    const data = await res.json()
    console.error('Failed to update object:', data)
    throw new Error(`Failed to update object: ${JSON.stringify(data)}`)
  }
}

// Sign JWT with RS256
async function signJwt(sa: { client_email: string; private_key: string }, payload: Record<string, unknown>): Promise<string> {
  const header = { alg: 'RS256', typ: 'JWT' }
  const h = btoa(JSON.stringify(header)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  const p = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  const input = `${h}.${p}`

  const pem = sa.private_key
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '')

  const der = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0))
  const key = await crypto.subtle.importKey(
    'pkcs8',
    der,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const sig = await crypto.subtle.sign(
    { name: 'RSASSA-PKCS1-v1_5' },
    key,
    new TextEncoder().encode(input)
  )

  const s = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  return `${input}.${s}`
}
