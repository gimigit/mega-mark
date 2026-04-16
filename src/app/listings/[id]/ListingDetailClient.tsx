'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { format } from 'date-fns'
import { ro } from 'date-fns/locale'
import { toast } from 'sonner'
import type { Database } from '@/types/database'
import PhoneReveal from '@/components/PhoneReveal'
import ShareButton from '@/components/ShareButton'

type Listing = Database['public']['Tables']['listings']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row']
  categories: Database['public']['Tables']['categories']['Row']
}

export default function ListingDetailClient({ listingId }: { listingId: string }) {
  const router = useRouter()
  const { user } = useSupabase()
  const supabase = createClient()
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [favorite, setFavorite] = useState(false)
  const [favLoading, setFavLoading] = useState(false)
  const [activeImage, setActiveImage] = useState(0)
  const [showContactModal, setShowContactModal] = useState(false)
  const [messageContent, setMessageContent] = useState('')
  const [sendLoading, setSendLoading] = useState(false)

  useEffect(() => {
    const fetchListing = async () => {
      const { data, error } = await supabase
        .from('listings')
        .select(
          '*, profiles(full_name, avatar_url, rating_avg, verified, location_country, phone), categories(name, icon)'
        )
        .eq('id', listingId)
        .single()

      if (error) {
        setError('Anunțul nu a fost găsit.')
      } else {
        setListing(data as Listing)
      }
      setLoading(false)
    }

    fetchListing()
  }, [listingId, supabase])

  useEffect(() => {
    if (!user || !listingId) return
    const checkFav = async () => {
      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('listing_id', listingId)
        .single()
      setFavorite(!!data)
    }
    checkFav()
  }, [user, listingId, supabase])

   const toggleFavorite = async () => {
    if (!user) {
      window.location.href = '/login'
      return
    }
    setFavLoading(true)
    if (favorite) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('listing_id', listingId)
      setFavorite(false)
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, listing_id: listingId })
      setFavorite(true)

      // Notify seller that their listing was favorited
      if (listing) {
        try {
          await fetch('/api/notifications/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'listing_favorited',
              data: {
                listingId: listingId,
                sellerId: listing.seller_id,
                favoriterName: user.user_metadata?.full_name || user.email,
              },
            }),
          })
        } catch (notifError) {
          console.error('Failed to send favorite notification:', notifError)
        }
      }
    }
    setFavLoading(false)
  }

  const handleContactClick = () => {
    if (!user) {
      router.push(`/login?redirect=/listings/${listingId}`)
      return
    }
    if (!listing) {
      toast.error('Anunțul nu a fost încărcat.')
      return
    }
    if (user.id === listing.seller_id) {
      toast.error('Nu poți trimite mesaje către tine însuți.')
      return
    }
    setShowContactModal(true)
  }

  const handleSendMessage = async () => {
    if (!messageContent.trim()) {
      toast.error('Te rugăm să scrii un mesaj.')
      return
    }
    if (!user || !listing) return

    setSendLoading(true)
    const { error } = await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: listing.seller_id,
      listing_id: listingId,
      content: messageContent.trim(),
    })

      if (error) {
        toast.error('Eroare la trimiterea mesajului. Încearcă din nou.')
      } else {
        toast.success('Mesaj trimis!')
        setShowContactModal(false)
        setMessageContent('')

        // Notify seller via in-app notification and email
        try {
          await fetch('/api/notifications/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'message_received',
              data: {
                userId: listing.seller_id,
                senderName: user.user_metadata?.full_name || user.email,
                messagePreview: messageContent.slice(0, 100),
                listingTitle: listing.title,
              },
            }),
          })
        } catch (notifError) {
          console.error('Failed to send notification:', notifError)
        }
      }
      setSendLoading(false)
  }

  const handleCloseModal = () => {
    setShowContactModal(false)
    setMessageContent('')
  }

  const getShareUrl = () => {
    if (typeof window === 'undefined') return ''
    return window.location.href
  }

  const getShareTitle = () => {
    return listing ? `${listing.title} | Mega-Mark` : 'Mega-Mark'
  }

  const getShareDescription = () => {
    if (!listing) return ''
    const parts = []
    if (listing.year) parts.push(`${listing.year}`)
    if (listing.location_country) parts.push(`${listing.location_country}`)
    if (listing.condition) parts.push(`${listing.condition === 'new' ? 'Nou' : listing.condition === 'used' ? 'Folosit' : 'Refurbished'}`)
    return `€${listing.price?.toLocaleString() ?? 'la cerere'} — ${parts.join(' · ')}`
  }

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}`
    window.open(url, '_blank', 'width=600,height=400')
  }

  const shareOnTwitter = () => {
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(getShareUrl())}&text=${encodeURIComponent(getShareTitle())}`
    window.open(url, '_blank', 'width=600,height=400')
  }

  const shareOnWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(getShareTitle() + ' ' + getShareUrl())}`
    window.open(url, '_blank')
  }

  const shareOnLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getShareUrl())}`
    window.open(url, '_blank', 'width=600,height=400')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-700 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Se încarcă...</p>
        </div>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <span className="text-6xl block mb-4">🔍</span>
          <h1 className="text-2xl font-black text-gray-900 mb-2">Anunț negăsit</h1>
          <p className="text-gray-500 mb-6">{error || 'Acest anunț nu mai există.'}</p>
          <Link href="/browse" className="inline-block bg-green-700 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-800 transition-colors">
            ← Înapoi la anunțuri
          </Link>
        </div>
      </div>
    )
  }

  const images = listing.images as string[] | null
  const conditionLabels: Record<string, string> = {
    new: 'Nou',
    used: 'Folosit',
    refurbished: 'Refurbished',
  }
  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    pending: 'bg-amber-100 text-amber-700',
    sold: 'bg-red-100 text-red-700',
    draft: 'bg-gray-100 text-gray-600',
  }

  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: listing.title,
    description: listing.description || '',
    offers: {
      '@type': 'Offer',
      price: listing.price,
      priceCurrency: listing.currency || 'EUR',
      availability: listing.status === 'active' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
    ...(images && images.length > 0 && { image: images }),
    ...(listing.year && { productionDate: listing.year.toString() }),
    ...(listing.condition && { condition: `https://schema.org/${listing.condition === 'new' ? 'NewCondition' : listing.condition === 'used' ? 'UsedCondition' : 'RefurbishedCondition'}` }),
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-8">
          <Link href="/" className="text-2xl font-black text-green-800 flex items-center gap-1">
            Mega<em className="text-amber-500 not-italic">Mark</em>
          </Link>
          <div className="hidden md:flex items-center gap-6 ml-auto">
            <Link href="/browse" className="text-gray-600 hover:text-green-700 font-medium transition-colors">Browse</Link>
            <Link href="/sell" className="text-gray-600 hover:text-green-700 font-medium transition-colors">Sell</Link>
            {user ? (
              <Link href="/dashboard" className="bg-green-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-green-800 transition-colors">Dashboard</Link>
            ) : (
              <Link href="/login" className="bg-green-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-green-800 transition-colors">Sign In</Link>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/browse" className="hover:text-green-700 transition-colors">Anunțuri</Link>
          <span>/</span>
          <span>{listing.categories?.name}</span>
          <span>/</span>
          <span className="text-gray-900 font-medium">{listing.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              {images && images.length > 0 ? (
                <>
                  <div className="relative bg-gray-100 aspect-[16/9] flex items-center justify-center">
                    <Image
                      src={images[activeImage]}
                      alt={listing.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 800px"
                      className="max-h-full max-w-full object-contain"
                    />
                    <span className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold text-white ${listing.status ? statusColors[listing.status] : 'bg-gray-500'}`}>
                      {(listing.status || 'unknown').toUpperCase()}
                    </span>
                  </div>
                  {images.length > 1 && (
                    <div className="flex gap-2 p-3 overflow-x-auto">
                      {images.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImage(i)}
                          className={`w-20 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-colors ${i === activeImage ? 'border-green-600' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                          <Image src={img} alt="" fill sizes="80px" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="aspect-[16/9] bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center">
                  <span className="text-7xl opacity-50">{listing.categories?.icon || '🚜'}</span>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Detalii</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {listing.year && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xs font-bold text-gray-400 uppercase mb-1">An</div>
                    <div className="text-lg font-black text-gray-900">{listing.year}</div>
                  </div>
                )}
                {listing.hours && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xs font-bold text-gray-400 uppercase mb-1">Ore</div>
                    <div className="text-lg font-black text-gray-900">{listing.hours.toLocaleString()}</div>
                  </div>
                )}
                {listing.condition && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xs font-bold text-gray-400 uppercase mb-1">Stare</div>
                    <div className="text-lg font-black text-gray-900">{conditionLabels[listing.condition]}</div>
                  </div>
                )}
                {listing.location_region && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xs font-bold text-gray-400 uppercase mb-1">Regiune</div>
                    <div className="text-lg font-black text-gray-900">{listing.location_region}</div>
                  </div>
                )}
                {listing.location_country && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xs font-bold text-gray-400 uppercase mb-1">Țară</div>
                    <div className="text-lg font-black text-gray-900">{listing.location_country}</div>
                  </div>
                )}
                {listing.mileage && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xs font-bold text-gray-400 uppercase mb-1">KM</div>
                    <div className="text-lg font-black text-gray-900">{listing.mileage.toLocaleString()}</div>
                  </div>
                )}
              </div>

              {listing.description && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Descriere</h3>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{listing.description}</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="text-sm text-gray-500 mb-1">{listing.listing_type === 'sale' ? 'Preț' : listing.listing_type === 'rent' ? 'Preț/lună' : 'Preț/zi'}</div>
              <div className="text-3xl font-black text-green-700 mb-1">
                {listing.price != null ? `€${listing.price.toLocaleString()}` : 'Preț la cerere'}
                {listing.price_type === 'negotiable' && <span className="text-sm font-normal text-gray-400 ml-2">negociabil</span>}
              </div>
              <div className="text-sm text-gray-400 mb-5">
                {listing.categories?.name} · {listing.year || '—'} · ID #{listing.id.slice(0, 8)}
              </div>

              <h1 className="text-xl font-black text-gray-900 mb-5">{listing.title}</h1>

              <div className="space-y-3">
                <button
                  onClick={handleContactClick}
                  className="w-full py-3 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-xl font-bold text-base hover:shadow-lg hover:shadow-green-700/30 transition-all"
                >
                  💬 Contactează vânzătorul
                </button>
                <button
                  onClick={toggleFavorite}
                  disabled={favLoading}
                  className={`w-full py-3 border-2 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 ${favorite ? 'border-red-300 bg-red-50 text-red-600 hover:bg-red-100' : 'border-gray-200 text-gray-700 hover:border-red-400 hover:text-red-500 hover:bg-red-50'}`}
                >
                  {favorite ? '❤️ Salbat din favorite' : '🤍 Adaugă la favorite'}
                </button>
              </div>

              <div className="mt-4 border-t border-gray-100 pt-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Distribuie</p>
                <ShareButton
                  title={getShareTitle()}
                  url={getShareUrl() || `${process.env.NEXT_PUBLIC_SITE_URL || ''}/listings/${listingId}`}
                />
              </div>

              {listing.listing_type !== 'sale' && (
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
                  ℹ️ Pentru {listing.listing_type === 'rent' ? 'închiriere' : 'lease'}, contactează vânzătorul pentru detalii.
                </div>
              )}
            </div>

            {listing.profiles && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Vânzător</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-green-700 rounded-full flex items-center justify-center text-white text-xl font-black">
                    {listing.profiles.full_name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 flex items-center gap-2">
                      {listing.profiles.full_name}
                      {listing.profiles.is_verified && <span className="text-blue-500 text-sm">✓</span>}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      📍 {listing.profiles.location_country}
                      {listing.profiles.rating_avg && (
                        <span className="ml-2">⭐ {Number(listing.profiles.rating_avg).toFixed(1)}</span>
                      )}
                    </div>
                  </div>
                </div>
                <Link
                  href={`/sellers/${listing.seller_id}`}
                  className="block text-center py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:border-green-600 hover:text-green-700 transition-colors"
                >
                  Vezi profilul vânzătorului
                </Link>
                {listing.profiles?.phone && (
                  <div className="mt-3">
                    <PhoneReveal phone={listing.profiles.phone} />
                  </div>
                )}
              </div>
            )}

            <div className="text-center text-xs text-gray-400 space-y-1">
              <p>Publicat: {listing.created_at ? format(new Date(listing.created_at), 'd MMMM yyyy', { locale: ro }) : '—'}</p>
               <p>Vizualizări: {listing.views_count || 0}</p>
              {user?.id === listing.seller_id && (
                <div className="mt-3 space-y-2">
                  <Link href={`/listings/${listing.id}/edit`} className="block bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-200 transition-colors">
                    ✏️ Editează anunțul
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleCloseModal}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              💬 Trimite mesaj
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Mesaj despre: <span className="font-medium text-gray-700">{listing.title}</span>
            </p>
            <textarea
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder="Scrie mesajul tău aici..."
              rows={5}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleCloseModal}
                className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-bold text-sm text-gray-700 hover:border-gray-400 transition-colors"
              >
                Anulează
              </button>
              <button
                onClick={handleSendMessage}
                disabled={sendLoading}
                className="flex-1 py-3 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-green-700/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {sendLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Se trimite...
                  </>
                ) : (
                  'Trimite'
                )}
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  )
}
