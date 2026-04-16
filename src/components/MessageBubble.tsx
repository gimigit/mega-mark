'use client'

import Image from 'next/image'
import { format, isToday, isYesterday } from 'date-fns'
import { ro } from 'date-fns/locale'
import type { Message } from '@/hooks/useMessages'

interface MessageBubbleProps {
  message: Message
  isMine: boolean
  showAvatar?: boolean
}

export function MessageBubble({ message, isMine, showAvatar = true }: MessageBubbleProps) {
  const formatTime = (date: string) => {
    const d = new Date(date)
    if (isToday(d)) return format(d, 'HH:mm')
    if (isYesterday(d)) return 'Ieri ' + format(d, 'HH:mm')
    return format(d, 'd MMM HH:mm', { locale: ro })
  }

  return (
    <div className={`flex gap-3 ${isMine ? 'flex-row-reverse' : 'flex-row'} mb-3`}>
      {showAvatar && !isMine && (
        <div className="w-8 h-8 flex-shrink-0">
          {message.sender_profile?.avatar_url ? (
            <Image
              src={message.sender_profile.avatar_url}
              alt=""
              fill
              sizes="32px"
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {message.sender_profile?.full_name?.charAt(0) || '?'}
            </div>
          )}
        </div>
      )}

      {!showAvatar && !isMine && <div className="w-8 flex-shrink-0" />}

      <div className={`max-w-[75%] ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${
            isMine
              ? 'bg-green-700 text-white rounded-br-sm'
              : 'bg-gray-100 text-gray-900 rounded-bl-sm'
          }`}
        >
          {message.content}
        </div>
        <div className={`flex items-center gap-1.5 mt-1 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className={`text-xs ${isMine ? 'text-green-200' : 'text-gray-400'}`}>
            {formatTime(message.created_at)}
          </span>
          {isMine && (
            <span className="text-xs text-green-200">
              {message.is_read ? '✓✓' : '✓'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
