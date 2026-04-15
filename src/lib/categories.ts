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
