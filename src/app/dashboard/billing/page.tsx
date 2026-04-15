import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ro } from 'date-fns/locale'
import { stripe } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Get active boosts (not expired)
  const { data: boosts } = await supabase
    .from('listing_boosts')
    .select(`
      *,
      listings ( title )
    `)
    .eq('profile_id', user.id)
    .eq('status', 'active')
    .gte('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })

  // Fetch billing history (invoices) from Stripe
  let invoices: any[] = []
  if (subscription?.stripe_subscription_id) {
    try {
      const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id)
      const customerId = stripeSubscription.customer as string
      if (customerId) {
        const stripeInvoices = await stripe.invoices.list({
          customer: customerId,
          limit: 10,
        })
        invoices = stripeInvoices.data.map(inv => ({
          id: inv.id,
          number: inv.number,
          amount: inv.amount_paid ? inv.amount_paid / 100 : 0,
          currency: inv.currency?.toUpperCase(),
          status: inv.status,
          date: inv.created ? new Date(inv.created * 1000) : null,
          host_invoice_url: inv.hosted_invoice_url,
        })).filter(inv => inv.date)
      }
      }
      catch (error) {
      console.error('Failed to fetch invoices:', error)
    }
  }

  const roLocale = ro

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Facturare și Abonament</h1>
          <p className="text-gray-600">Gestionează abonamentul și boost-urile tale</p>
        </div>

        {/* Subscription Section */}
        <Card>
          <CardHeader>
            <CardTitle>Abonament curent</CardTitle>
            <CardDescription>
              {subscription ? (
                <span className="flex items-center gap-2">
                  Plan: <Badge variant="secondary">{subscription.plan_type}</Badge>
                  Status: <Badge variant={subscription.status === 'active' ? 'default' : 'destructive'}>{subscription.status}</Badge>
                </span>
              ) : (
                'Nu ai niciun abonament activ.'
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {subscription ? (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Perioadă curentă</p>
                    <p className="font-medium">
                      {format(new Date(subscription.current_period_start), 'd MMM yyyy', { locale: roLocale })} – {format(new Date(subscription.current_period_end), 'd MMM yyyy', { locale: roLocale })}
                    </p>
                  </div>
                  {subscription.cancel_at_period_end && (
                    <div>
                      <p className="text-sm text-gray-500">Anulare</p>
                      <p className="font-medium text-orange-600">Abonamentul va fi anulat la sfârșitul perioadei</p>
                    </div>
                  )}
                  {subscription.canceled_at && (
                    <div>
                      <p className="text-sm text-gray-500">Anulat la</p>
                      <p className="font-medium">{format(new Date(subscription.canceled_at), 'd MMM yyyy', { locale: roLocale })}</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-3 pt-4 border-t">
                  <form action="/api/subscriptions/cancel" method="POST">
                    <Button type="submit" variant="destructive" disabled={subscription.status === 'cancelled' || subscription.status === 'unpaid'}>
                      Anulează abonamentul
                    </Button>
                  </form>
                  <form action="/api/stripe/portal" method="POST">
                    <Button type="submit" variant="outline">
                      Gestionează metoda de plată
                    </Button>
                  </form>
                  <Button variant="outline">
                    <a href="/pricing" className="hover:underline">Schimbă planul</a>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="mb-4">Nu ai un abonament activ. Selectează un plan pentru a începe.</p>
                <Button>
                  <a href="/pricing">Vezi planuri</a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Listing Boosts Section */}
        <Card>
          <CardHeader>
            <CardTitle>Boost-uri active</CardTitle>
            <CardDescription>Anunțurile tale promovate</CardDescription>
          </CardHeader>
          <CardContent>
            {!boosts || boosts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nu ai boost-uri active.</p>
            ) : (
              <div className="space-y-4">
                {boosts.map(boost => (
                  <div key={boost.id} className="border rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{boost.listings?.title || 'Anunț șters'}</p>
                      <p className="text-sm text-gray-500">
                        {boost.boost_type} • {format(new Date(boost.expires_at), 'd MMM yyyy', { locale: roLocale })}
                      </p>
                    </div>
                    <Badge variant="outline">{boost.quantity}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Billing History */}
        <Card>
          <CardHeader>
            <CardTitle>Istoric facturi</CardTitle>
            <CardDescription>Lista facturilor tale</CardDescription>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nu ai facturi încă.</p>
            ) : (
              <div className="space-y-4">
                {invoices.map(invoice => (
                  <div key={invoice.id} className="border rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">Factura #{invoice.number}</p>
                      <p className="text-sm text-gray-500">
                        {format(invoice.date!, 'd MMM yyyy', { locale: roLocale })} • {invoice.currency} {invoice.amount.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                        {invoice.status}
                      </Badge>
                      {invoice.host_invoice_url && (
                        <a href={invoice.host_invoice_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm">Vezi factură</Button>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}