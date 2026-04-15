import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const CATEGORIES = [
  { id: 'cat_tractors', slug: 'tractors', name: 'Tractoare', name_de: 'Traktoren', name_fr: 'Tracteurs', name_es: 'Tractores', name_pl: 'Ciągniki', name_ro: 'Tractoare', icon: '🚜', sort_order: 1 },
  { id: 'cat_combines', slug: 'combines', name: 'Combine', name_de: 'Mähdrescher', name_fr: 'Moissonneuses', name_es: 'Cosechadoras', name_pl: 'Kombajny', name_ro: 'Combine', icon: '🌾', sort_order: 2 },
  { id: 'cat_sprayers', slug: 'sprayers', name: 'Paturi de stropit', name_de: 'Feldspritzen', name_fr: 'Pulvérisateurs', name_es: 'Pulverizadores', name_pl: 'Opryskiwacze', name_ro: 'Paturi de stropit', icon: '💨', sort_order: 3 },
  { id: 'cat_seeders', slug: 'seeders', name: 'Semănători', name_de: 'Sämaschinen', name_fr: 'Semoirs', name_es: 'Sembradoras', name_pl: 'Siewniki', name_ro: 'Semănători', icon: '🌱', sort_order: 4 },
  { id: 'cat_plows', slug: 'plows', name: 'Pluguri', name_de: 'Pflüge', name_fr: 'Charrues', name_es: 'Arados', name_pl: 'Pługi', name_ro: 'Pluguri', icon: '⚙️', sort_order: 5 },
  { id: 'cat_trailers', slug: 'trailers', name: 'Remorci', name_de: 'Anhänger', name_fr: 'Remorques', name_es: 'Remolques', name_pl: 'Przyczepy', name_ro: 'Remorci', icon: '🚛', sort_order: 6 },
  { id: 'cat_loaders', slug: 'loaders', name: 'Încărcătoare', name_de: 'Lader', name_fr: 'Chargeurs', name_es: 'Cargadores', name_pl: 'Ładowacze', name_ro: 'Încărcătoare', icon: '🏗️', sort_order: 7 },
  { id: 'cat_irrigation', slug: 'irrigation', name: 'Irigare', name_de: 'Bewässerung', name_fr: 'Irrigation', name_es: 'Riego', name_pl: 'Nawadnianie', name_ro: 'Irigare', icon: '💧', sort_order: 8 },
]

const MANUFACTURERS = [
  { id: 'man_johndeere', slug: 'john-deere', name: 'John Deere', country: 'US' },
  { id: 'man_case', slug: 'case-ih', name: 'Case IH', country: 'US' },
  { id: 'man_newholland', slug: 'new-holland', name: 'New Holland', country: 'US' },
  { id: 'man_kubota', slug: 'kubota', name: 'Kubota', country: 'JP' },
  { id: 'man_fendt', slug: 'fendt', name: 'Fendt', country: 'DE' },
  { id: 'man_massey', slug: 'massey-ferguson', name: 'Massey Ferguson', country: 'UK' },
  { id: 'man_claas', slug: 'claas', name: 'Claas', country: 'DE' },
  { id: 'man_valtra', slug: 'valtra', name: 'Valtra', country: 'FI' },
]

const DEMO_PROFILES = [
  { id: 'demo_user_1', full_name: 'Maria Ionescu', location_country: 'RO', account_type: 'seller', rating_avg: 4.8, rating_count: 12, verified: true },
  { id: 'demo_user_2', full_name: 'Hans Müller GmbH', location_country: 'DE', account_type: 'dealer', rating_avg: 4.9, rating_count: 34, verified: true },
  { id: 'demo_user_3', full_name: 'Pierre Dupont', location_country: 'FR', account_type: 'seller', rating_avg: 4.5, rating_count: 8, verified: false },
  { id: 'demo_user_4', full_name: 'Jan Kowalski', location_country: 'PL', account_type: 'dealer', rating_avg: 4.7, rating_count: 21, verified: true },
]

