import {
  Tractor,
  Wheat,
  Crop,
  SprayCan,
  Sprout,
  Disc,
  Package,
  Truck,
  Forklift,
  Droplets,
  Construction,
  Wrench,
  type LucideIcon,
} from 'lucide-react'

/** Maps category slugs to Lucide icons. Fallback: Tractor */
export const categoryIconMap: Record<string, LucideIcon> = {
  tractors: Tractor,
  combines: Wheat,
  harvesters: Crop,
  sprayers: SprayCan,
  seeders: Sprout,
  plows: Disc,
  balers: Package,
  trailers: Truck,
  loaders: Forklift,
  irrigation: Droplets,
  construction: Construction,
  other: Wrench,
}

export function getCategoryIcon(slug: string): LucideIcon {
  return categoryIconMap[slug] || Tractor
}

/** EU countries with ISO codes for browse/filter */
export const EU_COUNTRIES = [
  { code: 'RO', name: 'Romania', flag: '🇷🇴' },
  { code: 'DE', name: 'Germania', flag: '🇩🇪' },
  { code: 'FR', name: 'Franța', flag: '🇫🇷' },
  { code: 'NL', name: 'Olanda', flag: '🇳🇱' },
  { code: 'PL', name: 'Polonia', flag: '🇵🇱' },
  { code: 'ES', name: 'Spania', flag: '🇪🇸' },
  { code: 'IT', name: 'Italia', flag: '🇮🇹' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹' },
  { code: 'BE', name: 'Belgia', flag: '🇧🇪' },
  { code: 'HU', name: 'Ungaria', flag: '🇭🇺' },
  { code: 'CZ', name: 'Cehia', flag: '🇨🇿' },
  { code: 'DK', name: 'Danemarca', flag: '🇩🇰' },
  { code: 'SE', name: 'Suedia', flag: '🇸🇪' },
  { code: 'PT', name: 'Portugalia', flag: '🇵🇹' },
  { code: 'GR', name: 'Grecia', flag: '🇬🇷' },
  { code: 'FI', name: 'Finlanda', flag: '🇫🇮' },
] as const

/** Top manufacturer names for display on landing */
export const TOP_MANUFACTURERS = [
  'John Deere',
  'Case IH',
  'New Holland',
  'Fendt',
  'Claas',
  'Massey Ferguson',
  'Kubota',
  'Valtra',
] as const

/** Romanian counties (județe) for SEO pages */
export const ROMANIAN_COUNTIES = [
  { slug: 'alba', name: 'Alba' },
  { slug: 'arad', name: 'Arad' },
  { slug: 'arges', name: 'Argeș' },
  { slug: 'bacau', name: 'Bacău' },
  { slug: 'bihor', name: 'Bihor' },
  { slug: 'bistrita-nasaud', name: 'Bistrița-Năsăud' },
  { slug: 'botosani', name: 'Botoșani' },
  { slug: 'braila', name: 'Brăila' },
  { slug: 'brasov', name: 'Brașov' },
  { slug: 'bucuresti', name: 'București' },
  { slug: 'buzau', name: 'Buzău' },
  { slug: 'calarasi', name: 'Călărași' },
  { slug: 'caras-severin', name: 'Caraș-Severin' },
  { slug: 'cluj', name: 'Cluj' },
  { slug: 'constanta', name: 'Constanța' },
  { slug: 'covasna', name: 'Covasna' },
  { slug: 'dambovita', name: 'Dâmbovița' },
  { slug: 'dolj', name: 'Dolj' },
  { slug: 'galati', name: 'Galați' },
  { slug: 'giurgiu', name: 'Giurgiu' },
  { slug: 'gorj', name: 'Gorj' },
  { slug: 'harghita', name: 'Harghita' },
  { slug: 'hunedoara', name: 'Hunedoara' },
  { slug: 'ialomita', name: 'Ialomița' },
  { slug: 'iasi', name: 'Iași' },
  { slug: 'ilfov', name: 'Ilfov' },
  { slug: 'maramures', name: 'Maramureș' },
  { slug: 'mehedinti', name: 'Mehedinți' },
  { slug: 'mures', name: 'Mureș' },
  { slug: 'neamt', name: 'Neamț' },
  { slug: 'olt', name: 'Olt' },
  { slug: 'prahova', name: 'Prahova' },
  { slug: 'salaj', name: 'Sălaj' },
  { slug: 'satu-mare', name: 'Satu Mare' },
  { slug: 'sibiu', name: 'Sibiu' },
  { slug: 'suceava', name: 'Suceava' },
  { slug: 'teleorman', name: 'Teleorman' },
  { slug: 'timis', name: 'Timiș' },
  { slug: 'tulcea', name: 'Tulcea' },
  { slug: 'valcea', name: 'Vâlcea' },
  { slug: 'vaslui', name: 'Vaslui' },
  { slug: 'vrancea', name: 'Vrancea' },
] as const

export function getCountyName(slug: string): string {
  const county = ROMANIAN_COUNTIES.find(c => c.slug === slug)
  return county?.name || slug
}
