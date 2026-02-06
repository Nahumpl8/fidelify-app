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
 * Preview Google Wallet Pass
 * Generates a preview pass directly from wizard configuration
 * No database lookup required - uses provided config
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const ISSUER_ID = Deno.env.get('GOOGLE_WALLET_ISSUER_ID')
    const SA_JSON = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON')

    if (!ISSUER_ID || !SA_JSON) {
      return new Response(JSON.stringify({ success: false, error: 'Credentials not configured' }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const sa = JSON.parse(SA_JSON)

    // Accept configuration directly from wizard
    const {
      businessName,
      programName,
      programType,
      logoUrl,
      backgroundColor,
      targetValue,
      rewardText,
      currentBalance = 3, // Demo balance for preview
      // Strip/Hero images
      stripImageUrl,
      heroImageUrl,
    } = await req.json()

    if (!businessName || !programName) {
      return new Response(JSON.stringify({ success: false, error: 'businessName and programName required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Generate safe IDs for class and object
    const safeSlug = businessName.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 20)
    const timestamp = Date.now()
    const classId = `${ISSUER_ID}.${safeSlug}_preview`
    const objectId = `${ISSUER_ID}.preview_${timestamp}`

    // Get OAuth token
    const accessToken = await getGoogleAccessToken(sa)

    // Default logo if none provided — reject base64 URLs
    const defaultLogo = `https://ui-avatars.com/api/?name=${encodeURIComponent(businessName)}&size=256&background=4285F4&color=fff&bold=true`
    const finalLogoUrl = isValidUrl(logoUrl) ? logoUrl : defaultLogo

    // Use custom strip/hero image if provided — reject base64 URLs
    const heroUrl = isValidUrl(stripImageUrl) ? stripImageUrl : isValidUrl(heroImageUrl) ? heroImageUrl : null

    // Create Loyalty Class
    const loyaltyClass: Record<string, unknown> = {
      id: classId,
      issuerName: businessName,
      programName: programName || `${businessName} Rewards`,
      programLogo: {
        sourceUri: { uri: finalLogoUrl },
        contentDescription: { defaultValue: { language: 'es', value: businessName } }
      },
      hexBackgroundColor: backgroundColor || '#4285F4',
      reviewStatus: 'UNDER_REVIEW',
      countryCode: 'MX',
    }

    // Add hero image if provided (this is the main visual strip in Google Wallet)
    if (heroUrl) {
      loyaltyClass.heroImage = {
        sourceUri: { uri: heroUrl },
        contentDescription: { defaultValue: { language: 'es', value: `${businessName} Card` } }
      }
    }

    await createOrUpdateClass(accessToken, classId, loyaltyClass)

    // Create Loyalty Object
    const label = programType === 'stamp' ? 'Sellos' : programType === 'cashback' ? 'Cashback' : 'Puntos'

    const loyaltyObject = {
      id: objectId,
      classId: classId,
      state: 'ACTIVE',
      accountId: 'preview@demo.com',
      accountName: 'Vista Previa',
      loyaltyPoints: {
        label: label,
        balance: { int: currentBalance }
      },
      barcode: {
        type: 'QR_CODE',
        value: `preview_${timestamp}`,
        alternateText: 'DEMO'
      },
      textModulesData: [
        {
          header: 'Premio',
          body: rewardText || 'Recompensa especial',
          id: 'reward'
        },
        {
          header: 'Progreso',
          body: `${currentBalance} / ${targetValue || 10}`,
          id: 'progress'
        }
      ],
    }

    await createOrUpdateObject(accessToken, objectId, loyaltyObject)

    // Generate save URL
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

    return new Response(JSON.stringify({
      success: true,
      saveUrl,
      objectId,
      classId,
      isPreview: true,
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

// Create or update Loyalty Class
async function createOrUpdateClass(accessToken: string, classId: string, classData: Record<string, unknown>) {
  const getRes = await fetch(
    `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyClass/${classId}`,
    { headers: { 'Authorization': `Bearer ${accessToken}` } }
  )

  if (getRes.status === 200) {
    await fetch(
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
  } else {
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
    if (!createRes.ok) {
      const data = await createRes.json()
      throw new Error(`Failed to create class: ${JSON.stringify(data)}`)
    }
  }
}

// Create or update Loyalty Object
async function createOrUpdateObject(accessToken: string, objectId: string, objectData: Record<string, unknown>) {
  const getRes = await fetch(
    `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyObject/${objectId}`,
    { headers: { 'Authorization': `Bearer ${accessToken}` } }
  )

  if (getRes.status === 200) {
    await fetch(
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
  } else {
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
    if (!createRes.ok) {
      const data = await createRes.json()
      throw new Error(`Failed to create object: ${JSON.stringify(data)}`)
    }
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
