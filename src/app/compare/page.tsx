import type { Metadata } from 'next'
import CompareClient from './CompareClient'

export const metadata: Metadata = {
  title: 'Comparator Utilaje | Mega-Mark',
  description: 'Compară side-by-side până la 3 utilaje agricole',
}

export default function ComparePage() {
  return <CompareClient />
}
