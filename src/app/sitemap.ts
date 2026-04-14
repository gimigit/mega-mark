import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://agromark.eu'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/browse`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  try {
    const supabase = await createClient()

    const { data: listings } = await supabase
      .from('listings')
      .select('id, updated_at, status')
      .eq('status', 'active')
      .limit(5000)

    if (listings && listings.length > 0) {
      const listingRoutes: MetadataRoute.Sitemap = listings.map((listing) => ({
        url: `${BASE_URL}/listings/${listing.id}`,
        lastModified: new Date(listing.updated_at),
        changeFrequency: 'weekly' as const,
        priority: listing.status === 'active' ? 0.8 : 0.5,
      }))

      return [...staticRoutes, ...listingRoutes]
    }
  } catch (error) {
    console.error('Error fetching listings for sitemap:', error)
  }

  return staticRoutes
}
