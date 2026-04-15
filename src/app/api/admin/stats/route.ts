import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/admin/stats - Get admin dashboard stats
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 })
    }

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()

    // Get counts in parallel
    const [
      listingsResult,
      activeResult,
      expiredResult,
      soldResult,
      usersResult,
      newUsersResult,
      messagesResult,
      messagesTodayResult,
    ] = await Promise.all([
      supabase.from('listings').select('*', { count: 'exact', head: true }),
      supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'expired'),
      supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'sold'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', todayStart),
      supabase.from('messages').select('*', { count: 'exact', head: true }),
      supabase.from('messages').select('*', { count: 'exact', head: true }).gte('created_at', todayStart),
    ])

    return NextResponse.json({
      totalAds: listingsResult.count || 0,
      activeAds: activeResult.count || 0,
      expiredAds: expiredResult.count || 0,
      soldAds: soldResult.count || 0,
      totalUsers: usersResult.count || 0,
      newUsersToday: newUsersResult.count || 0,
      totalMessages: messagesResult.count || 0,
      messagesToday: messagesTodayResult.count || 0,
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
