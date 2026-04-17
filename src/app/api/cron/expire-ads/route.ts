import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendAdExpiredEmail } from '@/lib/email'

const CRON_SECRET = process.env.CRON_SECRET || ''

export const dynamic = 'force-dynamic'

type ListingWithSeller = {
  id: string
  title: string
  slug: string | null
  expires_at: string
  profiles: { id: string; email: string; full_name: string | null } | null
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (CRON_SECRET && secret !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = await createClient()
    const now = new Date().toISOString()

    const { data: expiredListings, error: findError } = await supabase
      .from('listings')
      .select(`
        id,
        title,
        slug,
        expires_at,
        profiles:seller_id (
          id,
          email,
          full_name
        )
      `)
      .eq('status', 'active')
      .lt('expires_at', now)
      .not('expires_at', 'is', null)

    if (findError) {
      return NextResponse.json({ error: 'Failed to find expired listings' }, { status: 500 })
    }

    let listingsExpired = 0
    let emailsSent = 0
    let emailsFailed = 0

    for (const listing of (expiredListings as unknown as ListingWithSeller[]) || []) {
      const { error: updateError } = await supabase
        .from('listings')
        .update({ status: 'expired', updated_at: now })
        .eq('id', listing.id)
        .eq('status', 'active')

      if (updateError) continue

      listingsExpired++

      const userEmail = listing.profiles?.email
      const userName = listing.profiles?.full_name || 'Vânzător'

      if (userEmail && process.env.RESEND_API_KEY) {
        try {
          await sendAdExpiredEmail({
            to: userEmail,
            userName,
            listingTitle: listing.title,
            listingId: listing.id,
            listingSlug: listing.slug ?? undefined
          })
          emailsSent++
        } catch {
          emailsFailed++
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${expiredListings?.length || 0} expired listings`,
      listingsExpired,
      emailsSent,
      emailsFailed
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  return GET(req)
}
