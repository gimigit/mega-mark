'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { MessageBubble } from './MessageBubble'
import type { Message, Conversation } from '@/hooks/useMessages'

interface ChatWindowProps {
  conversation: Conversation
  messages: Message[]
  isLoading: boolean
  onSendMessage: (content: string) => Promise<void>
  onMarkAsRead: () => void
  onSubscribe: (callback: (msg: Message) => void) => () => void
  onBack?: () => void
}

export function ChatWindow({
  conversation,
  messages,
  isLoading,
  onSendMessage,
  onMarkAsRead,
  onSubscribe,
  onBack,
}: ChatWindowProps) {
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    onMarkAsRead()
  }, [conversation.otherUserId, conversation.listingId, onMarkAsRead])

  useEffect(() => {
    const unsubscribe = onSubscribe(() => {})
    return unsubscribe
  }, [conversation.otherUserId, conversation.listingId, onSubscribe])

  const handleSend = async () => {
    if (!input.trim() || sending) return

    setSending(true)
    await onSendMessage(input.trim())
    setInput('')
    setSending(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white">
        {onBack && (
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        {conversation.otherUserAvatar ? (
          <Image
            src={conversation.otherUserAvatar}
            alt=""
            fill
            sizes="40px"
            className="rounded-full"
          />
        ) : (
          <div className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center text-white font-bold">
            {conversation.otherUserName.charAt(0)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-bold text-gray-900 truncate">
            {conversation.otherUserName}
          </div>
          {conversation.listingTitle && (
            <div className="text-xs text-green-700 truncate">
              {conversation.listingTitle}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-3 border-green-700 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <span className="text-4xl mb-3">💬</span>
            <p className="text-gray-500 text-sm">
              Niciun mesaj încă. Începe conversația!
            </p>
          </div>
        ) : (
          <>
            {groupMessagesByDate(messages).map((group, i) => (
              <div key={i}>
                <div className="text-center my-4">
                  <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                    {group.date}
                  </span>
                </div>
                {group.messages.map((msg, j) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isMine={msg.sender_id !== conversation.otherUserId}
                    showAvatar={
                      j === 0 ||
                      group.messages[j - 1].sender_id !== msg.sender_id
                    }
                  />
                ))}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Scrie un mesaj..."
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="px-5 py-3 bg-green-700 text-white rounded-xl font-bold hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

function groupMessagesByDate(messages: Message[]) {
  const groups: { date: string; messages: Message[] }[] = []
  let currentDate = ''
  let currentGroup: { date: string; messages: Message[] } | null = null

  for (const msg of messages) {
    const d = new Date(msg.created_at)
    const dateStr = d.toLocaleDateString('ro-RO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })

    if (dateStr !== currentDate) {
      currentDate = dateStr
      currentGroup = { date: dateStr, messages: [] }
      groups.push(currentGroup)
    }
    currentGroup?.messages.push(msg)
  }

  return groups
}
