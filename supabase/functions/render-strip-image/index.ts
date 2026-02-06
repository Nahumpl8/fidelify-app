import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import React from 'https://esm.sh/react@18.2.0'
import { ImageResponse } from 'https://deno.land/x/og_edge/mod.ts'

const h = React.createElement

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Render Strip Image
 * Generates a dynamic PNG strip image for Google Wallet (1032x336)
 * Uses og_edge (Satori + resvg-wasm) for PNG generation
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)

    // Parse parameters from query string (GET) or body (POST)
    let current: number, total: number, bgColor: string, activeColor: string
    let icon: string, businessName: string, rewardText: string

    if (req.method === 'GET') {
      current = parseInt(url.searchParams.get('current') || '3')
      total = parseInt(url.searchParams.get('total') || '10')
      bgColor = url.searchParams.get('bg') || '#4285F4'
      activeColor = url.searchParams.get('active') || '#FFFFFF'
      icon = url.searchParams.get('icon') || 'circle'
      businessName = url.searchParams.get('name') || ''
      rewardText = url.searchParams.get('reward') || ''
    } else {
      const body = await req.json()
      current = body.current ?? 3
      total = body.total ?? 10
      bgColor = body.bgColor || '#4285F4'
      activeColor = body.activeColor || '#FFFFFF'
      icon = body.icon || 'circle'
      businessName = body.businessName || ''
      rewardText = body.rewardText || ''
    }

    // Icon characters for each type
    const iconMap: Record<string, { active: string; inactive: string }> = {
      circle: { active: '\u25CF', inactive: '\u25CB' },  // ● ○
      star:   { active: '\u2605', inactive: '\u2606' },  // ★ ☆
      coffee: { active: '\u2615', inactive: '\u25CB' },  // ☕ ○
      heart:  { active: '\u2764', inactive: '\u25CB' },  // ❤ ○
      check:  { active: '\u2713', inactive: '\u25CB' },  // ✓ ○
    }
    const chars = iconMap[icon] || iconMap.circle

    // Build stamp elements
    const stamps = Array.from({ length: total }, (_, i) => {
      const isActive = i < current
      return h('div', {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 44,
          height: 44,
          fontSize: 28,
          color: isActive ? activeColor : 'rgba(255,255,255,0.25)',
          margin: '4px',
        },
      }, isActive ? chars.active : chars.inactive)
    })

    // Build children array
    const children: unknown[] = []

    if (businessName) {
      children.push(
        h('div', {
          style: {
            display: 'flex',
            color: activeColor,
            fontSize: 22,
            fontWeight: 600,
          },
        }, businessName)
      )
    }

    children.push(
      h('div', {
        style: {
          display: 'flex',
          flexWrap: 'wrap' as const,
          justifyContent: 'center',
          marginTop: 12,
          marginBottom: 12,
          maxWidth: 500,
        },
      }, ...stamps)
    )

    children.push(
      h('div', {
        style: {
          display: 'flex',
          color: activeColor,
          fontSize: 28,
          fontWeight: 700,
        },
      }, `${current} / ${total}`)
    )

    if (rewardText) {
      children.push(
        h('div', {
          style: {
            display: 'flex',
            color: 'rgba(255,255,255,0.8)',
            fontSize: 14,
            marginTop: 4,
          },
        }, rewardText)
      )
    }

    const bgDarker = adjustColor(bgColor, -20)

    const element = h('div', {
      style: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        backgroundImage: `linear-gradient(135deg, ${bgColor}, ${bgDarker})`,
      },
    }, ...children)

    // og_edge returns PNG with Content-Type: image/png
    return new ImageResponse(element, {
      width: 1032,
      height: 336,
    })
  } catch (e) {
    console.error('Error generating strip image:', e)
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

// Adjust hex color brightness
function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.max(0, (num >> 16) + amount))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount))
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}