const SAMPLE_LISTINGS = [
  {
    id: 'listing_001',
    seller_id: 'demo_user_2',
    category_id: 'cat_tractors',
    manufacturer_id: 'man_johndeere',
    title: 'John Deere 6155M — 2019, 4.500 ore',
    description: 'Tractor John Deere 6155M din 2019, 155 CP, stare foarte bună. Are cabină climatizată, GPS integrat, suspensie față. Service complet la zi. Perfect pentru exploatații medii și mari.',
    price: 89000,
    currency: 'EUR',
    price_type: 'negotiable',
    listing_type: 'sale',
    condition: 'used',
    year: 2019,
    hours: 4500,
    location_country: 'DE',
    location_region: 'Bayern',
    images: [],
    status: 'active',
    is_featured: true,
    views_count: 234,
  },
  {
    id: 'listing_002',
    seller_id: 'demo_user_1',
    category_id: 'cat_combines',
    manufacturer_id: 'man_claas',
    title: 'Claas Lexion 870 — 2020, 1.200 ore',
    description: 'Combină de recoltat Claas Lexion 870, 530 CP, 12.5m header inclus. Sistem de mărunțire și dispersie residuri. Monitorizare randament în timp real. Import Germania.',
    price: 245000,
    currency: 'EUR',
    price_type: 'fixed',
    listing_type: 'sale',
    condition: 'used',
    year: 2020,
    hours: 1200,
    location_country: 'RO',
    location_region: 'Timiș',
    images: [],
    status: 'active',
    is_featured: true,
    views_count: 456,
  },
  {
    id: 'listing_003',
    seller_id: 'demo_user_3',
    category_id: 'cat_tractors',
    manufacturer_id: 'man_fendt',
    title: 'Fendt 720 Vario — 2021, 3.100 ore',
    description: 'Fendt 720 Vario, 200 CP, transmisiune continuă Vario. Ideal pentru lucrări de precizie. Franța, stare excelentă.',
    price: 112000,
    currency: 'EUR',
    price_type: 'negotiable',
    listing_type: 'sale',
    condition: 'used',
    year: 2021,
    hours: 3100,
    location_country: 'FR',
    location_region: 'Bourgogne',
    images: [],
    status: 'active',
    is_featured: false,
    views_count: 189,
  },
  {
    id: 'listing_004',
    seller_id: 'demo_user_4',
    category_id: 'cat_sprayers',
    manufacturer_id: 'man_case',
    title: 'Case IH Patriot 4440 — 2022',
    description: 'Patură de stropit autopropulsată Case IH Patriot 4440, 4.400 L, brațe 36m. Sistem de ghidare GPS. Perfectă pentru culturi de cereale și oleaginoase.',
    price: 178000,
    currency: 'EUR',
    price_type: 'on_request',
    listing_type: 'sale',
    condition: 'used',
    year: 2022,
    hours: 800,
    location_country: 'PL',
    location_region: 'Wielkopolskie',
    images: [],
    status: 'active',
    is_featured: true,
    views_count: 312,
  },
  {
    id: 'listing_005',
    seller_id: 'demo_user_1',
    category_id: 'cat_seeders',
    manufacturer_id: 'man_kubota',
    title: 'Kubota 8000 — Semănătoare precizie',
    description: 'Semănătoare de precizie Kubota 8000, 8 rânduri, 70 cm interax. Sistem de fertilizare integrat. Stare tehnică excelentă.',
    price: 28500,
    currency: 'EUR',
    price_type: 'fixed',
    listing_type: 'sale',
    condition: 'used',
    year: 2018,
    hours: null,
    location_country: 'RO',
    location_region: 'Arad',
    images: [],
    status: 'active',
    is_featured: false,
    views_count: 98,
  },
  {
    id: 'listing_006',
    seller_id: 'demo_user_2',
    category_id: 'cat_trailers',
    manufacturer_id: 'man_newholland',
    title: 'New Holland T8.435 + Remorcă 20t',
    description: 'Pachet tractor New Holland T8.435 (435 CP, 2020, 2.200 ore) + remorcă agricolă 20 tone, benă basculantă 3 laturi. Ofertă combinată avantajoasă.',
    price: 320000,
    currency: 'EUR',
    price_type: 'negotiable',
    listing_type: 'sale',
    condition: 'used',
    year: 2020,
    hours: 2200,
    location_country: 'DE',
    location_region: 'Niedersachsen',
    images: [],
    status: 'active',
    is_featured: false,
    views_count: 278,
  },
  {
    id: 'listing_007',
    seller_id: 'demo_user_3',
    category_id: 'cat_plows',
    manufacturer_id: 'man_massey',
    title: 'Massey Ferguson 8 brăzdare reversibile',
    description: 'Plug reversibil 8 brăzdare Massey Ferguson, corpuri semi-helicoidale. Lățime lucru 3.2m. Adaptare la orice tractor 180+ CP. Francez, bună stare.',
    price: 18500,
    currency: 'EUR',
    price_type: 'fixed',
    listing_type: 'sale',
    condition: 'used',
    year: 2017,
    hours: null,
    location_country: 'FR',
    location_region: 'Alsace',
    images: [],
    status: 'active',
    is_featured: false,
    views_count: 67,
  },
  {
    id: 'listing_008',
    seller_id: 'demo_user_4',
    category_id: 'cat_irrigation',
    manufacturer_id: 'man_valtra',
    title: 'Sistem irigare pivot complet — 48 ha',
    description: 'Sistem de irigare prin pivot complet, 48 hectare, 3 tronsoane. Pumpă performantă, automatizare completă. Inclus montaj și instruire.',
    price: 95000,
    currency: 'EUR',
    price_type: 'negotiable',
    listing_type: 'sale',
    condition: 'used',
    year: 2016,
    hours: null,
    location_country: 'PL',
    location_region: 'Lubuskie',
    images: [],
    status: 'active',
    is_featured: false,
    views_count: 145,
  },
  {
    id: 'listing_009',
    seller_id: 'demo_user_1',
    category_id: 'cat_loaders',
    manufacturer_id: 'man_johndeere',
    title: 'John Deere 640L — Încărcător frontal',
    description: 'Încărcător frontal John Deere 640L, cupă 3.1 m³, înălțime ridicare 4.2m. Cuant de descărcare 5.8t. Frană cuantică. România.',
    price: 67000,
    currency: 'EUR',
    price_type: 'negotiable',
    listing_type: 'sale',
    condition: 'used',
    year: 2019,
    hours: 3200,
    location_country: 'RO',
    location_region: 'Bihor',
    images: [],
    status: 'active',
    is_featured: false,
    views_count: 134,
  },
  {
    id: 'listing_010',
    seller_id: 'demo_user_2',
    category_id: 'cat_tractors',
    manufacturer_id: 'man_kubota',
    title: 'Kubota M7-172 — 2023, 800 ore',
    description: 'Kubota M7-172, 172 CP, transmisie powershift 24/24. Cabină cu suspensie pneumatică, montură față, PTO 540/1000. Tractor nou aproape, garanție producător valabilă.',
    price: 78500,
    currency: 'EUR',
    price_type: 'fixed',
    listing_type: 'sale',
    condition: 'refurbished',
    year: 2023,
    hours: 800,
    location_country: 'DE',
    location_region: 'Schleswig-Holstein',
    images: [],
    status: 'active',
    is_featured: true,
    views_count: 389,
  },
  {
    id: 'listing_011',
    seller_id: 'demo_user_4',
    category_id: 'cat_combines',
    manufacturer_id: 'man_newholland',
    title: 'New Holland CX 8.80 — 2018, 2.100 ore',
    description: 'Combină New Holland CX 8.80, 450 CP, 9.1m header Vario. Separator axial. Capacitate 140 t/h. Polonia, service documented.',
    price: 165000,
    currency: 'EUR',
    price_type: 'negotiable',
    listing_type: 'sale',
    condition: 'used',
    year: 2018,
    hours: 2100,
    location_country: 'PL',
    location_region: 'Kujawsko-Pomorskie',
    images: [],
    status: 'active',
    is_featured: false,
    views_count: 201,
  },
  {
    id: 'listing_012',
    seller_id: 'demo_user_1',
    category_id: 'cat_tractors',
    manufacturer_id: 'man_massey',
    title: 'Massey Ferguson 5713 — 2016, 6.200 ore',
    description: 'Massey Ferguson 5713, 130 CP, 4WD, cabină climatizată. Bună stare generală, pretinde revizie. Ideal pentru ferme mixte.',
    price: 42000,
    currency: 'EUR',
    price_type: 'negotiable',
    listing_type: 'sale',
    condition: 'used',
    year: 2016,
    hours: 6200,
    location_country: 'RO',
    location_region: 'Mureș',
    images: [],
    status: 'active',
    is_featured: false,
    views_count: 88,
  },
]

