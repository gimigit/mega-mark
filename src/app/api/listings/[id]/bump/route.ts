import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
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

    const { data: listing } = await supabase
      .from('listings')
      .select('seller_id, updated_at')
      .eq('id', id)
      .single()

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    if (listing.seller_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const hoursSinceBump = (Date.now() - new Date(listing.updated_at).getTime()) / (1000 * 60 * 60)

    if (hoursSinceBump < 24) {
      return NextResponse.json({
        error: 'Poți face bump o singură dată la 24 de ore',
        next_bump: new Date(new Date(listing.updated_at).getTime() + 24 * 60 * 60 * 1000).toISOString()
      }, { status: 429 })
    }

    const { data: updated, error } = await supabase
      .from('listings')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ listing: updated, message: 'Anunțul a fost reactualizat cu succes!' })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
