import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Helper to check if user is admin
async function checkAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') return null
  return { id: user.id, email: user.email, ...profile }
}

// GET /api/admin/me - Check if current user is admin
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const admin = await checkAdmin(supabase)

    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 401 })
    }

    return NextResponse.json({ admin })
  } catch (error) {
    console.error('Admin me error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
