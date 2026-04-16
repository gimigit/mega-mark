import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import BrowseByCategory from '@/components/BrowseByCategory'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import type { Metadata } from 'next'
import type { Database } from '@/types/database'

export const dynamic = 'force-dynamic'

type CategorySlugParams = {
  params: Promise<{ category: string }>
}

export async function generateMetadata({ params }: CategorySlugParams): Promise<Metadata> {
  const { category: slug } = await params
  const supabase = await createClient()
  
  const { data: cat } = await supabase
    .from('categories')
    .select('id, name, slug, description')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  
  if (!cat) {
    return { title: 'Pagina nu a fost gasita — Mega-Mark' }
  }
  
  return {
    title: `${cat.name} de vanzare — Mega-Mark`,
    description: cat.description || `Cumpara ${cat.name.toLowerCase()} agricol. Gaseste tractoare, utilaje si echipamente agricole second-hand si noi.`,
    alternates: {
      canonical: `/browse/${slug}`,
    },
  }
}

const CATEGORY_CONTENT: Record<string, { intro: string; tips: string[] }> = {
  tractors: {
    intro: 'Tractorul este piesa centrala a oricarei ferme. газ-la tractoare second-hand verificati cu atentie orele de functionare, istoricul interventiilor si starea anvelopelor.',
    tips: [
      'Verificati orele de functionare (ore motor)',
      'Verificati istoricul service',
      'Inspectati anvelopele pentru uzura',
      'Testati toate functiile hidraulice',
    ],
  },
  'combine-harvesters': {
    intro: 'Combinele sunt echipamente complexe. Verificati starea benzilor de taiere si a sitei de curatare.',
    tips: [
      'Verificati orele pecesorului',
      'Inspectati cutitul de taiere',
      'Verificati sita de curatare',
      'Testati sistemul de descarcare',
    ],
  },
  sprayers: {
    intro: 'Producatoarele sunt esentiale pentru protectia culturilor. Verificati pompa si duzele.',
    tips: [
      'Verificati presiunea de lucru',
      'Inspectati duzele',
      'Testati sistemul de agitare',
      'Verificati rezervorul',
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

export default async function BrowseCategoryPage({ params }: CategorySlugParams) {
  const { category: slug } = await params
  const category = await getCategoryBySlug(slug)
  
  if (!category) {
    notFound()
  }
  
  const content = CATEGORY_CONTENT[slug] || {
    intro: `Gaseste ${category.name} agricol de calitate. Verificati orele de functionare si istoricul inainte de cumparare.`,
    tips: [
      'Verificati orele de functionare',
      'Verificati starea generala',
      'Solicitati istoricul service',
    ],
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="bg-gradient-to-br from-green-900 via-green-800 to-green-950 text-white py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center gap-1.5 text-sm text-white/50 mb-6">
            <a href="/" className="hover:text-white/80 transition-colors">Acasa</a>
            <span>/</span>
            <a href="/browse" className="hover:text-white/80 transition-colors">Anunturi</a>
            <span>/</span>
            <span className="text-white/80 font-medium">{category.name}</span>
          </nav>
          
          <h1 className="text-3xl md:text-4xl font-black mb-2">
            <span className="text-amber-400">{category.name}</span> de vanzare
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
      
      <BrowseByCategory categoryId={category.id} categoryName={category.name} />
      
      <Footer />
    </div>
  )
}