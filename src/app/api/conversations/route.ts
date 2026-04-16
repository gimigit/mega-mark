import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/conversations - List conversations for the current user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        *,
        listing:listings(id, title, images),
        buyer:profiles(id, full_name, avatar_url),
        seller:profiles(id, full_name, avatar_url)
      `)
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order('last_message_at', { ascending: false })

    if (error) {
      console.error('Error fetching conversations:', error)
      return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
    }

    // Enrich each conversation with unread count relative to current user
    const enriched = (conversations || []).map((c) => ({
      ...c,
      unread_count: c.buyer_id === user.id ? c.buyer_unread || 0 : c.seller_unread || 0,
    }))

    return NextResponse.json({ conversations: enriched })
  } catch (error) {
    console.error('Conversations GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/conversations - Create a new conversation (or reopen existing)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { listing_id, message } = body

    if (!listing_id || !message) {
      return NextResponse.json(
        { error: 'listing_id and message are required' },
        { status: 400 }
      )
    }

    // Verify listing exists and get seller
    const { data: listing, error: listingErr } = await supabase
      .from('listings')
      .select('seller_id')
      .eq('id', listing_id)
      .single()

    if (listingErr || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    if (listing.seller_id === user.id) {
      return NextResponse.json(
        { error: 'Cannot message yourself about your own listing' },
        { status: 400 }
      )
    }

    const buyerId = user.id
    const sellerId = listing.seller_id
    const now = new Date().toISOString()

    // Check for existing conversation between buyer and seller for this listing
    const { data: existing, error: existingErr } = await supabase
      .from('conversations')
      .select('id, buyer_unread, seller_unread')
      .eq('buyer_id', buyerId)
      .eq('seller_id', sellerId)
      .eq('listing_id', listing_id)
      .maybeSingle()

    if (existingErr) {
      console.error('Error checking existing conversation:', existingErr)
      return NextResponse.json({ error: 'Failed to check existing conversation' }, { status: 500 })
    }

    let conversationId: string

    if (existing) {
      conversationId = existing.id
      // Append: increment seller unread and update last_message fields
      await supabase
        .from('conversations')
        .update({
          last_message_at: now,
          last_message_preview: message.substring(0, 100),
          seller_unread: (existing.seller_unread || 0) + 1,
        })
        .eq('id', conversationId)
    } else {
      // Create new conversation
      const { data: newConv, error: convErr } = await supabase
        .from('conversations')
        .insert({
          buyer_id: buyerId,
          seller_id: sellerId,
          listing_id,
          last_message_preview: message.substring(0, 100),
          last_message_at: now,
          buyer_unread: 0,
          seller_unread: 1,
          status: 'active',
        })
        .select()
        .single()

      if (convErr) {
        console.error('Error creating conversation:', convErr)
        return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
      }

      conversationId = newConv.id
    }

    // Insert first (or additional) message
    const { error: msgErr } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: buyerId,
        content: message,
        status: 'unread',
      })

    if (msgErr) {
      console.error('Error sending message:', msgErr)
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    return NextResponse.json({ conversation_id: conversationId }, { status: 201 })
  } catch (error) {
    console.error('Conversations POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
