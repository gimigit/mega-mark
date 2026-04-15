import { createClient } from '@/lib/supabase/server'
import { Suspense } from 'react'
import BrowseClient from './BrowseClient'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import type { Metadata } from 'next'
import type { Database } from '@/types/database'

type Listing = Database['public']['Tables']['listings']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row']
  categories: Database['public']['Tables']['categories']['Row']
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  const params = await searchParams
  const keyword = params.keyword

  if (keyword) {
    return {
      title: `${keyword} — Mega-Mark`,
      description: `Cauta ${keyword} pe Mega-Mark. Gaseste tractoare, utilaje agricole second-hand si noi de la vanzatori verificati.`,
    }
  }

  return {
    title: 'Anunturi — Mega-Mark',
    description: 'Cumpara si vinde tractoare, combine, recoltatoare si utilaje agricole in 16 tari UE. Marketplace-ul #1 pentru agricultura europeana.',
  }
}

const EU_COUNTRIES = [
  { code: 'RO', name: 'Romania' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'PL', name: 'Poland' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'AT', name: 'Austria' },
  { code: 'BE', name: 'Belgium' },
  { code: 'HU', name: 'Hungary' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'DK', name: 'Denmark' },
  { code: 'SE', name: 'Sweden' },
  { code: 'PT', name: 'Portugal' },
  { code: 'GR', name: 'Greece' },
  { code: 'FI', name: 'Finland' },
]

async function getCategories() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
  return data || []
}

async function getManufacturers() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('manufacturers')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true })
  return data || []
}

type SearchParams = {
  keyword?: string
  category?: string
  country?: string
  condition?: string
  priceMin?: string
  priceMax?: string
  yearMin?: string
  yearMax?: string
  manufacturer?: string
  listingType?: string
  sort?: string
  page?: string
}

function buildCountQuery(supabase: Awaited<ReturnType<typeof createClient>>, params: SearchParams) {
  let query = supabase
    .from('listings')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active')

  if (params.keyword) {
    query = query.textSearch('title', params.keyword, { type: 'websearch' })
  }
  if (params.category) {
    query = query.eq('category_id', params.category)
  }
  if (params.country) {
    query = query.eq('location_country', params.country)
  }
  if (params.condition) {
    query = query.eq('condition', params.condition)
  }
  if (params.priceMin) {
    query = query.gte('price', Number(params.priceMin))
  }
  if (params.priceMax) {
    query = query.lte('price', Number(params.priceMax))
  }
  if (params.yearMin) {
    query = query.gte('year', Number(params.yearMin))
  }
  if (params.yearMax) {
    query = query.lte('year', Number(params.yearMax))
  }
  if (params.manufacturer) {
    query = query.eq('manufacturer_id', params.manufacturer)
  }
  if (params.listingType) {
    query = query.eq('listing_type', params.listingType)
  }

  return query
}

function buildDataQuery(supabase: Awaited<ReturnType<typeof createClient>>, params: SearchParams, offset: number, limit: number) {
  let query = supabase
    .from('listings')
    .select('*, profiles(full_name, avatar_url, rating_avg, rating_count, is_verified), categories(name, slug, icon)')
    .eq('status', 'active')
    .range(offset, offset + limit - 1)

  if (params.keyword) {
    query = query.textSearch('title', params.keyword, { type: 'websearch' })
  }
  if (params.category) {
    query = query.eq('category_id', params.category)
  }
  if (params.country) {
    query = query.eq('location_country', params.country)
  }
  if (params.condition) {
    query = query.eq('condition', params.condition)
  }
  if (params.priceMin) {
    query = query.gte('price', Number(params.priceMin))
  }
  if (params.priceMax) {
    query = query.lte('price', Number(params.priceMax))
  }
  if (params.yearMin) {
    query = query.gte('year', Number(params.yearMin))
  }
  if (params.yearMax) {
    query = query.lte('year', Number(params.yearMax))
  }
  if (params.manufacturer) {
    query = query.eq('manufacturer_id', params.manufacturer)
  }
  if (params.listingType) {
    query = query.eq('listing_type', params.listingType)
  }

  const sort = params.sort || 'featured'
  if (sort === 'featured') {
    query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false })
  } else if (sort === 'newest') {
    query = query.order('created_at', { ascending: false })
  } else if (sort === 'oldest') {
    query = query.order('created_at', { ascending: true })
  } else if (sort === 'price_asc') {
    query = query.order('price', { ascending: true, nullsFirst: false })
  } else if (sort === 'price_desc') {
    query = query.order('price', { ascending: false, nullsFirst: false })
  } else if (sort === 'year_desc') {
    query = query.order('year', { ascending: false, nullsFirst: false })
  } else if (sort === 'year_asc') {
    query = query.order('year', { ascending: true, nullsFirst: false })
  } else {
    query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false })
  }

  return query
}

