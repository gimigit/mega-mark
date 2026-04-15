import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { notifyListingExpiring } from '@/lib/notifications'

export async function POST(request: NextRequest) {
  // Simple auth: check for a secret token (set in env)
  const token = request.headers.get('x-vercel-protection')
  if (token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()

  const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
  const startOfDay = new Date(threeDaysFromNow.setHours(0, 0, 0, 0))
  const endOfDay = new Date(new Date(threeDaysFromNow).setHours(23, 59, 59, 999))

  const { data: listings, error } = await supabase
    .from('listings')
    .select('id, seller_id, title, expires_at')
    .eq('status', 'active')
    .gte('expires_at', startOfDay.toISOString())
    .lte('expires_at', endOfDay.toISOString())

  if (error) {
    console.error('Error fetching expiring listings:', error)
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 })
  }

  if (!listings || listings.length === 0) {
    return NextResponse.json({ message: 'No listings expiring soon.' })
  }

  let sentCount = 0
  for (const listing of listings) {
    try {
      await notifyListingExpiring(listing.seller_id, listing.title, 3)
      sentCount++
    } catch (err) {
      console.error(`Failed for listing ${listing.id}:`, err)
    }
  }

  return NextResponse.json({ message: `Sent ${sentCount} expiry notifications.` })
}
