import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/listings - Get listings with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const offset = (page - 1) * limit

    const categoryId = searchParams.get('category_id')
    const county = searchParams.get('county')
    const minPrice = searchParams.get('min_price')
    const maxPrice = searchParams.get('max_price')
    const condition = searchParams.get('condition')
    const status = searchParams.get('status') || 'active'
    const sortBy = searchParams.get('sort') || 'created_desc'
    const search = searchParams.get('search')

    const supabase = await createClient()

    // Build query
    let query = supabase
      .from('listings')
      .select(`
        *,
        seller:profiles(id, full_name, avatar_url, verified, avg_rating, reviews_count),
        category:categories(id, name, slug),
        manufacturer:manufacturers(id, name),
        photos:listing_photos(id, url, position)
      `)
      .eq('status', status)

    // Apply filters
    if (categoryId) query = query.eq('category_id', categoryId)
    if (county) query = query.eq('location_region', county)
    if (minPrice) query = query.gte('price', parseFloat(minPrice))
    if (maxPrice) query = query.lte('price', parseFloat(maxPrice))
    if (condition) query = query.eq('condition', condition)
    if (search) query = query.ilike('title', `%${search}%`)

    // Sorting
    switch (sortBy) {
      case 'price_asc':
        query = query.order('price', { ascending: true, nullsFirst: false })
        break
      case 'price_desc':
        query = query.order('price', { ascending: false, nullsFirst: false })
        break
      case 'oldest':
        query = query.order('created_at', { ascending: true })
        break
      case 'popular':
        query = query.order('views_count', { ascending: false })
        break
      default:
        query = query.order('created_at', { ascending: false })
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: listings, error } = await query

    if (error) {
      console.error('Error fetching listings:', error)
      return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 })
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('status', status)

    if (categoryId) countQuery = countQuery.eq('category_id', categoryId)
    if (county) countQuery = countQuery.eq('location_region', county)
    if (minPrice) countQuery = countQuery.gte('price', parseFloat(minPrice))
    if (maxPrice) countQuery = countQuery.lte('price', parseFloat(maxPrice))
    if (condition) countQuery = countQuery.eq('condition', condition)

    const { count } = await countQuery

    return NextResponse.json({
      listings: listings || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Listings GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/listings - Create a new listing
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const body = await request.json()
    const {
      title,
      description,
      category_id,
      manufacturer_id,
      listing_type = 'sale',
      price,
      price_type = 'fixed',
      currency = 'EUR',
      year,
      hours,
      power_hp,
      condition = 'used',
      location_country = 'Romania',
      location_region,
      location_city,
      images = [],
      specs = {},
    } = body

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 })
    }

    const { data: listing, error } = await supabase
      .from('listings')
      .insert({
        seller_id: user.id,
        category_id: category_id || null,
        manufacturer_id: manufacturer_id || null,
        title,
        description,
        listing_type,
        price: price || null,
        price_type,
        currency,
        year: year || null,
        hours: hours || null,
        power_hp: power_hp || null,
        condition,
        location_country,
        location_region: location_region || null,
        location_city: location_city || null,
        images,
        specs,
        status: 'active',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating listing:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ listing }, { status: 201 })
  } catch (error) {
    console.error('Listings POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}