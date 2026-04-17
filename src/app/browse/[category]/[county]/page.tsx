import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BrowseByCategoryCounty from '@/components/BrowseByCategoryCounty'
import { getCountyName, getCategoryTips, ROMANIAN_COUNTIES } from '@/lib/categories'
import type { Database } from '@/types/database'

// Force dynamic - SEO pages need DB access at runtime
export const dynamic = 'force-dynamic'

// Optional: add all category/county combinations for better SEO indexing
// Remove since it requires DB access at build time
// export async function generateStaticParams() {...}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; county: string }>
}): Promise<Metadata> {
  const { category: categorySlug, county: countySlug } = await params

  // Validate county exists
  const validCounty = ROMANIAN_COUNTIES.find(c => c.slug === countySlug)
  if (!validCounty) {
    return {
      title: 'Pagina inexistentă — Mega-Mark',
    }
  }

  // Get category name from DB
  const supabase = await createClient()
  const { data: category } = await supabase
    .from('categories')
    .select('name')
    .eq('slug', categorySlug)
    .eq('is_active', true)
    .single()

  const categoryName = category?.name || categorySlug
  const countyName = getCountyName(countySlug)

  return {
    title: `${categoryName} în ${countyName} — Mega-Mark`,
    description: `Găsește ${categoryName.toLowerCase()} în ${countyName}. Anunțuri cu tractoare, combine și utilaje agricole din ${countyName}, Romania.`,
    openGraph: {
      title: `${categoryName} în ${countyName} — Mega-Mark`,
      description: `Caută ${categoryName.toLowerCase()} în ${countyName}. Anunțuri recente cu utilaje agricole.`,
    },
  }
}

interface Props {
  params: Promise<{ category: string; county: string }>
}

export default async function BrowseCategoryCountyPage({ params }: Props) {
  const { category: categorySlug, county: countySlug } = await params

  // Validate county exists
  const validCounty = ROMANIAN_COUNTIES.find(c => c.slug === countySlug)
  if (!validCounty) {
    notFound()
  }

  // Get category by slug
  const supabase = await createClient()
  const { data: category } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('slug', categorySlug)
    .eq('is_active', true)
    .single()

  if (!category) {
    notFound()
  }

  const countyName = getCountyName(countySlug)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="bg-gradient-to-br from-green-900 via-green-800 to-green-950 text-white py-8 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-sm text-white/50 mb-4">
            <a href="/" className="hover:text-white/80 transition-colors">Acasă</a>
            <span>/</span>
            <a href="/browse" className="hover:text-white/80 transition-colors">Anunțuri</a>
            <span>/</span>
            <a href={`/browse/${categorySlug}`} className="hover:text-white/80 transition-colors">{category.name}</a>
            <span>/</span>
            <span className="text-white/80 font-medium">{countyName}</span>
          </nav>

          <h1 className="text-3xl md:text-4xl font-black">
            {category.name} în <span className="text-amber-400">{countyName}</span>
          </h1>
          <p className="text-white/70 mt-2">
            Anunțuri cu {category.name.toLowerCase()} disponibile în {countyName}
          </p>
          <div className="mt-4 p-3 bg-white/10 rounded-lg">
            <p className="text-white/80 text-sm">
              Găsește {category.name.toLowerCase()} în {countyName}. Oferte de la fermieri și dealeri locali, 
              verificare gratuită a istoricului utilajului.
            </p>
          </div>
        </div>
      </div>

      {/* SEO Content: Tips for this category in this county */}
      <section className="py-8 px-6 bg-card border-b">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="text-xl">💡</span>
            Sfaturi pentru {category.name.toLowerCase()} în {countyName}
          </h2>
          <ul className="grid md:grid-cols-2 gap-3">
            {getCategoryTips(categorySlug).map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-green-600 font-bold">✓</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <BrowseByCategoryCounty
        categoryId={category.id}
        categoryName={category.name}
        countySlug={countySlug}
        countyName={countyName}
      />

      <Footer />
    </div>
  )
}