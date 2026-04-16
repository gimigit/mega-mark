export type ListingData = {
  title: string
  description: string | null
  price: number
  currency: string
  condition: string | null
  year: number | null
  hours: number | null
  images: string[] | null
  location_country: string | null
  categories?: { name: string }[]
  profiles?: { full_name: string }[]
}
