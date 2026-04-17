import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin-utils'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const admin = await getAdminUser()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()
  
  const { data: reports, error } = await supabase
    .from('listing_reports')
    .select(`
      *,
      listing:listings(id, title, seller:profiles!listings_seller_id_fkey(id, full_name, email)),
      reporter:profiles!listing_reports_user_id_fkey(id, full_name, email)
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const formatted = reports?.map(r => ({
    id: r.id,
    reason: r.reason,
    description: r.description,
    status: r.status,
    created_at: r.created_at,
    listing: r.listing ? {
      id: r.listing.id,
      title: r.listing.title,
      seller: r.listing.seller
    } : null,
    reporter: r.reporter ? {
      id: r.reporter.id,
      full_name: r.reporter.full_name,
      email: r.reporter.email
    } : null
  })) || []

  return NextResponse.json(formatted)
}

export async function PATCH(request: NextRequest) {
  const admin = await getAdminUser()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()
  const body = await request.json()
  const { id, status } = body

  if (!id || !status) {
    return NextResponse.json({ error: 'Missing id or status' }, { status: 400 })
  }

  const { error } = await supabase
    .from('listing_reports')
    .update({ 
      status,
      reviewed_by: admin.id,
      reviewed_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}