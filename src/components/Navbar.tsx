'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Menu, X, User, Plus, Heart, MessageSquare, LogOut } from 'lucide-react'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { Button } from '@/components/ui/button'
import ThemeToggle from './ThemeToggle'
import CurrencyToggle from './CurrencyToggle'
import { NotificationBell } from './NotificationBell'
import { useNotifications } from '@/hooks/useNotifications'

const navLinks = [
  { href: '/browse', label: 'Anunturi' },
  { href: '/request', label: 'Cereri' },
  { href: '/about', label: 'Despre' },
]

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { user, isLoading, supabase } = useSupabase()
  const { notifications, unreadCount, loading: notifsLoading, markAsRead, markAllAsRead, getNotificationIcon, getNotificationLink } = useNotifications(user?.id)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = searchQuery.trim()
    if (!trimmed) return
    router.push(`/browse?keyword=${encodeURIComponent(trimmed)}`)
    setSearchQuery('')
    setMobileMenuOpen(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    setDropdownOpen(false)
    router.push('/')
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-dark-950/95 backdrop-blur-md border-b border-gray-200 dark:border-dark-700 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-6">
        {/* Brand */}
        <Link href="/" className="text-2xl font-black flex items-center shrink-0 font-display">
          <span className="text-green-800 dark:text-green-400">Mega</span>
          <span className="text-amber-500">Mark</span>
        </Link>

        {/* Search bar - desktop */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cauta anunturi..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-dark-600 bg-gray-50 dark:bg-dark-800 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500 transition-colors"
            />
          </div>
        </form>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-5">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="text-gray-600 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 font-medium text-sm transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Side Actions - desktop */}
        <div className="hidden md:flex items-center gap-2 ml-auto">
          <CurrencyToggle />
          <ThemeToggle />

          {isLoading ? (
            <div className="size-8 rounded-lg bg-gray-100 dark:bg-dark-700 animate-pulse" />
          ) : user ? (
            <>
              <Link href="/favorites" className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-800 hover:text-red-500 transition-colors" title="Favorite">
                <Heart className="size-5" />
              </Link>
              <Link href="/dashboard/messages" className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-800 hover:text-green-600 transition-colors" title="Mesaje">
                <MessageSquare className="size-5" />
              </Link>
              <NotificationBell
                notifications={notifications}
                unreadCount={unreadCount}
                loading={notifsLoading}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
                getIcon={getNotificationIcon}
                getLink={getNotificationLink}
              />

              <Link href="/sell">
                <Button className="bg-green-700 hover:bg-green-800 text-white font-bold gap-1.5 px-4 py-2">
                  <Plus className="size-4" />
                  Adauga anunt
                </Button>
              </Link>

              {/* User dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors"
                  aria-label="Meniu utilizator"
                >
                  <User className="size-5" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-gray-200 dark:border-dark-600 bg-white dark:bg-dark-900 shadow-lg py-1 z-50">
                    <Link
                      href="/account"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors"
                    >
                      <User className="size-4" />
                      Contul meu
                    </Link>
                    <Link
                      href="/account/listings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors"
                    >
                      <Plus className="size-4" />
                      Anunturile mele
                    </Link>
                    <Link
                      href="/account/settings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors"
                    >
                      <Search className="size-4" />
                      Setari
                    </Link>
                    <hr className="my-1 border-gray-200 dark:border-dark-700" />
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut className="size-4" />
                      Deconectare
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/sell">
                <Button className="bg-green-700 hover:bg-green-800 text-white font-bold gap-1.5 px-4 py-2">
                  <Plus className="size-4" />
                  Adauga anunt
                </Button>
              </Link>
              <Link
                href="/login"
                className="text-gray-600 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 font-medium text-sm transition-colors px-3 py-2"
              >
                Autentificare
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden ml-auto p-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-950 animate-slide-down">
          <div className="px-6 py-4 space-y-3">
            {/* Mobile search */}
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cauta anunturi..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-dark-600 bg-gray-50 dark:bg-dark-800 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500 transition-colors"
                />
              </div>
            </form>

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

            <div className="pt-3 border-t border-gray-200 dark:border-dark-700 flex flex-col gap-3">
              {user ? (
                <>
                  <div className="flex items-center gap-3">
                    <Link href="/favorites" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 py-2 text-gray-600 dark:text-gray-300 hover:text-red-500 font-medium transition-colors">
                      <Heart className="size-5" />
                      Favorite
                    </Link>
                  </div>
                  <Link href="/chat" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 py-2 text-gray-600 dark:text-gray-300 hover:text-green-600 font-medium transition-colors">
                    <MessageSquare className="size-5" />
                    Mesaje
                  </Link>
                  <Link href="/account" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 py-2 text-gray-600 dark:text-gray-300 font-medium transition-colors">
                    <User className="size-5" />
                    Contul meu
                  </Link>
                  <Link href="/sell" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-green-700 hover:bg-green-800 text-white font-bold gap-1.5 py-2">
                      <Plus className="size-4" />
                      Adauga anunt
                    </Button>
                  </Link>
                  <button
                    onClick={() => { handleSignOut(); setMobileMenuOpen(false) }}
                    className="flex items-center gap-2 py-2 text-red-600 dark:text-red-400 font-medium transition-colors"
                  >
                    <LogOut className="size-5" />
                    Deconectare
                  </button>
                </>
              ) : (
                <>
                  <Link href="/sell" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-green-700 hover:bg-green-800 text-white font-bold gap-1.5 py-2">
                      <Plus className="size-4" />
                      Adauga anunt
                    </Button>
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center py-2 text-gray-600 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 font-medium transition-colors"
                  >
                    Autentificare
                  </Link>
                </>
              )}
              <div className="pt-2">
                <ThemeToggle />
                <div className="mt-2">
                  <CurrencyToggle />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
