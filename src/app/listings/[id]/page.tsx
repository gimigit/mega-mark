import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ListingDetailClient from './ListingDetailClient'

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()

  const { data: listing } = await supabase
    .from('listings')
    .select('title, description, price, currency, year, location_country, condition, images, categories(name), profiles(full_name)')
    .eq('id', id)
    .single()

  if (!listing) {
    return {
      title: 'Anunț negăsit | AgroMark EU',
    }
  }

  const images = listing.images as string[] | null
  const description = listing.description
    ? listing.description.slice(0, 160)
    : `Vezi detalii pentru ${listing.title} — ${listing.categories?.name || 'Agricultural'} în ${listing.location_country || 'UE'}`

  const keywords = [
    listing.categories?.name,
    listing.title,
    'agricultural equipment',
    'tractors',
    listing.location_country,
    'for sale',
    listing.condition === 'new' ? 'nou' : listing.condition === 'used' ? 'folosit' : 'refurbished',
  ].filter(Boolean)

  return {
    title: `${listing.title} | AgroMark EU`,
    description,
    keywords: keywords as string[],
    openGraph: {
      title: `${listing.title} — €${listing.price.toLocaleString()}`,
      description,
      type: 'website',
      ...(images && images.length > 0 && { images: [{ url: images[0], width: 1200, height: 630, alt: listing.title }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${listing.title} | AgroMark EU`,
      description,
      ...(images && images.length > 0 && { images: [images[0]] }),
    },
    alternates: {
      canonical: `/listings/${id}`,
    },
  }
}

export default async function ListingDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  // Increment view count asynchronously (fire and forget)
  try {
    await supabase.rpc('increment_view_count', { listing_id: id })
  } catch (e) {
    // Ignore errors - view count increment should not break the page
    console.error('Failed to increment view count:', e)
  }

  return <ListingDetailClient listingId={id} />
}
