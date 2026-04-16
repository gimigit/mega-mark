'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Send, MessageSquare } from 'lucide-react'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import Navbar from '@/components/Navbar'
import { useConversations, type ConvItem, type MsgItem } from '@/hooks/useConversations'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import { ro } from 'date-fns/locale'

function formatTime(dateStr: string) {
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: ro })
}

export default function MessagesPage() {
  const router = useRouter()
  const { user, isLoading } = useSupabase()
  const { conversations, loading, fetchMessages, sendMessage, markAsRead } = useConversations(user?.id)

  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [messages, setMessages] = useState<MsgItem[]>([])
  const [msgsLoading, setMsgsLoading] = useState(false)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = useRef(createClient()).current

  useEffect(() => {
    if (!isLoading && !user) router.push('/login')
  }, [user, isLoading, router])

  const activeConv = conversations.find(c => c.id === activeConvId) ?? null

  const loadMessages = useCallback(async (convId: string) => {
    setMsgsLoading(true)
    const msgs = await fetchMessages(convId)
    setMessages(msgs)
    setMsgsLoading(false)
    await markAsRead(convId)
  }, [fetchMessages, markAsRead])

  useEffect(() => {
    if (!activeConvId) return
    loadMessages(activeConvId)
  }, [activeConvId, loadMessages])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Realtime: subscribe to new messages in active conversation
  useEffect(() => {
    if (!activeConvId || !user) return

    const channel = supabase
      .channel(`chat:${activeConvId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `conversation_id=eq.${activeConvId}`,
      }, async (payload) => {
        const msg = payload.new as MsgItem
        if (msg.sender_id === user.id) return // already added optimistically
        setMessages(prev => [...prev, msg])
        await markAsRead(activeConvId)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [activeConvId, user, supabase, markAsRead])

  async function selectConv(conv: ConvItem) {
    setActiveConvId(conv.id)
    setMobileView('chat')
  }

  async function handleSend() {
    if (!input.trim() || !activeConvId || sending) return
    setSending(true)
    const content = input.trim()
    setInput('')

    // Optimistic update
    const tempMsg: MsgItem = {
      id: `temp-${Date.now()}`,
      conversation_id: activeConvId,
      sender_id: user!.id,
      content,
      status: 'unread',
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, tempMsg])

    await sendMessage(activeConvId, content)
    setSending(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="w-8 h-8 border-2 border-green-700 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-foreground mb-6 font-display">Mesaje</h1>

        <div className="bg-surface border border-border rounded-2xl overflow-hidden flex h-[calc(100vh-220px)] min-h-[500px]">
          {/* Conversation list */}
          <div className={`w-full md:w-80 border-r border-border flex flex-col shrink-0 ${mobileView === 'chat' ? 'hidden md:flex' : 'flex'}`}>
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm font-semibold text-muted-foreground">{conversations.length} conversații</p>
            </div>
            {conversations.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                <MessageSquare className="size-12 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">Nicio conversație încă.</p>
                <Link href="/browse" className="mt-3 text-sm text-green-700 font-semibold hover:underline">
                  Cauta anunturi
                </Link>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto divide-y divide-border">
                {conversations.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => selectConv(conv)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors ${activeConvId === conv.id ? 'bg-green-50 dark:bg-green-900/10' : ''}`}
                  >
                    {conv.otherUserAvatar ? (
                      <Image src={conv.otherUserAvatar} alt="" width={40} height={40} className="rounded-full shrink-0 object-cover" />
                    ) : (
                      <div className="size-10 rounded-full bg-green-700 flex items-center justify-center text-white font-bold shrink-0">
                        {conv.otherUserName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-semibold text-sm text-foreground truncate">{conv.otherUserName}</span>
                        {conv.lastMessageAt && (
                          <span className="text-xs text-muted-foreground shrink-0">{formatTime(conv.lastMessageAt)}</span>
                        )}
                      </div>
                      {conv.listingTitle && (
                        <p className="text-xs text-green-700 dark:text-green-400 truncate">{conv.listingTitle}</p>
                      )}
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.lastMessagePreview ?? '...'}</p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="shrink-0 size-5 bg-green-700 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chat area */}
          <div className={`flex-1 flex flex-col ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}`}>
            {!activeConv ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                <MessageSquare className="size-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Selectează o conversație</p>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-surface">
                  <button onClick={() => setMobileView('list')} className="md:hidden p-1 text-muted-foreground">
                    <ArrowLeft className="size-5" />
                  </button>
                  {activeConv.otherUserAvatar ? (
                    <Image src={activeConv.otherUserAvatar} alt="" width={36} height={36} className="rounded-full object-cover" />
                  ) : (
                    <div className="size-9 rounded-full bg-green-700 flex items-center justify-center text-white font-bold text-sm">
                      {activeConv.otherUserName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{activeConv.otherUserName}</p>
                    {activeConv.listingTitle && (
                      <Link href={`/listings/${activeConv.listingId}`} className="text-xs text-green-700 dark:text-green-400 hover:underline truncate block">
                        {activeConv.listingTitle}
                      </Link>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {msgsLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="size-7 border-2 border-green-700 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <p className="text-muted-foreground text-sm">Niciun mesaj. Începe conversația!</p>
                    </div>
                  ) : (
                    messages.map(msg => {
                      const isMine = msg.sender_id === user?.id
                      return (
                        <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${isMine ? 'bg-green-700 text-white rounded-br-sm' : 'bg-gray-100 dark:bg-dark-700 text-foreground rounded-bl-sm'}`}>
                            {msg.content}
                            <div className={`text-xs mt-1 ${isMine ? 'text-green-200' : 'text-muted-foreground'}`}>
                              {formatTime(msg.created_at)}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-3 border-t border-border bg-gray-50 dark:bg-dark-800">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Scrie un mesaj..."
                      className="flex-1 px-4 py-3 border border-border rounded-xl text-sm bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || sending}
                      className="px-4 py-3 bg-green-700 text-white rounded-xl hover:bg-green-800 transition-colors disabled:opacity-50"
                    >
                      {sending ? (
                        <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="size-5" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
