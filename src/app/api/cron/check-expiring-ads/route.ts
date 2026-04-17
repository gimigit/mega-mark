import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendAdExpiringEmail } from '@/lib/email'

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
    const now = new Date()
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
    const eightDaysFromNow = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString()

    const { data: expiringListings, error: findError } = await supabase
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
      .gte('expires_at', sevenDaysFromNow)
      .lt('expires_at', eightDaysFromNow)
      .not('expires_at', 'is', null)

    if (findError) {
      return NextResponse.json({ error: 'Failed to find expiring listings' }, { status: 500 })
    }

    let emailsSent = 0
    let emailsFailed = 0

    for (const listing of (expiringListings as unknown as ListingWithSeller[]) || []) {
      const userEmail = listing.profiles?.email
      const userName = listing.profiles?.full_name || 'Vânzător'

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
        } catch {
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
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  return GET(req)
}
