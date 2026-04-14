import { NextRequest, NextResponse } from 'next/server'
import {
  sendWelcomeEmail,
  sendNewMessageEmail,
  sendListingPublishedEmail,
  sendListingExpiringEmail,
  sendNewReviewEmail,
  sendPasswordResetEmail,
} from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, ...data } = body

    if (!type) {
      return NextResponse.json(
        { error: 'Missing notification type' },
        { status: 400 }
      )
    }

    switch (type) {
      case 'welcome':
        if (!data.to || !data.name) {
          return NextResponse.json(
            { error: 'Missing required fields: to, name' },
            { status: 400 }
          )
        }
        await sendWelcomeEmail(data.to, data.name)
        break

      case 'new_message':
        if (!data.to || !data.senderName || !data.preview) {
          return NextResponse.json(
            { error: 'Missing required fields: to, senderName, preview' },
            { status: 400 }
          )
        }
        await sendNewMessageEmail(data.to, data.senderName, data.preview, data.listingTitle)
        break

      case 'listing_published':
        if (!data.to || !data.listingTitle) {
          return NextResponse.json(
            { error: 'Missing required fields: to, listingTitle' },
            { status: 400 }
          )
        }
        await sendListingPublishedEmail(data.to, data.listingTitle)
        break

      case 'listing_expiring':
        if (!data.to || !data.listingTitle || !data.daysUntilExpiry) {
          return NextResponse.json(
            { error: 'Missing required fields: to, listingTitle, daysUntilExpiry' },
            { status: 400 }
          )
        }
        await sendListingExpiringEmail(data.to, data.listingTitle, data.daysUntilExpiry)
        break

      case 'new_review':
        if (!data.to || !data.reviewerName || !data.rating || !data.listingTitle) {
          return NextResponse.json(
            { error: 'Missing required fields: to, reviewerName, rating, listingTitle' },
            { status: 400 }
          )
        }
        await sendNewReviewEmail(data.to, data.reviewerName, data.rating, data.listingTitle)
        break

      case 'password_reset':
        if (!data.to || !data.resetUrl) {
          return NextResponse.json(
            { error: 'Missing required fields: to, resetUrl' },
            { status: 400 }
          )
        }
        await sendPasswordResetEmail(data.to, data.resetUrl)
        break

      default:
        return NextResponse.json(
          { error: `Unknown notification type: ${type}` },
          { status: 400 }
        )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Email notification error:', error)
    return NextResponse.json(
      { error: 'Failed to send email notification' },
      { status: 500 }
    )
  }
}
