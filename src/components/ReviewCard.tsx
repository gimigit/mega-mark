'use client'

import Link from 'next/link'
import type { Database } from '@/types/database'

type Review = Database['public']['Tables']['reviews']['Row'] & {
  reviewer?: Database['public']['Tables']['profiles']['Row']
}

interface ReviewCardProps {
  review: Review
  showListing?: boolean
  listingTitle?: string
  listingId?: string
}

export default function ReviewCard({ review, showListing, listingTitle, listingId }: ReviewCardProps) {
  const reviewerName = review.reviewer?.full_name || 'Utilizator anonim'
  const avatarUrl = review.reviewer?.avatar_url

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={i < rating ? 'text-amber-400' : 'text-gray-300'}
          >
            ★
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={reviewerName}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-lg font-bold text-green-700">
              {reviewerName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900">{reviewerName}</span>
              {review.reviewer?.is_verified && (
                <span className="text-green-600 text-xs">✓</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {renderStars(review.rating)}
              <span className="text-sm font-bold text-gray-900">{review.rating}/5</span>
            </div>
          </div>

          {showListing && listingTitle && listingId && (
            <Link
              href={`/listings/${listingId}`}
              className="inline-flex items-center gap-1 text-sm text-green-700 hover:text-green-800 mb-2"
            >
              📦 {listingTitle}
            </Link>
          )}

          {review.content && (
            <p className="text-gray-700">{review.content}</p>
          )}

          <p className="text-sm text-gray-500 mt-2">
            {new Date(review.created_at).toLocaleDateString('ro-RO', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </p>
        </div>
      </div>
    </div>
  )
}
