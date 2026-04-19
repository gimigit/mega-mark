'use client'

import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { X, GitCompare } from 'lucide-react'
import Image from 'next/image'
import { useCompareStore } from '@/store/useCompareStore'

export default function CompareBar() {
  const router = useRouter()
  const { listings, remove, clear } = useCompareStore()

  return (
    <AnimatePresence>
      {listings.length >= 1 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3"
        >
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 mr-1 whitespace-nowrap">
            Compară ({listings.length}/3):
          </span>

          {listings.map((l) => {
            const images = l.images as string[] | null
            return (
              <div key={l.id} className="relative group">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-green-100 dark:bg-dark-700 flex items-center justify-center">
                  {images?.[0] ? (
                    <Image src={images[0]} alt={l.title} fill className="object-cover" sizes="48px" />
                  ) : (
                    <span className="text-xl">🚜</span>
                  )}
                </div>
                <button
                  onClick={() => remove(l.id)}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Elimină"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            )
          })}

          {/* Placeholder slots */}
          {Array.from({ length: 3 - listings.length }).map((_, i) => (
            <div
              key={i}
              className="w-12 h-12 rounded-lg border-2 border-dashed border-gray-300 dark:border-dark-600 flex items-center justify-center text-gray-400 dark:text-gray-600 text-xs"
            >
              +
            </div>
          ))}

          <div className="flex items-center gap-2 ml-2">
            <button
              onClick={() => router.push('/compare')}
              disabled={listings.length < 2}
              className="flex items-center gap-1.5 px-4 py-2 bg-green-700 hover:bg-green-800 text-white text-sm font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <GitCompare className="w-4 h-4" />
              Compară
            </button>
            <button
              onClick={clear}
              className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              Golește
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
