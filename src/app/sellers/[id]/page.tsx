import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import SellerProfileClient from './SellerProfileClient'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()

  const { data: seller } = await supabase
    .from('profiles')
    .select('full_name, bio, rating_avg, location_country')
    .eq('id', id)
    .single()

  if (!seller) {
    return {
      title: 'Vânzător negăsit | AgroMark EU',
    }
  }

  const name = seller.full_name || 'Vânzător'
  const description = seller.bio
    ? seller.bio.slice(0, 160)
    : `Vezi profilul vânzătorului ${name} pe AgroMark EU. Rating: ${seller.rating_avg?.toFixed(1) || 'N/A'} din ${seller.location_country || 'UE'}.`

  return {
    title: `${name} — Vânzător | AgroMark EU`,
    description,
  }
}

export default function SellerProfilePage() {
  return <SellerProfileClient />
}
