'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export type Notification = {
  id: string
  user_id: string
  type: 'new_message' | 'listing_favorite' | 'listing_expired' | 'review_received' | 'listing_approved' | 'system'
  title: string
  body: string | null
  data: Record<string, unknown>
  is_read: boolean
  created_at: string
}

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()

  const fetchNotifications = useCallback(async () => {
    if (!userId) return

    setLoading(true)
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (data) {
      setNotifications(data)
      setUnreadCount(data.filter(n => !n.is_read).length)
    }
    setLoading(false)
  }, [userId, supabase])

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    fetchNotifications()

    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotif = payload.new as Notification
          setNotifications(prev => [newNotif, ...prev])
          if (!newNotif.is_read) {
            setUnreadCount(prev => prev + 1)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const updated = payload.new as Notification
          setNotifications(prev =>
            prev.map(n => n.id === updated.id ? updated : n)
          )
          if (updated.is_read) {
            setUnreadCount(prev => Math.max(0, prev - 1))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, fetchNotifications, supabase])

  const markAsRead = useCallback(
    async (notificationId?: string) => {
      if (!userId) return

      if (notificationId) {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', notificationId)

        setNotifications(prev =>
          prev.map(n =>
            n.id === notificationId ? { ...n, is_read: true } : n
          )
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    },
    [userId, supabase]
  )

  const markAllAsRead = useCallback(async () => {
    if (!userId) return

    const unread = notifications.filter(n => !n.is_read)
    if (unread.length === 0) return

    const ids = unread.map(n => n.id)
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', ids)

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnreadCount(0)
  }, [userId, notifications, supabase])

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'new_message':
        return '💬'
      case 'listing_favorite':
        return '❤️'
      case 'listing_expired':
        return '⏰'
      case 'review_received':
        return '⭐'
      case 'listing_approved':
        return '✅'
      case 'system':
      default:
        return '🔔'
    }
  }

  const getNotificationLink = (notification: Notification) => {
    const data = notification.data as Record<string, string>
    switch (notification.type) {
      case 'new_message':
        return '/dashboard?tab=messages'
      case 'listing_favorite':
      case 'listing_expired':
      case 'listing_approved':
        return data.listing_id ? `/listings/${data.listing_id}` : '/dashboard'
      case 'review_received':
        return data.reviewer_id ? `/sellers/${data.reviewer_id}` : '/dashboard'
      default:
        return '/dashboard'
    }
  }

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    getNotificationIcon,
    getNotificationLink,
    refresh: fetchNotifications,
  }
}
