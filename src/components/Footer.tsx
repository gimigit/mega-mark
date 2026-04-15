import Link from 'next/link'
import { Globe, Mail, Phone, ShoppingCart, User, Scale, MapPin, ShieldCheck } from 'lucide-react'

const footerLinks = {
  marketplace: [
    { href: '/browse', label: 'Browse All' },
    { href: '/browse?type=sell', label: 'For Sale' },
    { href: '/request', label: 'Buyer Requests' },
    { href: '/sell', label: 'Sell Equipment' },
  ],
  categories: [
    { href: '/browse?category=Tractors', label: 'Tractors' },
    { href: '/browse?category=Combines', label: 'Combines' },
    { href: '/browse?category=Harvesters', label: 'Harvesters' },
    { href: '/browse?category=Trailers', label: 'Trailers' },
  ],
  countries: [
    'Germany',
    'France',
    'Netherlands',
    'Poland',
    'Spain',
    'Italy',
    'Belgium',
    'Austria',
  ],
}

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-950 dark:bg-dark-900 text-white/70">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-10">
          {/* Brand Column */}
          <div>
            <Link href="/" className="text-2xl font-black text-white mb-3 flex items-center gap-1">
              Mega<em className="text-amber-400 not-italic">Mark</em>
            </Link>
            <p className="text-sm leading-relaxed mb-4">
              Europe&apos;s trusted marketplace for agricultural machinery. Buy and sell with confidence across 16 EU countries.
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

          {/* Account Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-400/70" />
              Cont
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard" className="text-sm hover:text-amber-400 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard?tab=messages" className="text-sm hover:text-amber-400 transition-colors">
                  Mesaje
                </Link>
              </li>
              <li>
                <Link href="/dashboard?tab=favorites" className="text-sm hover:text-amber-400 transition-colors">
                  Favorite
                </Link>
              </li>
              <li>
                <Link href="/profile/edit" className="text-sm hover:text-amber-400 transition-colors">
                  Setari
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-amber-400/70" />
              Legal
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-sm hover:text-amber-400 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm hover:text-amber-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm hover:text-amber-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm hover:text-amber-400 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/safety" className="text-sm hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
                  Siguranta pe Mega-Mark
                </Link>
              </li>
            </ul>
          </div>

          {/* Countries Grid */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400/70" />
              Countries
            </h4>
            <div className="grid grid-cols-2 gap-1">
              {footerLinks.countries.map(country => (
                <span key={country} className="text-xs text-white/50">
                  {country}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <p>&copy; {currentYear} Mega-Mark. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/about" className="hover:text-white transition-colors">
              About
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
