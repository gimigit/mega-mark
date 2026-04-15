import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ListingCard from '@/components/ListingCard'
import { createClient } from '@/lib/supabase/server'
import {
  Search, ArrowRight, Shield, Globe, Zap, ChevronRight,
  Camera, MessageSquare, Handshake, TrendingUp, Users, MapPin,
} from 'lucide-react'
import { getCategoryIcon, EU_COUNTRIES } from '@/lib/categories'
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
    .select('*, profiles(full_name, avatar_url, rating_avg, rating_count, is_verified), categories(name, slug, icon)')
    .eq('status', 'active')
    .eq('is_featured', true)
    .order('views_count', { ascending: false })
    .limit(6)
  return (data as Listing[]) || []
}

async function getRecentListings() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('listings')
    .select('*, profiles(full_name, avatar_url, rating_avg, rating_count, is_verified), categories(name, slug, icon)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
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
    slug: cat.slug || '',
    icon: cat.icon || '',
    count: cat.listings?.[0]?.count || 0,
  }))
}

async function getManufacturers() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('manufacturers')
    .select('id, name, slug, logo_url')
    .eq('is_active', true)
    .order('name', { ascending: true })
  return data || []
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
  const [featuredListings, recentListings, categories, manufacturers, stats] = await Promise.all([
    getFeaturedListings(),
    getRecentListings(),
    getCategoriesWithCount(),
    getManufacturers(),
    getStats(),
  ])

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-green-900 via-green-800 to-green-950 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        <div className="relative max-w-7xl mx-auto px-6 py-16 lg:py-24">
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

          {/* Search */}
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

          {/* Quick category links under search */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-5">
              {categories.slice(0, 6).map(cat => (
                <Link
                  key={cat.id}
                  href={`/browse?category=${cat.id}`}
                  className="px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-medium hover:bg-white/20 hover:text-white transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}

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
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 divide-x divide-border">
          {[
            { value: stats.listings > 0 ? `${stats.listings.toLocaleString()}+` : '0', label: 'Anunturi active', icon: TrendingUp },
            { value: String(categories.length), label: 'Categorii', icon: Search },
            { value: '16', label: 'Tari UE', icon: Globe },
            { value: stats.users > 0 ? `${stats.users.toLocaleString()}+` : '0', label: 'Utilizatori', icon: Users },
          ].map(stat => (
            <div key={stat.label} className="px-6 py-5 text-center">
              <stat.icon className="size-4 text-green-600 dark:text-green-400 mx-auto mb-1" />
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
              <h2 className="text-2xl font-bold text-foreground">Categorii echipamente</h2>
              <p className="text-muted-foreground text-sm mt-1">Gaseste exact ce ai nevoie</p>
            </div>
            <Link href="/browse" className="text-sm font-semibold text-green-700 dark:text-green-400 hover:underline flex items-center gap-1">
              Toate categoriile <ChevronRight className="size-4" />
            </Link>
          </div>
          {categories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
              {categories.map(cat => {
                const IconComponent = getCategoryIcon(cat.slug)
                return (
                  <Link
                    key={cat.id}
                    href={`/browse?category=${cat.id}`}
                    className="group flex items-center gap-4 p-5 rounded-xl border border-border bg-surface hover:border-green-400 hover:shadow-md transition-all"
                  >
                    <div className="shrink-0 size-12 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center group-hover:bg-green-100 dark:group-hover:bg-green-900/40 transition-colors">
                      <IconComponent className="size-6 text-green-700 dark:text-green-400" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-sm font-bold text-foreground group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">
                        {cat.name}
                      </span>
                      <span className="block text-xs text-muted-foreground mt-0.5">
                        {cat.count} {cat.count === 1 ? 'anunt' : 'anunturi'}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nu sunt categorii disponibile.</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Listings */}
      {featuredListings.length > 0 && (
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredListings.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Popular Brands */}
      {manufacturers.length > 0 && (
        <section className="py-14 px-6 bg-background">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Branduri populare</h2>
                <p className="text-muted-foreground text-sm mt-1">Cauta dupa producator</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {manufacturers.map(mfr => (
                <Link
                  key={mfr.id}
                  href={`/browse?manufacturer=${mfr.id}`}
                  className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-surface hover:border-green-400 hover:shadow-md transition-all"
                >
                  <div className="size-10 rounded-full bg-gray-100 dark:bg-dark-700 flex items-center justify-center text-sm font-black text-gray-600 dark:text-gray-300 group-hover:bg-green-50 dark:group-hover:bg-green-900/30 transition-colors">
                    {mfr.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}
                  </div>
                  <span className="text-xs font-semibold text-foreground text-center leading-tight group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">
                    {mfr.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Listings */}
      {recentListings.length > 0 && (
        <section className="py-14 px-6 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Adaugate recent</h2>
                <p className="text-muted-foreground text-sm mt-1">Cele mai noi anunturi pe Mega-Mark</p>
              </div>
              <Link href="/browse?sort=newest" className="text-sm font-semibold text-green-700 dark:text-green-400 hover:underline flex items-center gap-1">
                Vezi toate <ChevronRight className="size-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {recentListings.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Browse by Country */}
      <section className="py-14 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Cauta dupa tara</h2>
              <p className="text-muted-foreground text-sm mt-1">Echipamente agricole din 16 tari UE</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {EU_COUNTRIES.map(country => (
              <Link
                key={country.code}
                href={`/browse?country=${country.code}`}
                className="group flex flex-col items-center gap-2 p-3 rounded-xl border border-border bg-surface hover:border-green-400 hover:shadow-md transition-all"
              >
                <span className="text-2xl">{country.flag}</span>
                <span className="text-xs font-semibold text-foreground group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors text-center leading-tight">
                  {country.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-14 px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-foreground">Cum functioneaza?</h2>
            <p className="text-muted-foreground text-sm mt-1">3 pasi simpli pentru a vinde sau cumpara</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Camera,
                title: 'Publica anuntul',
                desc: 'Adauga poze, specificatii si pret. Anuntul tau va fi vizibil in toata UE in cateva minute.',
                step: '1',
              },
              {
                icon: MessageSquare,
                title: 'Primeste mesaje',
                desc: 'Cumparatorii interesati te contacteaza direct. Chat integrat, notificari pe email.',
                step: '2',
              },
              {
                icon: Handshake,
                title: 'Incheie tranzactia',
                desc: 'Negociaza pretul, stabileste livrarea. Platforma sigura cu vanzatori verificati.',
                step: '3',
              },
            ].map(item => (
              <div key={item.step} className="text-center">
                <div className="relative inline-flex">
                  <div className="size-16 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center mx-auto">
                    <item.icon className="size-7 text-green-700 dark:text-green-400" />
                  </div>
                  <span className="absolute -top-2 -right-2 size-7 rounded-full bg-amber-500 text-white text-xs font-black flex items-center justify-center">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-base font-bold text-foreground mt-4 mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Empty state + CTA (shown when no listings at all) */}
      {featuredListings.length === 0 && recentListings.length === 0 && (
        <section className="py-14 px-6 bg-background">
          <div className="text-center py-16 bg-surface rounded-xl border border-border max-w-3xl mx-auto">
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
        </section>
      )}

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
