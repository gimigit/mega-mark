/**
 * Listing Quality Score Calculator
 * 
 * Scores a listing 0-100 based on several factors:
 * - Images: 20pts (has 3+ images)
 * - Description: 20pts (50+ chars)
 * - Specs: 20pts (has 3+ spec fields)
 * - Competitive price: 20pts (has price, < median or "negotiable")
 * - Video: 20pts (has video or video_url)
 */

import type { Json } from '@/types/database'

interface ListingQualityInput {
  images?: string[] | null
  videos?: string[] | null
  video_url?: string | null
  description?: string | null
  specs?: Json | null
  price?: number | null
  listing_type?: string | null
}

/**
 * Calculate quality score for a listing
 * Returns { score: number, factors: string[] }
 */
export function calculateQualityScore(listing: ListingQualityInput): { score: number; factors: string[] } {
  const factors: string[] = []
  let score = 0

  // 1. Images (20pts) - has 3+ images
  const images = listing.images as string[] | null
  if (images && images.length >= 3) {
    score += 20
    factors.push('poze')
  } else if (images && images.length > 0) {
    score += 10 // Partial credit for 1-2 images
    factors.push('poze_partial')
  }

  // 2. Description (20pts) - 50+ characters
  const description = listing.description
  if (description && description.length >= 50) {
    score += 20
    factors.push('descriere')
  } else if (description && description.length >= 20) {
    score += 10
    factors.push('descriere_partial')
  }

  // 3. Specs (20pts) - has 3+ spec fields
  const specs = listing.specs as Json
  if (specs && typeof specs === 'object' && !Array.isArray(specs)) {
    const specObj = specs as Record<string, Json>
    const specCount = Object.keys(specObj).filter(k => specObj[k] !== null && specObj[k] !== '').length
    if (specCount >= 3) {
      score += 20
      factors.push('specificatii')
    } else if (specCount >= 1) {
      score += Math.round((specCount / 3) * 20)
      factors.push('specificatii_partial')
    }
  }

  // 4. Video (20pts) - has video or video_url
  const videos = listing.videos as string[] | null
  const videoUrl = listing.video_url
  if ((videos && videos.length > 0) || videoUrl) {
    score += 20
    factors.push('video')
  }

  // 5. Price (20pts) - has price, not on_request for sale
  const price = listing.price
  const listingType = listing.listing_type
  if (listingType === 'sale' && price && price > 0) {
    score += 20
    factors.push('pret')
  } else if (listingType !== 'sale' || price === null) {
    // For auction, rent, etc. give partial credit if they have any price info
    score += 10
    factors.push('pret_partial')
  }

  return { score: Math.min(100, score), factors }
}

/**
 * Get color class based on score
 */
export function getQualityColor(score: number): string {
  if (score >= 80) return 'text-green-600 bg-green-50 border-green-200'
  if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200'
  return 'text-red-600 bg-red-50 border-red-200'
}

/**
 * Get quality label based on score
 */
export function getQualityLabel(score: number): string {
  if (score >= 80) return 'Calitate bună'
  if (score >= 60) return 'Calitate medie'
  return 'Calitate redusă'
}