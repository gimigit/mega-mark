'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import ReviewCard from './ReviewCard'
import type { Database } from '@/types/database'

type Review = Database['public']['Tables']['reviews']['Row'] & {
  reviewer?: Database['public']['Tables']['profiles']['Row']
  listing?: Database['public']['Tables']['listings']['Row']
}

interface ReviewsListProps {
  sellerId: string
  limit?: number
  showAll?: boolean
}

export default function ReviewsList({ sellerId, limit = 10, showAll = false }: ReviewsListProps) {
  const supabase = createClient()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(1)

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          reviewer:profiles!reviews_reviewer_id_fkey(id, full_name, avatar_url, is_verified),
          listing:listings(id, title)
        `)
        .eq('reviewee_id', sellerId)
        .order('created_at', { ascending: false })
        .range(0, limit - 1)

      if (!error && data) {
        setReviews(data as Review[])
        setHasMore(data.length === limit)
      }
      
      setLoading(false)
    }

    fetchReviews()
  }, [sellerId, limit, supabase])

  const loadMore = async () => {
    const nextPage = page + 1
    const { data } = await supabase
      .from('reviews')
      .select(`
        *,
        reviewer:profiles!reviews_reviewer_id_fkey(id, full_name, avatar_url, is_verified),
        listing:listings(id, title)
      `)
      .eq('reviewee_id', sellerId)
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1)

    if (data && data.length > 0) {
      setReviews([...reviews, ...data as Review[]])
      setPage(nextPage)
      setHasMore(data.length === limit)
    } else {
      setHasMore(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-200" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
        <span className="text-4xl block mb-3">⭐</span>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Nicio recenzie încă</h3>
        <p className="text-gray-500">Acest vânzător nu a primit recenzii momentan.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewCard
          key={review.id}
          review={review}
          showListing={!!review.listing}
          listingTitle={review.listing?.title}
          listingId={review.listing?.id}
        />
      ))}

      {hasMore && showAll && (
        <div className="text-center pt-4">
          <button
            onClick={loadMore}
            className="px-6 py-2.5 border-2 border-gray-200 rounded-xl font-bold text-sm text-gray-700 hover:border-green-500 hover:text-green-700 transition-colors"
          >
            Vezi mai multe recenzii
          </button>
        </div>
      )}
    </div>
  )
}
