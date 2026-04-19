import type { Metadata } from 'next'
import { Suspense } from 'react'
import CompareClient from './CompareClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Comparator Utilaje | Mega-Mark',
  description: 'Compară side-by-side până la 3 utilaje agricole',
}

export default function ComparePage() {
  return (
    <Suspense>
      <CompareClient />
    </Suspense>
  )
}
