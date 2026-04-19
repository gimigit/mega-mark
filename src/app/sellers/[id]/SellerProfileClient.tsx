'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import Navbar from '@/components/Navbar'
import ReviewForm from '@/components/ReviewForm'
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']
type Listing = Database['public']['Tables']['listings']['Row'] & {
  categories?: Database['public']['Tables']['categories']['Row']
}
type Review = Database['public']['Tables']['reviews']['Row'] & {
  reviewer?: Profile
}

const EU_COUNTRIES: Record<string, string> = {
  RO: 'România', DE: 'Germania', FR: 'Franța', NL: 'Olanda', PL: 'Polonia',
  ES: 'Spania', IT: 'Italia', AT: 'Austria', BE: 'Belgia', HU: 'Ungaria',
  CZ: 'Cehia', DK: 'Danemarca', SE: 'Suedia', PT: 'Portugalia', GR: 'Grecia',
  FI: 'Finlanda'
}

const accountTypeLabels: Record<string, string> = {
  buyer: 'Cumpărător',
  seller: 'Vânzător',
  dealer: 'Dealer',
  admin: 'Administrator'
}

export default function SellerProfileClient() {
  const params = useParams()
  const router = useRouter()
  const sellerId = params.id as string
  const supabase = createClient()
  const { user } = useSupabase()

  const [seller, setSeller] = useState<Profile | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'listings' | 'reviews'>('listings')
  const [showReviewForm, setShowReviewForm] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      // Fetch seller profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sellerId)
        .single()

      if (profileError || !profileData) {
        setError('Vânzătorul nu a fost găsit.')
        setLoading(false)
        return
      }

      setSeller(profileData as Profile)

      // Fetch seller's active listings
      const { data: listingsData } = await supabase
        .from('listings')
        .select('*, categories(id, name, icon)')
        .eq('seller_id', sellerId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      setListings((listingsData || []) as Listing[])

      // Fetch reviews for this seller
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('*, reviewer:profiles!reviews_reviewer_id_fkey(id, full_name, avatar_url)')
        .eq('reviewed_id', sellerId)
        .order('created_at', { ascending: false })
        .limit(10)

      setReviews((reviewsData || []) as Review[])

      setLoading(false)
    }

    fetchData()
  }, [sellerId, supabase])

  const formatPrice = (price: number, currency: string) => {
    const symbol = currency === 'EUR' ? '€' : currency
    return `${symbol}${price.toLocaleString()}`
  }

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

    return (
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className="text-amber-400 text-lg">★</span>
        ))}
        {hasHalfStar && <span className="text-amber-400 text-lg">★</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className="text-gray-300 text-lg">★</span>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-green-700 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !seller) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl block mb-4">❌</span>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{error || 'Vânzătorul nu a fost găsit.'}</h2>
          <Link href="/" className="text-green-700 font-semibold hover:text-green-800">
            ← Înapoi la pagina principală
          </Link>
        </div>
      </div>
    )
  }

  const sellerName = seller.full_name || 'Vânzător'
  const avatarUrl = seller.avatar_url
  const isDealer = seller.role === 'dealer'

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center overflow-hidden relative">
                {avatarUrl ? (
                  <Image src={avatarUrl} alt={sellerName} fill className="object-cover" sizes="128px" />
                ) : (
                  <span className="text-5xl font-black text-green-700">
                    {sellerName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-black text-gray-900">{sellerName}</h1>
                    {seller.is_verified && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold text-white bg-green-600">
                        ✓ Verificat
                      </span>
                    )}
                    {isDealer && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold text-amber-700 bg-amber-100">
                        🏢 Dealer
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 mb-3">
                    {accountTypeLabels[seller.role || 'seller'] || 'Vânzător'}
                  </p>
                </div>
                {user && user.id !== sellerId && (
                  <Link
                    href={`/dashboard/messages`}
                    className="px-5 py-2.5 bg-green-700 text-white rounded-xl font-bold hover:bg-green-800 transition-colors"
                  >
                    Contactează
                  </Link>
                )}
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mb-4">
                {seller.rating_avg !== null && seller.rating_avg > 0 && (
                  <div className="flex items-center gap-2">
                    {renderStars(seller.rating_avg)}
                    <span className="font-bold text-gray-900">
                      {seller.rating_avg.toFixed(1)}
                    </span>
                    <span className="text-gray-500">
                      ({seller.rating_count || 0} recenzii)
                    </span>
                  </div>
                )}
                <div className="text-gray-600">
                  <span className="font-bold">{listings.length}</span> anunțuri active
                </div>
              </div>

              {/* Dealer company info */}
              {isDealer && seller.company_name && (
                <div className="text-gray-700 font-semibold">
                  🏢 {seller.company_name}
                  {seller.vat_number && (
                    <span className="ml-2 text-gray-400 text-sm font-normal">CUI: {seller.vat_number}</span>
                  )}
                </div>
              )}

              {/* Location */}
              {(seller.location_country || seller.location_region) && (
                <div className="text-gray-600">
                  📍 {seller.location_region && `${seller.location_region}, `}
                  {EU_COUNTRIES[seller.location_country || ''] || seller.location_country}
                </div>
              )}

              {/* Bio */}
              {seller.bio && (
                <p className="mt-4 text-gray-700">{seller.bio}</p>
              )}

              {/* Member since */}
              <p className="mt-4 text-sm text-gray-500">
                Membru din {new Date(seller.created_at).toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('listings')}
            className={`px-5 py-2.5 rounded-xl font-bold transition-colors ${
              activeTab === 'listings'
                ? 'bg-green-700 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Anunțuri ({listings.length})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-5 py-2.5 rounded-xl font-bold transition-colors ${
              activeTab === 'reviews'
                ? 'bg-green-700 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Recenzii ({reviews.length})
          </button>
        </div>

        {/* Listings Tab */}
        {activeTab === 'listings' && (
          <div>
            {listings.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <span className="text-5xl block mb-4">📦</span>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Niciun anunț activ</h3>
                <p className="text-gray-500">Acest vânzător nu are anunțuri active momentan.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map(listing => {
                  const images = listing.images as string[] | null
                  const hasImages = images && images.length > 0
                  const categoryIcon = listing.categories?.icon || '🚜'

                  return (
                    <Link
                      key={listing.id}
                      href={`/listings/${listing.id}`}
                      className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all hover:border-green-400"
                    >
                      <div className="relative h-48 bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center overflow-hidden">
                        {hasImages ? (
                          <Image
                            src={images[0]}
                            alt={listing.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        ) : (
                          <span className="text-6xl opacity-50">{categoryIcon}</span>
                        )}
                        {listing.is_featured && (
                          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold text-white bg-amber-500">
                            ⭐ Featured
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 mb-1 group-hover:text-green-700 transition-colors line-clamp-2">
                          {listing.title}
                        </h3>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xl font-black text-green-700">
                            {listing.price != null ? formatPrice(listing.price, listing.currency || 'EUR') : 'Preț la cerere'}
                          </span>
                          {listing.condition && (
                            <span className="text-xs text-gray-500 capitalize">
                              {listing.condition === 'used' ? 'Folosit' : listing.condition}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {/* Leave review */}
            {user && user.id !== sellerId && (
              showReviewForm ? (
                <ReviewForm
                  sellerId={sellerId}
                  onSuccess={() => { setShowReviewForm(false); window.location.reload() }}
                  onCancel={() => setShowReviewForm(false)}
                />
              ) : (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="w-full py-3 border-2 border-dashed border-green-300 rounded-xl text-green-700 font-semibold hover:border-green-500 hover:bg-green-50 transition-colors text-sm"
                >
                  + Lasă o recenzie
                </button>
              )
            )}

            {reviews.length === 0 ? (
              <div className="bg-surface rounded-2xl border border-border p-12 text-center">
                <span className="text-5xl block mb-4">⭐</span>
                <h3 className="text-xl font-bold text-foreground mb-2">Nicio recenzie</h3>
                <p className="text-muted-foreground">Acest vânzător nu are încă recenzii.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                        {review.reviewer?.avatar_url ? (
                          <Image src={review.reviewer.avatar_url} alt="" fill className="object-cover" sizes="48px" />
                        ) : (
                          <span className="text-lg font-bold text-green-700">
                            {(review.reviewer?.full_name || 'U').charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-gray-900">
                            {review.reviewer?.full_name || 'Utilizator anonim'}
                          </span>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={i < (review.rating || 0) ? 'text-amber-400' : 'text-gray-300'}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
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
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
