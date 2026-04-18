'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { MapPin, Star, Clock, Heart, BadgeCheck, Award } from 'lucide-react'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { useCurrencyStore, formatPrice } from '@/store/useCurrencyStore'
import { useFavoritesStore } from '@/store/useFavoritesStore'
import { toast } from 'sonner'
import type { Database } from '@/types/database'

// Helper to check if a date is today
function isUpdatedToday(dateString: string): boolean {
  const date = new Date(dateString)
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

type Listing = Database['public']['Tables']['listings']['Row'] & {
  profiles?: Database['public']['Tables']['profiles']['Row']
  categories?: Database['public']['Tables']['categories']['Row']
}

interface ListingCardProps {
  listing: Listing
  isFavorite?: boolean
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

function formatRelativeDate(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffH = Math.floor(diffMs / 3600000)
  const diffD = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'acum'
  if (diffMin < 60) return `acum ${diffMin}m`
  if (diffH < 24) return `acum ${diffH}h`
  if (diffD === 1) return 'ieri'
  if (diffD < 7) return `acum ${diffD}z`

  const day = date.getDate()
  const months = ['ian', 'feb', 'mar', 'apr', 'mai', 'iun', 'iul', 'aug', 'sep', 'oct', 'nov', 'dec']
  return `${day} ${months[date.getMonth()]}`
}

export default function ListingCard({ listing, isFavorite: initialFavorite = false }: ListingCardProps) {
  const router = useRouter()
  const { user } = useSupabase()
  const favStore = useFavoritesStore()
  // Use store state when hydrated, fallback to prop
  const [isFavorite, setIsFavorite] = useState(
    () => favStore.hydrated ? favStore.has(listing.id) : initialFavorite
  )
  const [isToggling, setIsToggling] = useState(false)

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      router.push('/login')
      return
    }

    if (isToggling) return
    setIsToggling(true)

    try {
      if (isFavorite) {
        const res = await fetch(`/api/favorites?listing_id=${listing.id}`, { method: 'DELETE' })
        if (res.ok) {
          setIsFavorite(false)
          favStore.remove(listing.id)
          toast.success('Anunț eliminat din favorite')
        }
      } else {
        const res = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ listing_id: listing.id }),
        })
        if (res.ok || res.status === 409) {
          setIsFavorite(true)
          favStore.add(listing.id)
          toast.success('Anunț adăugat la favorite')
        }
      }
    } finally {
      setIsToggling(false)
    }
  }

  const images = listing.images as string[] | null
  const hasImages = images && images.length > 0
  const categoryIcon = listing.categories?.icon || '🚜'

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.12)' }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="rounded-2xl"
    >
      <Link
        href={`/listings/${listing.id}`}
        className="group block bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-2xl overflow-hidden shadow-sm hover:border-green-400 dark:hover:border-green-500 transition-colors"
      >
        {/* Image Container */}
        <div className="relative aspect-[4/3] bg-gradient-to-br from-green-100 to-green-50 dark:from-dark-700 dark:to-dark-600 flex items-center justify-center overflow-hidden">
          {hasImages ? (
            <motion.div
              className="absolute inset-0"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <Image
                src={images[0]}
                alt={listing.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              />
            </motion.div>
          ) : (
            <span className="text-6xl opacity-50">{categoryIcon}</span>
          )}

          {/* Favorite Heart Button */}
          <motion.button
            type="button"
            onClick={toggleFavorite}
            whileTap={{ scale: 0.75 }}
            animate={isFavorite ? {
              scale: [1, 1.45, 1],
              rotate: [0, -10, 10, 0],
              transition: { duration: 0.4, ease: 'easeOut' }
            } : {}}
            transition={{ duration: 0.15 }}
            disabled={isToggling}
            className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/80 dark:bg-dark-900/80 hover:bg-white dark:hover:bg-dark-900 transition-colors shadow-sm disabled:opacity-50"
            aria-label="Adaugă la favorite"
          >
            <Heart
              className="w-4 h-4 transition-colors"
              fill={isFavorite ? '#ef4444' : 'none'}
              stroke={isFavorite ? '#ef4444' : 'currentColor'}
            />
          </motion.button>

          {/* Featured Badge */}
          {(listing.is_featured || (listing.updated_at && isUpdatedToday(listing.updated_at))) && (
            <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-sm flex items-center gap-1 ${
              listing.is_featured ? 'bg-amber-500 animate-pulse-subtle' : 'bg-green-600'
            }`}>
              {listing.is_featured && <Award className="w-3.5 h-3.5" />}
              {listing.is_featured ? 'Featured' : isUpdatedToday(listing.updated_at) ? 'Reactualizat' : null}
            </span>
          )}

          {/* Condition Badge */}
          {listing.condition && (
            <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold bg-white/90 dark:bg-dark-900/90 text-gray-700 dark:text-gray-200 shadow-sm">
              {conditionLabels[listing.condition] || listing.condition}
            </span>
          )}

          {/* Price Type Badge */}
          {listing.price_type && listing.price_type !== 'fixed' && (
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
            {listing.price != null ? formatPrice(listing.price, listing.currency as any) : 'Preț la cerere'}
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
              <MapPin className="w-3.5 h-3.5" />
              {listing.location_country || 'UE'}
            </span>
            <span className="flex items-center gap-1">
              {listing.categories?.name || 'Agricultural'}
              {listing.profiles?.is_verified && (
                <span title="Verified Seller">
                  <BadgeCheck className="w-3.5 h-3.5 text-green-600 dark:text-green-400 ml-1" />
                </span>
              )}
            </span>
          </div>

          {/* Seller Rating + Relative Date */}
          <div className="flex items-center justify-between mt-2">
            {listing.profiles?.rating_avg && listing.profiles.rating_avg > 0 ? (
              <div className="flex items-center gap-1 text-xs text-amber-500">
                <Star className="w-3.5 h-3.5 fill-amber-500" />
                <span className="font-semibold">{listing.profiles.rating_avg.toFixed(1)}</span>
                <span className="text-gray-400 dark:text-gray-500">
                  ({listing.profiles.rating_count} reviews)
                </span>
              </div>
            ) : (
              <span />
            )}
            {listing.created_at && (
              <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                <Clock className="w-3 h-3" />
                {formatRelativeDate(listing.created_at)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
