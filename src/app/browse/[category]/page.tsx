import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getCategoryIcon, getCategoryTips, getCategoryIntro, ROMANIAN_COUNTIES } from '@/lib/categories'
import type { Database } from '@/types/database'

// Force dynamic - needs DB access at runtime
export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>
}): Promise<Metadata> {
  const { category: categorySlug } = await params

  // Get category from DB
  const supabase = await createClient()
  const { data: category } = await supabase
    .from('categories')
    .select('name, description')
    .eq('slug', categorySlug)
    .eq('is_active', true)
    .single()

  if (!category) {
    return {
      title: 'Pagina inexistentă — Mega-Mark',
    }
  }

  return {
    title: `${category.name} de vânzare — Mega-Mark`,
    description: category.description || `Găsește ${category.name.toLowerCase()} de vânzare. Anunțuri cu tractoare, combine și utilaje agricole din toată Europa.`,
    openGraph: {
      title: `${category.name} de vânzare — Mega-Mark`,
      description: `Caută ${category.name.toLowerCase()}. Anunțuri recente cu utilaje agricole.`,
    },
  }
}

interface Props {
  params: Promise<{ category: string }>
}

export default async function BrowseCategoryPage({ params }: Props) {
  const { category: categorySlug } = await params

  // Get category by slug
  const supabase = await createClient()
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', categorySlug)
    .eq('is_active', true)
    .single()

  if (!category) {
    notFound()
  }

  // Manufacturers with listing counts for this category
  const { data: mfRows } = await supabase
    .from('listings')
    .select('manufacturer_id, manufacturers!inner(id, name, slug)')
    .eq('category_id', category.id)
    .eq('status', 'active')
    .not('manufacturer_id', 'is', null)

  const mfMap = new Map<string, { id: string; name: string; slug: string; count: number }>()
  for (const row of (mfRows ?? [])) {
    const m = (row as unknown as { manufacturers: { id: string; name: string; slug: string } }).manufacturers
    if (m?.slug) {
      const e = mfMap.get(m.slug)
      if (e) e.count++
      else mfMap.set(m.slug, { ...m, count: 1 })
    }
  }
  const manufacturers = Array.from(mfMap.values()).sort((a, b) => b.count - a.count).slice(0, 12)

  // ── Counties with listing counts (SEO: link every county, show count) ──
  const { data: countyRows } = await supabase
    .from('listings')
    .select('location_city')
    .eq('category_id', category.id)
    .eq('status', 'active')
    .eq('location_country', 'RO')

  type CountyCount = { slug: string; name: string; count: number }
  const countyMap = new Map<string, number>()

  if (countyRows) {
    for (const row of countyRows) {
      const city = (row.location_city || '').toLowerCase()
      for (const county of ROMANIAN_COUNTIES) {
        const key = county.slug
        if (city.includes(county.slug.replace('-', ' ')) || city.includes(county.slug)) {
          countyMap.set(key, (countyMap.get(key) || 0) + 1)
        }
      }
    }
  }

  // Top 15 counties sorted by count, then all other counties alphabetically
  const countiesWithCount: CountyCount[] = ROMANIAN_COUNTIES
    .map(c => ({ slug: c.slug, name: c.name, count: countyMap.get(c.slug) || 0 }))
    .filter(c => c.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 15)

  const CategoryIcon = getCategoryIcon(categorySlug)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="bg-gradient-to-br from-green-900 via-green-800 to-green-950 text-white py-10 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-sm text-white/50 mb-6">
            <a href="/" className="hover:text-white/80 transition-colors">Acasă</a>
            <span>/</span>
            <a href="/browse" className="hover:text-white/80 transition-colors">Anunțuri</a>
            <span>/</span>
            <span className="text-white/80 font-medium">{category.name}</span>
          </nav>

          <div className="flex items-center gap-4 mb-4">
            {CategoryIcon && <CategoryIcon className="size-12 text-amber-400" />}
            <h1 className="text-3xl md:text-4xl font-black">
              {category.name}
            </h1>
          </div>
          
          <p className="text-white/70 text-lg">
            {category.description || `Găsește ${category.name.toLowerCase()} de vânzare din toată Europa`}
          </p>
          <div className="mt-6 p-4 bg-white/10 rounded-lg">
            <p className="text-white/80 text-sm">
              {getCategoryIntro(categorySlug)}
            </p>
          </div>
        </div>
      </div>

      {/* SEO Content: Tips for this category */}
      <section className="py-10 px-6 bg-card border-y">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="text-2xl">💡</span>
            Sfaturi pentru achiziția de {category.name.toLowerCase()}
          </h2>
          <ul className="space-y-3">
            {getCategoryTips(categorySlug).map((tip, idx) => (
              <li key={idx} className="flex items-start gap-3 text-muted-foreground">
                <span className="text-green-600 font-bold">✓</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Browse by manufacturer links */}
      {manufacturers.length > 0 && (
        <section className="py-8 px-6 bg-background border-b">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-lg font-semibold mb-4">Caută după producător:</h2>
            <div className="flex flex-wrap gap-2">
              {manufacturers.map(mf => (
                <a
                  key={mf.slug}
                  href={`/browse/${categorySlug}/${mf.slug}`}
                  className="px-3 py-1.5 bg-card hover:bg-green-600 hover:text-white rounded-full text-sm transition-colors border flex items-center gap-1.5"
                >
                  {mf.name}
                  <span className="text-xs opacity-60">({mf.count})</span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Browse by county links — dynamic from DB, sorted by count */}
      {countiesWithCount.length > 0 && (
        <section className="py-8 px-6 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-lg font-semibold mb-4">Alege judetul:</h2>
            <div className="flex flex-wrap gap-2">
              {countiesWithCount.map(county => (
                <a
                  key={county.slug}
                  href={`/browse/${categorySlug}/${county.slug}`}
                  className="px-3 py-1.5 bg-card hover:bg-green-600 hover:text-white rounded-full text-sm transition-colors border flex items-center gap-1.5"
                >
                  {county.name}
                  <span className="text-xs opacity-60">({county.count})</span>
                </a>
              ))}
              <a
                href="/browse"
                className="px-3 py-1.5 bg-card hover:bg-green-600 hover:text-white rounded-full text-sm transition-colors border"
              >
                Toate judetele →
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Redirect to main browse with category filter */}
      <div className="max-w-7xl mx-auto py-12 px-6">
        <meta httpEquiv="refresh" content={`0;url=/browse?category=${category.id}`} />
        <div className="text-center py-12">
          <p className="text-muted-foreground">Se încarcă anunțurile...</p>
        </div>
      </div>

      <Footer />
    </div>
  )
}