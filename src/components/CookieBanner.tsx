'use client'

import { useEffect, useState } from 'react'
import { Cookie, X } from 'lucide-react'

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('mega-mark-cookie-consent')
    if (!cookieConsent) {
      setShowBanner(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('mega-mark-cookie-consent', 'accepted')
    setShowBanner(false)
  }

  const handleReject = () => {
    localStorage.setItem('mega-mark-cookie-consent', 'rejected')
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 dark:bg-dark-900 border-t border-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Cookie className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-white/90">
                Folosim cookies pentru a îmbunătăți experiența ta pe site. 
                Prin continuarea navigării, ești de acord cu utilizarea cookies-urilor esențiale.
              </p>
              <a href="/privacy" className="text-amber-400 hover:text-amber-300 text-xs underline">
                Citește mai mult în Politica de Confidențialitate
              </a>
            </div>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <button
              onClick={handleReject}
              className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              Refuz
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-2 text-sm font-bold bg-amber-500 hover:bg-amber-400 text-gray-900 rounded-lg transition-colors"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}