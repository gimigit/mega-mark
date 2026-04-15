import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendAdExpiredEmail } from '@/lib/email'

// This endpoint should be called by a cron job (e.g., Vercel Cron)
// It marks ads as expired when their expiresAt date has passed
// and sends notification emails to users
//
// Example cron schedule: hourly
// URL: /api/cron/expire-ads?secret=YOUR_CRON_SECRET

const CRON_SECRET = process.env.CRON_SECRET || ''

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  // Verify cron secret if provided
  const secret = req.nextUrl.searchParams.get('secret')
  if (CRON_SECRET && secret !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = await createClient()
    const now = new Date().toISOString()

    // Find all active listings that have expired
    const { data: expiredListings, error: findError } = await supabase
      .from('listings')
      .select(`
        id,
        title,
        slug,
        expires_at,
        profiles:owner_id (
          id,
          email,
          full_name
        )
      `)
      .eq('status', 'active')
      .lt('expires_at', now)
      .not('expires_at', 'is', null)

    if (findError) {
      console.error('Error finding expired listings:', findError)
      return NextResponse.json({ error: 'Failed to find expired listings' }, { status: 500 })
    }

    let listingsExpired = 0
    let emailsSent = 0
    let emailsFailed = 0

    // Process each expired listing
    for (const listing of expiredListings || []) {
      try {
        // Update listing status to expired
        const { error: updateError } = await supabase
          .from('listings')
          .update({ status: 'expired', updated_at: now })
          .eq('id', listing.id)
          .eq('status', 'active') // optimistic lock

        if (updateError) {
          console.error(`Failed to expire listing ${listing.id}:`, updateError)
          continue
        }

        listingsExpired++

        // Send email notification to user
        const userEmail = (listing.profiles as any)?.email
        const userName = (listing.profiles as any)?.full_name || 'Vânzător'

        if (userEmail && process.env.RESEND_API_KEY) {
          try {
            await sendAdExpiredEmail({
              to: userEmail,
              userName,
              listingTitle: listing.title,
              listingId: listing.id,
              listingSlug: listing.slug
            })
            emailsSent++
          } catch (err) {
            console.error(`Failed to send expired email for listing ${listing.id}:`, err)
            emailsFailed++
          }
        }
      } catch (err) {
        console.error(`Failed to expire listing ${listing.id}:`, err)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${expiredListings?.length || 0} expired listings`,
      listingsExpired,
      emailsSent,
      emailsFailed
    })
  } catch (error) {
    console.error('Error in expire-ads cron:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Also support POST method
export async function POST(req: NextRequest) {
  return GET(req)
}
