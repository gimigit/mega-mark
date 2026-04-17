import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  const supabase = await createClient()

  try {
    switch (event.type as string) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session, supabase)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, supabase)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, supabase)
        break

      case 'invoice.payment.failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice, supabase)
        break

      default:
    }
  } catch (error) {
    // Still return 200 to avoid Stripe retrying, but log error
  }

  return NextResponse.json({ received: true })
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session, supabase: any) {
  if (session.mode === 'subscription' && session.subscription) {
    // Fetch full subscription object
    const subscriptionResponse = await stripe.subscriptions.retrieve(session.subscription as string, {
      expand: ['items']
    }) as any
    const subscription = subscriptionResponse

    // Determine plan_type from metadata
    const planType = session.metadata?.plan_type
    if (!planType) {
      return
    }

    // Get billing period from subscription item (v22 API change)
    const subscriptionItem = subscription.items?.data?.[0]
    const currentPeriodStart = subscriptionItem?.current_period_start ?? subscriptionResponse.current_period_start ?? null
    const currentPeriodEnd = subscriptionItem?.current_period_end ?? subscriptionResponse.current_period_end ?? null

    // Insert or update subscription
    const { error } = await supabase.from('subscriptions').upsert({
      stripe_subscription_id: subscription.id,
      profile_id: session.metadata?.profile_id,
      plan_type: planType,
      status: subscription.status,
      current_period_start: currentPeriodStart ? new Date(currentPeriodStart * 1000).toISOString() : null,
      current_period_end: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null,
      cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at).toISOString() : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at).toISOString() : null,
      created_at: new Date().toISOString(),
    }, {
      onConflict: 'stripe_subscription_id',
    })

    if (error) {
    } else {
    }
  } else if (session.mode === 'payment') {
    // Handle one-time boost payment
    const listingId = session.metadata?.listing_id
    const boostType = session.metadata?.boost_type
    const profileId = session.metadata?.profile_id
    const quantity = parseInt((session as any).quantity?.toString() || '1', 10)

    if (!listingId || !boostType || !profileId) {
      return
    }

    // Determine expiration based on boost type
    const now = new Date()
    let expiresAt = new Date()
    switch (boostType) {
      case 'featured_7d':
        expiresAt.setDate(now.getDate() + 7)
        break
      case 'featured_30d':
        expiresAt.setDate(now.getDate() + 30)
        break
      case 'featured_14d':
      case 'top_position':
        expiresAt.setDate(now.getDate() + 14)
        break
      default:
        expiresAt.setDate(now.getDate() + 7)
    }

    // Update listing is_featured + featured_until
    await supabase.from('listings').update({
      is_featured: true,
      featured_until: expiresAt.toISOString(),
    }).eq('id', listingId)

    // Create listing_boost record
    const { error } = await supabase.from('listing_boosts').insert({
      listing_id: listingId,
      profile_id: profileId,
      boost_type: boostType,
      quantity: quantity,
      stripe_payment_intent_id: session.payment_intent as string,
      starts_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      status: 'active',
      created_at: now.toISOString(),
    })

    if (error) {
    } else {
    }
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription, supabase: any) {
  const sub = subscription as any
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: sub.status,
      current_period_start: sub.current_period_start ? new Date(sub.current_period_start).toISOString() : null,
      current_period_end: sub.current_period_end ? new Date(sub.current_period_end).toISOString() : null,
      cancel_at: sub.cancel_at ? new Date(sub.cancel_at).toISOString() : null,
      cancel_at_period_end: sub.cancel_at_period_end,
      canceled_at: sub.canceled_at ? new Date(sub.canceled_at).toISOString() : null,
    })
    .eq('stripe_subscription_id', sub.id)

  if (error) {
  } else {
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, supabase: any) {
  // Mark as cancelled
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'cancelled',
      canceled_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id)

  if (error) {
  } else {
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice, supabase: any) {
  // If the invoice is for a subscription, the subscription status will be updated via separate event
  // But we can log or send notification
  const inv = invoice as any
  // Could send email notification to user about failed payment
}