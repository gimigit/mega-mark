import Link from 'next/link'
import { Globe, Mail, Phone, ShoppingCart, User, Scale, MapPin, ShieldCheck, Tractor, Wrench } from 'lucide-react'

const footerLinks = {
  marketplace: [
    { href: '/browse', label: 'Toate anunturile' },
    { href: '/browse?sort=newest', label: 'Adaugate recent' },
    { href: '/browse?condition=new', label: 'Echipamente noi' },
    { href: '/browse?condition=used', label: 'Echipamente second-hand' },
    { href: '/sell', label: 'Publica anunt' },
  ],
  categories: [
    { href: '/browse?category=cat_tractors', label: 'Tractoare' },
    { href: '/browse?category=cat_combines', label: 'Combine' },
    { href: '/browse?category=cat_sprayers', label: 'Stropitori' },
    { href: '/browse?category=cat_seeders', label: 'Semanatori' },
    { href: '/browse?category=cat_plows', label: 'Pluguri' },
    { href: '/browse?category=cat_trailers', label: 'Remorci' },
    { href: '/browse?category=cat_loaders', label: 'Incarcatoare' },
    { href: '/browse?category=cat_irrigation', label: 'Irigare' },
  ],
  brands: [
    { href: '/browse?manufacturer=man_johndeere', label: 'John Deere' },
    { href: '/browse?manufacturer=man_fendt', label: 'Fendt' },
    { href: '/browse?manufacturer=man_claas', label: 'Claas' },
    { href: '/browse?manufacturer=man_case', label: 'Case IH' },
    { href: '/browse?manufacturer=man_newholland', label: 'New Holland' },
    { href: '/browse?manufacturer=man_massey', label: 'Massey Ferguson' },
    { href: '/browse?manufacturer=man_kubota', label: 'Kubota' },
    { href: '/browse?manufacturer=man_valtra', label: 'Valtra' },
  ],
  countries: [
    { code: 'RO', name: 'Romania' },
    { code: 'DE', name: 'Germania' },
    { code: 'FR', name: 'Franta' },
    { code: 'PL', name: 'Polonia' },
    { code: 'NL', name: 'Olanda' },
    { code: 'IT', name: 'Italia' },
    { code: 'ES', name: 'Spania' },
    { code: 'AT', name: 'Austria' },
  ],
}

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-950 dark:bg-dark-900 text-white/70">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 mb-10">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="text-2xl font-black text-white mb-3 flex items-center gap-1">
              Mega<em className="text-amber-400 not-italic">Mark</em>
            </Link>
            <p className="text-sm leading-relaxed mb-4">
              Marketplace-ul de incredere pentru utilaje agricole din Europa.
              Cumpara si vinde cu incredere in 16 tari UE.
            </p>
            <div className="flex gap-2">
              <a href="https://mega-mark.eu" className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-amber-500 transition-colors cursor-pointer">
                <Globe className="w-4 h-4" />
              </a>
              <a href="mailto:contact@mega-mark.eu" className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-amber-500 transition-colors cursor-pointer">
                <Mail className="w-4 h-4" />
              </a>
              <a href="tel:+40700000000" className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-amber-500 transition-colors cursor-pointer">
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Marketplace Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <ShoppingCart className="w-3.5 h-3.5 text-amber-400/70" />
              Marketplace
            </h4>
            <ul className="space-y-2">
              {footerLinks.marketplace.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-amber-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Tractor className="w-3.5 h-3.5 text-amber-400/70" />
              Categorii
            </h4>
            <ul className="space-y-2">
              {footerLinks.categories.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-amber-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Brands */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-amber-400/70" />
              Branduri
            </h4>
            <ul className="space-y-2">
              {footerLinks.brands.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-amber-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info + Countries */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-amber-400/70" />
              Informatii
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm hover:text-amber-400 transition-colors">Despre noi</Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm hover:text-amber-400 transition-colors">Intrebari frecvente</Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm hover:text-amber-400 transition-colors">Termeni si conditii</Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm hover:text-amber-400 transition-colors">Politica de confidentialitate</Link>
              </li>
              <li>
                <Link href="/safety" className="text-sm hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
                  Siguranta
                </Link>
              </li>
            </ul>

            <h4 className="text-xs font-bold text-white uppercase tracking-wider mt-6 mb-3 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400/70" />
              Tari
            </h4>
            <div className="grid grid-cols-2 gap-1">
              {footerLinks.countries.map(country => (
                <Link
                  key={country.code}
                  href={`/browse?country=${country.code}`}
                  className="text-xs hover:text-amber-400 transition-colors"
                >
                  {country.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <p>&copy; {currentYear} Mega-Mark. Toate drepturile rezervate.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Confidentialitate
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Termeni
            </Link>
            <Link href="/about" className="hover:text-white transition-colors">
              Despre
            </Link>
            <Link href="/faq" className="hover:text-white transition-colors">
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
