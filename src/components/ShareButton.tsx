'use client'

import { useState } from 'react'
import { Share2, Check } from 'lucide-react'
import { toast } from 'sonner'

interface ShareButtonProps {
  title: string
  url: string
}

export default function ShareButton({ title, url }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const shareData = { title, url }

    // Try native share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share(shareData)
        return
      } catch (err) {
        // User cancelled or error, fallback to clipboard
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Link copiat în clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Nu s-a putut copia link-ul')
    }
  }

  return (
    <button
      onClick={handleShare}
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
  )
}
