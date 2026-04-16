export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/admin-utils'
import { createClient } from '@/lib/supabase/server'
import { AdminDashboard } from '@/components/admin/AdminDashboard'

export default async function AdminPage() {
  const admin = await getAdminUser()
  
  if (!admin) {
    redirect('/')
  }

  const supabase = await createClient()
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()

  // Fetch initial data
  const [listings, totalStats] = await Promise.all([
    supabase
      .from('listings')
      .select(`
        *,
        seller:profiles!listings_seller_id_fkey(id, full_name, email, avatar_url, role, is_verified),
        category:categories(id, name, slug)
      `)
      .order('created_at', { ascending: false })
      .limit(50),
    // Get all stats in parallel
    Promise.all([
      supabase.from('listings').select('*', { count: 'exact', head: true }),
      supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'expired'),
      supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'sold'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', todayStart),
      supabase.from('messages').select('*', { count: 'exact', head: true }),
      supabase.from('messages').select('*', { count: 'exact', head: true }).gte('created_at', todayStart),
    ])
  ])

  const [
    totalListings,
    activeListings,
    expiredListings,
    soldListings,
    totalUsers,
    newUsersToday,
    totalMessages,
    messagesToday,
  ] = totalStats.map(r => r.count || 0)

  const statsData = {
    totalAds: totalListings || 0,
    activeAds: activeListings || 0,
    expiredAds: expiredListings || 0,
    soldAds: soldListings || 0,
    unresolvedReports: 0, // placeholder - no reports table yet
    totalUsers: totalUsers || 0,
    newUsersToday: newUsersToday || 0,
    totalMessages: totalMessages || 0,
    messagesToday: messagesToday || 0,
  }

  return (
    <AdminDashboard 
      initialAds={listings.data || []}
      initialReports={[]} // no reports table yet
      initialStats={statsData}
      adminUser={{ ...admin, name: admin.full_name || admin.email || '' }}
    />
  )
}
