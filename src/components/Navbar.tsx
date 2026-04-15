'use client'

import { useState } from 'react'
import Link from 'next/link'
import ThemeToggle from './ThemeToggle'

const navLinks = [
  { href: '/browse', label: 'Browse' },
  { href: '/sell', label: 'Sell' },
  { href: '/request', label: 'Requests' },
  { href: '/about', label: 'About' },
]

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-dark-950/95 backdrop-blur-md border-b border-gray-200 dark:border-dark-700 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-8">
        {/* Logo */}
        <Link href="/" className="text-2xl font-black text-green-800 dark:text-green-400 flex items-center gap-1">
          Mega<em className="text-amber-500 not-italic">Mark</em>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6 ml-auto">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="text-gray-600 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Side Actions */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/login"
            className="bg-green-700 dark:bg-green-600 text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-green-800 dark:hover:bg-green-700 transition-all hover:-translate-y-0.5"
          >
            Sign In
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden ml-auto flex flex-col gap-1.5 p-2"
          aria-label="Toggle menu"
        >
          <span className="w-6 h-0.5 bg-gray-800 dark:bg-white rounded transition-transform" />
          <span className="w-6 h-0.5 bg-gray-800 dark:bg-white rounded transition-opacity" />
          <span className="w-6 h-0.5 bg-gray-800 dark:bg-white rounded transition-transform" />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-950 animate-slide-down">
          <div className="px-6 py-4 space-y-3">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-gray-600 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 flex items-center gap-4">
              <ThemeToggle />
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 bg-green-700 dark:bg-green-600 text-white px-5 py-2.5 rounded-lg font-bold text-sm text-center"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
