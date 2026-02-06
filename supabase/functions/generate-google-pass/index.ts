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

    // Fetch card first
    const cardRes = await fetch(
      `${SUPABASE_URL}/rest/v1/loyalty_cards?id=eq.${cardId}&select=*`,
      {
        headers: {
          'apikey': SUPABASE_KEY!,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
      }
    )

    if (!cardRes.ok) {
      const errorText = await cardRes.text()
      console.error('Card fetch failed:', cardRes.status, errorText)
      return new Response(JSON.stringify({ success: false, error: `Failed to fetch card: ${cardRes.status}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const cards = await cardRes.json()
    console.log('Card response:', JSON.stringify(cards))

    if (!Array.isArray(cards)) {
      console.error('Card response is not an array:', cards)
      return new Response(JSON.stringify({ success: false, error: 'Invalid card response format' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (cards.length === 0) {
      return new Response(JSON.stringify({ success: false, error: `Card not found with id: ${cardId}` }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const card = cards[0]
    console.log('Card business_id:', card.business_id)

    // Fetch business data
    if (!card.business_id) {
      return new Response(JSON.stringify({ success: false, error: 'Card has no business_id field' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('Fetching business with id:', card.business_id)
    const bizRes = await fetch(
      `${SUPABASE_URL}/rest/v1/businesses?id=eq.${card.business_id}&select=*`,
      {
        headers: {
          'apikey': SUPABASE_KEY!,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'return=representation',
        },
      }
    )

    if (!bizRes.ok) {
      const errorText = await bizRes.text()
      console.error('Business fetch failed:', bizRes.status, errorText)
      return new Response(JSON.stringify({ success: false, error: `Failed to fetch business: ${bizRes.status}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const businesses = await bizRes.json()
    console.log('Business response:', JSON.stringify(businesses))

    if (!Array.isArray(businesses)) {
      console.error('Business response is not an array:', businesses)
      return new Response(JSON.stringify({ success: false, error: 'Invalid business response format' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (businesses.length === 0) {
      return new Response(JSON.stringify({ success: false, error: `Business not found with id: ${card.business_id}` }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const business = businesses[0]
    console.log('Business data:', JSON.stringify(business))
    console.log('Business branding - logo_url:', business.logo_url)
    console.log('Business branding - background_color:', business.background_color)
    console.log('Business branding - strip_image_url:', business.strip_image_url)
    console.log('Business branding - brand_color:', business.brand_color)

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

    // Sanitize slug for class ID (only alphanumeric, underscore, period allowed)
    const safeSlug = (business.slug || 'default').replace(/[^a-zA-Z0-9_]/g, '_')
    const classId = `${ISSUER_ID}.${safeSlug}_loyalty`
    const objectId = card.google_object_id || `${ISSUER_ID}.card_${card.id.replace(/-/g, '')}`

    // Get OAuth token for Google Wallet API
    const accessToken = await getGoogleAccessToken(sa)

    // Default logo if business doesn't have one — reject base64 URLs
    const defaultLogo = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(business.name) + '&size=256&background=4285F4&color=fff&bold=true'
    const logoUrl = isValidUrl(business.logo_url) ? business.logo_url : defaultLogo

    const targetValue = business.target_value || 10
    const currentBalance = card.current_balance || 0

    // Use custom strip/hero image from Storage — reject base64 URLs
    const heroImageUrl = isValidUrl(business.strip_image_url) ? business.strip_image_url : isValidUrl(business.hero_image_url) ? business.hero_image_url : null

    // Step 1: Create or update the Loyalty Class
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

    // Add hero image if available (main visual strip in Google Wallet)
    if (heroImageUrl) {
      loyaltyClass.heroImage = {
        sourceUri: { uri: heroImageUrl },
        contentDescription: { defaultValue: { language: 'es', value: `${business.name} Card` } }
      }
    }

    // Try to create the class, or update if it exists
    const classResult = await createOrUpdateClass(accessToken, classId, loyaltyClass)
    console.log('Class result:', classResult)

    // Step 2: Create the Loyalty Object
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
          int: card.current_balance || 0
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
          body: `${card.current_balance || 0} / ${business.target_value || 10}`,
          id: 'progress'
        }
      ],
    }

    // Create or update the object
    const objectResult = await createOrUpdateObject(accessToken, objectId, loyaltyObject)
    console.log('Object result:', objectResult)

    // Step 3: Generate the Save URL using JWT (for adding to wallet)
    const claims = {
      iss: sa.client_email,
      aud: 'google',
      typ: 'savetowallet',
      iat: Math.floor(Date.now() / 1000),
      origins: ['*'],
      payload: {
        loyaltyObjects: [{ id: objectId }]
      }
    }

    const jwt = await signJwt(sa, claims)
    const saveUrl = `https://pay.google.com/gp/v/save/${jwt}`

    // Update card in database
    if (!card.google_object_id) {
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
            google_object_id: objectId,
            google_class_id: classId,
            google_last_updated: new Date().toISOString(),
          }),
        }
      )
    }

    return new Response(JSON.stringify({
      success: true,
      saveUrl,
      objectId,
      classId,
      classCreated: classResult.created,
      objectCreated: objectResult.created,
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

// Get Google OAuth access token using service account
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

// Create or update Loyalty Class
async function createOrUpdateClass(accessToken: string, classId: string, classData: Record<string, unknown>) {
  // First try to get the class
  const getRes = await fetch(
    `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyClass/${classId}`,
    {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }
  )

  if (getRes.status === 200) {
    // Class exists, update it
    const updateRes = await fetch(
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
    const data = await updateRes.json()
    return { created: false, updated: true, data }
  } else {
    // Class doesn't exist, create it
    const createRes = await fetch(
      'https://walletobjects.googleapis.com/walletobjects/v1/loyaltyClass',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(classData)
      }
    )
    const data = await createRes.json()
    if (!createRes.ok) {
      console.error('Failed to create class:', data)
      throw new Error(`Failed to create class: ${JSON.stringify(data)}`)
    }
    return { created: true, updated: false, data }
  }
}

// Create or update Loyalty Object
async function createOrUpdateObject(accessToken: string, objectId: string, objectData: Record<string, unknown>) {
  // First try to get the object
  const getRes = await fetch(
    `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyObject/${objectId}`,
    {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }
  )

  if (getRes.status === 200) {
    // Object exists, update it
    const updateRes = await fetch(
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
    const data = await updateRes.json()
    return { created: false, updated: true, data }
  } else {
    // Object doesn't exist, create it
    const createRes = await fetch(
      'https://walletobjects.googleapis.com/walletobjects/v1/loyaltyObject',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(objectData)
      }
    )
    const data = await createRes.json()
    if (!createRes.ok) {
      console.error('Failed to create object:', data)
      throw new Error(`Failed to create object: ${JSON.stringify(data)}`)
    }
    return { created: true, updated: false, data }
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
