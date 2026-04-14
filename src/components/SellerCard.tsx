'use client'

import Link from 'next/link'
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

const EU_COUNTRIES: Record<string, string> = {
  RO: 'România', DE: 'Germania', FR: 'Franța', NL: 'Olanda', PL: 'Polonia',
  ES: 'Spania', IT: 'Italia', AT: 'Austria', BE: 'Belgia', HU: 'Ungaria',
  CZ: 'Cehia', DK: 'Danemarca', SE: 'Suedia', PT: 'Portugalia', GR: 'Grecia',
  FI: 'Finlanda'
}

interface SellerCardProps {
  seller: Profile
  listingCount?: number
  compact?: boolean
  onContact?: () => void
}

export default function SellerCard({ seller, listingCount, compact = false, onContact }: SellerCardProps) {
  const sellerName = seller.full_name || 'Vânzător'
  const avatarUrl = seller.avatar_url
  const isDealer = seller.account_type === 'dealer'

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

    return (
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className="text-amber-400 text-sm">★</span>
        ))}
        {hasHalfStar && <span className="text-amber-400 text-sm">★</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className="text-gray-300 text-sm">★</span>
        ))}
      </div>
    )
  }

  if (compact) {
    return (
      <Link
        href={`/sellers/${seller.id}`}
        className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center overflow-hidden flex-shrink-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt={sellerName} className="w-full h-full object-cover rounded-full" />
          ) : (
            <span className="text-sm font-bold text-green-700">
              {sellerName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900 truncate">{sellerName}</span>
            {seller.is_verified && (
              <span className="text-green-600 text-xs">✓</span>
            )}
          </div>
          {seller.rating_avg !== null && seller.rating_avg > 0 && (
            <div className="flex items-center gap-1">
              {renderStars(seller.rating_avg)}
              <span className="text-xs text-gray-500">({seller.rating_count || 0})</span>
            </div>
          )}
        </div>
      </Link>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <Link href={`/sellers/${seller.id}`} className="relative">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt={sellerName} className="w-full h-full object-cover rounded-full" />
            ) : (
              <span className="text-xl font-bold text-green-700">
                {sellerName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          {seller.is_verified && (
            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-xs">
              ✓
            </span>
          )}
        </Link>
        <div>
          <Link href={`/sellers/${seller.id}`} className="font-bold text-gray-900 hover:text-green-700 transition-colors">
            {sellerName}
          </Link>
          <div className="flex items-center gap-2 mt-0.5">
            {isDealer && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold text-amber-700 bg-amber-50">
                🏢 Dealer
              </span>
            )}
            {seller.rating_avg !== null && seller.rating_avg > 0 && (
              <div className="flex items-center gap-1">
                {renderStars(seller.rating_avg)}
                <span className="text-sm font-bold text-gray-900">
                  {seller.rating_avg.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        {seller.location_country && (
          <div className="flex items-center gap-2 text-gray-600">
            <span>📍</span>
            <span>
              {seller.location_region && `${seller.location_region}, `}
              {EU_COUNTRIES[seller.location_country] || seller.location_country}
            </span>
          </div>
        )}
        {listingCount !== undefined && (
          <div className="flex items-center gap-2 text-gray-600">
            <span>📦</span>
            <span>{listingCount} anunțuri active</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-gray-500 text-xs">
          <span>📅</span>
          <span>
            Membru din {new Date(seller.created_at).toLocaleDateString('ro-RO', { month: 'short', year: 'numeric' })}
          </span>
        </div>
      </div>

      {onContact && (
        <button
          onClick={onContact}
          className="w-full mt-4 px-4 py-2.5 bg-green-700 text-white rounded-xl font-bold text-sm hover:bg-green-800 transition-colors"
        >
          📩 Contactează vânzătorul
        </button>
      )}
    </div>
  )
}
