import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ListingCard from '@/components/ListingCard'
import ListingCardSkeleton from '@/components/ListingCardSkeleton'
import { createClient } from '@/lib/supabase/server'
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
    .select('id, name, icon, is_active, listings(count)')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  return (data || []).map((cat: any) => ({
    id: cat.id,
    name: cat.name,
    icon: cat.icon || '⚙️',
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

const STATIC_STATS = [
  { value: '16', label: 'EU Countries' },
  { value: 'Verified', label: 'Sellers' },
]

export default async function HomePage() {
  const [featuredListings, categories, stats] = await Promise.all([
    getFeaturedListings(),
    getCategoriesWithCount(),
    getStats(),
  ])

  const statsWithData = [
    { value: stats.listings.toLocaleString() + '+', label: 'Active Listings' },
    ...STATIC_STATS,
    { value: stats.users.toLocaleString() + '+', label: 'Users' },
  ]

  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-900 via-green-800 to-green-950 text-white py-20 lg:py-32 px-6">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="max-w-7xl mx-auto relative">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-semibold text-amber-300 mb-6 animate-fade-in">
            🌍 Serving 16 EU Countries
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight tracking-tight animate-slide-up">
            Buy & Sell <span className="text-amber-400">Farm Equipment</span><br />
            Across Europe
          </h1>
          <p className="text-lg text-white/80 max-w-xl mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: '100ms' }}>
            Europe&apos;s trusted marketplace for tractors, combines, harvesters and agricultural machinery. 
            Join thousands of farmers and dealers trading across the EU.
          </p>

          {/* Search Box */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-4xl mb-8 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-1">
                  Category
                </label>
                <select className="w-full p-3 rounded-lg border border-white/20 bg-white/10 text-white text-sm focus:border-amber-400 focus:bg-white/20 outline-none transition-all">
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-1">
                  Country
                </label>
                <select className="w-full p-3 rounded-lg border border-white/20 bg-white/10 text-white text-sm focus:border-amber-400 focus:bg-white/20 outline-none transition-all">
                  <option value="">All Countries</option>
                  <option value="de">Germany</option>
                  <option value="fr">France</option>
                  <option value="nl">Netherlands</option>
                  <option value="pl">Poland</option>
                  <option value="es">Spain</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-1">
                  Price Range
                </label>
                <input
                  type="text"
                  placeholder="e.g. 10000 - 50000"
                  className="w-full p-3 rounded-lg border border-white/20 bg-white/10 text-white text-sm placeholder:text-white/40 focus:border-amber-400 focus:bg-white/20 outline-none transition-all"
                />
              </div>
              <div className="flex items-end">
                <button className="w-full bg-gradient-to-r from-amber-500 to-amber-400 text-white p-3 rounded-lg font-bold text-base hover:shadow-lg hover:shadow-amber-500/30 transition-all hover:-translate-y-0.5">
                  🔍 Search
                </button>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap gap-3 animate-fade-in" style={{ animationDelay: '400ms' }}>
            <span className="bg-white/10 border border-white/15 rounded-full px-4 py-1.5 text-sm font-semibold">
              ✓ Verified Sellers
            </span>
            <span className="bg-white/10 border border-white/15 rounded-full px-4 py-1.5 text-sm font-semibold">
              🔒 Secure Payments
            </span>
            <span className="bg-white/10 border border-white/15 rounded-full px-4 py-1.5 text-sm font-semibold">
              🚚 EU-Wide Delivery
            </span>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 shadow-sm">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-200 dark:divide-dark-700">
          {statsWithData.map(stat => (
            <div key={stat.label} className="px-6 py-6 text-center">
              <div className="text-3xl font-black text-green-700 dark:text-green-400 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-6 bg-white dark:bg-dark-900">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Browse Categories</h2>
            <p className="text-gray-500 dark:text-gray-400">Find exactly what you need for your farm</p>
          </div>
          {categories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  href={`/browse?category=${cat.id}`}
                  className="group bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl p-4 text-center transition-all hover:bg-green-700 dark:hover:bg-green-700 hover:border-green-700 hover:-translate-y-1 hover:shadow-lg hover:shadow-green-700/20"
                >
                  <span className="text-3xl block mb-2">{cat.icon}</span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-white block">
                    {cat.name}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 group-hover:text-white/70 mt-1 block">
                    {cat.count}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p>No categories available. <a href="/api/seed" className="text-green-600 hover:underline">Run seed</a> to populate data.</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Listings Grid */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Featured Listings</h2>
              <p className="text-gray-500 dark:text-gray-400">Handpicked deals from verified sellers</p>
            </div>
            <Link href="/browse" className="text-green-700 dark:text-green-400 font-semibold hover:text-green-800 dark:hover:text-green-300 transition-colors">
              View All →
            </Link>
          </div>

          {featuredListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredListings.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <span className="text-6xl block mb-4">🚜</span>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No listings yet</h3>
              <p className="text-gray-500 mb-6">Be the first to post an agricultural listing!</p>
              <Link href="/listings/create" className="inline-block bg-green-700 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-800 transition-colors">
                + Post First Listing
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Post Listing CTA */}
      <section className="py-16 px-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-dark-800 dark:to-dark-900">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Sell Your Equipment</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              Reach thousands of potential buyers across Europe. List your tractors, combines, and farm equipment 
              in minutes and connect with verified farmers and dealers.
            </p>
            <div className="space-y-4">
              {[
                { icon: '⚡', title: 'Quick Listing', desc: 'Post in under 5 minutes' },
                { icon: '🌍', title: 'EU-Wide Reach', desc: 'Access 16 European markets' },
                { icon: '✅', title: 'Verified Buyers', desc: 'Connect with serious buyers' },
              ].map(item => (
                <div key={item.title} className="flex gap-4">
                  <div className="w-12 h-12 bg-green-700 dark:bg-green-600 text-white rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{item.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-dark-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-dark-700">
            <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Post a Listing</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1.5">Category</label>
                  <select className="w-full p-3 border border-gray-200 dark:border-dark-700 rounded-lg text-sm bg-white dark:bg-dark-900 text-gray-900 dark:text-white focus:border-green-500 focus:ring-2 focus:ring-green-500/10 outline-none">
                    <option>Select Category</option>
                    <option>Tractors</option>
                    <option>Combines</option>
                    <option>Harvesters</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1.5">Year</label>
                  <input type="number" placeholder="2020" className="w-full p-3 border border-gray-200 dark:border-dark-700 rounded-lg text-sm bg-white dark:bg-dark-900 text-gray-900 dark:text-white focus:border-green-500 focus:ring-2 focus:ring-green-500/10 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1.5">Title</label>
                <input type="text" placeholder="e.g. John Deere 6155M" className="w-full p-3 border border-gray-200 dark:border-dark-700 rounded-lg text-sm bg-white dark:bg-dark-900 text-gray-900 dark:text-white focus:border-green-500 focus:ring-2 focus:ring-green-500/10 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1.5">Price (€)</label>
                <input type="number" placeholder="50000" className="w-full p-3 border border-gray-200 dark:border-dark-700 rounded-lg text-sm bg-white dark:bg-dark-900 text-gray-900 dark:text-white focus:border-green-500 focus:ring-2 focus:ring-green-500/10 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1.5">Description</label>
                <textarea rows={3} placeholder="Describe your equipment..." className="w-full p-3 border border-gray-200 dark:border-dark-700 rounded-lg text-sm bg-white dark:bg-dark-900 text-gray-900 dark:text-white focus:border-green-500 focus:ring-2 focus:ring-green-500/10 outline-none resize-none" />
              </div>
              <button className="w-full py-3 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-xl font-bold text-base hover:shadow-lg hover:shadow-green-700/30 transition-all hover:-translate-y-0.5">
                Post Listing
              </button>
              <div className="flex justify-center gap-6 text-xs text-gray-400 dark:text-gray-500">
                <span>✓ Free to list</span>
                <span>✓ 24h approval</span>
                <span>✓ No commission</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
