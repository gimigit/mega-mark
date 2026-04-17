import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's subscription to retrieve Stripe customer ID
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id')
      .eq('profile_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!subscription || !subscription.stripe_subscription_id) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 })
    }

    // Retrieve the subscription from Stripe to get the customer ID
    const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id)
    const customerId = stripeSubscription.customer as string

    if (!customerId) {
      return NextResponse.json({ error: 'No Stripe customer associated' }, { status: 404 })
    }

    // Create a Customer Portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
    })

    // Redirect to Stripe portal
    return NextResponse.redirect(portalSession.url)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create portal session' }, { status: 500 })
  }
}