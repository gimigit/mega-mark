import { ImageResponse } from 'next/og'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const alt = 'Mega-Mark listing'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: listing } = await supabase
    .from('listings')
    .select('title, price, currency, images, location_country')
    .eq('id', id)
    .single()

  const title = listing?.title ?? 'Anunt agricol'
  const price = listing?.price != null
    ? `${listing.currency === 'EUR' ? '€' : listing.currency}${listing.price.toLocaleString()}`
    : 'Preț la cerere'
  const images = listing?.images as string[] | null
  const imageUrl = images?.[0] ?? null
  const location = listing?.location_country ?? ''

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #14532d 0%, #166534 50%, #15803d 100%)',
          fontFamily: 'Georgia, serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Left content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '60px',
            flex: 1,
          }}
        >
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '28px', fontWeight: 900, color: '#ffffff' }}>Mega</span>
            <span style={{ fontSize: '28px', fontWeight: 900, color: '#fbbf24' }}>Mark</span>
          </div>

          {/* Title + price */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                fontSize: '48px',
                fontWeight: 700,
                color: '#ffffff',
                lineHeight: 1.2,
                maxWidth: '580px',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {title}
            </div>
            <div style={{ fontSize: '40px', fontWeight: 900, color: '#fbbf24' }}>
              {price}
            </div>
            {location && (
              <div style={{ fontSize: '20px', color: 'rgba(255,255,255,0.6)' }}>
                {location}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)' }}>
            mega-mark-five.vercel.app
          </div>
        </div>

        {/* Right image */}
        {imageUrl && (
          <div
            style={{
              width: '420px',
              height: '100%',
              position: 'relative',
              flexShrink: 0,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: 0.9,
              }}
            />
            {/* Gradient overlay on left edge of image */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to right, #14532d 0%, transparent 40%)',
              }}
            />
          </div>
        )}
      </div>
    ),
    { ...size }
  )
}
