import type { Metadata } from 'next'
import { Fraunces, DM_Sans } from 'next/font/google'
import './globals.css'
import { SupabaseProvider } from '@/components/providers/SupabaseProvider'
import { CurrencyProvider } from '@/components/providers/CurrencyProvider'
import { ThemeProvider } from 'next-themes'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import CookieBanner from '@/components/CookieBanner'

const fraunces = Fraunces({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-display',
})

const dmSans = DM_Sans({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-body',
})

export const metadata: Metadata = {
  title: 'Mega-Mark — Piața Utilajelor Agricole din România și UE',
  description:
    'Cumpără și vinde tractoare, combine, recoltatoare și utilaje agricole în România și 16 țări UE. Marketplace-ul #1 pentru agricultura europeană.',
  keywords: [
    'agricultural machinery',
    'tractors',
    'farm equipment',
    'EU marketplace',
    'agriculture',
    'utilaje agricole',
    'tractoare',
    'combine',
  ],
  openGraph: {
    title: 'Mega-Mark — Piața Utilajelor Agricole',
    description:
      'Cumpără și vinde utilaje agricole în toată Europa. Tractoare, combine, recoltatoare.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ro" suppressHydrationWarning>
      <body className={`${fraunces.variable} ${dmSans.variable} font-body`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <TooltipProvider>
            <CurrencyProvider>
              <SupabaseProvider>{children}</SupabaseProvider>
            </CurrencyProvider>
          </TooltipProvider>
        </ThemeProvider>
        <Toaster position="top-center" richColors />
        <CookieBanner />
      </body>
    </html>
  )
}
