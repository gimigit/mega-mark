'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Upload, Download, CheckCircle, AlertCircle, FileSpreadsheet } from 'lucide-react'
import { toast } from 'sonner'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import Navbar from '@/components/Navbar'

const CSV_TEMPLATE_HEADER = 'title,description,price,currency,year,hours,power_hp,condition,category_slug,manufacturer_name,location_country,location_region,location_city'
const CSV_EXAMPLE_ROW = 'John Deere 6215R 2019,Tractor în stare excelentă 3000 ore,89000,EUR,2019,3000,215,used,tractoare,John Deere,Romania,Cluj,Cluj-Napoca'

type ParsedRow = Record<string, string>

function parseCsv(text: string): ParsedRow[] {
  const lines = text.trim().split('\n').filter(Boolean)
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
    const row: ParsedRow = {}
    headers.forEach((h, i) => { row[h] = values[i] ?? '' })
    return row
  })
}

function downloadTemplate() {
  const content = [CSV_TEMPLATE_HEADER, CSV_EXAMPLE_ROW].join('\n')
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'mega-mark-template.csv'
  a.click()
  URL.revokeObjectURL(url)
}

const COLUMNS = CSV_TEMPLATE_HEADER.split(',')

export default function BulkUploadClient() {
  const router = useRouter()
  const { user } = useSupabase()
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [fileName, setFileName] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ created: number; errors: { row: number; error: string }[] } | null>(null)

  const handleFile = useCallback((file: File) => {
    setFileName(file.name)
    setResult(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const parsed = parseCsv(text)
      setRows(parsed)
      if (parsed.length === 0) toast.error('CSV invalid sau gol')
      else toast.success(`${parsed.length} rânduri detectate`)
    }
    reader.readAsText(file)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file?.name.endsWith('.csv')) handleFile(file)
    else toast.error('Acceptăm doar fișiere .csv')
  }, [handleFile])

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleSubmit = async () => {
    if (!user) { router.push('/login'); return }
    if (rows.length === 0) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/listings/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listings: rows }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Eroare la upload'); return }
      setResult(data)
      if (data.created > 0) toast.success(`${data.created} anunțuri publicate cu succes!`)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display">
              Bulk Upload Anunțuri
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Importă până la 50 de anunțuri dintr-un fișier CSV</p>
          </div>
        </div>

        {/* Step 1: Download template */}
        <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-black flex items-center justify-center">1</span>
                Descarcă template-ul CSV
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Completează template-ul cu anunțurile tale. Câmpurile obligatorii: <code className="bg-gray-100 dark:bg-dark-700 px-1 rounded text-xs">title</code>, restul sunt opționale.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {COLUMNS.map(col => (
                  <span key={col} className="text-xs bg-gray-100 dark:bg-dark-700 px-2 py-1 rounded text-gray-600 dark:text-gray-400">
                    {col}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 px-4 py-2 border border-green-600 text-green-700 dark:text-green-400 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 font-semibold text-sm transition-colors whitespace-nowrap ml-4"
            >
              <Download className="w-4 h-4" />
              Template CSV
            </button>
          </div>
        </div>

        {/* Step 2: Upload */}
        <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-2xl p-6 mb-6">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-black flex items-center justify-center">2</span>
            Încarcă fișierul CSV
          </h2>

          <label
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="block border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-xl p-10 text-center cursor-pointer hover:border-green-500 dark:hover:border-green-500 transition-colors"
          >
            <input type="file" accept=".csv" className="hidden" onChange={handleInput} />
            <FileSpreadsheet className="w-10 h-10 mx-auto text-gray-400 dark:text-gray-600 mb-3" />
            {fileName ? (
              <p className="font-semibold text-green-700 dark:text-green-400">{fileName}</p>
            ) : (
              <>
                <p className="font-semibold text-gray-700 dark:text-gray-300">Drag & drop CSV sau click pentru selectare</p>
                <p className="text-sm text-gray-400 dark:text-gray-600 mt-1">Maxim 50 de rânduri per fișier</p>
              </>
            )}
          </label>
        </div>

        {/* Step 3: Preview */}
        {rows.length > 0 && (
          <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-2xl p-6 mb-6">
            <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-black flex items-center justify-center">3</span>
              Preview — {rows.length} anunțuri detectate
            </h2>

            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-dark-700">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 dark:bg-dark-700">
                  <tr>
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400 font-semibold">#</th>
                    {['title', 'price', 'currency', 'year', 'condition', 'category_slug', 'location_country'].map(col => (
                      <th key={col} className="px-3 py-2 text-left text-gray-600 dark:text-gray-400 font-semibold">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 10).map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white dark:bg-transparent' : 'bg-gray-50 dark:bg-dark-800/50'}>
                      <td className="px-3 py-2 text-gray-400 dark:text-gray-600">{i + 1}</td>
                      {['title', 'price', 'currency', 'year', 'condition', 'category_slug', 'location_country'].map(col => (
                        <td key={col} className="px-3 py-2 text-gray-700 dark:text-gray-300 max-w-[200px] truncate">
                          {row[col] || <span className="text-gray-300 dark:text-gray-600">—</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length > 10 && (
                <p className="text-xs text-center text-gray-400 dark:text-gray-600 py-2">
                  ... și încă {rows.length - 10} rânduri
                </p>
              )}
            </div>

            {/* Submit */}
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Se vor publica <strong>{rows.length}</strong> anunțuri cu statusul <strong>active</strong>.
              </p>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Se publică...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Publică {rows.length} anunțuri
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className={`rounded-2xl p-6 ${result.created > 0 ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
            {result.created > 0 && (
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-bold text-green-800 dark:text-green-300">
                  {result.created} anunțuri publicate cu succes!
                </span>
              </div>
            )}
            {result.errors.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="font-semibold text-red-700 dark:text-red-400 text-sm">{result.errors.length} erori:</span>
                </div>
                <ul className="text-sm space-y-1">
                  {result.errors.map((e, i) => (
                    <li key={i} className="text-red-600 dark:text-red-400">Rând {e.row}: {e.error}</li>
                  ))}
                </ul>
              </div>
            )}
            {result.created > 0 && (
              <Link href="/dashboard" className="inline-block mt-4 px-4 py-2 bg-green-700 text-white text-sm font-semibold rounded-xl hover:bg-green-800 transition-colors">
                Vezi anunțurile publicate
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
