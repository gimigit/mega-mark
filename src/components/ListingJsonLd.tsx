import type { ListingData } from '@/types/listing'

type Props = {
  listing: ListingData
}

export default function ListingJsonLd({ listing }: Props) {
  const conditionMap: Record<string, string> = {
    new: 'https://schema.org/NewCondition',
    used: 'https://schema.org/UsedCondition',
    refurbished: 'https://schema.org/RefurbishedCondition',
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: listing.title,
    description: listing.description || `${listing.title} - utilaj agricol de vanzare in UE`,
    image: listing.images && listing.images.length > 0 ? listing.images[0] : undefined,
    offers: {
      '@type': 'Offer',
      price: listing.price,
      priceCurrency: listing.currency || 'EUR',
      availability: 'https://schema.org/InStock',
      itemCondition: listing.condition ? conditionMap[listing.condition] : 'https://schema.org/UsedCondition',
      seller: listing.profiles?.[0]?.full_name ? {
        '@type': 'Organization',
        name: listing.profiles[0].full_name,
      } : undefined,
    },
    ...(listing.year && { productionDate: listing.year.toString() }),
    ...(listing.hours && { mileageValue: listing.hours, mileageUnit: 'H' }),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}