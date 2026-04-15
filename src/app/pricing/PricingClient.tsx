'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '0€',
    period: '/lună',
    description: 'Pentru încercare',
    features: [
      '3 anunțuri active',
      '1 anunț featured pe lună',
      'Mesagerie de bază',
      'Favorites',
    ],
    buttonText: 'Începe gratuit',
    buttonVariant: 'outline' as const,
    disabled: false,
  },
  {
    id: 'seller',
    name: 'Seller',
    price: '9.99€',
    period: '/lună',
    description: 'Pentru vânzători mici și mijlocii',
    features: [
      '20 anunțuri active',
      '1 anunț featured pe lună',
      'Mesagerie nelimitată',
      'Favorites',
      'Suport email',
    ],
    buttonText: 'Upgrade la Seller',
    buttonVariant: 'default' as const,
    disabled: false,
  },
  {
    id: 'dealer',
    name: 'Dealer',
    price: '29.99€',
    period: '/lună',
    description: 'Pentru dealership-uri profesionale',
    features: [
      'Anunțuri nelimitate',
      '5 anunțuri featured pe lună',
      'Mesagerie nelimitată',
      'Favorites',
      'Badge Dealer Verificat',
      'Suport prioritar',
    ],
    buttonText: 'Upgrade la Dealer',
    buttonVariant: 'default' as const,
    disabled: false,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'Pentru mari companii',
    features: [
      'Anunțuri nelimitate',
      'Featured nelimitat',
      'API access',
      'Integrare personalizată',
      'Manager de cont dedicat',
    ],
    buttonText: 'Contactează-ne',
    buttonVariant: 'outline' as const,
    disabled: false,
    contact: true,
  },
]

const BOOSTS = [
  {
    id: 'featured_7d',
    name: 'Featured 7 zile',
    price: '4.99€',
    description: 'Evidențiază anunțul 7 zile în top',
    buttonText: 'Boost 7 zile',
  },
  {
    id: 'featured_14d',
    name: 'Featured 14 zile',
    price: '9.99€',
    description: 'Top poziție + badge Featured 14 zile',
    buttonText: 'Boost 14 zile',
  },
]

const TESTIMONIALS = [
  {
    initials: 'IP',
    name: 'Ion Popescu',
    role: 'Fermier, Iași',
    quote: 'Planul Seller mi-a permis să public 20 de anunțuri și să primesc mesaje de la cumpărători din toată țara. Serviciul este foarte eficient!',
  },
  {
    initials: 'MI',
    name: 'Maria Ionescu',
    role: 'Dealer, Cluj',
    quote: 'Badge-ul de Dealer Verificat a crescut semnificativ încrederea clienților. Am ajuns să vând mai multe utilaje agricole.',
  },
  {
    initials: 'AV',
    name: 'Andrei Vasilescu',
    role: 'CompanieAgricolă, Timișoara',
    quote: 'Integrarea API pentru planul Enterprise a fost ușor de configurat. Acum putem automatiza întregul proces de publicare.',
  },
  {
    initials: 'ED',
    name: 'Elena Dumitru',
    role: 'Fermier, București',
    quote: 'Am început cu planul Free pentru a vedea cum merge. După ce am văzut rezultatele, am trecut la Seller. Recomand!',
  },
]

export default function PricingClient() {
  const supabase = createClient()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  // Check current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase])

  const handleUpgrade = async (planId: string) => {
    if (!user) {
      alert('Te rugăm să te autentifici pentru a upgrade.')
      window.location.href = '/login'
      return
    }
    setLoadingPlan(planId)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemType: 'subscription', planType: planId }),
      })
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Eroare la crearea sesiunii de plată.')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Eroare la inițierea plății.')
    } finally {
      setLoadingPlan(null)
    }
  }

  const handleBoost = async (boostType: string) => {
    if (!user) {
      alert('Te rugăm să te autentifici pentru a cumpăra un boost.')
      window.location.href = '/login'
      return
    }
    // Redirect to browse or to user's listings to select which listing to boost.
    // For now, we'll redirect to the browse page with a note that boost is applied from listing details.
    window.location.href = '/browse'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="text-2xl font-bold text-green-700">Mega-Mark</a>
          <div className="space-x-4">
            <a href="/browse" className="text-gray-600 hover:text-green-600">Browse</a>
            <a href="/pricing" className="text-green-600 font-medium">Prețuri</a>
            {user ? (
              <a href="/dashboard" className="text-gray-600 hover:text-green-600">Dashboard</a>
            ) : (
              <>
                <a href="/login" className="text-gray-600 hover:text-green-600">Login</a>
                <a href="/signup" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">Înscrie-te</a>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Planuri și Prețuri</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Alege planul care se potrivește nevoilor tale. Fie că ești vânzător individual sau dealer profesionist, avem soluția.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {PLANS.map(plan => (
            <Card key={plan.id} className={plan.id === 'dealer' ? 'border-green-500 shadow-lg' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {plan.name}
                  {plan.id === 'dealer' && <Badge variant="secondary">Popular</Badge>}
                </CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.buttonVariant}
                  disabled={plan.disabled || loadingPlan === plan.id}
                  onClick={() => {
                    if (plan.contact) {
                      window.location.href = '/contact'
                    } else {
                      handleUpgrade(plan.id)
                    }
                  }}
                >
                  {loadingPlan === plan.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {plan.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Boost pentru Anunțuri</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {BOOSTS.map(boost => (
              <Card key={boost.id}>
                <CardHeader>
                  <CardTitle>{boost.name}</CardTitle>
                  <CardDescription>{boost.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-2xl font-bold">{boost.price}</span>
                    <span className="text-gray-500"> / one-time</span>
                  </div>
                </CardHeader>
                <CardFooter>
                  <Button className="w-full" onClick={() => handleBoost(boost.id)}>
                    {boost.buttonText}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          <p className="text-center text-sm text-gray-500 mt-4">
            Boosturile se pot activa direct din pagina anunțului tău.
          </p>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Testimoniale</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, idx) => (
              <Card key={idx}>
                <CardContent className="pt-6">
                  <p className="italic text-gray-600 mb-4">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                      {t.initials}
                    </div>
                    <div>
                      <p className="font-semibold">{t.name}</p>
                      <p className="text-sm text-gray-500">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Întrebări Frecvente</h2>
          <div className="space-y-4 max-w-3xl">
            <div className="border-b pb-4">
              <h3 className="font-semibold">Ce se întâmplă dacă depășesc numărul de anunțuri?</h3>
              <p className="text-gray-600">Poți upgrade la un plan superior sau poți șterge anunțuri vechi pentru a face loc pentru noi.</p>
            </div>
            <div className="border-b pb-4">
              <h3 className="font-semibold">Se poate anula abonamentul în orice moment?</h3>
              <p className="text-gray-600">Da, poți anula abonamentul în orice moment. Accesul rămâne activ p��nă la sfârșitul perioadei de facturare.</p>
            </div>
            <div className="border-b pb-4">
              <h3 className="font-semibold">Cum se activează boost-ul?</h3>
              <p className="text-gray-600">După cumpărare, boost-ul este aplicat automat pe anunțul selectat și rămâne activ pentru durata specificată.</p>
            </div>
            <div>
              <h3 className="font-semibold">Acceptați facturare pentru companii?</h3>
              <p className="text-gray-600">Planul Enterprise poate fi facturat pe Factură. Contactează-ne pentru detalii.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 text-gray-300 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2025 Mega-Mark. Toate drepturile rezervate.</p>
        </div>
      </footer>
    </div>
  )
}