'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Currency = 'EUR' | 'RON'

interface CurrencyContextType {
  currency: Currency
  setCurrency: (currency: Currency) => void
  convertPrice: (priceInEUR: number) => number
  formatPrice: (price: number, originalCurrency?: Currency) => string
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

// Exchange rate (static for now, could be fetched from API)
const EUR_TO_RON = 4.95

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('EUR')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('currency') as Currency | null
    if (stored && (stored === 'EUR' || stored === 'RON')) {
      setCurrencyState(stored)
    }
  }, [])

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency)
    localStorage.setItem('currency', newCurrency)
  }

  const convertPrice = (priceInEUR: number): number => {
    if (currency === 'RON') {
      return priceInEUR * EUR_TO_RON
    }
    return priceInEUR
  }

  const formatPrice = (price: number, originalCurrency?: Currency): string => {
    const convertedPrice = originalCurrency === 'RON' ? price : convertPrice(price)
    
    if (currency === 'RON') {
      return new Intl.NumberFormat('ro-RO', {
        style: 'currency',
        currency: 'RON',
      }).format(convertedPrice)
    }
    
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'EUR',
    }).format(convertedPrice)
  }

  // Return provider with default values before mount to avoid hydration mismatch
  if (!mounted) {
    return (
      <CurrencyContext.Provider value={{
        currency: 'EUR',
        setCurrency,
        convertPrice,
        formatPrice,
      }}>
        {children}
      </CurrencyContext.Provider>
    )
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convertPrice, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (!context) {
    // Return default values if used outside provider
    return {
      currency: 'EUR' as Currency,
      setCurrency: () => {},
      convertPrice: (price: number) => price,
      formatPrice: (price: number) => `${price} EUR`,
    }
  }
  return context
}