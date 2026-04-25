import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { category, manufacturer, model, year, hours, condition } = body

    if (!category) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Build query for similar listings
    let query = supabase
      .from('listings')
      .select('price, year, hours, condition, status')
      .eq('status', 'active')
      .eq('category', category)
      .not('price', 'is', 'null')

    // Filter by manufacturer if provided
    if (manufacturer) {
      query = query.eq('manufacturer', manufacturer)
    }

    // Filter by model if provided
    if (model) {
      query = query.ilike('model', `%${model}%`)
    }

    // Filter by year ±5 if provided
    if (year) {
      const minYear = year - 5
      const maxYear = year + 5
      query = query.gte('year', minYear).lte('year', maxYear)
    }

    // Filter by hours ±2000 if provided
    if (hours) {
      const minHours = Math.max(0, hours - 2000)
      const maxHours = hours + 2000
      query = query.gte('hours', minHours).lte('hours', maxHours)
    }

    const { data: similarListings, error } = await query

    if (error) {
      console.error('Error fetching similar listings:', error)
      return NextResponse.json(
        { error: 'Failed to fetch similar listings' },
        { status: 500 }
      )
    }

    if (!similarListings || similarListings.length === 0) {
      return NextResponse.json({
        min: null,
        max: null,
        median: null,
        count: 0,
        message: 'No similar listings found for comparison'
      })
    }

    // Filter out异常值 (prices that are 0 or extremely low)
    const validPrices = similarListings
      .filter(l => l.price && l.price > 100)
      .map(l => l.price)

    if (validPrices.length === 0) {
      return NextResponse.json({
        min: null,
        max: null,
        median: null,
        count: 0,
        message: 'No valid price data found'
      })
    }

    // Sort prices for percentile calculation
    const sortedPrices = [...validPrices].sort((a, b) => a - b)

    // Calculate statistics
    const min = sortedPrices[0]
    const max = sortedPrices[sortedPrices.length - 1]
    const median = sortedPrices[Math.floor(sortedPrices.length / 2)]

    // Calculate quartiles for range
    const q1Index = Math.floor(sortedPrices.length * 0.25)
    const q3Index = Math.floor(sortedPrices.length * 0.75)
    const q1 = sortedPrices[q1Index]
    const q3 = sortedPrices[q3Index]

    // Return range as IQR-based bounds
    const recommendedMin = Math.round(q1)
    const recommendedMax = Math.round(q3)

    return NextResponse.json({
      min: recommendedMin,
      max: recommendedMax,
      median: Math.round(median),
      count: validPrices.length,
      lowest: min,
      highest: max
    })
  } catch (error) {
    console.error('Price estimation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}