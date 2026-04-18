'use client'

import { useCurrencyStore } from '@/store/useCurrencyStore'
import { Button } from '@/components/ui/button'

export default function CurrencyToggle() {
  const { currency, toggle } = useCurrencyStore()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      className="w-16 h-8 px-1 font-medium text-sm text-gray-600 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400"
    >
      {currency}
    </Button>
  )
}
