import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const body = await request.json()
    const { itemType, planType, listingId, boostType, quantity = 1 } = body

    if (!itemType) {
      return NextResponse.json({ error: 'Missing itemType' }, { status: 400 })
    }

    // Build line items and metadata
    let lineItems: { price: string; quantity: number }[] = []
    let metadata: { profile_id: string; listing_id?: string; boost_type?: string; plan_type?: string } = {
      profile_id: profile.id,
    }

    if (itemType === 'subscription') {
      if (!planType) {
        return NextResponse.json({ error: 'Missing planType for subscription' }, { status: 400 })
      }

      // Map plan type to Stripe price ID from environment variables
      const priceIdMap: Record<string, string> = {
        seller: process.env.STRIPE_PRICE_SELLER!,
        dealer: process.env.STRIPE_PRICE_DEALER!,
        enterprise: process.env.STRIPE_PRICE_ENTERPRISE!,
      }
      const priceId = priceIdMap[planType]
      if (!priceId) {
        return NextResponse.json({ error: `Invalid planType: ${planType}` }, { status: 400 })
      }

      lineItems = [{ price: priceId, quantity: 1 }]
      metadata.plan_type = planType
    } else if (itemType === 'boost') {
      if (!listingId || !boostType) {
        return NextResponse.json({ error: 'Missing listingId or boostType for boost' }, { status: 400 })
      }

      // Map boost type to Stripe price ID
      const boostPriceIdMap: Record<string, string> = {
        featured_7d: process.env.STRIPE_PRICE_BOOST_FEATURED_7D!,
        featured_14d: process.env.STRIPE_PRICE_BOOST_FEATURED_14D!,
        top_position: process.env.STRIPE_PRICE_BOOST_TOP_POSITION!,
      }
      const priceId = boostPriceIdMap[boostType]
      if (!priceId) {
        return NextResponse.json({ error: `Invalid boostType: ${boostType}` }, { status: 400 })
      }

      lineItems = [{ price: priceId, quantity }]
      metadata.listing_id = listingId
      metadata.boost_type = boostType
    } else {
      return NextResponse.json({ error: `Invalid itemType: ${itemType}` }, { status: 400 })
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: itemType === 'subscription' ? ['card'] : ['card'],
      mode: itemType === 'subscription' ? 'subscription' : 'payment',
      line_items: lineItems,
      customer_email: user.email,
      metadata,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}