'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSupabase } from '@/components/providers/SupabaseProvider'

interface ReviewFormProps {
  sellerId: string
  listingId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export default function ReviewForm({ sellerId, listingId, onSuccess, onCancel }: ReviewFormProps) {
  const { user } = useSupabase()
  const supabase = createClient()

  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (rating === 0) {
      setError('Te rugăm să selectezi un rating.')
      return
    }

    setSubmitting(true)
    setError('')

    const { error: submitError } = await supabase
      .from('reviews')
      .insert({
        reviewer_id: user.id,
        reviewed_id: sellerId,
        listing_id: listingId || null,
        rating,
        content: comment.trim() || null,
      })

    setSubmitting(false)

    if (submitError) {
      setError(submitError.message)
    } else {
      // Notify seller about new review
        try {
          // Get listing title if listingId provided
          let listingTitle = undefined
          if (listingId) {
            const { data: listing } = await supabase
              .from('listings')
              .select('title')
              .eq('id', listingId)
              .single()
            listingTitle = listing?.title
          }

          await fetch('/api/notifications/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'review_received',
              data: {
                userId: sellerId,
                reviewerId: user.id,
                reviewerName: user.user_metadata?.full_name || user.email,
                rating,
                listingTitle: listingTitle || '',
              },
            }),
          })
        } catch (notifError) {
          console.error('Failed to send review notification:', notifError)
        }

      onSuccess?.()
      setRating(0)
      setComment('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Lasă o recenzie</h3>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Star Rating */}
      <div className="mb-4">
        <label className="block text-sm font-bold text-gray-700 mb-2">Rating *</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="text-3xl transition-transform hover:scale-110 focus:outline-none"
            >
              <span className={((hoverRating || rating) >= star ? 'text-amber-400' : 'text-gray-300')}>
                ★
              </span>
            </button>
          ))}
        </div>
        <div className="mt-1 text-sm text-gray-500">
          {rating === 0 && 'Selectează un rating'}
          {rating === 1 && 'Foarte nemulțumit'}
          {rating === 2 && 'Nemulțumit'}
          {rating === 3 && 'Neutru'}
          {rating === 4 && 'Mulțumit'}
          {rating === 5 && 'Foarte mulțumit'}
        </div>
      </div>

      {/* Comment */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-gray-700 mb-2">Comentariu</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Descrie experiența ta cu acest vânzător..."
          rows={4}
          maxLength={500}
          className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/10 outline-none transition-all resize-none"
        />
        <p className="text-xs text-gray-400 mt-1">{comment.length} / 500 caractere</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 border-2 border-gray-200 rounded-xl font-bold text-sm text-gray-700 hover:border-gray-400 transition-colors"
          >
            Anulează
          </button>
        )}
        <button
          type="submit"
          disabled={submitting || rating === 0}
          className="px-5 py-2.5 bg-green-700 text-white rounded-xl font-bold text-sm hover:bg-green-800 transition-colors disabled:opacity-50"
        >
          {submitting ? 'Se trimite...' : 'Trimite recenzia'}
        </button>
      </div>
    </form>
  )
}
