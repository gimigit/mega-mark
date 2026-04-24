import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'
import HomeClient from '@/components/HomeClient'

export const dynamic = 'force-dynamic'

type Listing = Database['public']['Tables']['listings']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row']
  categories: Database['public']['Tables']['categories']['Row']
}

type Category = {
  id: number
  name: string
  slug: string
  icon: string
  count: number
}

type Manufacturer = {
  id: number
  name: string
  slug: string
  logo_url: string | null
}

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
    <HomeClient
      featuredListings={featuredListings}
      recentListings={recentListings}
      categories={categories as Category[]}
      manufacturers={manufacturers as Manufacturer[]}
      stats={stats}
    />
  )
}