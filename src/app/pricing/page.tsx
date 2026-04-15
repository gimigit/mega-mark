import type { Metadata } from 'next'
import PricingClient from './PricingClient'

export const metadata: Metadata = {
  title: 'Planuri și Prețuri | Mega-Mark',
  description: 'Explorează planurile de abonament și prețurile pentru Mega-Mark. Free, Seller, Dealer, Enterprise plus boosturi pentru anunțuri.',
}

export default function PricingPage() {
  return <PricingClient />
}