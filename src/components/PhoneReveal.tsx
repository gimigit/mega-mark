'use client'

import { useState } from 'react'
import { Phone, Eye } from 'lucide-react'

interface PhoneRevealProps {
  phone: string
}

export default function PhoneReveal({ phone }: PhoneRevealProps) {
  const [revealed, setRevealed] = useState(false)

  if (revealed) {
    return (
      <div className="text-center">
        <a
          href={`tel:${phone}`}
          className="text-[24px] font-bold text-green-700 whitespace-nowrap hover:underline"
        >
          {phone}
        </a>
        <p className="text-sm text-gray-400 mt-1">Telefon vânzător</p>
      </div>
    )
  }

  return (
    <button
      onClick={() => setRevealed(true)}
      className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-gradient-to-r from-green-700 to-green-600 text-white font-medium transition-all hover:shadow-lg hover:shadow-green-700/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
    >
      <Phone className="w-5 h-5" />
      <span>Arată numărul de telefon</span>
      <Eye className="w-4 h-4 opacity-70" />
    </button>
  )
}
