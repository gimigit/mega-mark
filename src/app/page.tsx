import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ListingCard from '@/components/ListingCard'
import { createClient } from '@/lib/supabase/server'
import { Search, ArrowRight, Shield, Globe, Zap, ChevronRight } from 'lucide-react'
import type { Database } from '@/types/database'

type Listing = Database['public']['Tables']['listings']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row']
  categories: Database['public']['Tables']['categories']['Row']
}

export const dynamic = 'force-dynamic'

async function getFeaturedListings() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('listings')
    .select('*, profiles(full_name, avatar_url, rating_avg, is_verified), categories(name, icon)')
    .eq('status', 'active')
    .eq('is_featured', true)
    .order('views_count', { ascending: false })
    .limit(6)
  return (data as Listing[]) || []
}

async function getCategoriesWithCount() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('id, name, slug, icon, is_active, listings(count)')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  return (data || []).map((cat: any) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    icon: cat.icon || '',
    count: cat.listings?.[0]?.count || 0,
  }))
}

async function getStats() {
  const supabase = await createClient()
  const [listingsCount, usersCount] = await Promise.all([
    supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
  ])
  return {
    listings: listingsCount.count || 0,
    users: usersCount.count || 0,
  }
}

export default async function HomePage() {
  const [featuredListings, categories, stats] = await Promise.all([
    getFeaturedListings(),
    getCategoriesWithCount(),
    getStats(),
  ])

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-green-900 via-green-800 to-green-950 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
          <p className="text-green-300 text-sm font-semibold tracking-wide uppercase mb-3">
            Marketplace agricol Romania & UE
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-4">
            Cumpara si vinde<br />
            <span className="text-amber-400">utilaje agricole</span>
          </h1>
          <p className="text-lg text-white/70 max-w-xl mb-8 leading-relaxed">
            Tractoare, combine, recoltatoare si echipamente agricole
            de la vanzatori verificati din toata Europa.
          </p>

          {/* Search — functional */}
          <form action="/browse" method="GET" className="max-w-2xl">
            <div className="flex">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                <input
                  type="text"
                  name="keyword"
                  placeholder="Cauta: John Deere 6330, tractor 150 CP..."
                  className="w-full h-14 pl-12 pr-4 rounded-l-xl border-0 text-gray-900 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <button
                type="submit"
                className="h-14 px-8 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-r-xl transition-colors flex items-center gap-2"
              >
                Cauta
                <ArrowRight className="size-4" />
              </button>
            </div>
          </form>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-6 mt-8 text-sm text-white/60">
            <span className="flex items-center gap-2">
              <Shield className="size-4" />
              Vanzatori verificati
            </span>
            <span className="flex items-center gap-2">
              <Globe className="size-4" />
              16 tari UE
            </span>
            <span className="flex items-center gap-2">
              <Zap className="size-4" />
              Publicare gratuita
            </span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-surface">
        <div className="max-w-7xl mx-auto grid grid-cols-3 divide-x divide-border">
          {[
            { value: stats.listings > 0 ? `${stats.listings.toLocaleString()}+` : '0', label: 'Anunturi active' },
            { value: '16', label: 'Tari UE' },
            { value: stats.users > 0 ? `${stats.users.toLocaleString()}+` : '0', label: 'Utilizatori' },
          ].map(stat => (
            <div key={stat.label} className="px-6 py-5 text-center">
              <div className="text-2xl font-extrabold text-green-700 dark:text-green-400">{stat.value}</div>
              <div className="text-xs text-muted-foreground font-medium mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-14 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Categorii</h2>
              <p className="text-muted-foreground text-sm mt-1">Gaseste exact ce ai nevoie</p>
            </div>
            <Link href="/browse" className="text-sm font-semibold text-green-700 dark:text-green-400 hover:underline flex items-center gap-1">
              Toate categoriile <ChevronRight className="size-4" />
            </Link>
          </div>
          {categories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  href={`/browse?category=${cat.id}`}
                  className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-surface hover:border-green-400 hover:shadow-md transition-all"
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-sm font-semibold text-foreground group-hover:text-green-700 dark:group-hover:text-green-400 text-center leading-tight">
                    {cat.name}
                  </span>
                  <span className="text-xs text-muted-foreground">{cat.count} anunturi</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nu sunt categorii disponibile.</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-14 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Anunturi recomandate</h2>
              <p className="text-muted-foreground text-sm mt-1">Selectate de echipa noastra</p>
            </div>
            <Link href="/browse" className="text-sm font-semibold text-green-700 dark:text-green-400 hover:underline flex items-center gap-1">
              Vezi toate <ChevronRight className="size-4" />
            </Link>
          </div>

          {featuredListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredListings.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-surface rounded-xl border border-border">
              <div className="size-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                <Search className="size-7 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Nu sunt anunturi inca</h3>
              <p className="text-muted-foreground mb-6 text-sm">Fii primul care publica un anunt!</p>
              <Link
                href="/listings/create"
                className="inline-flex items-center gap-2 bg-green-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-800 transition-colors"
              >
                Publica anunt
                <ArrowRight className="size-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 px-6 bg-background">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-foreground mb-3">Vrei sa vinzi un utilaj?</h2>
          <p className="text-muted-foreground mb-6">
            Publicare gratuita, mii de cumparatori potentiali din toata Europa.
            Listeaza tractorul, combina sau echipamentul tau in cateva minute.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/listings/create"
              className="inline-flex items-center justify-center gap-2 bg-green-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-800 transition-colors"
            >
              Publica anunt gratuit
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/browse"
              className="inline-flex items-center justify-center gap-2 border border-border text-foreground px-6 py-3 rounded-lg font-semibold hover:bg-muted transition-colors"
            >
              Exploreaza anunturi
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
