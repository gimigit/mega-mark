'use client'

import Image from 'next/image'
import { useState, useTransition, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import ListingCard from '@/components/ListingCard'
import MapView from '@/components/MapView'
import {
  Search, RotateCcw, Bookmark, X, Grid3X3, Map, List,
  ChevronLeft, ChevronRight, SearchX, Loader2,
} from 'lucide-react'
import { useTranslations } from '@/i18n/I18nProvider'
import type { Database, Json } from '@/types/database'

type Listing = Database['public']['Tables']['listings']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row']
  categories: Database['public']['Tables']['categories']['Row']
  manufacturers: Database['public']['Tables']['manufacturers']['Row'] | null
  export_countries?: string[]
  video_url?: string
  specs?: Json
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
  const t = useTranslations().t
  const [isPending, startTransition] = useTransition()

  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid')
  const observerTarget = useRef<HTMLDivElement>(null)

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
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

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
        .select('*, profiles(full_name, avatar_url, rating_avg, rating_count, is_verified), categories(name, slug, icon)')
        .eq('status', 'active')
        .range(offset, offset + limit - 1)

      dataQuery = applyFilters(dataQuery)

      const sortFilter = getCurrentFilters().find(f => f.key === 'sort')?.value || 'featured'
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
      setHasMore(listingsData.length === limit)
      setListings(prev => newPage === 1 ? listingsData : [...prev, ...listingsData])
      setLoading(false)
      setLoadingMore(false)
    },
    [supabase, categories, countries, manufacturers, activeFilters]
  )

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore || loading) return
    setLoadingMore(true)
    fetchListings(page + 1)
  }, [hasMore, loadingMore, loading, page, fetchListings])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [hasMore, loadingMore, loading, loadMore])

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
    setHasMore(true)
    router.push(pathname, { scroll: false })
    fetchListings(1, [])
  }

  const sortLabels: Record<string, string> = {
    featured: t('browse.sortFeatured'),
    newest: t('browse.sortNewest'),
    oldest: t('browse.sortOldest'),
    price_asc: t('browse.sortPriceAsc'),
    price_desc: t('browse.sortPriceDesc'),
    year_desc: t('browse.sortYearDesc'),
    year_asc: t('browse.sortYearAsc'),
  }

  const hasActiveFilters = keyword || selectedCategory || selectedCountry || selectedCondition || priceMin || priceMax || yearMin || yearMax || selectedManufacturer || selectedListingType || sortBy !== 'featured'

  const selectClass = 'w-full p-3 rounded-lg border border-white/20 bg-white/10 text-white text-sm focus:border-amber-400 focus:bg-white/20 outline-none transition-all'
  const inputClass = 'w-full p-3 rounded-lg border border-white/20 bg-white/10 text-white text-sm placeholder:text-white/40 focus:border-amber-400 focus:bg-white/20 outline-none transition-all'

  return (
    <div>
      {/* Filters */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-3">
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-1">
              {t('browse.filtersKeyword')}
            </label>
            <input
              type="text"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applyFilters()}
              placeholder={t('browse.placeholderKeyword')}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-1">
              {t('browse.filtersCategory')}
            </label>
            <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className={selectClass}>
              <option value="">{t('browse.all')}</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-1">
              {t('browse.filtersManufacturer')}
            </label>
            <select value={selectedManufacturer} onChange={e => setSelectedManufacturer(e.target.value)} className={selectClass}>
              <option value="">{t('browse.allManufacturers')}</option>
              {manufacturers.map(mfr => (
                <option key={mfr.id} value={mfr.name}>{mfr.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-1">
              {t('browse.filtersCountry')}
            </label>
            <select value={selectedCountry} onChange={e => setSelectedCountry(e.target.value)} className={selectClass}>
              <option value="">{t('browse.allCountries')}</option>
              {countries.map(country => (
                <option key={country.code} value={country.code}>{country.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-1">
              {t('browse.filtersCondition')}
            </label>
            <select value={selectedCondition} onChange={e => setSelectedCondition(e.target.value)} className={selectClass}>
              <option value="">{t('browse.anyCondition')}</option>
              <option value="new">{t('browse.conditionNew')}</option>
              <option value="used">{t('browse.conditionUsed')}</option>
              <option value="refurbished">{t('browse.conditionRefurbished')}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-1">
              {t('browse.filtersPriceMin')}
            </label>
            <input type="number" value={priceMin} onChange={e => setPriceMin(e.target.value)} placeholder={t('browse.placeholderPriceMin')} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-1">
              {t('browse.filtersPriceMax')}
            </label>
            <input type="number" value={priceMax} onChange={e => setPriceMax(e.target.value)} placeholder={t('browse.placeholderPriceMax')} className={inputClass} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
          <div>
            <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-1">{t('browse.filtersYearFrom')}</label>
            <input type="number" value={yearMin} onChange={e => setYearMin(e.target.value)} placeholder={t('browse.placeholderYearFrom')} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-1">{t('browse.filtersYearTo')}</label>
            <input type="number" value={yearMax} onChange={e => setYearMax(e.target.value)} placeholder={t('browse.placeholderYearTo')} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-1">{t('browse.filtersType')}</label>
            <select value={selectedListingType} onChange={e => setSelectedListingType(e.target.value)} className={selectClass}>
              <option value="">{t('browse.all')}</option>
              <option value="sale">{t('browse.typeSale')}</option>
              <option value="rent">{t('browse.typeRent')}</option>
              <option value="lease">{t('browse.typeLease')}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-1">{t('browse.filtersSort')}</label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className={selectClass}>
              {Object.entries(sortLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <button
            onClick={applyFilters}
            className="flex-1 bg-gradient-to-r from-amber-500 to-amber-400 text-white p-3 rounded-lg font-bold text-base hover:shadow-lg hover:shadow-amber-500/30 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            <Search className="size-4" />
            {t('browse.search')}
          </button>
          {hasActiveFilters && (
            <>
              <button
                onClick={() => setSaveSearchOpen(true)}
                disabled={!user}
                className="px-6 py-3 border border-white/20 text-white rounded-lg font-semibold hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                title={user ? t('browse.saveSearchTooltipLoggedIn') : t('browse.saveSearchTooltip')}
              >
                <Bookmark className="size-4" />
                {t('browse.saveSearch')}
              </button>
              <button
                onClick={resetFilters}
                className="px-6 py-3 border border-white/20 text-white rounded-lg font-semibold hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                <RotateCcw className="size-4" />
                {t('browse.reset')}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Brand pills — quick manufacturer filter */}
      {manufacturers.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 pb-4">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">{t('browse.brandsQuick')}</span>
            {manufacturers.slice(0, 10).map(mfr => (
              <button
                key={mfr.id}
                onClick={() => {
                  setSelectedManufacturer(selectedManufacturer === mfr.name ? '' : mfr.name)
                  const newFilters = activeFilters.filter(f => f.key !== 'manufacturer')
                  if (selectedManufacturer !== mfr.name) newFilters.push({ key: 'manufacturer', value: mfr.name })
                  setActiveFilters(newFilters)
                  setPage(1)
                  const params = buildParams(newFilters, 1)
                  router.push(`${pathname}?${params}`, { scroll: false })
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  selectedManufacturer === mfr.name
                    ? 'bg-green-700 text-white border-green-700'
                    : 'bg-white dark:bg-dark-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-dark-600 hover:border-green-500 hover:text-green-700'
                }`}
              >
                {mfr.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results area */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{t('browse.activeFilters')}</span>
                {activeFilters.map(filter => (
                  <button
                    key={filter.key}
                    onClick={() => removeFilter(filter.key)}
                    className="inline-flex items-center gap-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-full text-sm font-semibold hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                  >
                    {filter.value}
                    <X className="size-3" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <p className="text-gray-600 dark:text-gray-300">
              {loading ? (
                <span className="animate-pulse">{t('browse.resultsLoading')}</span>
              ) : (
                <>
                  <span className="font-bold text-gray-900 dark:text-white">{totalCount}</span> {t('browse.resultsCount')}
                  {page > 1 && (
                    <span className="text-gray-400 dark:text-gray-500 ml-2">
                      {t('browse.resultsPage').replace('{page}', String(page)).replace('{total}', String(totalPages))}
                    </span>
                  )}
                </>
              )}
            </p>
            <div className="flex border border-gray-200 dark:border-dark-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  viewMode === 'grid'
                    ? 'bg-green-700 text-white'
                    : 'bg-white dark:bg-dark-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700'
                }`}
              >
                <Grid3X3 className="size-4" />
                {t('browse.viewGrid')}
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  viewMode === 'list'
                    ? 'bg-green-700 text-white'
                    : 'bg-white dark:bg-dark-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700'
                }`}
              >
                <List className="size-4" />
                {t('browse.viewList')}
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-2 text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  viewMode === 'map'
                    ? 'bg-green-700 text-white'
                    : 'bg-white dark:bg-dark-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700'
                }`}
              >
                <Map className="size-4" />
                {t('browse.viewMap')}
              </button>
            </div>
          </div>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-2xl overflow-hidden">
                <div className="aspect-[4/3] bg-gray-200 dark:bg-dark-700 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-dark-700 rounded animate-pulse w-3/4" />
                  <div className="h-6 bg-gray-200 dark:bg-dark-700 rounded animate-pulse w-1/2" />
                  <div className="h-3 bg-gray-200 dark:bg-dark-700 rounded animate-pulse w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Map view */}
        {!loading && viewMode === 'map' && (
          <div className="h-[600px] rounded-xl overflow-hidden border border-gray-200 dark:border-dark-700">
            <MapView listings={listings} />
          </div>
        )}

        {/* Grid view */}
        {!loading && viewMode === 'grid' && listings.length > 0 && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
          >
            <AnimatePresence>
              {listings.map((listing, i) => (
                <motion.div
                  key={listing.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
                  }}
                >
                  <ListingCard listing={listing} />
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={observerTarget} className="h-10" />
          </motion.div>
        )}

{/* Empty state */}
        {!loading && viewMode === 'grid' && listings.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-dark-700">
            <div className="size-16 rounded-full bg-gray-100 dark:bg-dark-700 flex items-center justify-center mx-auto mb-4">
              <SearchX className="size-7 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('browse.emptyTitle')}</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{t('browse.emptySubtitle')}</p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-700 text-white rounded-lg font-semibold hover:bg-green-800 transition-colors"
              >
                <RotateCcw className="size-4" />
                {t('browse.reset')}
              </button>
            )}
          </div>
        )}

        {/* List view */}
        {!loading && viewMode === 'list' && listings.length > 0 && (
          <div className="flex flex-col gap-3">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="flex items-center gap-4 p-4 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl hover:shadow-lg transition-all"
              >
                <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                  <Image
                    src={(listing.images as string[] | null)?.[0] || '/placeholder.jpg'}
                    alt={listing.title}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                    {listing.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {listing.categories?.name} • {listing.manufacturers?.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {listing.location_city}, {listing.location_country}
                  </p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-lg font-bold text-green-700">
                    {listing.price?.toLocaleString()} {listing.currency === 'EUR' ? '€' : 'RON'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(listing.created_at).toLocaleDateString('ro-RO')}
                  </p>
                </div>
              </div>
            ))}

            {/* Infinite scroll trigger */}
            <div ref={observerTarget} className="h-10" />
          </div>
        )}

{/* Pagination */}
        {!loading && totalPages > 1 && viewMode === 'grid' && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-200 dark:border-dark-600 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-800 hover:bg-gray-50 dark:hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
            >
              <ChevronLeft className="size-4" />
              {t('browse.previous')}
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
                        : 'border border-gray-200 dark:border-dark-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-800 hover:bg-gray-50 dark:hover:bg-dark-700'
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
              className="px-4 py-2 border border-gray-200 dark:border-dark-600 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-800 hover:bg-gray-50 dark:hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
            >
              {t('browse.next')}
              <ChevronRight className="size-4" />
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
          <div className="relative bg-white dark:bg-dark-800 rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="size-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bookmark className="size-7 text-green-700 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('browse.saveSearchTitle')}</h3>
              <p className="text-gray-500 dark:text-gray-400">{t('browse.saveSearchDesc')}</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('browse.saveSearchName')}
                </label>
                <input
                  type="text"
                  value={searchName}
                  onChange={e => setSearchName(e.target.value)}
                  placeholder={t('browse.saveSearchPlaceholder')}
                  className="w-full p-3 border border-gray-200 dark:border-dark-600 rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-dark-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="notifyEmail"
                  defaultChecked
                  className="w-5 h-5 text-green-700 rounded focus:ring-green-500"
                />
                <label htmlFor="notifyEmail" className="text-sm text-gray-700 dark:text-gray-300">
                  {t('browse.saveSearchNotify')}
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setSaveSearchOpen(false)}
                className="flex-1 px-5 py-2.5 border-2 border-gray-200 dark:border-dark-600 rounded-xl font-bold text-sm text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-dark-500 transition-colors"
              >
                {t('common.cancel')}
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
                    <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t('browse.saveSearchSaving')}
                  </>
                ) : (
                  <>
                    <Bookmark className="size-4" />
                    {t('browse.saveSearch')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
