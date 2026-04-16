import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import BrowseByCategoryCounty from '@/components/BrowseByCategoryCounty'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getCountyName, ROMANIAN_COUNTIES } from '@/lib/categories'
import type { Metadata } from 'next'
import type { Database } from '@/types/database'

export const dynamic = 'force-dynamic'

type CategoryCountyParams = {
  params: Promise<{ category: string; county: string }>
}

export async function generateMetadata({ params }: CategoryCountyParams): Promise<Metadata> {
  const { category: catSlug, county: countySlug } = await params
  const supabase = await createClient()

  const { data: cat } = await supabase
    .from('categories')
    .select('id, name, slug, description')
    .eq('slug', catSlug)
    .eq('is_active', true)
    .single()

  const countyName = getCountyName(countySlug)

  if (!cat) {
    return { title: 'Pagina nu a fost găsită — Mega-Mark' }
  }

  return {
    title: `${cat.name} în ${countyName} — Mega-Mark`,
    description: `Cumpără ${cat.name.toLowerCase()} agricol în ${countyName}. Găsește tractoare, utilaje și echipamente agricole second-hand și noi.`,
    alternates: {
      canonical: `/browse/${catSlug}/${countySlug}`,
    },
  }
}

const CATEGORY_CONTENT: Record<string, { intro: string; tips: string[] }> = {
  tractors: {
    intro: 'Tractorul este piesa centrală a oricărei ferme. Când cauți tractoare second-hand, verifică cu atenție orele de funcționare, istoricul intervențiilor și starea anvelopelor.',
    tips: [
      'Verifică orele de funcționare (ore motor)',
      'Verifică istoricul service',
      'Inspectează anvelopele pentru uzură',
      'Testează toate funcțiile hidraulice',
    ],
  },
  'combine-harvesters': {
    intro: 'Combinele sunt echipamente complexe. Verifică starea benzilor de tăiere și a sitei de curățare.',
    tips: [
      'Verifică orele combinei',
      'Inspectează cuțitul de tăiere',
      'Verifică sita de curățare',
      'Testează sistemul de descărcare',
    ],
  },
  sprayers: {
    intro: 'Producătoarele sunt esențiale pentru protecția culturilor. Verifică pompa și duzele.',
    tips: [
      'Verifică presiunea de lucru',
      'Inspectează duzele',
      'Testează sistemul de agitare',
      'Verifică rezervorul',
    ],
  },
}

async function getCategoryBySlug(slug: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  return data
}

function isValidCounty(slug: string): boolean {
  return ROMANIAN_COUNTIES.some(c => c.slug === slug)
}

export default async function BrowseCategoryCountyPage({ params }: CategoryCountyParams) {
  const { category: catSlug, county: countySlug } = await params

  // Validate county
  if (!isValidCounty(countySlug)) {
    notFound()
  }

  const category = await getCategoryBySlug(catSlug)
  if (!category) {
    notFound()
  }

  const countyName = getCountyName(countySlug)

  const content = CATEGORY_CONTENT[catSlug] || {
    intro: `Găsește ${category.name} agricol de calitate în ${countyName}. Verifică orele de funcționare și istoricul înainte de cumpărare.`,
    tips: [
      'Verifică orele de funcționare',
      'Verifică starea generală',
      'Solicită istoricul service',
    ],
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="bg-gradient-to-br from-green-900 via-green-800 to-green-950 text-white py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center gap-1.5 text-sm text-white/50 mb-6">
            <a href="/" className="hover:text-white/80 transition-colors">Acasă</a>
            <span>/</span>
            <a href="/browse" className="hover:text-white/80 transition-colors">Anunțuri</a>
            <span>/</span>
            <a href={`/browse/${catSlug}`} className="hover:text-white/80 transition-colors">{category.name}</a>
            <span>/</span>
            <span className="text-white/80 font-medium">{countyName}</span>
          </nav>

          <h1 className="text-3xl md:text-4xl font-black mb-2">
            <span className="text-amber-400">{category.name}</span> în {countyName}
          </h1>
          <p className="text-white/70 mb-8 max-w-2xl">
            {content.intro}
          </p>

          <div className="flex flex-wrap gap-2">
            {content.tips.map((tip, i) => (
              <span key={i} className="bg-white/10 px-3 py-1.5 rounded-full text-sm">
                ✅ {tip}
              </span>
            ))}
          </div>
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