async function getListingsCount(params: SearchParams) {
  const supabase = await createClient()
  const { count } = await buildCountQuery(supabase, params)
  return count || 0
}

async function getInitialListings(page: number, params: SearchParams) {
  const supabase = await createClient()
  const limit = 12
  const offset = (page - 1) * limit

  const { data } = await buildDataQuery(supabase, params, offset, limit)
  return (data as Listing[]) || []
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const [categories, manufacturers, page, totalCount, listings] = await Promise.all([
    getCategories(),
    getManufacturers(),
    Promise.resolve(Number(params.page) || 1),
    getListingsCount(params),
    getInitialListings(Number(params.page) || 1, params),
  ])
  const totalPages = Math.ceil(totalCount / 12)

  const activeFilters = []
  if (params.keyword) activeFilters.push({ key: 'keyword', value: params.keyword })
  if (params.category) {
    const cat = categories.find(c => c.id === params.category)
    activeFilters.push({ key: 'category', value: cat?.name || params.category })
  }
  if (params.country) {
    const country = EU_COUNTRIES.find(c => c.code === params.country)
    activeFilters.push({ key: 'country', value: country?.name || params.country })
  }
  if (params.condition) activeFilters.push({ key: 'condition', value: params.condition })
  if (params.priceMin) activeFilters.push({ key: 'priceMin', value: `€${params.priceMin}` })
  if (params.priceMax) activeFilters.push({ key: 'priceMax', value: `€${params.priceMax}` })
  if (params.yearMin) activeFilters.push({ key: 'yearMin', value: `${params.yearMin}` })
  if (params.yearMax) activeFilters.push({ key: 'yearMax', value: `${params.yearMax}` })
  if (params.manufacturer) {
    const mfr = manufacturers.find(m => m.id === params.manufacturer)
    activeFilters.push({ key: 'manufacturer', value: mfr?.name || params.manufacturer })
  }
  if (params.listingType) activeFilters.push({ key: 'listingType', value: params.listingType })

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="bg-gradient-to-br from-green-900 via-green-800 to-green-950 text-white py-10 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-sm text-white/50 mb-6">
            <a href="/" className="hover:text-white/80 transition-colors">Acasa</a>
            <span>/</span>
            <span className="text-white/80 font-medium">Anunturi</span>
            {params.category && activeFilters.find(f => f.key === 'category') && (
              <>
                <span>/</span>
                <span className="text-white font-medium">
                  {activeFilters.find(f => f.key === 'category')?.value}
                </span>
              </>
            )}
          </nav>

          <h1 className="text-3xl md:text-4xl font-black mb-2">
            Cauta <span className="text-amber-400">Echipament Agricol</span>
          </h1>
          <p className="text-white/70 mb-8">
            Gaseste tractoare, combine si utilaje agricole din toata UE
          </p>

          <Suspense fallback={<div className="h-48 bg-white/10 rounded-2xl animate-pulse" />}>
            <BrowseClient
              categories={categories}
              manufacturers={manufacturers}
              countries={EU_COUNTRIES}
              initialListings={listings}
              totalPages={totalPages}
              totalCount={totalCount}
              activeFilters={activeFilters}
              currentPage={page}
            />
          </Suspense>
        </div>
      </section>

      <Footer />
    </div>
  )
}
