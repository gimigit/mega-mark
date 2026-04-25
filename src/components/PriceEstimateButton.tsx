'use client'

import { useState, useEffect } from 'react'
import { Loader2, TrendingUp } from 'lucide-react'
import { useCurrencyStore } from '@/store/useCurrencyStore'

interface PriceEstimate {
  min: number
  max: number
  median: number
  count: number
  lowest: number
  highest: number
  message?: string
}

interface PriceEstimateButtonProps {
  category: string
  manufacturer?: string
  model?: string
  year?: number
  hours?: number
  condition?: string
}

export default function PriceEstimateButton({
  category,
  manufacturer,
  model,
  year,
  hours,
  condition
}: PriceEstimateButtonProps) {
  const [estimate, setEstimate] = useState<PriceEstimate | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { currency } = useCurrencyStore()

  const fetchEstimate = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/listings/price-estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          category,
          manufacturer,
          model,
          year,
          hours,
          condition
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch estimate')
      }

      setEstimate(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    const converted = currency === 'RON' ? price * 4.9 : price
    return new Intl.NumberFormat(currency === 'RON' ? 'ro-RO' : 'en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0
    }).format(converted)
  }

  return (
    <div className="mt-4 p-4 bg-muted/50 rounded-lg">
      <button
        onClick={fetchEstimate}
        disabled={loading || !category}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <TrendingUp className="w-4 h-4" />
        )}
        <span>
          {estimate ? 'Recalculează preț' : 'Estimează preț bazat pe similar listings'}
        </span>
      </button>

      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}

      {estimate && estimate.count > 0 && (
        <div className="mt-3 space-y-1">
          <p className="text-sm text-muted-foreground">
            Bazat pe {estimate.count} anunțuri similare:
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">
              {formatPrice(estimate.min)} - {formatPrice(estimate.max)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Median: {formatPrice(estimate.median)} • Preț minim: {formatPrice(estimate.lowest)} • Preț maxim: {formatPrice(estimate.highest)}
          </p>
        </div>
      )}

      {estimate && estimate.count === 0 && (
        <p className="mt-2 text-sm text-muted-foreground">
          {estimate.message || 'Nu există anunțuri similare pentru comparație'}
        </p>
      )}
    </div>
  )
}