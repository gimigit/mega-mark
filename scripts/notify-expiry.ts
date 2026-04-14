import { createAdminClient } from '@/lib/supabase/admin'
import { notifyListingExpiring } from '@/lib/notifications'

async function runExpiryNotifications() {
  const supabase = createAdminClient()

  // Calculate date range for listings expiring in 3 days
  const now = new Date()
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
  const startOfDay = new Date(threeDaysFromNow.setHours(0, 0, 0, 0))
  const endOfDay = new Date(new Date(threeDaysFromNow).setHours(23, 59, 59, 999))

  console.log(`Checking for listings expiring between ${startOfDay.toISOString()} and ${endOfDay.toISOString()}`)

  const { data: listings, error } = await supabase
    .from('listings')
    .select('id, seller_id, title, expires_at')
    .eq('status', 'active')
    .gte('expires_at', startOfDay.toISOString())
    .lte('expires_at', endOfDay.toISOString())

  if (error) {
    console.error('Error fetching expiring listings:', error)
    process.exit(1)
  }

  if (!listings || listings.length === 0) {
    console.log('No listings expiring in 3 days.')
    return
  }

  console.log(`Found ${listings.length} listings expiring soon. Sending notifications...`)

  for (const listing of listings) {
    try {
      await notifyListingExpiring(listing.seller_id, listing.title, 3)
      console.log(`✅ Sent expiry notification for listing "${listing.title}" (${listing.id}) to seller ${listing.seller_id}`)
    } catch (err) {
      console.error(`❌ Failed to send expiry notification for listing ${listing.id}:`, err)
    }
  }

  console.log('Expiry notification job completed.')
}

runExpiryNotifications()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
