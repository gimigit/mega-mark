import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendSavedSearchMatchEmail } from '@/lib/email'

// Cron job to check for new listings matching saved searches
// Run this every hour or so
// URL: /api/cron/check-saved-searches?secret=YOUR_CRON_SECRET

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
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString()

    // Get all active saved searches with notifications enabled
    const { data: savedSearches, error: searchError } = await supabase
      .from('saved_searches')
      .select(`
        id,
        user_id,
        name,
        keyword,
        category_id,
        country,
        condition,
        price_min,
        price_max,
        year_min,
        year_max,
        manufacturer_id,
        listing_type,
        notify_email,
        last_notified_at,
        profiles:user_id (
          id,
          email,
          full_name
        )
      `)
      .eq('notify_email', true)
      .or('last_notified_at.is.null,last_notified_at.lt.' + oneHourAgo)

    if (searchError) {
      console.error('Error fetching saved searches:', searchError)
      return NextResponse.json({ error: 'Failed to fetch saved searches' }, { status: 500 })
    }

    if (!savedSearches || savedSearches.length === 0) {
      return NextResponse.json({ message: 'No saved searches to process', processed: 0 })
    }

    let emailsSent = 0
    let emailsFailed = 0

    for (const search of savedSearches) {
      const userEmail = (search.profiles as any)?.email
      const userName = (search.profiles as any)?.full_name || 'Utilizator'

      if (!userEmail) {
        console.log(`Skipping search ${search.id}: no user email`)
        continue
      }

      // Build query for new listings matching this saved search
      let query = supabase
        .from('listings')
        .select(`
          id,
          title,
          slug,
          price,
          currency,
          location_city,
          location_region,
          location_country,
          created_at
        `)
        .eq('status', 'active')
        .gte('created_at', oneHourAgo)

      // Apply saved search filters
      if (search.keyword) {
        query = query.or(`title.ilike.%${search.keyword}%,description.ilike.%${search.keyword}%`)
      }
      if (search.category_id) {
        query = query.eq('category_id', search.category_id)
      }
      if (search.country) {
        query = query.eq('location_country', search.country)
      }
      if (search.condition) {
        query = query.eq('condition', search.condition)
      }
      if (search.price_min) {
        query = query.gte('price', search.price_min)
      }
      if (search.price_max) {
        query = query.lte('price', search.price_max)
      }
      if (search.year_min) {
        query = query.gte('year', search.year_min)
      }
      if (search.year_max) {
        query = query.lte('year', search.year_max)
      }
      if (search.manufacturer_id) {
        query = query.eq('manufacturer_id', search.manufacturer_id)
      }
      if (search.listing_type) {
        query = query.eq('listing_type', search.listing_type)
      }

      // Get only the most recent matching listing (to avoid spamming)
      query = query.order('created_at', { ascending: false }).limit(1)

      const { data: matchingListings, error: listingError } = await query

      if (listingError) {
        console.error(`Error finding listings for search ${search.id}:`, listingError)
        continue
      }

      if (!matchingListings || matchingListings.length === 0) {
        // Update last_notified_at even if no matches to avoid re-checking too soon
        await supabase
          .from('saved_searches')
          .update({ last_notified_at: now.toISOString() })
          .eq('id', search.id)
        continue
      }

      const listing = matchingListings[0]

      // Send email notification
      if (process.env.RESEND_API_KEY) {
        try {
          const location = [listing.location_city, listing.location_region].filter(Boolean).join(', ')

          await sendSavedSearchMatchEmail({
            to: userEmail,
            searchName: search.name || search.keyword || 'Căutarea ta',
            listingTitle: listing.title,
            listingPrice: listing.price,
            listingCurrency: listing.currency,
            listingLocation: location || undefined,
            listingId: listing.id,
            listingSlug: listing.slug || undefined,
          })

          // Update last_notified_at
          await supabase
            .from('saved_searches')
            .update({ last_notified_at: now.toISOString() })
            .eq('id', search.id)

          emailsSent++
          console.log(`Sent saved search notification for search "${search.name}" to ${userEmail}`)
        } catch (emailError) {
          console.error(`Failed to send email for search ${search.id}:`, emailError)
          emailsFailed++
        }
      }
    }

    return NextResponse.json({
      message: 'Saved search check completed',
      processed: savedSearches.length,
      emailsSent,
      emailsFailed,
    })
  } catch (error) {
    console.error('Error in check-saved-searches cron:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}