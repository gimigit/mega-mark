import { createAdminClient } from '@/lib/supabase/admin'
import * as email from '@/lib/email'

// Lazy initialize admin client only when needed
let supabase: ReturnType<typeof createAdminClient> | null = null

function getSupabase() {
  if (!supabase) {
    supabase = createAdminClient()
  }
  return supabase
}

async function getUserEmail(userId: string): Promise<string | null> {
  const { data } = await getSupabase()
    .from('profiles')
    .select('email')
    .eq('id', userId)
    .single()

  return data?.email || null
}

export async function createNotification(userId: string, type: string, title: string, body: string | null = null, data: Record<string, unknown> = {}) {
  const { error } = await getSupabase()
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      title,
      body,
      data,
    })

  if (error) {
    console.error('Failed to create notification:', error)
  }

  return { error }
}

export async function notifyMessageReceived(userId: string, senderName: string, messagePreview: string, listingTitle?: string) {
  // Create in-app notification first
  await createNotification(
    userId,
    'new_message',
    `Mesaj nou de la ${senderName}`,
    messagePreview,
    { sender_name: senderName, preview: messagePreview, listing_title: listingTitle }
  )

  // Send email
  const userEmail = await getUserEmail(userId)
  if (userEmail) {
    await email.sendNewMessageEmail(userEmail, senderName, messagePreview, listingTitle)
  } else {
    console.warn(`Cannot send message email: no email for user ${userId}`)
  }
}

export async function notifyListingFavorited(listingId: string, sellerId: string, favoriterName: string) {
  await createNotification(
    sellerId,
    'listing_favorite',
    `${favoriterName} a adăugat anunțul tău la favorite`,
    `${favoriterName} a marcat unul dintre anunțurile ca favorit.`,
    { listing_id: listingId, favoriter_name: favoriterName }
  )
}

export async function notifyReviewReceived(userId: string, reviewerId: string, reviewerName: string, rating: number, listingTitle: string) {
  // Create in-app notification first
  await createNotification(
    userId,
    'review_received',
    `Ai primit o recenzie de la ${reviewerName}`,
    `Rating: ${rating} ⭐ pentru anunțul "${listingTitle}"`,
    { reviewer_id: reviewerId, reviewer_name: reviewerName, rating, listing_title: listingTitle }
  )

  // Send email
  const userEmail = await getUserEmail(userId)
  if (userEmail) {
    await email.sendNewReviewEmail(userEmail, reviewerName, rating, listingTitle)
  } else {
    console.warn(`Cannot send review email: no email for user ${userId}`)
  }
}

export async function notifyListingPublished(userId: string, listingTitle: string) {
  await createNotification(
    userId,
    'listing_approved',
    'Anunțul tău a fost publicat!',
    `Anunțul "${listingTitle}" este acum vizibil pe Mega-Mark.`,
    { listing_title: listingTitle }
  )

  // Send email
  const userEmail = await getUserEmail(userId)
  if (userEmail) {
    await email.sendListingPublishedEmail(userEmail, listingTitle)
  } else {
    console.warn(`Cannot send listing published email: no email for user ${userId}`)
  }
}

export async function notifyListingExpiring(userId: string, listingTitle: string, daysUntilExpiry: number) {
  await createNotification(
    userId,
    'listing_expired',
    `Anunțul "${listingTitle}" expiră în ${daysUntilExpiry} zile`,
    `Pornește o nouă listare sau prelungește actualul pentru a continua primirea de cereri.`,
    { listing_title: listingTitle, days_until_expiry: daysUntilExpiry }
  )

  // Send email
  const userEmail = await getUserEmail(userId)
  if (userEmail) {
    await email.sendListingExpiringEmail(userEmail, listingTitle, daysUntilExpiry)
  } else {
    console.warn(`Cannot send listing expiring email: no email for user ${userId}`)
  }
}
