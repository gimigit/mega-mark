import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Trebuie să fii autentificat pentru a raporta un anunț.' }, { status: 401 })
  }

  const body = await request.json()
  const { listing_id, reason, description } = body

  if (!listing_id || !reason) {
    return NextResponse.json({ error: 'Lipsesc date obligatorii.' }, { status: 400 })
  }

  const validReasons = ['spam', 'inappropriate', 'scam', 'duplicate', 'expired', 'other']
  if (!validReasons.includes(reason)) {
    return NextResponse.json({ error: 'Motiv invalid.' }, { status: 400 })
  }

  const { data: listingExists } = await supabase
    .from('listings')
    .select('id')
    .eq('id', listing_id)
    .single()

  if (!listingExists) {
    return NextResponse.json({ error: 'Anunțul nu există.' }, { status: 404 })
  }

  const { error } = await supabase
    .from('listing_reports')
    .insert({
      listing_id,
      user_id: user.id,
      reason,
      description: description || null,
      status: 'pending'
    })

  if (error) {
    return NextResponse.json({ error: 'Nu s-a putut trimite raportul.' }, { status: 500 })
  }

  return NextResponse.json({ success: true, message: 'Raportul a fost trimis. Mulțumim!' })
}