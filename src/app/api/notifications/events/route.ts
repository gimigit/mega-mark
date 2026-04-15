import { NextRequest, NextResponse } from 'next/server'
import {
  notifyMessageReceived,
  notifyListingFavorited,
  notifyReviewReceived,
  notifyListingPublished,
  notifyListingExpiring,
} from '@/lib/notifications'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { event, data } = body

    if (!event) {
      return NextResponse.json({ error: 'Missing event type' }, { status: 400 })
    }

    switch (event) {
      case 'message_received':
        if (!data?.userId || !data?.senderName || !data?.messagePreview) {
          return NextResponse.json(
            { error: 'Missing required fields: userId, senderName, messagePreview' },
            { status: 400 }
          )
        }
        await notifyMessageReceived(
          data.userId,
          data.senderName,
          data.messagePreview,
          data.listingTitle
        )
        break

      case 'listing_favorited':
        if (!data?.listingId || !data?.sellerId || !data?.favoriterName) {
          return NextResponse.json(
            { error: 'Missing required fields: listingId, sellerId, favoriterName' },
            { status: 400 }
          )
        }
        await notifyListingFavorited(data.listingId, data.sellerId, data.favoriterName)
        break

      case 'review_received':
        if (!data?.userId || !data?.reviewerId || !data?.reviewerName || !data?.rating || !data?.listingTitle) {
          return NextResponse.json(
            { error: 'Missing required fields: userId, reviewerId, reviewerName, rating, listingTitle' },
            { status: 400 }
          )
        }
        await notifyReviewReceived(data.userId, data.reviewerId, data.reviewerName, data.rating, data.listingTitle)
        break

      case 'listing_published':
        if (!data?.userId || !data?.listingTitle) {
          return NextResponse.json(
            { error: 'Missing required fields: userId, listingTitle' },
            { status: 400 }
          )
        }
        await notifyListingPublished(data.userId, data.listingTitle)
        break

      case 'listing_expiring':
        if (!data?.userId || !data?.listingTitle || !data?.daysUntilExpiry) {
          return NextResponse.json(
            { error: 'Missing required fields: userId, listingTitle, daysUntilExpiry' },
            { status: 400 }
          )
        }
        await notifyListingExpiring(data.userId, data.listingTitle, data.daysUntilExpiry)
        break

      default:
        return NextResponse.json({ error: `Unknown event: ${event}` }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Notification event error:', error)
    return NextResponse.json(
      { error: 'Failed to process notification event' },
      { status: 500 }
    )
  }
}
