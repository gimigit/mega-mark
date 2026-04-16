'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import ListingCard from '@/components/ListingCard'
import type { Database } from '@/types/database'

type Listing = Database['public']['Tables']['listings']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row']
  categories: Database['public']['Tables']['categories']['Row']
}

export default function FavoritesPage() {
  const router = useRouter()
  const { user, isLoading } = useSupabase()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) router.push('/login')
  }, [user, isLoading, router])

  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    supabase
      .from('favorites')
      .select('listing_id, listings(*, profiles(full_name, avatar_url, rating_avg, rating_count, is_verified), categories(name, slug, icon))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const favListings = (data ?? []).map((f: any) => f.listings).filter(Boolean)
        setListings(favListings as Listing[])
        setLoading(false)
      })
  }, [user])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Heart className="size-6 text-red-500 fill-red-500" />
          <h1 className="text-2xl font-bold text-foreground font-display">Anunțuri favorite</h1>
          {!loading && <span className="text-sm text-muted-foreground">({listings.length})</span>}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="size-8 border-2 border-green-700 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-16 bg-surface border border-border rounded-2xl">
            <Heart className="size-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">Nu ai niciun anunț salvat la favorite.</p>
            <Link href="/browse" className="inline-block px-5 py-2.5 bg-green-700 text-white rounded-xl font-semibold text-sm hover:bg-green-800 transition-colors">
              Cauta anunturi
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {listings.map(listing => (
              <ListingCard key={listing.id} listing={listing} isFavorite={true} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
