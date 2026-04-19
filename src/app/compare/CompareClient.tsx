'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, X, GitCompare, Share2 } from 'lucide-react'
import { useCompareStore } from '@/store/useCompareStore'
import { formatPrice } from '@/store/useCurrencyStore'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Database } from '@/types/database'

type Listing = Database['public']['Tables']['listings']['Row'] & {
  categories?: Database['public']['Tables']['categories']['Row']
  profiles?: Database['public']['Tables']['profiles']['Row']
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

type RowDef = {
  label: string
  render: (l: Listing) => string | null | undefined
}

const rows: RowDef[] = [
  { label: 'Categorie', render: (l) => l.categories?.name },
  { label: 'Preț', render: (l) => l.price != null ? formatPrice(l.price, l.currency as 'EUR' | 'RON') : 'La cerere' },
  { label: 'Tip', render: (l) => l.listing_type ? listingTypeLabels[l.listing_type] : null },
  { label: 'Stare', render: (l) => l.condition ? conditionLabels[l.condition] : null },
  { label: 'An fabricație', render: (l) => l.year?.toString() },
  { label: 'Ore funcționare', render: (l) => l.hours != null ? `${l.hours.toLocaleString()} h` : null },
  { label: 'Kilometraj', render: (l) => l.mileage != null ? `${l.mileage.toLocaleString()} km` : null },
  { label: 'Putere (CP)', render: (l) => l.power_hp != null ? `${l.power_hp} CP` : null },
  { label: 'Motor', render: (l) => l.engine_type },
  { label: 'Transmisie', render: (l) => l.transmission },
  { label: 'Greutate', render: (l) => l.weight_kg != null ? `${l.weight_kg.toLocaleString()} kg` : null },
  { label: 'Locație', render: (l) => [l.location_city, l.location_region, l.location_country].filter(Boolean).join(', ') || null },
  { label: 'Vânzător', render: (l) => l.profiles?.full_name },
  { label: 'Vizualizări', render: (l) => l.views_count?.toLocaleString() },
]

function highlight(values: (string | null | undefined)[]): boolean[] {
  const defined = values.filter(Boolean)
  if (defined.length < 2) return values.map(() => false)
  return values.map(() => false)
}

export default function CompareClient() {
  const searchParams = useSearchParams()
  const { listings: storeListings, remove, clear } = useCompareStore()
  const [listings, setListings] = useState<Listing[]>(storeListings)
  const supabase = createClient()

  // Load from ?ids= URL param (shared compare link)
  useEffect(() => {
    const ids = searchParams.get('ids')
    if (!ids) { setListings(storeListings); return }
    const idList = ids.split(',').filter(Boolean).slice(0, 3)
    if (idList.length === 0) { setListings(storeListings); return }

    supabase
      .from('listings')
      .select('*, categories(id, name, slug, icon), profiles:seller_id(id, full_name, avatar_url, is_verified, is_dealer, company_name, rating_avg, rating_count)')
      .in('id', idList)
      .then(({ data }) => {
        if (data && data.length > 0) setListings(data as unknown as Listing[])
      })
  }, [searchParams])

  // Sync with store when no URL param
  useEffect(() => {
    if (!searchParams.get('ids')) setListings(storeListings)
  }, [storeListings, searchParams])

  const shareUrl = () => {
    const ids = listings.map(l => l.id).join(',')
    const url = `${window.location.origin}/compare?ids=${ids}`
    navigator.clipboard.writeText(url)
    toast.success('Link copiat în clipboard!')
  }

  if (listings.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-4">
        <GitCompare className="w-16 h-16 text-gray-300 dark:text-gray-600" />
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Niciun anunț de comparat</h1>
          <p className="text-gray-500 dark:text-gray-400">Adaugă anunțuri la comparare folosind iconița <GitCompare className="inline w-4 h-4" /> de pe carduri.</p>
        </div>
        <Link href="/browse" className="px-6 py-2.5 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-xl transition-colors">
          Explorează anunțuri
        </Link>
      </div>
    )
  }

  const colCount = listings.length

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link href="/browse" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display">
                Comparator utilaje
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{colCount} anunț{colCount !== 1 ? 'uri' : ''} selectat{colCount !== 1 ? 'e' : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {listings.length >= 2 && (
              <button
                onClick={shareUrl}
                className="flex items-center gap-1.5 text-sm text-green-700 dark:text-green-400 hover:text-green-800 font-semibold transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Distribuie
              </button>
            )}
            <button
              onClick={clear}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              Golește tot
            </button>
          </div>
        </div>

        {/* Compare Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            {/* Image row */}
            <thead>
              <tr>
                <th className="w-36 min-w-[120px]" />
                {listings.map((l) => {
                  const images = l.images as string[] | null
                  return (
                    <th key={l.id} className="p-3 align-top">
                      <div className="relative">
                        {/* Remove button */}
                        <button
                          onClick={() => remove(l.id)}
                          className="absolute -top-1 -right-1 z-10 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-md"
                          aria-label="Elimină din comparare"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>

                        {/* Image */}
                        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-green-100 dark:bg-dark-700 mb-3">
                          {images?.[0] ? (
                            <Image src={images[0]} alt={l.title} fill className="object-cover" sizes="300px" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-40">🚜</div>
                          )}
                        </div>

                        {/* Title */}
                        <Link
                          href={`/listings/${l.id}`}
                          className="block font-bold text-gray-900 dark:text-white hover:text-green-700 dark:hover:text-green-400 transition-colors line-clamp-2 text-sm"
                        >
                          {l.title}
                        </Link>
                      </div>
                    </th>
                  )
                })}
                {/* Empty slots if < 3 */}
                {Array.from({ length: 3 - colCount }).map((_, i) => (
                  <th key={`empty-${i}`} className="p-3 align-top opacity-0 pointer-events-none" />
                ))}
              </tr>
            </thead>

            {/* Spec rows */}
            <tbody>
              {rows.map((row, idx) => {
                const values = listings.map(row.render)
                const hasAnyValue = values.some(Boolean)
                if (!hasAnyValue) return null

                return (
                  <tr
                    key={row.label}
                    className={idx % 2 === 0 ? 'bg-gray-50 dark:bg-dark-800/50' : 'bg-white dark:bg-transparent'}
                  >
                    <td className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-dark-700">
                      {row.label}
                    </td>
                    {listings.map((l, li) => {
                      const val = row.render(l)
                      return (
                        <td key={l.id} className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200 text-center">
                          {val ?? <span className="text-gray-300 dark:text-gray-600">—</span>}
                        </td>
                      )
                    })}
                    {Array.from({ length: 3 - colCount }).map((_, i) => (
                      <td key={`empty-${i}`} />
                    ))}
                  </tr>
                )
              })}
            </tbody>

            {/* CTA row */}
            <tfoot>
              <tr>
                <td />
                {listings.map((l) => (
                  <td key={l.id} className="px-4 py-4 text-center">
                    <Link
                      href={`/listings/${l.id}`}
                      className="inline-block px-5 py-2 bg-green-700 hover:bg-green-800 text-white text-sm font-semibold rounded-xl transition-colors"
                    >
                      Vezi anunțul
                    </Link>
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>

        {listings.length < 3 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Poți adăuga încă {3 - listings.length} anunț{3 - listings.length !== 1 ? 'uri' : ''} pentru comparare.
            </p>
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-green-600 text-green-700 dark:text-green-400 font-semibold rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors text-sm"
            >
              <GitCompare className="w-4 h-4" />
              Adaugă mai multe
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
