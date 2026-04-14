'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

export type Message = {
  id: string
  sender_id: string
  receiver_id: string | null
  listing_id: string | null
  content: string
  is_read: boolean
  created_at: string
  sender_profile?: {
    id: string
    full_name: string | null
    avatar_url: string | null
  }
}

export type Conversation = {
  otherUserId: string
  otherUserName: string
  otherUserAvatar: string | null
  listingId: string | null
  listingTitle: string | null
  lastMessage: Message | null
  unreadCount: number
}

export function useMessages(userId: string | undefined) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [allMessages, setAllMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  const buildConversations = useCallback((messages: Message[]): Conversation[] => {
    if (!userId) return []

    const convMap = new Map<string, { messages: Message[]; otherUserId: string }>()

    for (const msg of messages) {
      const otherId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id
      if (!otherId) continue

      const key = `${otherId}-${msg.listing_id || 'general'}`
      if (!convMap.has(key)) {
        convMap.set(key, { messages: [], otherUserId: otherId })
      }
      convMap.get(key)!.messages.push(msg)
    }

    return Array.from(convMap.values()).map(({ messages: msgs, otherUserId }) => {
      const sorted = msgs.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      const unreadCount = sorted.filter(
        m => m.sender_id !== userId && !m.is_read
      ).length

      return {
        otherUserId,
        otherUserName: sorted[0]?.sender_profile?.full_name || 'Utilizator',
        otherUserAvatar: sorted[0]?.sender_profile?.avatar_url || null,
        listingId: sorted[0]?.listing_id || null,
        listingTitle: null,
        lastMessage: sorted[0] || null,
        unreadCount,
      }
    }).sort((a, b) => {
      const aTime = a.lastMessage?.created_at || ''
      const bTime = b.lastMessage?.created_at || ''
      return new Date(bTime).getTime() - new Date(aTime).getTime()
    })
  }, [userId])

  const fetchMessages = useCallback(async () => {
    if (!userId) return

    setLoading(true)
    const { data: raw } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false })

    if (!raw || raw.length === 0) {
      setAllMessages([])
      setConversations([])
      setLoading(false)
      return
    }

    const otherIds = new Set<string>()
    for (const msg of raw) {
      if (msg.sender_id !== userId) otherIds.add(msg.sender_id)
      if (msg.receiver_id && msg.receiver_id !== userId) otherIds.add(msg.receiver_id)
    }

    const listingIds = [...new Set(raw.map(m => m.listing_id).filter(Boolean))] as string[]

    const [{ data: profiles }, { data: listings }] = await Promise.all([
      supabase.from('profiles').select('id,full_name,avatar_url').in('id', [...otherIds]),
      listingIds.length > 0
        ? supabase.from('listings').select('id,title').in('id', listingIds)
        : Promise.resolve({ data: [] }),
    ])

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])
    const listingMap = new Map(listings?.map(l => [l.id, l]) || [])

    const enriched: Message[] = raw.map(msg => ({
      ...msg,
      sender_profile: profileMap.get(msg.sender_id) || undefined,
    }))

    setAllMessages(enriched)

    const convs = buildConversations(enriched).map(c => ({
      ...c,
      listingTitle: c.listingId && listingMap.has(c.listingId) ? listingMap.get(c.listingId)!.title : null,
    }))
    setConversations(convs)
    setLoading(false)
  }, [userId, supabase, buildConversations])

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    fetchMessages()

    const channel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        async (payload) => {
          const msg = payload.new as Message
          if (msg.sender_id !== userId && msg.receiver_id !== userId) return

          const { data: profile } = await supabase
            .from('profiles')
            .select('id,full_name,avatar_url')
            .eq('id', msg.sender_id)
            .single()

          const newMsg: Message = { ...msg, sender_profile: profile || undefined }

          setAllMessages(prev => [newMsg, ...prev])
          setConversations(prev => {
            const otherId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id
            const listingKey = msg.listing_id || 'general'
            const key = `${otherId}-${listingKey}`

            const existing = prev.find(
              c => c.otherUserId === otherId && (c.listingId || 'general') === listingKey
            )

            if (existing) {
              return prev.map(c =>
                c === existing
                  ? { ...c, lastMessage: newMsg, unreadCount: c.unreadCount + (msg.sender_id !== userId && !msg.is_read ? 1 : 0) }
                  : c
              ).sort((a, b) => {
                const aTime = a.lastMessage?.created_at || ''
                const bTime = b.lastMessage?.created_at || ''
                return new Date(bTime).getTime() - new Date(aTime).getTime()
              })
            }

            return [{
              otherUserId: otherId || '',
              otherUserName: profile?.full_name || 'Utilizator',
              otherUserAvatar: profile?.avatar_url || null,
              listingId: msg.listing_id || null,
              listingTitle: null,
              lastMessage: newMsg,
              unreadCount: msg.sender_id !== userId && !msg.is_read ? 1 : 0,
            }, ...prev]
          })
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages' },
        (payload) => {
          const updated = payload.new as Message
          setAllMessages(prev => prev.map(m => m.id === updated.id ? { ...m, ...updated } : m))
          setConversations(prev => prev.map(c =>
            c.lastMessage?.id === updated.id
              ? { ...c, lastMessage: { ...c.lastMessage!, ...updated } }
              : c
          ))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, fetchMessages, supabase])

  const fetchThreadMessages = useCallback(
    async (otherUserId: string, listingId: string | null): Promise<Message[]> => {
      if (!userId) return []

      const listingFilter = listingId
        ? `listing_id.eq.${listingId}`
        : 'listing_id.is.null'

      const { data: raw } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
        .eq('listing_id', listingId || null)
        .order('created_at', { ascending: true })

      if (!raw || raw.length === 0) return []

      const senderIds = [...new Set(raw.map(m => m.sender_id))]
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id,full_name,avatar_url')
        .in('id', senderIds)

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])

      return raw.map(m => ({
        ...m,
        sender_profile: profileMap.get(m.sender_id),
      }))
    },
    [userId, supabase]
  )

  const subscribeToThread = useCallback(
    (otherUserId: string, listingId: string | null, onNewMessage: (msg: Message) => void) => {
      const filter = listingId
        ? `and(receiver_id.eq.${userId},sender_id.eq.${otherUserId},listing_id.eq.${listingId})`
        : `and(receiver_id.eq.${userId},sender_id.eq.${otherUserId},listing_id.is.null)`

      const channel = supabase
        .channel(`thread:${otherUserId}:${listingId || 'general'}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
          },
          async (payload) => {
            const msg = payload.new as Message
            if (msg.sender_id === userId) return
            if (listingId && msg.listing_id !== listingId) return
            if (!listingId && msg.listing_id) return

            const { data: profile } = await supabase
              .from('profiles')
              .select('id,full_name,avatar_url')
              .eq('id', msg.sender_id)
              .single()

            onNewMessage({ ...msg, sender_profile: profile || undefined })
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    },
    [userId, supabase]
  )

  const sendMessage = useCallback(
    async (receiverId: string, content: string, listingId: string | null = null) => {
      if (!userId || !content.trim()) return null

      // Use a server-side approach: send message and trigger email notification
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: userId,
          receiver_id: receiverId,
          listing_id: listingId,
          content: content.trim(),
        })
        .select()
        .single()

      if (error) {
        console.error('Failed to send message:', error)
        return null
      }

      // Fire off email notification to receiver (asynchronous)
      if (receiverId) {
        ;(async () => {
          try {
            // Fetch receiver email
            const { data: receiverProfile } = await supabase
              .from('profiles')
              .select('email')
              .eq('id', receiverId)
              .single()

            if (!receiverProfile?.email) return

            // Get listing title if available
            let listingTitle: string | undefined
            if (listingId) {
              const { data: listing } = await supabase
                .from('listings')
                .select('title')
                .eq('id', listingId)
                .single()
              listingTitle = listing?.title
            }

      // Get sender name
      const { data: senderProfile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', userId)
        .single()
      const senderName = senderProfile?.full_name || senderProfile?.email || 'Utilizator'

            // Call email notification API
            await fetch('/api/notifications/email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'new_message',
                to: receiverProfile.email,
                senderName,
                preview: content.slice(0, 100),
                listingTitle,
              }),
            }).catch(err => console.error('Email notification error:', err))
          } catch (err) {
            console.error('Error sending email notification:', err)
          }
        })()
      }

      return data
    },
    [userId, supabase]
  )

  const markThreadAsRead = useCallback(
    async (otherUserId: string, listingId: string | null) => {
      if (!userId) return

      const unread = allMessages.filter(
        m =>
          m.sender_id === otherUserId &&
          m.receiver_id === userId &&
          !m.is_read &&
          (listingId ? m.listing_id === listingId : !m.listing_id)
      )

      if (unread.length === 0) return

      const ids = unread.map(m => m.id)
      await supabase.from('messages').update({ is_read: true }).in('id', ids)

      setConversations(prev =>
        prev.map(c =>
          c.otherUserId === otherUserId && (c.listingId || null) === listingId
            ? { ...c, unreadCount: 0 }
            : c
        )
      )
    },
    [userId, allMessages, supabase]
  )

  return {
    conversations,
    allMessages,
    loading,
    fetchThreadMessages,
    subscribeToThread,
    sendMessage,
    markThreadAsRead,
    refresh: fetchMessages,
  }
}
