import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BrowseByCategoryCounty from '@/components/BrowseByCategoryCounty'
import { getCategoryIcon, getCountyName, getCategoryTips, getCategoryIntro, getCountyIntro, ROMANIAN_COUNTIES } from '@/lib/categories'
import { MapPin, Clock } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface RouteParams {
  category: string
  slug: string
}

async function resolveSlug(categorySlug: string, slug: string) {
  const county = ROMANIAN_COUNTIES.find(c => c.slug === slug)
  if (county) return { type: 'county' as const, county }

  const supabase = await createClient()
  const { data: manufacturer } = await supabase
    .from('manufacturers')
    .select('id, name, slug')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (manufacturer) return { type: 'manufacturer' as const, manufacturer }

  return null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>
}): Promise<Metadata> {
  const { category: categorySlug, slug } = await params

  const supabase = await createClient()
  const { data: category } = await supabase
    .from('categories')
    .select('name')
    .eq('slug', categorySlug)
    .eq('is_active', true)
    .single()

  if (!category) return { title: 'Pagina inexistentă — Mega-Mark' }

  const resolved = await resolveSlug(categorySlug, slug)
  if (!resolved) return { title: 'Pagina inexistentă — Mega-Mark' }

  if (resolved.type === 'county') {
    const countyName = getCountyName(slug)
    return {
      title: `${category.name} în ${countyName} — Mega-Mark`,
      description: `Găsește ${category.name.toLowerCase()} în ${countyName}. Anunțuri cu tractoare, combine și utilaje agricole din ${countyName}, Romania.`,
      openGraph: {
        title: `${category.name} în ${countyName} — Mega-Mark`,
        description: `Caută ${category.name.toLowerCase()} în ${countyName}. Anunțuri recente cu utilaje agricole.`,
      },
    }
  }

  const { manufacturer } = resolved
  return {
    title: `${manufacturer.name} ${category.name} de vânzare — Mega-Mark`,
    description: `Anunțuri cu ${manufacturer.name} ${category.name.toLowerCase()} de vânzare din toată România și Europa. Compară prețuri și specificații tehnice.`,
    openGraph: {
      title: `${manufacturer.name} ${category.name} — Mega-Mark`,
      description: `Găsește ${manufacturer.name} ${category.name.toLowerCase()} second-hand și noi de la fermieri și dealeri.`,
    },
  }
}

export default async function BrowseCategorySlugPage({
  params,
}: {
  params: Promise<RouteParams>
}) {
  const { category: categorySlug, slug } = await params

  const supabase = await createClient()
  const { data: category } = await supabase
    .from('categories')
    .select('id, name, slug, description')
    .eq('slug', categorySlug)
    .eq('is_active', true)
    .single()

  if (!category) notFound()

  const resolved = await resolveSlug(categorySlug, slug)
  if (!resolved) notFound()

  const CategoryIcon = getCategoryIcon(categorySlug)

  // ── County page ──────────────────────────────────────────────────────
  if (resolved.type === 'county') {
    const countyName = getCountyName(slug)
    return (
      <div className="min-h-screen bg-background">
        <Navbar />

        <div className="bg-gradient-to-br from-green-900 via-green-800 to-green-950 text-white py-8 px-6">
          <div className="max-w-7xl mx-auto">
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
            <p className="text-white/60 mt-3 max-w-2xl text-base leading-relaxed">
              {getCountyIntro(slug)}
            </p>
          </div>
        </div>

        <section className="py-8 px-6 bg-card border-b">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-lg font-bold mb-4">Sfaturi pentru {category.name.toLowerCase()} în {countyName}</h2>
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
          countySlug={slug}
          countyName={countyName}
        />

        <Footer />
      </div>
    )
  }

  // ── Manufacturer page ─────────────────────────────────────────────────
  const { manufacturer } = resolved

  const { data: listings } = await supabase
    .from('listings')
    .select('id, title, price, currency, year, images, location_city, created_at')
    .eq('category_id', category.id)
    .eq('manufacturer_id', manufacturer.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(40)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="bg-gradient-to-br from-green-900 via-green-800 to-green-950 text-white py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center gap-1.5 text-sm text-white/50 mb-6">
            <a href="/" className="hover:text-white/80 transition-colors">Acasă</a>
            <span>/</span>
            <a href="/browse" className="hover:text-white/80 transition-colors">Anunțuri</a>
            <span>/</span>
            <a href={`/browse/${categorySlug}`} className="hover:text-white/80 transition-colors">{category.name}</a>
            <span>/</span>
            <span className="text-white/80 font-medium">{manufacturer.name}</span>
          </nav>

          <div className="flex items-center gap-4 mb-4">
            {CategoryIcon && <CategoryIcon className="size-10 text-amber-400" />}
            <div>
              <h1 className="text-3xl md:text-4xl font-black">
                {manufacturer.name} <span className="text-amber-400">{category.name}</span>
              </h1>
              <p className="text-white/70 mt-1">{listings?.length ?? 0} anunțuri disponibile</p>
            </div>
          </div>

          <p className="text-white/80 mt-4 text-lg max-w-2xl">{getCategoryIntro(categorySlug)}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-6">
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-5">
          <h3 className="font-bold text-amber-800 dark:text-amber-200 mb-3 flex items-center gap-2">
            💡 Sfaturi la achiziție
          </h3>
          <ul className="space-y-2">
            {getCategoryTips(categorySlug).map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-amber-900 dark:text-amber-100">
                <span className="text-amber-500 mt-0.5">✓</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        <h2 className="text-2xl font-black mt-10 mb-6">Anunțuri disponibile</h2>
        {listings && listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {listings.map((listing) => {
              const thumb = Array.isArray(listing.images) && listing.images.length > 0
                ? (listing.images[0] as string)
                : null

              return (
                <Link
                  key={listing.id}
                  href={`/listings/${listing.id}`}
                  className="group bg-card border rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative aspect-[4/3] bg-gray-100 dark:bg-dark-800">
                    {thumb ? (
                      <Image
                        src={thumb}
                        alt={listing.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                        {CategoryIcon && <CategoryIcon className="size-12" />}
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-sm line-clamp-2 mb-2">{listing.title}</p>
                    <div className="text-green-700 font-bold text-base">
                      {listing.price != null ? `€${listing.price.toLocaleString('de-DE')}` : 'Preț la cerere'}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                      {listing.location_city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3" />{listing.location_city}
                        </span>
                      )}
                      {listing.year && (
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />{listing.year}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg mb-4">
              Nu există anunțuri pentru {manufacturer.name} {category.name.toLowerCase()} momentan.
            </p>
            <Link href={`/browse/${categorySlug}`} className="text-green-700 hover:underline font-medium">
              Vezi toate {category.name.toLowerCase()} →
            </Link>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
