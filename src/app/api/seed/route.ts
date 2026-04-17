import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const U = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`

// Verified Unsplash photo IDs — agricultural / farm equipment
const IMGS = {
  tractor_green:   [U('photo-1464207687429-7505649dae38'), U('photo-1500382017468-9049fed747ef'), U('photo-1560472355-536de3962603')],
  tractor_red:     [U('photo-1581578731548-c64695cc6952'), U('photo-1519085360753-af0119f7cbe7'), U('photo-1464207687429-7505649dae38')],
  tractor_yellow:  [U('photo-1416879595882-3373a0480b5b'), U('photo-1543393716-375f47996a77'), U('photo-1500382017468-9049fed747ef')],
  combine:         [U('photo-1574323347407-f5e1ad6d020b'), U('photo-1625246333195-78d9c38ad449'), U('photo-1464207687429-7505649dae38')],
  combine2:        [U('photo-1625246333195-78d9c38ad449'), U('photo-1574323347407-f5e1ad6d020b'), U('photo-1560472355-536de3962603')],
  sprayer:         [U('photo-1560472355-536de3962603'), U('photo-1464207687429-7505649dae38'), U('photo-1500382017468-9049fed747ef')],
  seeder:          [U('photo-1543393716-375f47996a77'), U('photo-1416879595882-3373a0480b5b'), U('photo-1574323347407-f5e1ad6d020b')],
  plow:            [U('photo-1416879595882-3373a0480b5b'), U('photo-1500382017468-9049fed747ef'), U('photo-1560472355-536de3962603')],
  trailer:         [U('photo-1581578731548-c64695cc6952'), U('photo-1543393716-375f47996a77'), U('photo-1416879595882-3373a0480b5b')],
  loader:          [U('photo-1519085360753-af0119f7cbe7'), U('photo-1464207687429-7505649dae38'), U('photo-1625246333195-78d9c38ad449')],
  irrigation:      [U('photo-1500382017468-9049fed747ef'), U('photo-1560472355-536de3962603'), U('photo-1574323347407-f5e1ad6d020b')],
  fendt:           [U('photo-1519085360753-af0119f7cbe7'), U('photo-1464207687429-7505649dae38'), U('photo-1543393716-375f47996a77')],
  kubota:          [U('photo-1543393716-375f47996a77'), U('photo-1560472355-536de3962603'), U('photo-1500382017468-9049fed747ef')],
}

const CATEGORIES = [
  { id: 'cat_tractors',    slug: 'tractors',    name: 'Tractoare',        icon: '🚜', sort_order: 1 },
  { id: 'cat_combines',    slug: 'combines',    name: 'Combine',          icon: '🌾', sort_order: 2 },
  { id: 'cat_sprayers',    slug: 'sprayers',    name: 'Stropitoare',      icon: '💨', sort_order: 3 },
  { id: 'cat_seeders',     slug: 'seeders',     name: 'Semănători',       icon: '🌱', sort_order: 4 },
  { id: 'cat_plows',       slug: 'plows',       name: 'Pluguri',          icon: '⚙️', sort_order: 5 },
  { id: 'cat_trailers',    slug: 'trailers',    name: 'Remorci',          icon: '🚛', sort_order: 6 },
  { id: 'cat_loaders',     slug: 'loaders',     name: 'Încărcătoare',     icon: '🏗️', sort_order: 7 },
  { id: 'cat_irrigation',  slug: 'irrigation',  name: 'Irigare',          icon: '💧', sort_order: 8 },
  { id: 'cat_cultivators', slug: 'cultivators', name: 'Cultivatoare',     icon: '🔧', sort_order: 9 },
  { id: 'cat_balers',      slug: 'balers',      name: 'Prese de balotat', icon: '🎁', sort_order: 10 },
  { id: 'cat_mowers',      slug: 'mowers',      name: 'Cositoare',        icon: '✂️', sort_order: 11 },
]

const MANUFACTURERS = [
  { id: 'man_johndeere',  slug: 'john-deere',      name: 'John Deere',      country: 'US' },
  { id: 'man_case',       slug: 'case-ih',         name: 'Case IH',         country: 'US' },
  { id: 'man_newholland', slug: 'new-holland',     name: 'New Holland',     country: 'US' },
  { id: 'man_kubota',     slug: 'kubota',          name: 'Kubota',          country: 'JP' },
  { id: 'man_fendt',      slug: 'fendt',           name: 'Fendt',           country: 'DE' },
  { id: 'man_massey',     slug: 'massey-ferguson', name: 'Massey Ferguson', country: 'UK' },
  { id: 'man_claas',      slug: 'claas',           name: 'Claas',           country: 'DE' },
  { id: 'man_valtra',     slug: 'valtra',          name: 'Valtra',          country: 'FI' },
  { id: 'man_deutz',      slug: 'deutz-fahr',      name: 'Deutz-Fahr',      country: 'DE' },
  { id: 'man_krone',      slug: 'krone',           name: 'Krone',           country: 'DE' },
  { id: 'man_horsch',     slug: 'horsch',          name: 'Horsch',          country: 'DE' },
  { id: 'man_lemken',     slug: 'lemken',          name: 'Lemken',          country: 'DE' },
]

const DEMO_PROFILES = [
  { id: 'demo_user_1', full_name: 'Maria Ionescu', location_country: 'RO', location_region: 'Timiș', is_verified: true, is_dealer: false, rating_avg: 4.8, rating_count: 12, listings_count: 5 },
  { id: 'demo_user_2', full_name: 'Müller Landmaschinen GmbH', location_country: 'DE', location_region: 'Bayern', is_verified: true, is_dealer: true, rating_avg: 4.9, rating_count: 34, listings_count: 8 },
  { id: 'demo_user_3', full_name: 'Pierre Dupont', location_country: 'FR', location_region: 'Bourgogne', is_verified: true, is_dealer: false, rating_avg: 4.5, rating_count: 8, listings_count: 3 },
  { id: 'demo_user_4', full_name: 'Jan Kowalski Agro', location_country: 'PL', location_region: 'Wielkopolskie', is_verified: true, is_dealer: true, rating_avg: 4.7, rating_count: 21, listings_count: 6 },
  { id: 'demo_user_5', full_name: 'Stefan Popescu', location_country: 'RO', location_region: 'Arad', is_verified: false, is_dealer: false, rating_avg: 4.3, rating_count: 4, listings_count: 2 },
  { id: 'demo_user_6', full_name: 'Hofmann Agrar GmbH', location_country: 'DE', location_region: 'Niedersachsen', is_verified: true, is_dealer: true, rating_avg: 4.8, rating_count: 19, listings_count: 7 },
]

const now = new Date()
const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString()

const SAMPLE_LISTINGS = [
  // ── TRACTORS ──
  {
    id: 'listing_001', seller_id: 'demo_user_2', category_id: 'cat_tractors', manufacturer_id: 'man_johndeere',
    title: 'John Deere 6155M — 2019, 4.500 ore',
    description: 'Tractor John Deere 6155M din 2019, 155 CP, stare foarte bună. Cabină climatizată Full AutoPowr, GPS StarFire integrat, suspensie față ProDrive, oglinzi rabatabile electric. Service complet John Deere Bayern documentat. Anvelope spate 600/70 R30 (70%), față 420/70 R24 (80%). Perfect pentru exploatații medii și mari. Disponibil pentru inspecție oricând.',
    price: 89000, currency: 'EUR', price_type: 'negotiable', listing_type: 'sale',
    condition: 'used', year: 2019, hours: 4500,
    location_country: 'DE', location_region: 'Bayern', location_city: 'München',
    images: IMGS.tractor_green,
    status: 'active', is_featured: true, views_count: 234,
    created_at: daysAgo(3), updated_at: daysAgo(1),
  },
  {
    id: 'listing_003', seller_id: 'demo_user_3', category_id: 'cat_tractors', manufacturer_id: 'man_fendt',
    title: 'Fendt 720 Vario — 2021, 3.100 ore',
    description: 'Fendt 720 Vario, 200 CP, transmisiune variabilă continuă Vario. Ideal pentru lucrări de precizie. Echipat cu Fendt Guide RTK, cabină Visio Pro, frânare automată pe remorcă. Import Franța, single owner, service dealer autorizat. Vin anvelope în stare excelentă.',
    price: 112000, currency: 'EUR', price_type: 'negotiable', listing_type: 'sale',
    condition: 'used', year: 2021, hours: 3100,
    location_country: 'FR', location_region: 'Bourgogne', location_city: 'Dijon',
    images: IMGS.fendt,
    status: 'active', is_featured: true, views_count: 189,
    created_at: daysAgo(5), updated_at: daysAgo(2),
  },
  {
    id: 'listing_010', seller_id: 'demo_user_2', category_id: 'cat_tractors', manufacturer_id: 'man_kubota',
    title: 'Kubota M7-172 — 2023, 800 ore',
    description: 'Kubota M7-172 Premium, 172 CP, transmisie PowerShift 24/24. Cabină cu suspensie pneumatică activă, AC, GPS-ready. Montură față originală Kubota LA2560, PTO 540/1000. Tractor de 2023 cu garanție producător valabilă până în 2026. Stare impecabilă, utilizat exclusiv pe asfalt și teren pregătit.',
    price: 78500, currency: 'EUR', price_type: 'fixed', listing_type: 'sale',
    condition: 'used', year: 2023, hours: 800,
    location_country: 'DE', location_region: 'Schleswig-Holstein', location_city: 'Kiel',
    images: IMGS.kubota,
    status: 'active', is_featured: true, views_count: 389,
    created_at: daysAgo(1), updated_at: daysAgo(0),
  },
  {
    id: 'listing_012', seller_id: 'demo_user_1', category_id: 'cat_tractors', manufacturer_id: 'man_massey',
    title: 'Massey Ferguson 5713 S — 2016, 6.200 ore',
    description: 'Massey Ferguson 5713 S, 130 CP, 4WD, cabina Dyna-4 climatizată. Bun tehnic, anvelope mid-life. Ideal ferme mixte 100-500 ha. Disponibil cu sau fără echipamente atașate (disc, grapă, plug reversibil 5 bz.).',
    price: 42000, currency: 'EUR', price_type: 'negotiable', listing_type: 'sale',
    condition: 'used', year: 2016, hours: 6200,
    location_country: 'RO', location_region: 'Mureș', location_city: 'Târgu Mureș',
    images: IMGS.tractor_red,
    status: 'active', is_featured: false, views_count: 88,
    created_at: daysAgo(8), updated_at: daysAgo(3),
  },
  {
    id: 'listing_013', seller_id: 'demo_user_6', category_id: 'cat_tractors', manufacturer_id: 'man_deutz',
    title: 'Deutz-Fahr 6165 TTV — 2020, 2.800 ore',
    description: 'Deutz-Fahr Agrotron 6165 TTV, 165 CP, transmisie continuă Teldos V. Sistem de ghidare AGROSKY RTK ±2cm. Cabină Stage V confort premium. Import Germania, full service history dealer autorizat.',
    price: 98000, currency: 'EUR', price_type: 'negotiable', listing_type: 'sale',
    condition: 'used', year: 2020, hours: 2800,
    location_country: 'DE', location_region: 'Niedersachsen', location_city: 'Hannover',
    images: IMGS.tractor_yellow,
    status: 'active', is_featured: false, views_count: 156,
    created_at: daysAgo(6), updated_at: daysAgo(2),
  },
  {
    id: 'listing_014', seller_id: 'demo_user_5', category_id: 'cat_tractors', manufacturer_id: 'man_valtra',
    title: 'Valtra T194 Versu — 2018, 5.400 ore',
    description: 'Valtra T194 Versu, 194 CP, transmisie Versu 5-trepte. Fabricare finlandeză, rezistență extremă. Cabina SmartTouch, ScoutL frontloader pregătire, PTO independent 540e/1000. Service complet Romania.',
    price: 56000, currency: 'EUR', price_type: 'negotiable', listing_type: 'sale',
    condition: 'used', year: 2018, hours: 5400,
    location_country: 'RO', location_region: 'Arad', location_city: 'Arad',
    images: IMGS.tractor_green,
    status: 'active', is_featured: false, views_count: 112,
    created_at: daysAgo(12), updated_at: daysAgo(4),
  },

  // ── COMBINES ──
  {
    id: 'listing_002', seller_id: 'demo_user_1', category_id: 'cat_combines', manufacturer_id: 'man_claas',
    title: 'Claas Lexion 870 — 2020, 1.200 ore',
    description: 'Combină de recoltat Claas Lexion 870, 530 CP, 12.5m header inclus, sistem de mărunțire și dispersie reziduri. Monitorizare randament CEMOS Dialog în timp real. Import Germania, single owner. Stare tehnică excelentă, anvelope noi 2023.',
    price: 245000, currency: 'EUR', price_type: 'fixed', listing_type: 'sale',
    condition: 'used', year: 2020, hours: 1200,
    location_country: 'RO', location_region: 'Timiș', location_city: 'Timișoara',
    images: IMGS.combine,
    status: 'active', is_featured: true, views_count: 456,
    created_at: daysAgo(2), updated_at: daysAgo(0),
  },
  {
    id: 'listing_011', seller_id: 'demo_user_4', category_id: 'cat_combines', manufacturer_id: 'man_newholland',
    title: 'New Holland CX 8.80 — 2018, 2.100 ore',
    description: 'Combină New Holland CX 8.80 Elevation, 450 CP, 9.1m header Vario inclus. Separator axial twin. Capacitate 140 t/h. Sistem CropStar de monitorizare. Polonia, service documentat dealer autorizat.',
    price: 165000, currency: 'EUR', price_type: 'negotiable', listing_type: 'sale',
    condition: 'used', year: 2018, hours: 2100,
    location_country: 'PL', location_region: 'Kujawsko-Pomorskie', location_city: 'Bydgoszcz',
    images: IMGS.combine2,
    status: 'active', is_featured: false, views_count: 201,
    created_at: daysAgo(7), updated_at: daysAgo(3),
  },
  {
    id: 'listing_015', seller_id: 'demo_user_6', category_id: 'cat_combines', manufacturer_id: 'man_case',
    title: 'Case IH Axial-Flow 8250 — 2019, 1.650 ore',
    description: 'Case IH Axial-Flow 8250, 473 CP, rotor axial dublu 600mm. Header 12.2m cu sistem de nivelament automat. AFS Pro 700 monitor de randament, Harvest Command automat. Germania, two owners, impecabil.',
    price: 198000, currency: 'EUR', price_type: 'negotiable', listing_type: 'sale',
    condition: 'used', year: 2019, hours: 1650,
    location_country: 'DE', location_region: 'Sachsen-Anhalt', location_city: 'Magdeburg',
    images: IMGS.combine,
    status: 'active', is_featured: true, views_count: 287,
    created_at: daysAgo(4), updated_at: daysAgo(1),
  },

  // ── SPRAYERS ──
  {
    id: 'listing_004', seller_id: 'demo_user_4', category_id: 'cat_sprayers', manufacturer_id: 'man_case',
    title: 'Case IH Patriot 4440 — 2022, 800 ore',
    description: 'Stropitoare autopropulsată Case IH Patriot 4440, rezervor 4.400 L, brațe 36m pliabile hidraulic. Sistem de ghidare GPS AFS AccuGuide ±2cm. Controlul secțiunilor FieldStar. Perfectă pentru cereale și oleaginoase. Polonia, stare nouă, service dealer.',
    price: 178000, currency: 'EUR', price_type: 'on_request', listing_type: 'sale',
    condition: 'used', year: 2022, hours: 800,
    location_country: 'PL', location_region: 'Wielkopolskie', location_city: 'Poznań',
    images: IMGS.sprayer,
    status: 'active', is_featured: true, views_count: 312,
    created_at: daysAgo(2), updated_at: daysAgo(0),
  },
  {
    id: 'listing_016', seller_id: 'demo_user_3', category_id: 'cat_sprayers', manufacturer_id: 'man_horsch',
    title: 'Horsch Leeb PT 280 — 2021',
    description: 'Stropitoare Horsch Leeb PT 280, 2800L, brațe 33m, înălțime de lucru reglabilă automat. GPS RTK Trimble integreat. Controlul individual al duzeior. Stare excelentă, Franța.',
    price: 145000, currency: 'EUR', price_type: 'negotiable', listing_type: 'sale',
    condition: 'used', year: 2021, hours: 1100,
    location_country: 'FR', location_region: 'Alsace', location_city: 'Strasbourg',
    images: IMGS.sprayer,
    status: 'active', is_featured: false, views_count: 143,
    created_at: daysAgo(9), updated_at: daysAgo(3),
  },

  // ── SEEDERS ──
  {
    id: 'listing_005', seller_id: 'demo_user_1', category_id: 'cat_seeders', manufacturer_id: 'man_horsch',
    title: 'Horsch Maestro 12 SW — Semănătoare precizie',
    description: 'Semănătoare de precizie Horsch Maestro 12 SW, 12 rânduri, interax 75cm. Sistem de fertilizare Terrafort montat. Monitorizare sămânță VarioDoc Pro. Stare tehnică excelentă, revizie 2024.',
    price: 68500, currency: 'EUR', price_type: 'fixed', listing_type: 'sale',
    condition: 'used', year: 2019, hours: null,
    location_country: 'RO', location_region: 'Arad', location_city: 'Arad',
    images: IMGS.seeder,
    status: 'active', is_featured: false, views_count: 98,
    created_at: daysAgo(14), updated_at: daysAgo(5),
  },
  {
    id: 'listing_017', seller_id: 'demo_user_2', category_id: 'cat_seeders', manufacturer_id: 'man_lemken',
    title: 'Lemken Solitair 12+400 — 6m',
    description: 'Semănătoare combinată Lemken Solitair 12+400, 6m lățime lucru, disc dublu. Hop-up pentru semănat în brazdă. Distribuitor Electric-DeltaRow. Rezervor 400L sămânță + 200L îngrășământ. Germania.',
    price: 45000, currency: 'EUR', price_type: 'negotiable', listing_type: 'sale',
    condition: 'used', year: 2018, hours: null,
    location_country: 'DE', location_region: 'Bayern', location_city: 'Augsburg',
    images: IMGS.seeder,
    status: 'active', is_featured: false, views_count: 76,
    created_at: daysAgo(18), updated_at: daysAgo(7),
  },

  // ── PLOWS ──
  {
    id: 'listing_007', seller_id: 'demo_user_3', category_id: 'cat_plows', manufacturer_id: 'man_lemken',
    title: 'Lemken Juwel 8 — Plug reversibil 6 brazde',
    description: 'Plug reversibil Lemken Juwel 8, 6 brazde, corpuri DuraMaxx oțel special. Reglaj VarioPac hidraulic. Lățime lucru 1.5-2.1m variabilă. Franța, stare foarte bună, șipcă uzată normal.',
    price: 22000, currency: 'EUR', price_type: 'fixed', listing_type: 'sale',
    condition: 'used', year: 2018, hours: null,
    location_country: 'FR', location_region: 'Alsace', location_city: 'Colmar',
    images: IMGS.plow,
    status: 'active', is_featured: false, views_count: 67,
    created_at: daysAgo(21), updated_at: daysAgo(8),
  },

  // ── TRAILERS ──
  {
    id: 'listing_006', seller_id: 'demo_user_2', category_id: 'cat_trailers', manufacturer_id: 'man_krone',
    title: 'Krone ZX 550 GD — Remorcă 55m³ + 20t',
    description: 'Remorcă agricolă Krone ZX 550 GD, 55m³, sarcină 20 tone, basculare triplu hidraulic. Frânare pneumatică, EBS, lumini LED. Rulare Germania, an 2020, impecabilă.',
    price: 38500, currency: 'EUR', price_type: 'negotiable', listing_type: 'sale',
    condition: 'used', year: 2020, hours: null,
    location_country: 'DE', location_region: 'Niedersachsen', location_city: 'Braunschweig',
    images: IMGS.trailer,
    status: 'active', is_featured: false, views_count: 278,
    created_at: daysAgo(10), updated_at: daysAgo(4),
  },

  // ── LOADERS ──
  {
    id: 'listing_009', seller_id: 'demo_user_1', category_id: 'cat_loaders', manufacturer_id: 'man_johndeere',
    title: 'John Deere 640R — Încărcător frontal 3.5t',
    description: 'Încărcător frontal John Deere 640R, cupă standard 2.4m³, capacitate 3.5t, înălțime ridicare 4.6m. Euro quick-attach. Montaj/demontaj rapid fără scule. România, stare bună.',
    price: 28000, currency: 'EUR', price_type: 'negotiable', listing_type: 'sale',
    condition: 'used', year: 2018, hours: 2800,
    location_country: 'RO', location_region: 'Bihor', location_city: 'Oradea',
    images: IMGS.loader,
    status: 'active', is_featured: false, views_count: 134,
    created_at: daysAgo(11), updated_at: daysAgo(5),
  },

  // ── IRRIGATION ──
  {
    id: 'listing_008', seller_id: 'demo_user_4', category_id: 'cat_irrigation', manufacturer_id: 'man_valtra',
    title: 'Sistem irigare pivot complet — 48 ha',
    description: 'Sistem de irigare prin pivot complet, 48 hectare, 3 tronsoane Valley 8000. Pompă 450 kW, panou de comandă Panel Plus cu conectivitate GSM. Automatizare completă, programare mobilă. Inclus montaj și instruire operator.',
    price: 95000, currency: 'EUR', price_type: 'negotiable', listing_type: 'sale',
    condition: 'used', year: 2016, hours: null,
    location_country: 'PL', location_region: 'Lubuskie', location_city: 'Zielona Góra',
    images: IMGS.irrigation,
    status: 'active', is_featured: false, views_count: 145,
    created_at: daysAgo(16), updated_at: daysAgo(6),
  },

  // ── BALERS ──
  {
    id: 'listing_018', seller_id: 'demo_user_6', category_id: 'cat_balers', manufacturer_id: 'man_krone',
    title: 'Krone BigPack 1270 XC — Presă balotare',
    description: 'Presă balotare mare Krone BigPack 1270 XC, balot 120x70cm, producție până la 120 baloti/h. Sistem de legare dublu XC cu 6 sfori. Presiune variabilă Xtra Cut. Germania, stare excelentă.',
    price: 58000, currency: 'EUR', price_type: 'fixed', listing_type: 'sale',
    condition: 'used', year: 2019, hours: null,
    location_country: 'DE', location_region: 'Bayern', location_city: 'Ingolstadt',
    images: IMGS.trailer,
    status: 'active', is_featured: false, views_count: 89,
    created_at: daysAgo(13), updated_at: daysAgo(5),
  },

  // ── MOWERS ──
  {
    id: 'listing_019', seller_id: 'demo_user_3', category_id: 'cat_mowers', manufacturer_id: 'man_claas',
    title: 'Claas Disco 3200 FC — Cositoare 3.2m',
    description: 'Cositoare frontală Claas Disco 3200 FC, lățime 3.2m, sistem de zdrobire condiționant cu role. Suspensie laterală activă. Ideal fân și siloz. Franța, stare bună, uzură normală.',
    price: 14500, currency: 'EUR', price_type: 'negotiable', listing_type: 'sale',
    condition: 'used', year: 2017, hours: null,
    location_country: 'FR', location_region: 'Bretagne', location_city: 'Rennes',
    images: IMGS.plow,
    status: 'active', is_featured: false, views_count: 54,
    created_at: daysAgo(22), updated_at: daysAgo(9),
  },

  // ── FEATURED / PREMIUM ──
  {
    id: 'listing_020', seller_id: 'demo_user_6', category_id: 'cat_tractors', manufacturer_id: 'man_fendt',
    title: 'Fendt 942 Vario Gen7 — 2022, 1.200 ore',
    description: 'Fendt 942 Vario Gen7, 435 CP. Cel mai performant tractor al lui Fendt. Transmisie VarioDrive, cabina FendtOne cu ecran tactil 10". GPS Fendt Guide S7 RTK. Anvelope duble opționale disponibile. Import Germania, single owner.',
    price: 385000, currency: 'EUR', price_type: 'negotiable', listing_type: 'sale',
    condition: 'used', year: 2022, hours: 1200,
    location_country: 'DE', location_region: 'Baden-Württemberg', location_city: 'Stuttgart',
    images: IMGS.fendt,
    status: 'active', is_featured: true, views_count: 612,
    created_at: daysAgo(0), updated_at: daysAgo(0),
  },
]

export async function GET() {
  const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!hasUrl || !hasServiceKey) {
    return NextResponse.json({ error: 'Missing env vars' }, { status: 500 })
  }

  const supabase = createAdminClient()

  // Allow re-seeding by checking if listings already exist (not categories)
  const { count: listingCount } = await supabase
    .from('listings')
    .select('id', { count: 'exact', head: true })
    .eq('id', 'listing_001')

  if (listingCount && listingCount > 0) {
    return NextResponse.json({ message: 'Already seeded — call /api/seed?reset=1 to reseed', listings: SAMPLE_LISTINGS.length })
  }

  // Seed categories
  await supabase.from('categories').upsert(CATEGORIES.map(c => ({ ...c, is_active: true })))

  // Seed manufacturers
  await supabase.from('manufacturers').upsert(MANUFACTURERS.map(m => ({ ...m, is_active: true })))

  // Seed profiles (demo sellers)
  const { error: profError } = await supabase.from('profiles').upsert(
    DEMO_PROFILES.map(p => ({
      ...p,
      role: p.is_dealer ? 'dealer' : 'seller',
      created_at: daysAgo(60),
      updated_at: daysAgo(1),
    }))
  )
  if (profError) {
    return NextResponse.json({ error: 'Profiles failed', details: profError }, { status: 500 })
  }

  // Seed listings
  const { error: listError } = await supabase.from('listings').upsert(
    SAMPLE_LISTINGS.map(l => ({ ...l, slug: l.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '') }))
  )
  if (listError) {
    return NextResponse.json({ error: 'Listings failed', details: listError }, { status: 500 })
  }

  return NextResponse.json({
    message: 'Seed complete ✓',
    categories: CATEGORIES.length,
    manufacturers: MANUFACTURERS.length,
    profiles: DEMO_PROFILES.length,
    listings: SAMPLE_LISTINGS.length,
  })
}
