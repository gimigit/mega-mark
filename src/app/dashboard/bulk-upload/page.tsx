import type { Metadata } from 'next'
import BulkUploadClient from './BulkUploadClient'

export const metadata: Metadata = {
  title: 'Bulk Upload Anunțuri | Mega-Mark Dealer',
  description: 'Importă multiple anunțuri dintr-un fișier CSV',
}

export default function BulkUploadPage() {
  return <BulkUploadClient />
}
