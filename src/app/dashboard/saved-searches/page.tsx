'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Bookmark, Trash2, ExternalLink, Search } from 'lucide-react'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import Navbar from '@/components/Navbar'
import { formatDistanceToNow } from 'date-fns'
import { ro } from 'date-fns/locale'

type SavedSearch = {
  id: string
  name: string
  keyword?: string
  country?: string
  condition?: string
  price_min?: number
  price_max?: number
  year_min?: number
  year_max?: number
  created_at: string
}

function buildBrowseUrl(s: SavedSearch): string {
  const params = new URLSearchParams()
  if (s.keyword) params.set('keyword', s.keyword)
  if (s.country) params.set('country', s.country)
  if (s.condition) params.set('condition', s.condition)
  if (s.price_min) params.set('price_min', String(s.price_min))
  if (s.price_max) params.set('price_max', String(s.price_max))
  if (s.year_min) params.set('year_min', String(s.year_min))
  if (s.year_max) params.set('year_max', String(s.year_max))
  return `/browse?${params.toString()}`
}

function buildSummary(s: SavedSearch): string {
  const parts: string[] = []
  if (s.keyword) parts.push(`"${s.keyword}"`)
  if (s.country) parts.push(s.country)
  if (s.condition) parts.push(s.condition)
  if (s.price_min || s.price_max) {
    parts.push(`${s.price_min ?? 0}–${s.price_max ?? '∞'} €`)
  }
  if (s.year_min || s.year_max) {
    parts.push(`${s.year_min ?? '?'}–${s.year_max ?? 'prezent'}`)
  }
  return parts.join(' · ') || 'Toate anunțurile'
}

export default function SavedSearchesPage() {
  const router = useRouter()
  const { user, isLoading } = useSupabase()
  const [searches, setSearches] = useState<SavedSearch[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) router.push('/login')
  }, [user, isLoading, router])

  useEffect(() => {
    if (!user) return
    fetch('/api/saved-searches')
      .then(r => r.json())
      .then(d => { setSearches(d.saved_searches ?? []); setLoading(false) })
  }, [user])

  async function handleDelete(id: string) {
    const res = await fetch(`/api/saved-searches?id=${id}`, { method: 'DELETE' })
    if (res.ok) setSearches(prev => prev.filter(s => s.id !== id))
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Bookmark className="size-6 text-green-700" />
          <h1 className="text-2xl font-bold text-foreground font-display">Cautări salvate</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="size-8 border-2 border-green-700 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : searches.length === 0 ? (
          <div className="text-center py-16 bg-surface border border-border rounded-2xl">
            <Search className="size-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">Nicio cautare salvata inca.</p>
            <Link href="/browse" className="inline-block px-5 py-2.5 bg-green-700 text-white rounded-xl font-semibold text-sm hover:bg-green-800 transition-colors">
              Cauta anunturi
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {searches.map(s => (
              <div key={s.id} className="flex items-center gap-4 p-4 bg-surface border border-border rounded-xl hover:border-green-400 transition-colors group">
                <Bookmark className="size-5 text-green-700 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">{s.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{buildSummary(s)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Salvat {formatDistanceToNow(new Date(s.created_at), { addSuffix: true, locale: ro })}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={buildBrowseUrl(s)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-green-700 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
                  >
                    <ExternalLink className="size-3.5" />
                    Deschide
                  </Link>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors"
                    title="Sterge cautarea"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
