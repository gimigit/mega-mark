import Stripe from 'stripe'

// Lazy initialization pattern — avoids "aruncă la import time" error when STRIPE_SECRET_KEY is not set
let _stripe: Stripe | null = null
export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is not set')
    }
    _stripe = new Stripe(key, {
      apiVersion: '2026-03-25.dahlia' as '2026-03-25.dahlia',
    })
  }
  return _stripe
}

// Proxy pattern for lazy initialization
export const stripe = new Proxy({} as Stripe, {
  get(_t, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop]
  }
})

// Price IDs for featured ads (in RON)
export const PROMOTION_PRICES = {
  '7': process.env.STRIPE_PRICE_7_DAYS || '',
  '30': process.env.STRIPE_PRICE_30_DAYS || '',
}

// Fallback: calculate amounts manually if environment variables not set
export const PROMOTION_AMOUNTS = {
  '7': 1500,  // 15 RON in cents
  '30': 4500, // 45 RON in cents
}