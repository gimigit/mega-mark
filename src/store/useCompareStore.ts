import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Database } from '@/types/database'

type Listing = Database['public']['Tables']['listings']['Row'] & {
  categories?: Database['public']['Tables']['categories']['Row']
  profiles?: Database['public']['Tables']['profiles']['Row']
}

const MAX_COMPARE = 3

interface CompareState {
  listings: Listing[]
  add: (listing: Listing) => void
  remove: (id: string) => void
  has: (id: string) => boolean
  clear: () => void
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      listings: [],
      add: (listing) => {
        const { listings } = get()
        if (listings.length >= MAX_COMPARE || listings.some(l => l.id === listing.id)) return
        set({ listings: [...listings, listing] })
      },
      remove: (id) => set((s) => ({ listings: s.listings.filter(l => l.id !== id) })),
      has: (id) => get().listings.some(l => l.id === id),
      clear: () => set({ listings: [] }),
    }),
    { name: 'mega-mark-compare' }
  )
)
