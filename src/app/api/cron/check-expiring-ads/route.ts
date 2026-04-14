import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-server'
import { sendAdExpiringEmail } from '@/lib/email'

// This endpoint should be called by a cron job (e.g., Vercel Cron, GitHub Actions, or external service)
// It sends email reminders for listings that are about to expire
//
// Example cron schedule: daily at 9:00 AM
// URL: /api/cron/check-expiring-ads?secret=YOUR_CRON_SECRET

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
    const now = new Date()
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
    const eightDaysFromNow = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString()

    // Find listings that expire in 7 days (between 7 and 8 days from now)
    const { data: expiringListings, error: findError } = await supabase
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
      .gte('expires_at', sevenDaysFromNow)
      .lt('expires_at', eightDaysFromNow)
      .not('expires_at', 'is', null)

    if (findError) {
      console.error('Error finding expiring listings:', findError)
      return NextResponse.json({ error: 'Failed to find expiring listings' }, { status: 500 })
    }

    let emailsSent = 0
    let emailsFailed = 0

    for (const listing of expiringListings || []) {
      const userEmail = (listing.profiles as any)?.email
      const userName = (listing.profiles as any)?.full_name || 'Vânzător'

      if (userEmail && process.env.RESEND_API_KEY) {
        try {
          await sendAdExpiringEmail({
            to: userEmail,
            userName,
            listingTitle: listing.title,
            listingId: listing.id,
            daysUntilExpiry: 7
          })
          emailsSent++
        } catch (err) {
          console.error(`Failed to send expiring email for listing ${listing.id}:`, err)
          emailsFailed++
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${expiringListings?.length || 0} expiring listings`,
      emailsSent,
      emailsFailed
    })
  } catch (error) {
    console.error('Error in check-expiring-ads cron:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Also support POST method
export async function POST(req: NextRequest) {
  return GET(req)
}
