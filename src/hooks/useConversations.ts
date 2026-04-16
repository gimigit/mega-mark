'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export type ConvItem = {
  id: string
  otherUserId: string | null
  otherUserName: string
  otherUserAvatar: string | null
  listingId: string | null
  listingTitle: string | null
  listingThumbnail: string | null
  lastMessagePreview: string | null
  lastMessageAt: string | null
  unreadCount: number
}

export type MsgItem = {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  status: string
  created_at: string
  sender?: { id: string; full_name: string | null; avatar_url: string | null }
}

export function useConversations(userId: string | undefined) {
  const [conversations, setConversations] = useState<ConvItem[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = useRef(createClient()).current

  const fetchConversations = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/conversations')
    if (res.ok) {
      const { conversations: data } = await res.json()
      setConversations(data ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    fetchConversations()

    // Realtime: re-fetch when a message is inserted in any conversation of this user
    const channel = supabase
      .channel('inbox-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
        fetchConversations()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId, fetchConversations, supabase])

  async function fetchMessages(conversationId: string): Promise<MsgItem[]> {
    const res = await fetch(`/api/conversations/${conversationId}`)
    if (!res.ok) return []
    const { messages } = await res.json()
    return messages ?? []
  }

  async function sendMessage(conversationId: string, content: string): Promise<boolean> {
    const res = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
    if (res.ok) {
      // Optimistically update last preview in list
      setConversations(prev => prev.map(c =>
        c.id === conversationId
          ? { ...c, lastMessagePreview: content.slice(0, 100), lastMessageAt: new Date().toISOString() }
          : c
      ))
    }
    return res.ok
  }

  async function markAsRead(conversationId: string) {
    await fetch(`/api/conversations/${conversationId}/read`, { method: 'POST' })
    setConversations(prev => prev.map(c =>
      c.id === conversationId ? { ...c, unreadCount: 0 } : c
    ))
  }

  return { conversations, loading, fetchMessages, sendMessage, markAsRead, refresh: fetchConversations }
}
