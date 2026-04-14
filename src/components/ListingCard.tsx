'use client'

import Link from 'next/link'
import type { Database } from '@/types/database'

type Listing = Database['public']['Tables']['listings']['Row'] & {
  profiles?: Database['public']['Tables']['profiles']['Row']
  categories?: Database['public']['Tables']['categories']['Row']
}

interface ListingCardProps {
  listing: Listing
}

const conditionLabels: Record<string, string> = {
  new: 'Nou',
  used: 'Folosit',
  refurbished: 'Refurbished',
}

const priceTypeLabels: Record<string, string> = {
  fixed: '',
  negotiable: 'Neg.',
  on_request: 'On Request',
  auction: 'Auction',
}

export default function ListingCard({ listing }: ListingCardProps) {
  const formatPrice = (price: number, currency: string) => {
    const symbol = currency === 'EUR' ? '€' : currency
    return `${symbol}${price.toLocaleString()}`
  }

  const images = listing.images as string[] | null
  const hasImages = images && images.length > 0
  const categoryIcon = listing.categories?.icon || '🚜'

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all hover:border-green-400 dark:hover:border-green-500"
    >
      {/* Image Container */}
      <div className="relative h-48 bg-gradient-to-br from-green-100 to-green-50 dark:from-dark-700 dark:to-dark-600 flex items-center justify-center overflow-hidden">
        {hasImages ? (
          <img
            src={images[0]}
            alt={listing.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="text-6xl opacity-50">{categoryIcon}</span>
        )}

        {/* Featured Badge */}
        {listing.is_featured && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold text-white bg-amber-500 shadow-sm animate-pulse-subtle">
            ⭐ Featured
          </span>
        )}

        {/* Condition Badge */}
        {listing.condition && (
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold bg-white/90 dark:bg-dark-900/90 text-gray-700 dark:text-gray-200 shadow-sm">
            {conditionLabels[listing.condition] || listing.condition}
          </span>
        )}

        {/* Price Type Badge */}
        {listing.price_type !== 'fixed' && (
          <span className="absolute bottom-3 left-3 px-2 py-1 rounded text-xs font-semibold bg-white/90 dark:bg-dark-900/90 text-gray-600 dark:text-gray-300">
            {priceTypeLabels[listing.price_type]}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-bold text-gray-900 dark:text-white mb-1 group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors line-clamp-2">
          {listing.title}
        </h3>

        {/* Price */}
        <div className="text-xl font-black text-green-700 dark:text-green-400 mb-2">
          {formatPrice(listing.price, listing.currency)}
        </div>

        {/* Specs */}
        <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
          {listing.year && (
            <span className="bg-gray-100 dark:bg-dark-700 px-2 py-1 rounded font-medium">
              {listing.year}
            </span>
          )}
          {listing.hours && (
            <span className="bg-gray-100 dark:bg-dark-700 px-2 py-1 rounded font-medium">
              {listing.hours.toLocaleString()}h
            </span>
          )}
          {listing.mileage && (
            <span className="bg-gray-100 dark:bg-dark-700 px-2 py-1 rounded font-medium">
              {listing.mileage.toLocaleString()} km
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 pt-3 border-t border-gray-100 dark:border-dark-700">
          <span className="flex items-center gap-1">
            📍 {listing.location_country || 'UE'}
          </span>
          <span className="flex items-center gap-1">
            {listing.categories?.name || 'Agricultural'}
            {listing.profiles?.is_verified && (
              <span className="text-green-600 dark:text-green-400 ml-1" title="Verified Seller">
                ✓
              </span>
            )}
          </span>
        </div>

        {/* Seller Rating */}
        {listing.profiles?.rating_avg && listing.profiles.rating_avg > 0 && (
          <div className="flex items-center gap-1 mt-2 text-xs text-amber-500">
            <span>★</span>
            <span className="font-semibold">{listing.profiles.rating_avg.toFixed(1)}</span>
            <span className="text-gray-400 dark:text-gray-500">
              ({listing.profiles.rating_count} reviews)
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}
