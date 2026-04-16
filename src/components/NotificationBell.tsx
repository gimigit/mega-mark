'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { NotificationDropdown } from './NotificationDropdown'
import type { Notification } from '@/hooks/useNotifications'

interface NotificationBellProps {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  onMarkAsRead: (id?: string) => void
  onMarkAllAsRead: () => void
  getIcon: (type: Notification['type']) => string
  getLink: (notification: Notification) => string
}

export function NotificationBell({
  notifications,
  unreadCount,
  loading,
  onMarkAsRead,
  onMarkAllAsRead,
  getIcon,
  getLink,
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [shouldShake, setShouldShake] = useState(false)
  const prevCount = useRef(unreadCount)

  useEffect(() => {
    if (unreadCount > prevCount.current) {
      setShouldShake(true)
      setTimeout(() => setShouldShake(false), 600)
    }
    prevCount.current = unreadCount
  }, [unreadCount])

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-gray-700 transition-colors"
        animate={shouldShake ? { rotate: [0, -10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.5 }}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </motion.button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <NotificationDropdown
            notifications={notifications}
            loading={loading}
            onMarkAsRead={onMarkAsRead}
            onMarkAllAsRead={onMarkAllAsRead}
            onClose={() => setIsOpen(false)}
            getIcon={getIcon}
            getLink={getLink}
          />
        </>
      )}
    </div>
  )
}
