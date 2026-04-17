import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'

type SimilarListing = {
  id: string
  title: string
  price: number | null
  currency: string
  images: string[] | null
  location_city: string | null
  location_country: string
  condition: string | null
  year: number | null
}

export default async function SimilarListings({
  categoryId,
  excludeId,
}: {
  categoryId: string
  excludeId: string
}) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('listings')
    .select('id, title, price, currency, images, location_city, location_country, condition, year')
    .eq('category_id', categoryId)
    .eq('status', 'active')
    .neq('id', excludeId)
    .order('is_featured', { ascending: false })
    .order('updated_at', { ascending: false })
    .limit(4)

  const listings = (data as unknown as SimilarListing[] | null) ?? []

  if (listings.length === 0) return null

  return (
    <section className="mt-12 border-t pt-10">
      <h2 className="text-xl font-semibold text-foreground mb-6">Anunțuri similare</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {listings.map((item) => {
          const img = item.images?.[0]
          const location = [item.location_city, item.location_country].filter(Boolean).join(', ')
          return (
            <Link
              key={item.id}
              href={`/listings/${item.id}`}
              className="group block rounded-xl border bg-card hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="relative aspect-[4/3] bg-muted">
                {img ? (
                  <Image
                    src={img}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                    Fără imagine
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-foreground line-clamp-2 leading-snug">
                  {item.title}
                </p>
                {item.price != null && (
                  <p className="mt-1 text-green-700 dark:text-green-400 font-semibold text-sm">
                    €{item.price.toLocaleString('ro-RO')}
                  </p>
                )}
                {location && (
                  <p className="mt-0.5 text-xs text-muted-foreground truncate">{location}</p>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
