'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, Filter, ChevronDown, MapPin, Eye, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import type { Database } from '@/types/database'

type Listing = Database['public']['Tables']['listings']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row']
  categories: Database['public']['Tables']['categories']['Row']
}

type ListingsResponse = {
  listings: Listing[]
  totalCount: number
  totalPages: number
}

interface BrowseByCategoryCountyProps {
  categoryId: string
  categoryName: string
  countySlug: string
  countyName: string
}

const EU_COUNTRIES = [
  { code: 'RO', name: 'Romania' },
  { code: 'DE', name: 'Germania' },
  { code: 'FR', name: 'Franta' },
  { code: 'NL', name: 'Olanda' },
  { code: 'PL', name: 'Polonia' },
  { code: 'ES', name: 'Spania' },
  { code: 'IT', name: 'Italia' },
  { code: 'AT', name: 'Austria' },
  { code: 'BE', name: 'Belgia' },
  { code: 'HU', name: 'Ungaria' },
  { code: 'CZ', name: 'Cehia' },
  { code: 'DK', name: 'Danemarca' },
  { code: 'SE', name: 'Suedia' },
  { code: 'PT', name: 'Portugalia' },
  { code: 'GR', name: 'Grecia' },
  { code: 'FI', name: 'Finlanda' },
]

export default function BrowseByCategoryCounty({
  categoryId,
  categoryName,
  countySlug,
  countyName,
}: BrowseByCategoryCountyProps) {
  const [listings, setListings] = useState<Listing[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [isPending, startTransition] = useTransition()

  const [filters, setFilters] = useState({
    country: 'all',
    condition: 'all',
    priceMin: '',
    priceMax: '',
    sort: 'featured',
  })

  const fetchListings = async (page: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        category: categoryId,
        county: countySlug,
      })

      if (filters.country !== 'all') params.set('country', filters.country)
      if (filters.condition !== 'all') params.set('condition', filters.condition)
      if (filters.priceMin) params.set('priceMin', filters.priceMin)
      if (filters.priceMax) params.set('priceMax', filters.priceMax)
      params.set('sort', filters.sort)

      const res = await fetch(`/api/listings?${params}`)
      const data: ListingsResponse = await res.json()

      setListings(data.listings || [])
      setTotalCount(data.totalCount || 0)
      setTotalPages(data.totalPages || 0)
    } catch (error) {
      console.error('Failed to fetch listings:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    startTransition(() => {
      fetchListings(currentPage)
    })
  }, [categoryId, countySlug, currentPage, filters])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const handleCountryChange = (value: string | null) => {
    setFilters(prev => ({ ...prev, country: value || 'all' }))
    setCurrentPage(1)
  }

  const handleConditionChange = (value: string | null) => {
    setFilters(prev => ({ ...prev, condition: value || 'all' }))
    setCurrentPage(1)
  }

  const handleSortChange = (value: string | null) => {
    setFilters(prev => ({ ...prev, sort: value || 'featured' }))
    setCurrentPage(1)
  }

  const formatPrice = (price: number | null, currency: string | null) => {
    if (!price) return 'Preț neprecizat'
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: currency || 'EUR',
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <section className="py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-4">
              {categoryName} în {countyName} — {totalCount} anunțuri
            </h2>
          </div>

          <div className="flex flex-wrap gap-3">
            <Select value={filters.country} onValueChange={handleCountryChange}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Țară" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toate țările</SelectItem>
                {EU_COUNTRIES.map(c => (
                  <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.condition} onValueChange={handleConditionChange}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Stare" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toate stările</SelectItem>
                <SelectItem value="new">Nou</SelectItem>
                <SelectItem value="used">Folosit</SelectItem>
                <SelectItem value="refurbished">Recondiționat</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.sort} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sortare" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Recomandate</SelectItem>
                <SelectItem value="newest">Cele mai noi</SelectItem>
                <SelectItem value="price_asc">Preț: crescător</SelectItem>
                <SelectItem value="price_desc">Preț: descrescător</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              Nu sunt anunțuri pentru {categoryName} în {countyName} momentan.
            </p>
            <p className="text-muted-foreground mt-2">
              Fii primul care publică un anunț!
            </p>
            <Link href="/listings/create">
              <Button className="mt-4">Publică anunț</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map(listing => (
              <Link
                key={listing.id}
                href={`/listings/${listing.id}`}
                className="group block bg-card rounded-xl border overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="relative h-48 bg-muted">
                  {(listing.images as string[] | null) && (listing.images as string[] | null)?.[0] ? (
                    <Image
                      src={(listing.images as string[] | null)?.[0] || ''}
                      alt={listing.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <span>Fără imagine</span>
                    </div>
                  )}
                  {listing.is_featured && (
                    <Badge className="absolute top-2 left-2 bg-amber-500">
                      Recomandat
                    </Badge>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold truncate group-hover:text-green-600 transition-colors">
                    {listing.title}
                  </h3>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {formatPrice(listing.price, listing.currency)}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <MapPin className="size-4" />
                    <span>{listing.location_country || 'N/A'}</span>
                    {listing.year && (
                      <span className="ml-auto">{listing.year}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="size-4" />
                      {listing.views_count || 0}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              Înapoi
            </Button>
            <span className="flex items-center px-4">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              Următorul
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
