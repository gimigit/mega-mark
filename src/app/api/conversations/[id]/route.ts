import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/conversations/[id] - Get a single conversation with its messages
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch conversation with listing and both participant profiles
    const { data: conversation, error: convErr } = await supabase
      .from('conversations')
      .select(`
        id, buyer_id, seller_id,
        listing:listings(id, title, images),
        buyer:profiles!conversations_buyer_id_fkey(id, full_name, avatar_url),
        seller:profiles!conversations_seller_id_fkey(id, full_name, avatar_url)
      `)
      .eq('id', id)
      .maybeSingle()

    if (convErr || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Verify current user is a participant
    if (conversation.buyer_id !== user.id && conversation.seller_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch all messages for this conversation
    const { data: messages, error: msgsErr } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles(id, full_name, avatar_url)
      `)
      .eq('conversation_id', id)
      .order('created_at', { ascending: true })

    if (msgsErr) {
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    return NextResponse.json({
      conversation,
      messages: messages || [],
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
