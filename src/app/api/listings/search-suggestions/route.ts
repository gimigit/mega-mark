import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim()
  if (!q || q.length < 2) return NextResponse.json([])

  const supabase = await createClient()

  const { data } = await supabase
    .from('listings')
    .select('id, title, categories(name, icon)')
    .eq('status', 'active')
    .ilike('title', `%${q}%`)
    .order('views_count', { ascending: false })
    .limit(6)

  type Row = { id: string; title: string; categories: { name: string; icon: string } | null }
  const rows = (data as unknown as Row[] | null) ?? []

  return NextResponse.json(rows)
}
