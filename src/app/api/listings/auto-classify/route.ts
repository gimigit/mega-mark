import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Manufacturer aliases: slug → list of strings to search for in title
const MFG_ALIASES: Record<string, string[]> = {
  'john-deere':      ['john deere', 'johndeere', ' jd '],
  'case-ih':         ['case ih', 'caseih', 'case-ih'],
  'new-holland':     ['new holland', 'newholland', ' nh '],
  'fendt':           ['fendt'],
  'massey-ferguson': ['massey ferguson', 'massey-ferguson', ' mf '],
  'claas':           ['claas'],
  'kubota':          ['kubota'],
  'deutz-fahr':      ['deutz-fahr', 'deutz fahr', 'deutz'],
  'valtra':          ['valtra'],
  'jcb':             ['jcb'],
  'valmet':          ['valmet'],
  'steyr':           ['steyr'],
  'mccormick':       ['mccormick'],
  'zetor':           ['zetor'],
  'belarus':         ['belarus', ' mtz '],
  'versatile':       ['versatile'],
  'poettinger':      ['pöttinger', 'pottinger', 'poettinger'],
  'lemken':          ['lemken'],
  'kverneland':      ['kverneland'],
}

// Category slug → keywords that indicate that category
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'tractors':      ['tractor', 'tractoare', 'tracteur', 'traktor', 'ciągnik', 'articulated tractor'],
  'combines':      ['combina', 'combine', 'moissonneuse', 'mähdrescher', 'kombajn', 'combine harvester'],
  'harvesters':    ['recoltator', 'recoltor', 'ensileuse', 'feldhäcksler', 'silage', 'header', 'forage harvester', 'sugar beet', 'potato harvester'],
  'sprayers':      ['stropit', 'stropitor', 'pulverizator', 'sprayer', 'sprüh', 'atomizor', 'field sprayer'],
  'seeders':       ['semanat', 'semanaoare', 'semănătoare', 'seeder', 'semoir', 'siewnik', 'planter', 'drill', 'pneumatic seeder'],
  'plows':         ['plug ', 'pluguri', 'plow', 'charrue', 'pflug', 'disc harrow', 'grapa', 'cultivator', 'subsoiler', 'tillage'],
  'balers':        ['balotiera', 'balot', 'presa balot', 'baler', 'rotopress', 'round baler', 'square baler', 'press'],
  'loaders':       ['incarcator', 'încărcător', 'loader', 'frontlader', 'telehandler', 'telescopic', 'front loader'],
  'trailers':      ['remorca', 'remorci', 'trailer', 'cisterna', 'bena', 'tipping trailer', 'tank', 'spreader'],
  'construction':  ['excavator', 'buldozer', 'bulldozer', 'macara', 'crane', 'skid steer', 'mini loader', 'compactor'],
  'other':         [],
}

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const title = req.nextUrl.searchParams.get('title')?.trim() || ''
  const description = req.nextUrl.searchParams.get('description')?.trim() || ''

  if (!title) return NextResponse.json({ category_slug: null, manufacturer_slug: null })

  const text = (title + ' ' + description).toLowerCase()

  // Detect manufacturer
  let detectedMfgSlug: string | null = null
  for (const [slug, aliases] of Object.entries(MFG_ALIASES)) {
    if (aliases.some(a => text.includes(a))) {
      detectedMfgSlug = slug
      break
    }
  }

  // Detect category (first match wins — ordered by specificity)
  let detectedCategorySlug: string | null = null
  for (const [slug, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (slug === 'other') continue
    if (keywords.some(k => text.includes(k))) {
      detectedCategorySlug = slug
      break
    }
  }

  if (!detectedMfgSlug && !detectedCategorySlug) {
    return NextResponse.json({ category_id: null, manufacturer_id: null })
  }

  // Resolve slugs → IDs
  const supabase = await createClient()
  const [catRes, mfgRes] = await Promise.all([
    detectedCategorySlug
      ? supabase.from('categories').select('id').eq('slug', detectedCategorySlug).single()
      : Promise.resolve({ data: null }),
    detectedMfgSlug
      ? supabase.from('manufacturers').select('id').eq('slug', detectedMfgSlug).single()
      : Promise.resolve({ data: null }),
  ])

  return NextResponse.json({
    category_id: catRes.data?.id ?? null,
    manufacturer_id: mfgRes.data?.id ?? null,
    category_slug: detectedCategorySlug,
    manufacturer_slug: detectedMfgSlug,
  })
}
