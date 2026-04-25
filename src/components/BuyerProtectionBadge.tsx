'use client'

import { Shield, Info } from 'lucide-react'
import { useState } from 'react'

interface BuyerProtectionBadgeProps {
  compact?: boolean
}

export default function BuyerProtectionBadge({ compact = false }: BuyerProtectionBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
        <Shield className="w-3 h-3" />
        Garanție
      </span>
    )
  }

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-green-900 bg-green-100 rounded-full cursor-help">
        <Shield className="w-4 h-4" />
        Garanție Mega-Mark
      </span>

      {showTooltip && (
        <div className="absolute z-50 left-0 top-full mt-2 w-64 p-3 bg-white rounded-lg border shadow-lg text-sm">
          <div className="font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-600" />
            Protecție Cumpărător
          </div>
          <ul className="space-y-1.5 text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              Dealer verificat de Mega-Mark
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              Istoric preț verificat
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              Transport asigurat
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              Garanție returnare bani
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}