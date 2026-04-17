import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/conversations/[id]/messages - Send a new message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { content } = body

    if (!content || typeof content !== 'string' || content.trim() === '') {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 })
    }

    // Verify conversation exists and user is a participant
    const { data: conv, error: convErr } = await supabase
      .from('conversations')
      .select('buyer_id, seller_id, seller_unread, buyer_unread')
      .eq('id', conversationId)
      .maybeSingle()

    if (convErr || !conv) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    if (conv.buyer_id !== user.id && conv.seller_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Determine which unread counter to increment (recipient)
    const recipientUnreadField = conv.buyer_id === user.id ? 'seller_unread' : 'buyer_unread'
    const now = new Date().toISOString()

    // Insert the message
    const { error: msgErr } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: content.trim(),
        status: 'unread',
      })

    if (msgErr) {
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    // Update conversation: increment recipient unread, update last_message_* fields
    await supabase
      .from('conversations')
      .update({
        last_message_at: now,
        last_message_preview: content.trim().substring(0, 100),
        [recipientUnreadField]: (conv[recipientUnreadField] || 0) + 1,
      })
      .eq('id', conversationId)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
