'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ViewedListing {
  listingId: string
  categorySlug: string
  manufacturerSlug?: string
  viewedAt: number
}

interface BrowsingHistory {
  viewedListings: ViewedListing[]
  searchedTerms: string[]
  favoriteBrands: string[]
}

interface BrowsingHistoryActions {
  addViewedListing: (listingId: string, categorySlug: string, manufacturerSlug?: string) => void
  addSearchedTerm: (term: string) => void
  addFavoriteBrand: (brand: string) => void
  getMostViewedCategory: () => string | null
  getMostFavoritedBrand: () => string | null
  clearHistory: () => void
}

export const useBrowsingHistoryStore = create<BrowsingHistory & BrowsingHistoryActions>()(
  persist(
    (set, get) => ({
      viewedListings: [],
      searchedTerms: [],
      favoriteBrands: [],

      addViewedListing: (listingId: string, categorySlug: string, manufacturerSlug?: string) => {
        set((state) => {
          // Remove if already exists, add to front
          const filtered = state.viewedListings.filter((l) => l.listingId !== listingId)
          return {
            viewedListings: [
              { listingId, categorySlug, manufacturerSlug, viewedAt: Date.now() },
              ...filtered,
            ].slice(0, 50), // Keep last 50
          }
        })
      },

      addSearchedTerm: (term: string) => {
        set((state) => {
          const filtered = state.searchedTerms.filter((t) => t !== term)
          return {
            searchedTerms: [term, ...filtered].slice(0, 20), // Keep last 20
          }
        })
      },

      addFavoriteBrand: (brand: string) => {
        set((state) => {
          if (state.favoriteBrands.includes(brand)) return state
          return {
            favoriteBrands: [brand, ...state.favoriteBrands].slice(0, 10), // Keep last 10
          }
        })
      },

      getMostViewedCategory: () => {
        const { viewedListings } = get()
        if (viewedListings.length === 0) return null

        const counts: Record<string, number> = {}
        viewedListings.forEach((l) => {
          counts[l.categorySlug] = (counts[l.categorySlug] || 0) + 1
        })

        return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || null
      },

      getMostFavoritedBrand: () => {
        const { favoriteBrands } = get()
        if (favoriteBrands.length === 0) return null
        return favoriteBrands[0]
      },

      clearHistory: () => {
        set({ viewedListings: [], searchedTerms: [], favoriteBrands: [] })
      },
    }),
    {
      name: 'mega-mark-browsing-history',
    }
  )
)