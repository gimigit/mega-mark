'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { ChatWindow } from '@/components/ChatWindow'
import { NotificationBell } from '@/components/NotificationBell'
import Recommendations from '@/components/Recommendations'
import { useMessages, type Message, type Conversation } from '@/hooks/useMessages'
import { useNotifications } from '@/hooks/useNotifications'
import { format, isToday, isYesterday } from 'date-fns'
import { ro } from 'date-fns/locale'
import type { Database } from '@/types/database'

type Listing = Database['public']['Tables']['listings']['Row'] & {
  categories: Database['public']['Tables']['categories']['Row']
}

type FavoriteWithListing = Database['public']['Tables']['favorites']['Row'] & {
  listings: Listing
}

type SavedSearch = Database['public']['Tables']['saved_searches']['Row']

export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useSupabase()
  const supabase = createClient()

  const {
    conversations: realtimeConversations,
    fetchThreadMessages,
    subscribeToThread,
    sendMessage,
    markThreadAsRead,
    loading: messagesLoading,
  } = useMessages(user?.id)

  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    markAsRead,
    markAllAsRead,
    getNotificationIcon,
    getNotificationLink,
  } = useNotifications(user?.id)

  const [activeTab, setActiveTab] = useState<'listings' | 'favorites' | 'messages' | 'saved_searches'>('listings')
  const [loading, setLoading] = useState(true)
  const [listings, setListings] = useState<Listing[]>([])
  const [favorites, setFavorites] = useState<FavoriteWithListing[]>([])
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [stats, setStats] = useState({
    activeListings: 0,
    totalViews: 0,
    favoritesCount: 0,
  })
  const [profile, setProfile] = useState<Database['public']['Tables']['profiles']['Row'] | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [listingToDelete, setListingToDelete] = useState<Listing | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [bumpingId, setBumpingId] = useState<string | null>(null)
  const [bumpedIds, setBumpedIds] = useState<Set<string>>(new Set())

  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [threadMessages, setThreadMessages] = useState<Message[]>([])
  const [threadLoading, setThreadLoading] = useState(false)

  const handleDeleteClick = (listing: Listing) => {
    setListingToDelete(listing)
    setDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!listingToDelete) return
    setDeleteLoading(true)
    
    const { error } = await supabase.from('listings').delete().eq('id', listingToDelete.id)
    
    if (error) {
      alert('Eroare la ștergerea anunțului: ' + error.message)
    } else {
      setListings(listings.filter(l => l.id !== listingToDelete.id))
      setStats(prev => ({
        ...prev,
        activeListings: prev.activeListings - (listingToDelete.status === 'active' ? 1 : 0),
      }))
    }
    
    setDeleteLoading(false)
    setDeleteModalOpen(false)
    setListingToDelete(null)
  }

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false)
    setListingToDelete(null)
  }

  const handleBump = async (listingId: string, updatedAt: string) => {
    const hoursSince = (Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60)
    if (hoursSince < 24) {
      toast.error('Poți face bump o singură dată la 24 de ore')
      return
    }

    setBumpingId(listingId)
    try {
      const res = await fetch(`/api/listings/${listingId}/bump`, { method: 'PATCH' })
      const data = await res.json() as { error?: string }
      if (!res.ok) {
        toast.error(data.error || 'Eroare la reactualizare')
        return
      }
      setBumpedIds(prev => new Set(prev).add(listingId))
      toast.success('Anunțul a fost reactualizat!')
      const { data: listingsData } = await supabase
        .from('listings')
        .select('*, categories(name, icon)')
        .eq('seller_id', user!.id)
        .order('created_at', { ascending: false })
      setListings(listingsData || [])
    } catch {
      toast.error('Eroare la reactualizare')
    } finally {
      setBumpingId(null)
    }
  }

  const handleSelectConversation = useCallback(
    async (conversation: Conversation) => {
      setSelectedConversation(conversation)
      setThreadLoading(true)

      const msgs = await fetchThreadMessages(
        conversation.otherUserId,
        conversation.listingId
      )
      setThreadMessages(msgs)
      setThreadLoading(false)
    },
    [fetchThreadMessages]
  )

  const handleSendReply = useCallback(
    async (content: string) => {
      if (!selectedConversation || !user) return

      await sendMessage(
        selectedConversation.otherUserId,
        content,
        selectedConversation.listingId
      )
    },
    [selectedConversation, user, sendMessage]
  )

  const handleMarkAsRead = useCallback(() => {
    if (!selectedConversation) return
    markThreadAsRead(selectedConversation.otherUserId, selectedConversation.listingId)
  }, [selectedConversation, markThreadAsRead])

  const handleSubscribeToThread = useCallback(
    (callback: (msg: Message) => void) => {
      if (!selectedConversation) return () => {}
      return subscribeToThread(
        selectedConversation.otherUserId,
        selectedConversation.listingId,
        callback
      )
    },
    [selectedConversation, subscribeToThread]
  )

  const handleBackToConversations = () => {
    setSelectedConversation(null)
    setThreadMessages([])
  }

  useEffect(() => {
    if (!selectedConversation) return

    let unsubscribe: (() => void) | undefined

    const setupSubscription = () => {
      unsubscribe = subscribeToThread(
        selectedConversation.otherUserId,
        selectedConversation.listingId,
        (newMsg) => {
          setThreadMessages(prev => [...prev, newMsg])
        }
      )
    }

    setupSubscription()

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [selectedConversation, subscribeToThread])

  const formatMessageDate = (date: string) => {
    const d = new Date(date)
    if (isToday(d)) return format(d, 'HH:mm')
    if (isYesterday(d)) return 'Ieri ' + format(d, 'HH:mm')
    return format(d, 'd MMM HH:mm', { locale: ro })
  }

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      setLoading(true)

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(profileData)

      // Fetch user's listings
      const { data: listingsData } = await supabase
        .from('listings')
        .select('*, categories(name, icon)')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false })
      setListings(listingsData || [])

      // Fetch favorites with listings
      const { data: favoritesData } = await supabase
        .from('favorites')
        .select('*, listings(*, categories(name, icon))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setFavorites(favoritesData || [])

      // Fetch saved searches
      const { data: searchesData } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setSavedSearches(searchesData || [])

      // Calculate stats
      const activeListings = (listingsData || []).filter(l => l.status === 'active').length
       const totalViews = (listingsData || []).reduce((sum, l) => sum + (l.views_count || 0), 0)
      const favoritesCount = (favoritesData || []).length

      setStats({
        activeListings,
        totalViews,
        favoritesCount,
      })

      setLoading(false)
    }

    fetchData()
  }, [user, supabase])

  const statusLabels: Record<string, { label: string; className: string }> = {
    active: { label: 'Activ', className: 'bg-green-100 text-green-700' },
    pending: { label: 'În așteptare', className: 'bg-amber-100 text-amber-700' },
    sold: { label: 'Vândut', className: 'bg-red-100 text-red-700' },
    draft: { label: 'Ciornă', className: 'bg-gray-100 text-gray-600' },
    archived: { label: 'Arhivat', className: 'bg-gray-100 text-gray-500' },
  }

  const conditionLabels: Record<string, string> = {
    new: 'Nou',
    used: 'Folosit',
    refurbished: 'Refurbished',
  }

  const formatPrice = (price: number, currency: string) => {
    return `${currency === 'EUR' ? '€' : currency}${price.toLocaleString()}`
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ro-RO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-700 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Se încarcă...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-8">
          <Link href="/" className="text-2xl font-black text-green-800 flex items-center gap-1">
            Mega<em className="text-amber-500 not-italic">Mark</em>
          </Link>
          <div className="hidden md:flex items-center gap-6 ml-auto">
            <Link href="/browse" className="text-gray-600 hover:text-green-700 font-medium transition-colors">
              Browse
            </Link>
            <Link href="/dashboard" className="text-green-700 font-bold transition-colors">
              Dashboard
            </Link>
            <Link
              href="/listings/create"
              className="bg-green-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-green-800 transition-colors"
            >
              + Post New
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell
              notifications={notifications}
              unreadCount={unreadCount}
              loading={notificationsLoading}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
              getIcon={getNotificationIcon}
              getLink={getNotificationLink}
            />
            <Link href="/profile/edit" className="text-sm text-gray-500 hover:text-green-700 font-medium transition-colors">
              ✏️ Editează profil
            </Link>
            {profile?.avatar_url ? (
              <Image src={profile.avatar_url} alt="" fill sizes="40px" className="rounded-full" />
            ) : (
              <div className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center text-white font-bold">
                {profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Recommendations for logged in users */}
        <Recommendations />

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">Bună, {profile?.full_name || 'Utilizator'}</p>
          </div>
          <div className="flex items-center gap-3">
            {(profile?.is_dealer || profile?.role === 'dealer' || profile?.role === 'admin') && (
              <Link
                href="/dashboard/bulk-upload"
                className="border border-green-600 text-green-700 px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-green-50 transition-colors"
              >
                📤 Bulk Upload
              </Link>
            )}
            <Link
              href="/listings/create"
              className="bg-gradient-to-r from-green-700 to-green-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-green-700/30 transition-all flex items-center gap-2"
            >
              <span className="text-lg">+</span> Post New Listing
            </Link>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
              <div>
                <div className="text-sm text-gray-500 font-medium">Anunțuri Active</div>
                <div className="text-2xl font-black text-gray-900">{stats.activeListings}</div>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">👁️</span>
              </div>
              <div>
                <div className="text-sm text-gray-500 font-medium">Total Vizualizări</div>
                <div className="text-2xl font-black text-gray-900">{stats.totalViews}</div>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">❤️</span>
              </div>
              <div>
                <div className="text-sm text-gray-500 font-medium">Favorite</div>
                <div className="text-2xl font-black text-gray-900">{stats.favoritesCount}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('listings')}
              className={`flex-1 px-6 py-4 text-sm font-bold transition-colors ${
                activeTab === 'listings'
                  ? 'text-green-700 border-b-2 border-green-700 bg-green-50/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              📦 Anunțurile mele ({listings.length})
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`flex-1 px-6 py-4 text-sm font-bold transition-colors ${
                activeTab === 'favorites'
                  ? 'text-green-700 border-b-2 border-green-700 bg-green-50/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              ❤️ Favorite ({favorites.length})
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`flex-1 px-6 py-4 text-sm font-bold transition-colors ${
                activeTab === 'messages'
                  ? 'text-green-700 border-b-2 border-green-700 bg-green-50/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              💬 Mesaje
            </button>
            <button
              onClick={() => setActiveTab('saved_searches')}
              className={`flex-1 px-6 py-4 text-sm font-bold transition-colors ${
                activeTab === 'saved_searches'
                  ? 'text-green-700 border-b-2 border-green-700 bg-green-50/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              🔔 Alerte ({savedSearches.length})
            </button>
          </div>

          <div className="p-6">
            {/* My Listings Tab */}
            {activeTab === 'listings' && (
              <div>
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="bg-gray-100 rounded-xl h-32 animate-pulse" />
                    ))}
                  </div>
                ) : listings.length === 0 ? (
                  <div className="text-center py-16">
                    <span className="text-6xl block mb-4">📦</span>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Nu ai niciun anunț</h3>
                    <p className="text-gray-500 mb-6">Începe să vinzi echipamentul tău agricol</p>
                    <Link
                      href="/listings/create"
                      className="inline-block bg-green-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-800 transition-colors"
                    >
                      Creează primul anunț
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {listings.map(listing => (
                      <div
                        key={listing.id}
                        className="border border-gray-200 rounded-xl p-4 hover:border-green-400 hover:shadow-md transition-all"
                      >
                        <div className="flex gap-4">
                          <div className="w-24 h-20 bg-gradient-to-br from-green-100 to-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            {listing.images && (listing.images as string[]).length > 0 ? (
                              <Image
                                src={(listing.images as string[])[0]}
                                alt=""
                                fill
                                sizes="96px"
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <span className="text-3xl opacity-50">
                                {listing.categories?.icon || '🚜'}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h3 className="font-bold text-gray-900 truncate">{listing.title}</h3>
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ${
                                  listing.status ? statusLabels[listing.status]?.className : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {listing.status ? statusLabels[listing.status]?.label : listing.status}
                              </span>
                            </div>
                            <div className="text-lg font-black text-green-700 mb-1">
                              {listing.price != null ? formatPrice(listing.price, listing.currency || 'EUR') : 'Preț la cerere'}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              {listing.year && <span>{listing.year}</span>}
                              {listing.hours && <span>· {listing.hours}h</span>}
                              {listing.condition && (
                                <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">
                                  {conditionLabels[listing.condition]}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-2">
                              <Link
                                href={`/listings/${listing.id}/edit`}
                                className="text-xs font-semibold text-green-700 hover:text-green-800 transition-colors"
                              >
                                ✏️ Editează
                              </Link>
                              <button
                                onClick={() => handleBump(listing.id, listing.updated_at || listing.created_at)}
                                disabled={bumpingId === listing.id || bumpedIds.has(listing.id)}
                                className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {bumpingId === listing.id
                                  ? 'Se actualizează...'
                                  : bumpedIds.has(listing.id)
                                  ? '✓ Reactualizat'
                                  : '↑ Reactualizează'}
                              </button>
                              <button
                                onClick={() => handleDeleteClick(listing)}
                                className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
                                title="Șterge anunțul"
                              >
                                🗑️ Șterge
                              </button>
                              <Link
                                href={`/listings/${listing.id}`}
                                className="text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors"
                              >
                                👁️ Vezi
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Favorites Tab */}
            {activeTab === 'favorites' && (
              <div>
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="bg-gray-100 rounded-xl h-48 animate-pulse" />
                    ))}
                  </div>
                ) : favorites.length === 0 ? (
                  <div className="text-center py-16">
                    <span className="text-6xl block mb-4">❤️</span>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Nu ai favorite</h3>
                    <p className="text-gray-500 mb-6">
                      Salvează anunțurile care te interesează pentru a le găsi rapid
                    </p>
                    <Link
                      href="/browse"
                      className="inline-block bg-green-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-800 transition-colors"
                    >
                      Răsfoiește anunțuri
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {favorites.map(fav => (
                      <Link
                        key={fav.id}
                        href={`/listings/${fav.listings.id}`}
                        className="border border-gray-200 rounded-xl overflow-hidden hover:border-green-400 hover:shadow-lg transition-all group"
                      >
                        <div className="h-36 bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center relative">
                          {fav.listings.images && (fav.listings.images as string[]).length > 0 ? (
                            <Image
                              src={(fav.listings.images as string[])[0]}
                              alt=""
                              fill
                              sizes="200px"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-5xl opacity-50">
                              {fav.listings.categories?.icon || '🚜'}
                            </span>
                          )}
                          <span className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-red-500 shadow-sm hover:scale-110 transition-transform">
                            ❤️
                          </span>
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-gray-900 mb-1 group-hover:text-green-700 transition-colors truncate">
                            {fav.listings.title}
                          </h3>
                          <div className="text-lg font-black text-green-700 mb-2">
                            {fav.listings.price != null ? formatPrice(fav.listings.price, fav.listings.currency || 'EUR') : 'Preț la cerere'}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            {fav.listings.year && <span>{fav.listings.year}</span>}
                            {fav.listings.location_country && (
                              <span>📍 {fav.listings.location_country}</span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <div className="h-[500px]">
                {messagesLoading && realtimeConversations.length === 0 ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="bg-gray-100 rounded-xl h-20 animate-pulse" />
                    ))}
                  </div>
                ) : selectedConversation ? (
                  <ChatWindow
                    conversation={selectedConversation}
                    messages={threadMessages}
                    isLoading={threadLoading}
                    onSendMessage={handleSendReply}
                    onMarkAsRead={handleMarkAsRead}
                    onSubscribe={handleSubscribeToThread}
                    onBack={handleBackToConversations}
                  />
                ) : (
                  <div className="h-full">
                    {realtimeConversations.length === 0 ? (
                      <div className="text-center py-16">
                        <span className="text-6xl block mb-4">💬</span>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Nicio conversație</h3>
                        <p className="text-gray-500 mb-6">
                          Mesajele tale cu vânzătorii și cumpărătorii vor apărea aici
                        </p>
                        <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
                          <span className="text-amber-500">ℹ️</span>
                          Contactează vânzătorii direct din pagina anunțului
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {realtimeConversations.map((conv) => (
                          <button
                            key={`${conv.otherUserId}-${conv.listingId || 'general'}`}
                            onClick={() => handleSelectConversation(conv)}
                            className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-green-400 hover:bg-green-50/50 transition-all text-left"
                          >
                            <div className="relative">
                              {conv.otherUserAvatar ? (
                                <Image src={conv.otherUserAvatar} alt="" fill sizes="48px" className="w-12 h-12 rounded-full" />
                              ) : (
                                <div className="w-12 h-12 bg-green-700 rounded-full flex items-center justify-center text-white text-lg font-bold">
                                  {conv.otherUserName.charAt(0)}
                                </div>
                              )}
                              {conv.unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                  {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className={`font-bold truncate ${conv.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                                  {conv.otherUserName}
                                </span>
                                <span className="text-xs text-gray-400 flex-shrink-0">
                                  {conv.lastMessage ? formatMessageDate(conv.lastMessage.created_at) : ''}
                                </span>
                              </div>
                              {conv.listingTitle && (
                                <div className="text-xs text-green-700 font-medium truncate mb-1">
                                  {conv.listingTitle}
                                </div>
                              )}
                              <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
                                {conv.lastMessage?.sender_id === user?.id ? 'Tu: ' : ''}
                                {conv.lastMessage?.content || 'Niciun mesaj'}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Saved Searches Tab */}
            {activeTab === 'saved_searches' && (
              <div>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="bg-gray-100 rounded-xl h-20 animate-pulse" />
                    ))}
                  </div>
                ) : savedSearches.length === 0 ? (
                  <div className="text-center py-16">
                    <span className="text-6xl block mb-4">🔔</span>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Nu ai alerte salvate</h3>
                    <p className="text-gray-500 mb-6">
                      Salvează criteriile de căutare pentru a fi notificat când apar anunțuri noi
                    </p>
                    <Link
                      href="/browse"
                      className="inline-block bg-green-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-800 transition-colors"
                    >
                      Caută și salvează
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedSearches.map(search => (
                      <div
                        key={search.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-green-400 hover:bg-green-50/50 transition-all"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-gray-900">
                            {search.name || 'Căutare salvată'}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {[search.keyword && `„${search.keyword}”`]
                              .filter(Boolean)
                              .join(' ')}
                            {search.category_id && ` · categorie`}
                            {search.country && ` · ${search.country}`}
                            {search.price_min && ` · de la €${search.price_min.toLocaleString()}`}
                            {search.price_max && ` · până la €${search.price_max.toLocaleString()}`}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            search.notify_email 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {search.notify_email ? '📧 Email' : '🔕 Dezactivat'}
                          </span>
                          <button
                            onClick={async () => {
                              if (!user) return
                              await supabase.from('saved_searches').delete().eq('id', search.id)
                              setSavedSearches(prev => prev.filter(s => s.id !== search.id))
                            }}
                            className="text-red-500 hover:text-red-700 p-2"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleDeleteCancel}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚠️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Ștergi anunțul?</h3>
              <p className="text-gray-500 mb-6">
                Ești sigur că vrei să ștergi anunțul <strong className="text-gray-700">"{listingToDelete?.title}"</strong>? 
                Această acțiune nu poate fi anulată.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleDeleteCancel}
                  disabled={deleteLoading}
                  className="px-5 py-2.5 border-2 border-gray-200 rounded-xl font-bold text-sm text-gray-700 hover:border-gray-400 transition-colors disabled:opacity-50"
                >
                  Anulează
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleteLoading}
                  className="px-5 py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {deleteLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Se șterge...
                    </>
                  ) : (
                    '🗑️ Șterge definitiv'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
