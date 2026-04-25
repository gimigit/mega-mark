'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2, RefreshCw } from 'lucide-react'
import { useBrowsingHistoryStore } from '@/store/useBrowsingHistoryStore'
import { createClient } from '@/lib/supabase/client'

type Listing = {
  id: string
  title: string
  price: number
  images: string[]
  category_slug: string
  manufacturer_slug: string
  model: string
  year: number
  hours: number
  location_region: string
}

interface RecommendationsProps {
  limit?: number
}

export default function Recommendations({ limit = 4 }: RecommendationsProps) {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { getMostViewedCategory, getMostFavoritedBrand } = useBrowsingHistoryStore()

  const fetchRecommendations = async () => {
    setLoading(true)
    setError(null)

    try {
      const supabase = await createClient()

      const category = getMostViewedCategory()
      const brand = getMostFavoritedBrand()

      let query = supabase
        .from('listings')
        .select('id, title, price, images, category_slug, manufacturer_slug, model, year, hours, location_region')
        .eq('status', 'active')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(20)

      if (category) {
        query = query.eq('category_slug', category)
      }
      if (brand) {
        query = query.eq('manufacturer_slug', brand)
      }

      const { data, error: queryError } = await query

      if (queryError) throw queryError

      // Shuffle and take limit
      const shuffled = (data || [])
        .sort(() => Math.random() - 0.5)
        .slice(0, limit)

      setListings(shuffled)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recommendations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecommendations()
  }, []) // Only fetch on mount - don't depend on store values to avoid infinite loops

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  if (listings.length === 0) {
    return null // Don't show if no recommendations
  }

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Recomandări pentru tine</h2>
        <button
          onClick={fetchRecommendations}
          className="p-2 hover:bg-muted rounded-full transition-colors"
          title="Recalculează"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {listings.map((listing) => (
          <Link
            key={listing.id}
            href={`/listings/${listing.id}`}
            className="group block bg-card rounded-lg overflow-hidden border hover:border-primary transition-colors"
          >
            <div className="aspect-[4/3] relative bg-muted overflow-hidden">
              {listing.images?.[0] ? (
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No image
                </div>
              )}
            </div>
            <div className="p-3">
              <h3 className="font-medium truncate text-sm">{listing.title}</h3>
              <p className="text-lg font-bold text-primary mt-1">
                {new Intl.NumberFormat('ro-RO', {
                  style: 'currency',
                  currency: 'EUR',
                  maximumFractionDigits: 0,
                }).format(listing.price)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {listing.year && `${listing.year} • `}
                {listing.hours && `${listing.hours.toLocaleString()} ore`}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}