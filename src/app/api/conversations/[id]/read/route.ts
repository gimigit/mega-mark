import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/conversations/[id]/read - Mark conversation as read for current user
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

    // Verify conversation exists and user is participant
    const { data: conv, error: convErr } = await supabase
      .from('conversations')
      .select('buyer_id, seller_id')
      .eq('id', conversationId)
      .maybeSingle()

    if (convErr || !conv) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    if (conv.buyer_id !== user.id && conv.seller_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Determine which unread field to reset
    const field = conv.buyer_id === user.id ? 'buyer_unread' : 'seller_unread'

    await supabase
      .from('conversations')
      .update({ [field]: 0 })
      .eq('id', conversationId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Read POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
