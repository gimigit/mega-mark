import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/reviews - Get reviews for a seller
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reviewedId = searchParams.get('reviewed_id')
    const listingId = searchParams.get('listing_id')

    if (!reviewedId) {
      return NextResponse.json({ error: 'Missing reviewed_id parameter' }, { status: 400 })
    }

    const supabase = await createClient()
    
    let query = supabase
      .from('reviews')
      .select(`
        *,
        reviewer:profiles!reviews_reviewer_id_fkey(id, full_name, avatar_url)
      `)
      .eq('reviewed_id', reviewedId)
      .order('created_at', { ascending: false })

    if (listingId) {
      query = query.eq('listing_id', listingId)
    }

    const { data: reviews, error } = await query

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
    }

    // Get average rating
    const { data: avgData } = await supabase
      .from('reviews')
      .select('rating')
      .eq('reviewed_id', reviewedId)

    const avgRating = avgData?.length 
      ? avgData.reduce((sum, r) => sum + r.rating, 0) / avgData.length 
      : 0

    return NextResponse.json({ 
      reviews: reviews || [],
      avgRating: Math.round(avgRating * 10) / 10,
      count: reviews?.length || 0
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/reviews - Create a new review
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { reviewed_id, listing_id, rating, title, content } = body

    if (!reviewed_id || !rating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    // Can't review yourself
    if (reviewed_id === user.id) {
      return NextResponse.json({ error: 'Cannot review yourself' }, { status: 400 })
    }

    const { data: review, error } = await supabase
      .from('reviews')
      .insert({
        reviewer_id: user.id,
        reviewed_id,
        listing_id: listing_id || null,
        rating,
        title: title || null,
        content: content || null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update seller's avg_rating in profiles
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('reviewed_id', reviewed_id)

    if (reviews?.length) {
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      await supabase
        .from('profiles')
        .update({ 
          rating_avg: Math.round(avgRating * 10) / 10,
          rating_count: reviews.length
        })
        .eq('id', reviewed_id)
    }

    return NextResponse.json({ review })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}