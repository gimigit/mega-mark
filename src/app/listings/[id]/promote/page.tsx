'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Zap, Clock, CheckCircle, ArrowLeft } from 'lucide-react'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'

const PLANS = [
  {
    id: 'featured_7d',
    label: '7 zile',
    price: '15 RON',
    description: 'Anunțul tău apare primul în căutări timp de 7 zile.',
    badge: 'Popular',
  },
  {
    id: 'featured_30d',
    label: '30 zile',
    price: '45 RON',
    description: 'Vizibilitate maximă timp de 30 zile. Cel mai bun raport calitate/preț.',
    badge: 'Cel mai bun',
  },
]

export default function PromotePage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const listingId = params.id as string
  const { user, isLoading } = useSupabase()
  const [listingTitle, setListingTitle] = useState('')
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const success = searchParams.get('success')

  useEffect(() => {
    if (!isLoading && !user) router.push('/login')
  }, [user, isLoading, router])

  useEffect(() => {
    if (!listingId) return
    createClient()
      .from('listings')
      .select('title, seller_id')
      .eq('id', listingId)
      .single()
      .then(({ data }) => {
        if (!data) { router.push('/browse'); return }
        if (data.seller_id !== user?.id) { router.push(`/listings/${listingId}`); return }
        setListingTitle(data.title)
      })
  }, [listingId, user?.id, router])

  async function handleCheckout() {
    if (!selectedPlan) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemType: 'boost',
          boostType: selectedPlan,
          listingId,
        }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Eroare la crearea sesiunii Stripe.')
        setLoading(false)
      }
    } catch {
      setError('Eroare de rețea. Încearcă din nou.')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <CheckCircle className="size-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2 font-display">Anunț promovat!</h1>
          <p className="text-muted-foreground mb-6">Anunțul tău apare acum primul în rezultatele căutării.</p>
          <Link href={`/listings/${listingId}`} className="px-6 py-3 bg-green-700 text-white rounded-xl font-bold hover:bg-green-800 transition-colors">
            Vezi anunțul
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Link href={`/listings/${listingId}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="size-4" />
          Înapoi la anunț
        </Link>

        <div className="text-center mb-8">
          <Zap className="size-10 text-amber-500 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-foreground font-display mb-1">Promovează anunțul</h1>
          {listingTitle && <p className="text-muted-foreground text-sm truncate">"{listingTitle}"</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {PLANS.map(plan => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative p-6 rounded-2xl border-2 text-left transition-all ${
                selectedPlan === plan.id
                  ? 'border-green-600 bg-green-50 dark:bg-green-900/10'
                  : 'border-border bg-surface hover:border-green-400'
              }`}
            >
              <span className="absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                {plan.badge}
              </span>
              <Clock className="size-6 text-green-700 mb-3" />
              <div className="text-2xl font-black text-green-700 mb-0.5">{plan.label}</div>
              <div className="text-lg font-bold text-foreground mb-2">{plan.price}</div>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
              {selectedPlan === plan.id && (
                <CheckCircle className="absolute bottom-4 right-4 size-5 text-green-600" />
              )}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleCheckout}
          disabled={!selectedPlan || loading}
          className="w-full py-4 bg-green-700 text-white rounded-xl font-bold text-lg hover:bg-green-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Zap className="size-5" />
              Continuă la plată
            </>
          )}
        </button>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Plată securizată prin Stripe. Anunțul devine promovat imediat după plată.
        </p>
      </div>
    </div>
  )
}
