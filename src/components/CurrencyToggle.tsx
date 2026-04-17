'use client'

import { useCurrency } from '@/components/providers/CurrencyProvider'
import { Coins } from 'lucide-react'

export default function CurrencyToggle() {
  const { currency, setCurrency } = useCurrency()

  return (
    <button
      onClick={() => setCurrency(currency === 'EUR' ? 'RON' : 'EUR')}
      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 dark:bg-dark-800 hover:bg-gray-200 dark:hover:bg-dark-700 transition-colors text-sm font-semibold"
      aria-label={`Switch to ${currency === 'EUR' ? 'RON' : 'EUR'}`}
    >
      <Coins className="w-4 h-4 text-amber-600" />
      <span className="text-gray-700 dark:text-gray-200">{currency}</span>
    </button>
  )
}