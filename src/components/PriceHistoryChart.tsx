'use client'

import { useMemo } from 'react'
import { TrendingDown, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { ro } from 'date-fns/locale'
import { useCurrencyStore, formatPrice } from '@/store/useCurrencyStore'

interface PriceHistoryItem {
  date: string
  price: number
  currency?: string
}

interface PriceHistoryChartProps {
  priceHistory: PriceHistoryItem[]
  currentPrice: number
  currentCurrency?: 'EUR' | 'RON'
}

export default function PriceHistoryChart({ 
  priceHistory, 
  currentPrice, 
  currentCurrency = 'EUR' 
}: PriceHistoryChartProps) {
  const { currency, rate } = useCurrencyStore()

  // Need at least 2 entries to show chart
  const historyData = useMemo(() => {
    if (!priceHistory || priceHistory.length < 2) return []
    
    // Sort by date and take last 6 entries
    const sorted = [...priceHistory].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    return sorted.slice(-6)
  }, [priceHistory])

  if (historyData.length < 2) return null

  // Calculate price drop
  const firstPrice = historyData[0].price
  const lastPrice = currentPrice
  const hasDrop = lastPrice < firstPrice
  const dropPercent = hasDrop 
    ? Math.round(((firstPrice - lastPrice) / firstPrice) * 100) 
    : 0

  // Convert prices for display
  const convertPrice = (price: number, priceCurrency?: string) => {
    const priceInEUR = (priceCurrency === 'RON' || priceCurrency === 'ron') 
      ? price / rate 
      : price
    
    if (currency === 'RON') {
      return priceInEUR * rate
    }
    return priceInEUR
  }

  const minPrice = Math.min(...historyData.map(h => convertPrice(h.price, h.currency)))
  const maxPrice = Math.max(...historyData.map(h => convertPrice(h.price, h.currency)))
  const priceRange = maxPrice - minPrice || 1

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Istoric preț
        </h4>
        {hasDrop && (
          <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">
            <TrendingDown className="w-3 h-3" />
            -{dropPercent}%
          </span>
        )}
      </div>

      {/* Simple line chart */}
      <div className="relative h-16 mb-2">
        <svg 
          viewBox="0 0 100 50" 
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          <line x1="0" y1="12.5" x2="100" y2="12.5" stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="2" />
          <line x1="0" y1="25" x2="100" y2="25" stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="2" />
          <line x1="0" y1="37.5" x2="100" y2="37.5" stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="2" />
          
          {/* Line */}
          <polyline
            fill="none"
            stroke={hasDrop ? '#16a34a' : '#6b7280'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={historyData
              .map((h, i) => {
                const x = (i / (historyData.length - 1)) * 100
                const y = 50 - ((convertPrice(h.price, h.currency) - minPrice) / priceRange) * 50
                return `${x},${y}`
              })
              .join(' ')}
          />
          
          {/* Dots */}
          {historyData.map((h, i) => {
            const x = (i / (historyData.length - 1)) * 100
            const y = 50 - ((convertPrice(h.price, h.currency) - minPrice) / priceRange) * 50
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="2.5"
                fill={i === historyData.length - 1 ? '#16a34a' : '#9ca3af'}
                stroke="white"
                strokeWidth="1"
              />
            )
          })}
        </svg>
      </div>

      {/* Price info */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          {format(new Date(historyData[0].date), 'd MMM', { locale: ro })}
        </span>
        <span className="text-green-600 font-medium">
          {formatPrice(currentPrice, currentCurrency)}
        </span>
        <span>
          {format(new Date(historyData[historyData.length - 1].date), 'd MMM yyyy', { locale: ro })}
        </span>
      </div>
    </div>
  )
}