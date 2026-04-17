'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ArrowRight } from 'lucide-react'

type Suggestion = {
  id: string
  title: string
  categories: { name: string; icon: string } | null
}

export default function HeroSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const fetchSuggestions = (value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (value.trim().length < 2) { setSuggestions([]); setOpen(false); return }
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/listings/search-suggestions?q=${encodeURIComponent(value)}`)
      if (res.ok) {
        const data: Suggestion[] = await res.json()
        setSuggestions(data)
        setOpen(data.length > 0)
        setActiveIdx(-1)
      }
    }, 280)
  }

  const navigate = (suggestion?: Suggestion) => {
    setOpen(false)
    setSuggestions([])
    if (suggestion) {
      router.push(`/listings/${suggestion.id}`)
    } else {
      const q = query.trim()
      if (q) router.push(`/browse?search=${encodeURIComponent(q)}`)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, suggestions.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, -1)) }
    if (e.key === 'Escape') { setOpen(false); setActiveIdx(-1) }
    if (e.key === 'Enter' && activeIdx >= 0) { e.preventDefault(); navigate(suggestions[activeIdx]) }
  }

  return (
    <div ref={containerRef} className="max-w-2xl mx-auto animate-slide-up relative">
      <form
        onSubmit={(e) => { e.preventDefault(); navigate() }}
        className="flex shadow-2xl rounded-xl overflow-visible"
      >
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); fetchSuggestions(e.target.value) }}
            onKeyDown={onKeyDown}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            placeholder="Cauta: John Deere 6330, tractor 150 CP..."
            autoComplete="off"
            className="w-full h-14 pl-12 pr-4 border-0 rounded-l-xl text-gray-900 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
        <button
          type="submit"
          className="h-14 px-8 bg-amber-500 hover:bg-amber-600 text-white font-bold transition-colors flex items-center gap-2 shrink-0 rounded-r-xl"
        >
          Cauta
          <ArrowRight className="size-4" />
        </button>
      </form>

      {open && suggestions.length > 0 && (
        <ul className="absolute top-[calc(100%+6px)] left-0 right-0 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
          {suggestions.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                onMouseDown={() => navigate(s)}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${i === activeIdx ? 'bg-green-50' : 'hover:bg-gray-50'}`}
              >
                <span className="text-xl shrink-0">{s.categories?.icon || '🚜'}</span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium text-gray-900 truncate">{s.title}</span>
                  {s.categories?.name && (
                    <span className="text-xs text-gray-400">{s.categories.name}</span>
                  )}
                </span>
                <ArrowRight className="size-3.5 text-gray-300 shrink-0" />
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              onMouseDown={() => navigate()}
              className="w-full text-left px-4 py-2.5 flex items-center gap-2 text-sm text-green-700 font-medium hover:bg-green-50 transition-colors border-t border-gray-100"
            >
              <Search className="size-3.5" />
              Cauta &ldquo;{query}&rdquo; în toate anunțurile
            </button>
          </li>
        </ul>
      )}
    </div>
  )
}
