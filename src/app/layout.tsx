import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SupabaseProvider } from '@/components/providers/SupabaseProvider'
import { ThemeProvider } from 'next-themes'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

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
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <TooltipProvider>
            <SupabaseProvider>{children}</SupabaseProvider>
          </TooltipProvider>
        </ThemeProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
