import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/favorites - Get user's favorites
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: favorites, error } = await supabase
      .from('favorites')
      .select(`
        id,
        created_at,
        listing:listings(
          id,
          title,
          price,
          currency,
          images,
          location_city,
          location_country,
          condition,
          categories(name)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 })
    }

    return NextResponse.json({ favorites: favorites || [] })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/favorites - Add a favorite
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { listing_id } = body

    if (!listing_id) {
      return NextResponse.json({ error: 'Missing listing_id' }, { status: 400 })
    }

    // Check if listing exists
    const { data: listing } = await supabase
      .from('listings')
      .select('id')
      .eq('id', listing_id)
      .single()

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    // Check if already favorited
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('listing_id', listing_id)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Already favorited', alreadyFavorited: true }, { status: 409 })
    }

    const { data: favorite, error } = await supabase
      .from('favorites')
      .insert({
        user_id: user.id,
        listing_id,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ favorite, message: 'Added to favorites' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/favorites - Remove a favorite
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const listing_id = searchParams.get('listing_id')

    if (!listing_id) {
      return NextResponse.json({ error: 'Missing listing_id parameter' }, { status: 400 })
    }

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('listing_id', listing_id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Removed from favorites' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}