export async function GET(request: Request) {
  // Debug: check if env vars are present at runtime
  const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!hasUrl || !hasServiceKey) {
    return NextResponse.json({
      error: 'Missing env vars',
      debug: { hasUrl, hasKey, hasServiceKey },
    }, { status: 500 })
  }

  const supabase = createAdminClient()

  // Check if already seeded
  const { count } = await supabase.from('categories').select('id', { count: 'exact', head: true })
  if (count && count > 0) {
    return NextResponse.json({ message: 'Already seeded', categories: count }, { status: 200 })
  }

  // Seed categories
  const { error: catError } = await supabase.from('categories').upsert(
    CATEGORIES.map(c => ({ ...c, is_active: true }))
  )
  if (catError) {
    return NextResponse.json({ error: 'Categories failed', details: catError }, { status: 500 })
  }

  // Seed manufacturers
  const { error: manError } = await supabase.from('manufacturers').upsert(
    MANUFACTURERS.map(m => ({ ...m, is_active: true }))
  )
  if (manError) {
    return NextResponse.json({ error: 'Manufacturers failed', details: manError }, { status: 500 })
  }

  // Seed profiles
  const { error: profError } = await supabase.from('profiles').upsert(
    DEMO_PROFILES.map(p => ({ ...p, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }))
  )
  if (profError) {
    return NextResponse.json({ error: 'Profiles failed', details: profError }, { status: 500 })
  }

  // Seed listings
  const { error: listError } = await supabase.from('listings').upsert(
    SAMPLE_LISTINGS.map(l => ({
      ...l,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }))
  )
  if (listError) {
    return NextResponse.json({ error: 'Listings failed', details: listError }, { status: 500 })
  }

  return NextResponse.json({
    message: 'Seed complete',
    categories: CATEGORIES.length,
    manufacturers: MANUFACTURERS.length,
    profiles: DEMO_PROFILES.length,
    listings: SAMPLE_LISTINGS.length,
  })
}
