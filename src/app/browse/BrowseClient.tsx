'use client'

import { useState, useTransition, useCallback, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import MapView from '@/components/MapView'
import type { Database } from '@/types/database'

type Listing = Database['public']['Tables']['listings']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row']
  categories: Database['public']['Tables']['categories']['Row']
}

type Category = Database['public']['Tables']['categories']['Row']
type Manufacturer = Database['public']['Tables']['manufacturers']['Row']
type Country = { code: string; name: string }

interface BrowseClientProps {
  categories: Category[]
  manufacturers: Manufacturer[]
  countries: Country[]
  initialListings: Listing[]
  totalPages: number
  totalCount: number
  activeFilters: { key: string; value: string }[]
  currentPage: number
}

export default function BrowseClient({
  categories,
  manufacturers,
  countries,
  initialListings,
  totalPages: initialTotalPages,
  totalCount: initialTotalCount,
  activeFilters: initialFilters,
  currentPage: initialPage,
}: BrowseClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const { user } = useSupabase()
  const [isPending, startTransition] = useTransition()

  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid')
  const [keyword, setKeyword] = useState(initialFilters.find(f => f.key === 'keyword')?.value || '')
  const [selectedCategory, setSelectedCategory] = useState(
    initialFilters.find(f => f.key === 'category')?.value || ''
  )
  const [selectedCountry, setSelectedCountry] = useState(
    initialFilters.find(f => f.key === 'country')?.value || ''
  )
  const [selectedCondition, setSelectedCondition] = useState(
    initialFilters.find(f => f.key === 'condition')?.value || ''
  )
  const [priceMin, setPriceMin] = useState(
    initialFilters.find(f => f.key === 'priceMin')?.value.replace('€', '') || ''
  )
  const [priceMax, setPriceMax] = useState(
    initialFilters.find(f => f.key === 'priceMax')?.value.replace('€', '') || ''
  )
  const [yearMin, setYearMin] = useState(initialFilters.find(f => f.key === 'yearMin')?.value || '')
  const [yearMax, setYearMax] = useState(initialFilters.find(f => f.key === 'yearMax')?.value || '')
  const [selectedManufacturer, setSelectedManufacturer] = useState(
    initialFilters.find(f => f.key === 'manufacturer')?.value || ''
  )
  const [selectedListingType, setSelectedListingType] = useState(
    initialFilters.find(f => f.key === 'listingType')?.value || ''
  )
  const [sortBy, setSortBy] = useState('featured')

  const [listings, setListings] = useState(initialListings)
  const [totalPages, setTotalPages] = useState(initialTotalPages)
  const [totalCount, setTotalCount] = useState(initialTotalCount)
  const [page, setPage] = useState(initialPage)
  const [activeFilters, setActiveFilters] = useState(initialFilters)
  const [loading, setLoading] = useState(false)
  const [saveSearchOpen, setSaveSearchOpen] = useState(false)
  const [searchName, setSearchName] = useState('')
  const [saveLoading, setSaveLoading] = useState(false)

  const fetchListings = useCallback(
    async (newPage: number = 1, filters?: typeof initialFilters) => {
      setLoading(true)

      const getCurrentFilters = () => {
        if (filters) return filters
        return activeFilters
      }

      const applyFilters = (query: any) => {
        const currentFilters = getCurrentFilters()

        const keywordFilter = currentFilters.find(f => f.key === 'keyword')?.value
        if (keywordFilter) {
          query = query.textSearch('title', keywordFilter, { type: 'websearch' })
        }

        const catFilter = currentFilters.find(f => f.key === 'category')
        if (catFilter) {
          const cat = categories.find(c => c.name === catFilter.value)
          if (cat) query = query.eq('category_id', cat.id)
        }

        const countryFilter = currentFilters.find(f => f.key === 'country')
        if (countryFilter) {
          const country = countries.find(c => c.name === countryFilter.value)
          if (country) query = query.eq('location_country', country.code)
        }

        const condFilter = currentFilters.find(f => f.key === 'condition')
        if (condFilter) query = query.eq('condition', condFilter.value)

        const minFilter = currentFilters.find(f => f.key === 'priceMin')
        if (minFilter) {
          const val = minFilter.value.replace('€', '')
          query = query.gte('price', Number(val))
        }

        const maxFilter = currentFilters.find(f => f.key === 'priceMax')
        if (maxFilter) {
          const val = maxFilter.value.replace('€', '')
          query = query.lte('price', Number(val))
        }

        const yearMinFilter = currentFilters.find(f => f.key === 'yearMin')
        if (yearMinFilter) query = query.gte('year', Number(yearMinFilter.value))

        const yearMaxFilter = currentFilters.find(f => f.key === 'yearMax')
        if (yearMaxFilter) query = query.lte('year', Number(yearMaxFilter.value))

        const mfrFilter = currentFilters.find(f => f.key === 'manufacturer')
        if (mfrFilter) {
          const mfr = manufacturers.find(m => m.name === mfrFilter.value)
          if (mfr) query = query.eq('manufacturer_id', mfr.id)
        }

        const typeFilter = currentFilters.find(f => f.key === 'listingType')
        if (typeFilter) query = query.eq('listing_type', typeFilter.value)

        return query
      }

      const isNewSearch = newPage === 1 || filters !== undefined
      if (isNewSearch) {
        let countQuery = supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'active')
        countQuery = applyFilters(countQuery)
        const { count } = await countQuery
        setTotalCount(count || 0)
        setTotalPages(Math.ceil((count || 0) / 12))
      }

      const limit = 12
      const offset = (newPage - 1) * limit
      let dataQuery = supabase
        .from('listings')
        .select('*, profiles(full_name, avatar_url, rating_avg, is_verified), categories(name, icon)')
        .eq('status', 'active')
        .range(offset, offset + limit - 1)

      dataQuery = applyFilters(dataQuery)

      const sortFilter = currentFilters.find(f => f.key === 'sort')?.value || 'featured'
      if (sortFilter === 'featured') {
        dataQuery = dataQuery.order('is_featured', { ascending: false }).order('created_at', { ascending: false })
      } else if (sortFilter === 'newest') {
        dataQuery = dataQuery.order('created_at', { ascending: false })
      } else if (sortFilter === 'price_asc') {
        dataQuery = dataQuery.order('price', { ascending: true, nullsFirst: false })
      } else if (sortFilter === 'price_desc') {
        dataQuery = dataQuery.order('price', { ascending: false, nullsFirst: false })
      } else if (sortFilter === 'year_desc') {
        dataQuery = dataQuery.order('year', { ascending: false, nullsFirst: false })
      } else if (sortFilter === 'year_asc') {
        dataQuery = dataQuery.order('year', { ascending: true, nullsFirst: false })
      }

      const { data } = await dataQuery
      const listingsData = (data as Listing[]) || []

      setListings(prev => newPage === 1 ? listingsData : [...prev, ...listingsData])
      setLoading(false)
    },
    [supabase, categories, countries, manufacturers, activeFilters]
  )

  const buildParams = (newFilters: typeof activeFilters, newPage: number = 1, newSort?: string) => {
    const params = new URLSearchParams()
    newFilters.forEach(f => {
      if (f.key === 'category') {
        const cat = categories.find(c => c.name === f.value)
        if (cat) params.set('category', cat.id)
      } else if (f.key === 'country') {
        const country = countries.find(c => c.name === f.value)
        if (country) params.set('country', country.code)
      } else if (f.key === 'priceMin') {
        params.set('priceMin', f.value.replace('€', ''))
      } else if (f.key === 'priceMax') {
        params.set('priceMax', f.value.replace('€', ''))
      } else if (f.key === 'yearMin') {
        params.set('yearMin', f.value)
      } else if (f.key === 'yearMax') {
        params.set('yearMax', f.value)
      } else if (f.key === 'manufacturer') {
        const mfr = manufacturers.find(m => m.name === f.value)
        if (mfr) params.set('manufacturer', mfr.id)
      } else if (f.key !== 'sort') {
        params.set(f.key, f.value)
      }
    })
    const sortValue = newSort || sortBy
    if (sortValue && sortValue !== 'featured') params.set('sort', sortValue)
    if (newPage > 1) params.set('page', String(newPage))
    return params.toString()
  }

  const applyFilters = () => {
    const filters: { key: string; value: string }[] = []
    if (keyword) filters.push({ key: 'keyword', value: keyword })
    if (selectedCategory) filters.push({ key: 'category', value: selectedCategory })
    if (selectedCountry) filters.push({ key: 'country', value: selectedCountry })
    if (selectedCondition) filters.push({ key: 'condition', value: selectedCondition })
    if (priceMin) filters.push({ key: 'priceMin', value: `€${priceMin}` })
    if (priceMax) filters.push({ key: 'priceMax', value: `€${priceMax}` })
    if (yearMin) filters.push({ key: 'yearMin', value: yearMin })
    if (yearMax) filters.push({ key: 'yearMax', value: yearMax })
    if (selectedManufacturer) filters.push({ key: 'manufacturer', value: selectedManufacturer })
    if (selectedListingType) filters.push({ key: 'listingType', value: selectedListingType })
    if (sortBy !== 'featured') filters.push({ key: 'sort', value: sortBy })

    setActiveFilters(filters)
    setPage(1)

    const params = buildParams(filters, 1)
    startTransition(() => {
      router.push(`${pathname}?${params}`, { scroll: false })
    })

    fetchListings(1, filters)
  }

  const removeFilter = (key: string) => {
    const newFilters = activeFilters.filter(f => f.key !== key)
    setActiveFilters(newFilters)

    if (key === 'keyword') setKeyword('')
    if (key === 'category') setSelectedCategory('')
    if (key === 'country') setSelectedCountry('')
    if (key === 'condition') setSelectedCondition('')
    if (key === 'priceMin') setPriceMin('')
    if (key === 'priceMax') setPriceMax('')
    if (key === 'yearMin') setYearMin('')
    if (key === 'yearMax') setYearMax('')
    if (key === 'manufacturer') setSelectedManufacturer('')
    if (key === 'listingType') setSelectedListingType('')
    if (key === 'sort') setSortBy('featured')

    const params = buildParams(newFilters, 1)
    setPage(1)
    startTransition(() => {
      router.push(`${pathname}?${params}`, { scroll: false })
    })
    fetchListings(1, newFilters)
  }

  const goToPage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return
    setPage(newPage)
    const params = buildParams(activeFilters, newPage)
    startTransition(() => {
      router.push(`${pathname}?${params}`, { scroll: false })
    })
    fetchListings(newPage)
  }

  const resetFilters = () => {
    setKeyword('')
    setSelectedCategory('')
    setSelectedCountry('')
    setSelectedCondition('')
    setPriceMin('')
    setPriceMax('')
    setYearMin('')
    setYearMax('')
    setSelectedManufacturer('')
    setSelectedListingType('')
    setSortBy('featured')
    setActiveFilters([])
    setPage(1)
    router.push(pathname, { scroll: false })
    fetchListings(1, [])
  }

  const conditionLabels: Record<string, string> = {
    new: 'Nou',
    used: 'Folosit',
    refurbished: 'Refurbished',
  }

  const listingTypeLabels: Record<string, string> = {
    sale: 'Vânzare',
    rent: 'Închiriere',
    lease: 'Leasing',
  }

  const sortLabels: Record<string, string> = {
    featured: 'Featured',
    newest: 'Cele mai noi',
    oldest: 'Cele mai vechi',
    price_asc: 'Preț crescător',
    price_desc: 'Preț descrescător',
    year_desc: 'An mai nou',
    year_asc: 'An mai vechi',
  }

  const formatPrice = (price: number, currency: string) => {
    return `${currency === 'EUR' ? '€' : currency}${price.toLocaleString()}`
  }

  const hasActiveFilters = keyword || selectedCategory || selectedCountry || selectedCondition || priceMin || priceMax || yearMin || yearMax || selectedManufacturer || selectedListingType || sortBy !== 'featured'

  return (
    <div>
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-3">
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-1">
              Cuvinte cheie
            </label>
            <input
              type="text"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applyFilters()}
              placeholder="John Deere..."
              className="w-full p-3 rounded-lg border border-white/20 bg-white/10 text-white text-sm placeholder:text-white/40 focus:border-amber-400 focus:bg-white/20 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-1">
              Categorie
            </label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full p-3 rounded-lg border border-white/20 bg-white/10 text-white text-sm focus:border-amber-400 focus:bg-white/20 outline-none transition-all"
            >
              <option value="">Toate</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-1">
              Producător
            </label>
            <select
              value={selectedManufacturer}
              onChange={e => setSelectedManufacturer(e.target.value)}
              className="w-full p-3 rounded-lg border border-white/20 bg-white/10 text-white text-sm focus:border-amber-400 focus:bg-white/20 outline-none transition-all"
            >
              <option value="">Toți</option>
              {manufacturers.map(mfr => (
                <option key={mfr.id} value={mfr.name}>
                  {mfr.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-1">
              Țară
            </label>
            <select
              value={selectedCountry}
              onChange={e => setSelectedCountry(e.target.value)}
              className="w-full p-3 rounded-lg border border-white/20 bg-white/10 text-white text-sm focus:border-amber-400 focus:bg-white/20 outline-none transition-all"
            >
              <option value="">Toate</option>
              {countries.map(country => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-1">
              Stare
            </label>
            <select
              value={selectedCondition}
              onChange={e => setSelectedCondition(e.target.value)}
              className="w-full p-3 rounded-lg border border-white/20 bg-white/10 text-white text-sm focus:border-amber-400 focus:bg-white/20 outline-none transition-all"
            >
              <option value="">Oricare</option>
              <option value="new">Nou</option>
              <option value="used">Folosit</option>
              <option value="refurbished">Refurbished</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-1">
              Preț min
            </label>
            <input
              type="number"
              value={priceMin}
              onChange={e => setPriceMin(e.target.value)}
              placeholder="€ 0"
              className="w-full p-3 rounded-lg border border-white/20 bg-white/10 text-white text-sm placeholder:text-white/40 focus:border-amber-400 focus:bg-white/20 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-1">
              Preț max
            </label>
            <input
              type="number"
              value={priceMax}
              onChange={e => setPriceMax(e.target.value)}
              placeholder="€ 500000"
              className="w-full p-3 rounded-lg border border-white/20 bg-white/10 text-white text-sm placeholder:text-white/40 focus:border-amber-400 focus:bg-white/20 outline-none transition-all"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
          <div>
            <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-1">
              An de la
            </label>
            <input
              type="number"
              value={yearMin}
              onChange={e => setYearMin(e.target.value)}
              placeholder="2000"
              className="w-full p-3 rounded-lg border border-white/20 bg-white/10 text-white text-sm placeholder:text-white/40 focus:border-amber-400 focus:bg-white/20 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-1">
              An până la
            </label>
            <input
              type="number"
              value={yearMax}
              onChange={e => setYearMax(e.target.value)}
              placeholder="2026"
              className="w-full p-3 rounded-lg border border-white/20 bg-white/10 text-white text-sm placeholder:text-white/40 focus:border-amber-400 focus:bg-white/20 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-1">
              Tip
            </label>
            <select
              value={selectedListingType}
              onChange={e => setSelectedListingType(e.target.value)}
              className="w-full p-3 rounded-lg border border-white/20 bg-white/10 text-white text-sm focus:border-amber-400 focus:bg-white/20 outline-none transition-all"
            >
              <option value="">Toate</option>
              <option value="sale">Vânzare</option>
              <option value="rent">Închiriere</option>
              <option value="lease">Leasing</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-1">
              Sortare
            </label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="w-full p-3 rounded-lg border border-white/20 bg-white/10 text-white text-sm focus:border-amber-400 focus:bg-white/20 outline-none transition-all"
            >
              {Object.entries(sortLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <button
            onClick={applyFilters}
            className="flex-1 bg-gradient-to-r from-amber-500 to-amber-400 text-white p-3 rounded-lg font-bold text-base hover:shadow-lg hover:shadow-amber-500/30 transition-all hover:-translate-y-0.5"
          >
            🔍 Caută
          </button>
          {hasActiveFilters && (
            <>
              <button
                onClick={() => setSaveSearchOpen(true)}
                disabled={!user}
                className="px-6 py-3 border border-white/20 text-white rounded-lg font-semibold hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={user ? "Salvează această căutare" : "Autentifică-te pentru a salva căutarea"}
              >
                💾 Salvează
              </button>
              <button
                onClick={resetFilters}
                className="px-6 py-3 border border-white/20 text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Resetează
              </button>
            </>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-500 font-medium">Filtre:</span>
                {activeFilters.map(filter => (
                  <button
                    key={filter.key}
                    onClick={() => removeFilter(filter.key)}
                    className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-sm font-semibold hover:bg-green-200 transition-colors"
                  >
                    {filter.value}
                    <span className="text-green-500">×</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <p className="text-gray-600">
              {loading ? (
                <span className="animate-pulse">Se încarcă...</span>
              ) : (
                <>
                  <span className="font-bold text-gray-900">{totalCount}</span> anunțuri
                  {page > 1 && (
                    <span className="text-gray-400 ml-2">
                      (pagina {page} din {totalPages})
                    </span>
                  )}
                </>
              )}
            </p>
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 text-sm font-semibold transition-colors ${
                  viewMode === 'grid' ? 'bg-green-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 text-sm font-semibold transition-colors ${
                  viewMode === 'map' ? 'bg-green-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Hartă
              </button>
            </div>
          </div>
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <div className="h-48 bg-gray-200 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && viewMode === 'map' && (
          <div className="h-[600px] rounded-xl overflow-hidden border border-gray-200">
            <MapView listings={listings} />
          </div>
        )}

        {!loading && viewMode === 'grid' && listings.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <span className="text-6xl block mb-4">🔍</span>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Niciun anunț găsit</h3>
            <p className="text-gray-500 mb-6">Încearcă să modifici criteriile de căutare</p>
          </div>
        )}

        {!loading && viewMode === 'grid' && listings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map(listing => (
              <Link
                key={listing.id}
                href={`/listings/${listing.id}`}
                className="group bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all hover:border-green-400"
              >
                <div className="relative h-48 bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center">
                  {listing.images && (listing.images as string[]).length > 0 ? (
                    <img
                      src={(listing.images as string[])[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-6xl opacity-50">{listing.categories?.icon || '🚜'}</span>
                  )}
                  {listing.is_featured && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold text-white bg-amber-500 shadow-sm">
                      ⭐ Featured
                    </span>
                  )}
                  {listing.listing_type && listing.listing_type !== 'sale' && (
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 shadow-sm">
                      {listingTypeLabels[listing.listing_type] || listing.listing_type}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-1 group-hover:text-green-700 transition-colors line-clamp-2">
                    {listing.title}
                  </h3>
                  <div className="text-xl font-black text-green-700 mb-2">
                    {listing.price ? formatPrice(listing.price, listing.currency || 'EUR') : 'La cerere'}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
                    {listing.year && (
                      <span className="bg-gray-100 px-2 py-1 rounded font-medium">{listing.year}</span>
                    )}
                    {listing.hours && (
                      <span className="bg-gray-100 px-2 py-1 rounded font-medium">
                        {listing.hours.toLocaleString()}h
                      </span>
                    )}
                    {listing.power_hp && (
                      <span className="bg-gray-100 px-2 py-1 rounded font-medium">
                        {listing.power_hp} CP
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
                    <span className="flex items-center gap-1">
                      📍 {listing.location_country || 'UE'}
                    </span>
                    <span>{listing.categories?.name || 'Agricultural'}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && totalPages > 1 && viewMode === 'grid' && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Anterior
            </button>
            <div className="flex gap-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                let pageNum: number
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (page <= 3) {
                  pageNum = i + 1
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = page - 2 + i
                }
                return (
                  <button
                    key={i}
                    onClick={() => goToPage(pageNum)}
                    className={`w-10 h-10 rounded-lg text-sm font-bold transition-colors ${
                      pageNum === page
                        ? 'bg-green-700 text-white'
                        : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Următor →
            </button>
          </div>
        )}
      </div>

      {/* Save Search Modal */}
      {saveSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSaveSearchOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💾</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Salvează căutarea</h3>
              <p className="text-gray-500">Vei fi notificat când apar anunțuri noi care corespund criteriilor tale.</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nume căutare
                </label>
                <input
                  type="text"
                  value={searchName}
                  onChange={e => setSearchName(e.target.value)}
                  placeholder="Ex: Tractoare John Deere sub 30k"
                  className="w-full p-3 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="notifyEmail"
                  defaultChecked
                  className="w-5 h-5 text-green-700 rounded focus:ring-green-500"
                />
                <label htmlFor="notifyEmail" className="text-sm text-gray-700">
                  Trimite notificări pe email
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setSaveSearchOpen(false)}
                className="flex-1 px-5 py-2.5 border-2 border-gray-200 rounded-xl font-bold text-sm text-gray-700 hover:border-gray-400 transition-colors"
              >
                Anulează
              </button>
              <button
                onClick={async () => {
                  if (!user) return
                  setSaveLoading(true)
                  
                  const cat = selectedCategory ? categories.find(c => c.name === selectedCategory) : null
                  const mfr = selectedManufacturer ? manufacturers.find(m => m.name === selectedManufacturer) : null
                  
                  await supabase.from('saved_searches').insert({
                    user_id: user.id,
                    name: searchName || null,
                    keyword: keyword || null,
                    category_id: cat?.id || null,
                    country: selectedCountry || null,
                    condition: selectedCondition || null,
                    price_min: priceMin ? Number(priceMin) : null,
                    price_max: priceMax ? Number(priceMax) : null,
                    year_min: yearMin ? Number(yearMin) : null,
                    year_max: yearMax ? Number(yearMax) : null,
                    manufacturer_id: mfr?.id || null,
                    listing_type: selectedListingType || null,
                    notify_email: true,
                  })
                  
                  setSaveLoading(false)
                  setSaveSearchOpen(false)
                  setSearchName('')
                }}
                disabled={saveLoading}
                className="flex-1 px-5 py-2.5 bg-green-700 text-white rounded-xl font-bold text-sm hover:bg-green-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saveLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Se salvează...
                  </>
                ) : (
                  '💾 Salvează'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}