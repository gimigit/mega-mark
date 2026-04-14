'use client'

import Link from 'next/link'
import { format, isToday, isYesterday } from 'date-fns'
import { ro } from 'date-fns/locale'
import type { Notification } from '@/hooks/useNotifications'

interface NotificationDropdownProps {
  notifications: Notification[]
  loading: boolean
  onMarkAsRead: (id?: string) => void
  onMarkAllAsRead: () => void
  onClose: () => void
  getIcon: (type: Notification['type']) => string
  getLink: (notification: Notification) => string
}

export function NotificationDropdown({
  notifications,
  loading,
  onMarkAsRead,
  onMarkAllAsRead,
  onClose,
  getIcon,
  getLink,
}: NotificationDropdownProps) {
  const formatDate = (date: string) => {
    const d = new Date(date)
    if (isToday(d)) return 'Astăzi ' + format(d, 'HH:mm')
    if (isYesterday(d)) return 'Ieri ' + format(d, 'HH:mm')
    return format(d, 'd MMM HH:mm', { locale: ro })
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="font-bold text-gray-900">Notificări</h3>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="text-xs text-green-700 hover:text-green-800 font-medium"
          >
            Marchează toate citite
          </button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-green-700 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-8 text-center">
            <span className="text-3xl block mb-2">🔔</span>
            <p className="text-gray-500 text-sm">Nicio notificare</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <Link
              key={notification.id}
              href={getLink(notification)}
              onClick={() => {
                if (!notification.is_read) {
                  onMarkAsRead(notification.id)
                }
                onClose()
              }}
              className={`flex gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${
                !notification.is_read ? 'bg-green-50/50' : ''
              }`}
            >
              <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                {getIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-medium truncate ${!notification.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                    {notification.title}
                  </p>
                  {!notification.is_read && (
                    <span className="w-2 h-2 bg-green-600 rounded-full flex-shrink-0 mt-1.5" />
                  )}
                </div>
                {notification.body && (
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                    {notification.body}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {formatDate(notification.created_at)}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>

      <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
        <Link
          href="/dashboard?tab=notifications"
          onClick={onClose}
          className="block text-center text-xs text-gray-500 hover:text-green-700"
        >
          Vezi toate notificările
        </Link>
      </div>
    </div>
  )
}
