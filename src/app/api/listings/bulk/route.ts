import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const VALID_CONDITIONS = ['new', 'used', 'refurbished']
const VALID_CURRENCIES = ['EUR', 'RON', 'USD', 'GBP', 'PLN', 'HUF', 'CZK']
const MAX_BATCH = 50

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Neautentificat' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, is_dealer')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'dealer' && profile.role !== 'admin' && !profile.is_dealer)) {
    return NextResponse.json({ error: 'Doar dealerii pot folosi bulk upload' }, { status: 403 })
  }

  const body = await request.json()
  const { listings } = body as { listings: Record<string, string>[] }

  if (!Array.isArray(listings) || listings.length === 0) {
    return NextResponse.json({ error: 'Lista de anunțuri este goală' }, { status: 400 })
  }
  if (listings.length > MAX_BATCH) {
    return NextResponse.json({ error: `Maxim ${MAX_BATCH} anunțuri per upload` }, { status: 400 })
  }

  // Resolve category slugs → IDs
  const { data: categories } = await supabase.from('categories').select('id, slug')
  const categoryMap = Object.fromEntries((categories ?? []).map(c => [c.slug, c.id]))

  // Resolve manufacturer names → IDs
  const { data: manufacturers } = await supabase.from('manufacturers').select('id, name')
  const mfgMap = Object.fromEntries(
    (manufacturers ?? []).map(m => [m.name.toLowerCase(), m.id])
  )

  const rows: Record<string, unknown>[] = []
  const errors: { row: number; error: string }[] = []

  for (let i = 0; i < listings.length; i++) {
    const r = listings[i]
    if (!r.title?.trim()) { errors.push({ row: i + 1, error: 'Titlul lipsește' }); continue }

    const categoryId = r.category_slug ? categoryMap[r.category_slug.trim()] ?? null : null
    const manufacturerId = r.manufacturer_name
      ? mfgMap[r.manufacturer_name.trim().toLowerCase()] ?? null
      : null

    const price = r.price ? parseFloat(r.price) : null
    const year = r.year ? parseInt(r.year) : null
    const hours = r.hours ? parseInt(r.hours) : null
    const power_hp = r.power_hp ? parseInt(r.power_hp) : null
    const condition = VALID_CONDITIONS.includes(r.condition) ? r.condition : 'used'
    const currency = VALID_CURRENCIES.includes(r.currency?.toUpperCase())
      ? r.currency.toUpperCase()
      : 'EUR'

    rows.push({
      seller_id: user.id,
      title: r.title.trim(),
      description: r.description?.trim() || null,
      category_id: categoryId,
      manufacturer_id: manufacturerId,
      price: price && !isNaN(price) ? price : null,
      currency,
      price_type: 'fixed',
      year: year && !isNaN(year) ? year : null,
      hours: hours && !isNaN(hours) ? hours : null,
      power_hp: power_hp && !isNaN(power_hp) ? power_hp : null,
      condition,
      listing_type: 'sale',
      location_country: r.location_country?.trim() || 'Romania',
      location_region: r.location_region?.trim() || null,
      location_city: r.location_city?.trim() || null,
      status: 'active',
    })
  }

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Niciun rând valid', errors }, { status: 400 })
  }

  const { data: inserted, error: insertError } = await supabase
    .from('listings')
    .insert(rows)
    .select('id, title')

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({
    created: inserted?.length ?? 0,
    errors,
  })
}
