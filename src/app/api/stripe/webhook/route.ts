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
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  const supabase = await createClient()

  try {
    switch (event.type) {
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
        console.log(`Unhandled Stripe event type: ${event.type}`)
    }
  } catch (error) {
    console.error('Error processing webhook:', error)
    // Still return 200 to avoid Stripe retrying, but log error
  }

  return NextResponse.json({ received: true })
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session, supabase: any) {
  if (session.mode === 'subscription' && session.subscription) {
    // Fetch full subscription object
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

    // Determine plan_type from metadata
    const planType = session.metadata?.plan_type
    if (!planType) {
      console.error('Subscription checkout missing plan_type in metadata')
      return
    }

    // Insert or update subscription
    const { error } = await supabase.from('subscriptions').upsert({
      stripe_subscription_id: subscription.id,
      profile_id: session.metadata?.profile_id,
      plan_type: planType,
      status: subscription.status,
      current_period_start: subscription.current_period_start ? new Date(subscription.current_period_start).toISOString() : null,
      current_period_end: subscription.current_period_end ? new Date(subscription.current_period_end).toISOString() : null,
      cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at).toISOString() : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at).toISOString() : null,
      created_at: new Date().toISOString(),
    }, {
      onConflict: 'stripe_subscription_id',
    })

    if (error) {
      console.error('Failed to upsert subscription:', error.message)
    } else {
      console.log(`Subscription ${subscription.id} saved for profile ${session.metadata?.profile_id}`)
    }
  } else if (session.mode === 'payment') {
    // Handle one-time boost payment
    const listingId = session.metadata?.listing_id
    const boostType = session.metadata?.boost_type
    const profileId = session.metadata?.profile_id
    const quantity = parseInt(session.quantity?.toString() || '1', 10)

    if (!listingId || !boostType || !profileId) {
      console.error('Boost checkout missing metadata (listing_id, boost_type, profile_id)')
      return
    }

    // Determine expiration based on boost type
    const now = new Date()
    let expiresAt = new Date()
    switch (boostType) {
      case 'featured_7d':
        expiresAt.setDate(now.getDate() + 7)
        break
      case 'featured_14d':
      case 'top_position':
        expiresAt.setDate(now.getDate() + 14)
        break
      default:
        expiresAt.setDate(now.getDate() + 7) // fallback
    }

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
      console.error('Failed to create listing_boost:', error.message)
    } else {
      console.log(`Listing boost created for listing ${listingId}, type ${boostType}`)
    }
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription, supabase: any) {
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_start: subscription.current_period_start ? new Date(subscription.current_period_start).toISOString() : null,
      current_period_end: subscription.current_period_end ? new Date(subscription.current_period_end).toISOString() : null,
      cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at).toISOString() : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at).toISOString() : null,
    })
    .eq('stripe_subscription_id', subscription.id)

  if (error) {
    console.error('Failed to update subscription:', error.message)
  } else {
    console.log(`Subscription ${subscription.id} updated to status ${subscription.status}`)
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
    console.error('Failed to delete subscription:', error.message)
  } else {
    console.log(`Subscription ${subscription.id} marked as cancelled`)
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice, supabase: any) {
  // If the invoice is for a subscription, the subscription status will be updated via separate event
  // But we can log or send notification
  console.log(`Invoice ${invoice.id} payment failed for subscription ${invoice.subscription}`)
  // Could send email notification to user about failed payment
}