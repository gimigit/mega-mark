'use client'

import { useState } from 'react'
import { Truck, Package, MapPin } from 'lucide-react'
import { useCurrencyStore } from '@/store/useCurrencyStore'

interface ShippingCalculatorProps {
  exportCountries?: string[]
  weight?: number // in kg, default 10
}

// Estimated shipping rates per country (EUR)
const shippingRates: Record<string, number> = {
  DE: 120,
  FR: 150,
  IT: 140,
  HU: 80,
  PL: 100,
  BG: 60,
  SK: 70,
  CZ: 90,
}

const countryNames: Record<string, string> = {
  DE: 'Germania',
  FR: 'Franța',
  IT: 'Italia',
  HU: 'Ungaria',
  PL: 'Polonia',
  BG: 'Bulgaria',
  SK: 'Slovacia',
  CZ: 'Cehia',
}

export default function ShippingCalculator({ exportCountries, weight = 10 }: ShippingCalculatorProps) {
  const [selectedCountry, setSelectedCountry] = useState<string>('')
  const { currency } = useCurrencyStore()
  const isRon = currency === 'RON'

  if (!exportCountries || exportCountries.length === 0) {
    return null
  }

  const baseRate = selectedCountry ? shippingRates[selectedCountry] || 100 : 0
  // Weight multiplier: +10% per 10kg over 10kg base
  const weightMultiplier = weight > 10 ? 1 + (weight - 10) * 0.1 : 1
  const shippingCost = baseRate * weightMultiplier

  const formatCurrency = (amount: number) => {
    if (isRon) {
      const ronAmount = amount * 5 // rough EUR to RON conversion
      return `${ronAmount.toFixed(0)} RON`
    }
    return `${amount.toFixed(0)} EUR`
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Truck className="w-5 h-5 text-blue-600" />
        Calculator Transport
      </h3>

      <div className="space-y-4">
        {/* Country Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            Destinație
          </label>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all bg-white"
          >
            <option value="">Selectează țara...</option>
            {exportCountries.map((country) => (
              <option key={country} value={country}>
                {countryNames[country] || country} ({formatCurrency(shippingRates[country] || 100)})
              </option>
            ))}
          </select>
        </div>

        {/* Weight Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Package className="w-4 h-4 inline mr-1" />
            Greutate estimată (kg)
          </label>
          <input
            type="number"
            min="1"
            max="500"
            defaultValue={weight}
            className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
          />
        </div>

        {/* Estimated Cost */}
        {selectedCountry && (
          <div className="bg-blue-50 rounded-xl p-4 mt-4">
            <div className="text-sm text-blue-600 mb-1">Cost estimat transport</div>
            <div className="text-2xl font-bold text-blue-700">
              {formatCurrency(shippingCost)}
            </div>
            <div className="text-xs text-blue-500 mt-1">
              *Tarif estimativ, final după confirmare
            </div>
          </div>
        )}

        {/* Countries Info */}
        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Transport disponibil către: {exportCountries.map(c => countryNames[c] || c).join(', ')}
          </p>
        </div>
      </div>
    </div>
  )
}