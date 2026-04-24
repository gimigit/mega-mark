'use client'

import { useState, useRef, useEffect } from 'react'
import { Share2, Check, Facebook, Mail, Link2 } from 'lucide-react'
import { toast } from 'sonner'

interface ShareButtonProps {
  title: string
  url: string
  description?: string
}

export default function ShareButton({ title, url, description }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const shareText = description ? `${title} - ${description}` : title
  const shareUrl = typeof window !== 'undefined' ? url : url

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success('Link copiat în clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Nu s-a putut copia link-ul')
    }
  }

  const shareToFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    window.open(fbUrl, '_blank', 'width=600,height=400')
    setShowDropdown(false)
  }

  const shareToWhatsApp = () => {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`
    window.open(waUrl, '_blank')
    setShowDropdown(false)
  }

  const shareToEmail = () => {
    const subject = encodeURIComponent(title)
    const body = encodeURIComponent(`${shareText}\n\nVezi aici: ${shareUrl}`)
    window.location.href = `mailto:?subject=${subject}&body=${body}`
    setShowDropdown(false)
  }

  // Native share API
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: shareText, url: shareUrl })
        return
      } catch {
        // User cancelled, do nothing
      }
    }
    setShowDropdown(true)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleNativeShare}
        className="w-full rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
      >
        {copied ? (
          <>
            <Check className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-600">Copiat!</span>
          </>
        ) : (
          <>
            <Share2 className="w-5 h-5" />
            <span className="font-medium">Distribuie</span>
          </>
        )}
      </button>

      {/* Dropdown with share options */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg shadow-lg z-10 overflow-hidden">
          <button
            onClick={copyToClipboard}
            className="w-full px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors flex items-center gap-3 text-left"
          >
            <Link2 className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">Copiază link</span>
          </button>
          <button
            onClick={shareToFacebook}
            className="w-full px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors flex items-center gap-3 text-left"
          >
            <Facebook className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium">Facebook</span>
          </button>
          <button
            onClick={shareToWhatsApp}
            className="w-full px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors flex items-center gap-3 text-left"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#25D366">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.964-.94 1.162-.173.199-.347.223-.644.075-.297-.15-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.66-1.351-1.72-2.397-1.052-1.037-1.822-1.971-2.02-2.289-.198-.317-.019-.495.15-.647.149-.149.347-.397.52-.595.174-.198.297-.347.446-.521.149-.174.198-.372.025-.521-.075-.149-.66-1.351-1.72-2.397-1.052-1.037-1.822-1.971-2.02-2.289-.198-.317-.019-.495.15-.647.134-.133.298-.347.446-.52.149-.174.198-.298.297-.496.1-.198.05-.372-.024-.521-.075-.149-.66-1.351-1.72-2.397-1.052-1.037-1.822-1.971-2.02-2.289-.198-.317-.019-.495.15-.647.134-.133.347-.397.52-.595.174-.198.347-.347.496-.52.149-.174.198-.347.347-.52.149-.174.198-.372.025-.521-.075-.149-.66-1.351-1.72-2.397-1.052-1.037-1.822-1.971-2.02-2.289-.198-.317-.019-.495.15-.647.134-.133.298-.347.446-.52.149-.174.198-.298.297-.496.1-.198.05-.371-.025-.52z"/>
            </svg>
            <span className="text-sm font-medium">WhatsApp</span>
          </button>
          <button
            onClick={shareToEmail}
            className="w-full px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors flex items-center gap-3 text-left border-t border-gray-100 dark:border-dark-700"
          >
            <Mail className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">Email</span>
          </button>
        </div>
      )}
    </div>
  )
}