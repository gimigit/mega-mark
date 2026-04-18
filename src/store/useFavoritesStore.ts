import { create } from 'zustand'

interface FavoritesState {
  ids: Set<string>
  hydrated: boolean
  hydrate: (ids: string[]) => void
  add: (id: string) => void
  remove: (id: string) => void
  has: (id: string) => boolean
  count: () => number
}

export const useFavoritesStore = create<FavoritesState>()((set, get) => ({
  ids: new Set(),
  hydrated: false,
  hydrate: (ids) => set({ ids: new Set(ids), hydrated: true }),
  add: (id) => set((s) => ({ ids: new Set([...s.ids, id]) })),
  remove: (id) => set((s) => { const next = new Set(s.ids); next.delete(id); return { ids: next } }),
  has: (id) => get().ids.has(id),
  count: () => get().ids.size,
}))
