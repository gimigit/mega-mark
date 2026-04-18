import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://mega-mark-five.vercel.app'

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

    const [{ data: listings }, { data: categories }] = await Promise.all([
      supabase.from('listings').select('id, updated_at').eq('status', 'active').limit(5000),
      supabase.from('categories').select('slug').eq('is_active', true),
    ])

    const listingRoutes: MetadataRoute.Sitemap = (listings ?? []).map((listing) => ({
      url: `${BASE_URL}/listings/${listing.id}`,
      lastModified: new Date(listing.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    const categoryRoutes: MetadataRoute.Sitemap = (categories ?? []).map((cat) => ({
      url: `${BASE_URL}/browse/${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.85,
    }))

    // category × manufacturer combinations with active listings
    const { data: combos } = await supabase
      .from('listings')
      .select('categories!inner(slug), manufacturers!inner(slug)')
      .eq('status', 'active')
      .not('manufacturer_id', 'is', null)

    const comboSet = new Set<string>()
    for (const row of (combos ?? [])) {
      const r = row as unknown as { categories: { slug: string }; manufacturers: { slug: string } }
      if (r.categories?.slug && r.manufacturers?.slug) {
        comboSet.add(`${r.categories.slug}/${r.manufacturers.slug}`)
      }
    }

    const comboRoutes: MetadataRoute.Sitemap = Array.from(comboSet).map((combo) => ({
      url: `${BASE_URL}/browse/${combo}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.75,
    }))

    return [...staticRoutes, ...categoryRoutes, ...comboRoutes, ...listingRoutes]
  } catch {
    // Return static routes on error
  }

  return staticRoutes
}
