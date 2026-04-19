'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { uploadListingImage, deleteListingImage } from '@/lib/upload'

type Category = { id: string; slug: string; name: string; icon: string | null }
type Manufacturer = { id: string; slug: string; name: string }

type UploadedImage = {
  url: string
  file: File
  uploading: boolean
  error: string | null
}

const EU_COUNTRIES = [
  { code: 'RO', name: 'România' },
  { code: 'DE', name: 'Germania' },
  { code: 'FR', name: 'Franța' },
  { code: 'NL', name: 'Olanda' },
  { code: 'PL', name: 'Polonia' },
  { code: 'ES', name: 'Spania' },
  { code: 'IT', name: 'Italia' },
  { code: 'AT', name: 'Austria' },
  { code: 'BE', name: 'Belgia' },
  { code: 'HU', name: 'Ungaria' },
  { code: 'CZ', name: 'Cehia' },
  { code: 'DK', name: 'Danemarca' },
  { code: 'SE', name: 'Suedia' },
  { code: 'PT', name: 'Portugalia' },
  { code: 'GR', name: 'Grecia' },
  { code: 'FI', name: 'Finlanda' },
]

export default function CreateListingPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useSupabase()
  const supabase = createClient()

  const [categories, setCategories] = useState<Category[]>([])
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Image upload state
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [uploadingCount, setUploadingCount] = useState(0)

  const [autoClassified, setAutoClassified] = useState<{ category_id: string | null; manufacturer_id: string | null } | null>(null)
  const [classifying, setClassifying] = useState(false)
  const classifyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [form, setForm] = useState({
    title: '',
    category_id: '',
    manufacturer_id: '',
    listing_type: 'sale',
    price: '',
    price_type: 'fixed',
    condition: 'used',
    year: '',
    hours: '',
    mileage: '',
    location_country: 'RO',
    location_region: '',
    description: '',
    status: 'active' as 'active' | 'draft',
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const fetchData = async () => {
      const [catRes, mfgRes] = await Promise.all([
        supabase.from('categories').select('id, slug, name, icon').eq('is_active', true).order('sort_order'),
        supabase.from('manufacturers').select('id, slug, name').eq('is_active', true).order('name'),
      ])
      if (catRes.data) setCategories(catRes.data as Category[])
      if (mfgRes.data) setManufacturers(mfgRes.data as Manufacturer[])
    }
    if (user) fetchData()
  }, [user, supabase])

  // Auto-classify on title change
  const triggerAutoClassify = useCallback((title: string) => {
    if (classifyTimeoutRef.current) clearTimeout(classifyTimeoutRef.current)
    if (title.length < 5) return
    classifyTimeoutRef.current = setTimeout(async () => {
      setClassifying(true)
      try {
        const res = await fetch(`/api/listings/auto-classify?title=${encodeURIComponent(title)}`)
        const data = await res.json()
        if (data.category_id || data.manufacturer_id) {
          setAutoClassified(data)
          setForm(prev => ({
            ...prev,
            ...(data.category_id && !prev.category_id ? { category_id: data.category_id } : {}),
            ...(data.manufacturer_id && !prev.manufacturer_id ? { manufacturer_id: data.manufacturer_id } : {}),
          }))
        }
      } finally {
        setClassifying(false)
      }
    }, 500)
  }, [])

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || e.target.files.length === 0) return

    const files = Array.from(e.target.files)
    
    // Create preview entries
    const newImages: UploadedImage[] = files.map(file => ({
      url: '',
      file,
      uploading: true,
      error: null,
    }))
    
    setUploadedImages(prev => [...prev, ...newImages])
    setUploadingCount(prev => prev + files.length)

    // Upload each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const imageIndex = uploadedImages.length + i
      
      const { url, error } = await uploadListingImage(file, user.id)
      
      setUploadedImages(prev => prev.map((img, idx) => 
        idx === imageIndex 
          ? { ...img, url, uploading: false, error } 
          : img
      ))
      
      setUploadingCount(prev => prev - 1)
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Remove image
  const handleRemoveImage = async (index: number) => {
    if (!user) return
    const image = uploadedImages[index]
    
    // If it was uploaded, try to delete from storage
    if (image.url) {
      await deleteListingImage(image.url, user.id)
    }
    
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

  // Trigger file input
  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setError('')
    setLoading(true)

    const { data, error: submitError } = await supabase.from('listings').insert({
      seller_id: user.id,
      category_id: form.category_id || null,
      manufacturer_id: form.manufacturer_id || null,
      title: form.title,
      description: form.description || null,
      price: Number(form.price),
      currency: 'EUR',
      price_type: form.price_type as 'fixed' | 'negotiable' | 'on_request' | 'auction',
      listing_type: form.listing_type as 'sale' | 'rent' | 'lease',
      condition: form.condition as 'new' | 'used' | 'refurbished',
      year: form.year ? Number(form.year) : null,
      hours: form.hours ? Number(form.hours) : null,
      mileage: form.mileage ? Number(form.mileage) : null,
      location_country: form.location_country,
      location_region: form.location_region || null,
      status: form.status,
      images: uploadedImages.filter(img => img.url && !img.error).map(img => img.url),
    }).select().single()

    setLoading(false)

    if (submitError) {
      setError(submitError.message)
    } else if (data) {
      // Notify seller about published listing (if active)
      if (data.status === 'active') {
        try {
          await fetch('/api/notifications/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'listing_published',
              data: {
                userId: user.id,
                listingTitle: data.title,
              },
            }),
          })
        } catch (notifError) {
          console.error('Failed to send listing published notification:', notifError)
        }
      }

      router.push(`/listings/${data.id}`)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-green-700 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/" className="text-2xl font-black text-green-800 flex items-center gap-1">
            Mega<em className="text-amber-500 not-italic">Mark</em>
          </Link>
          <div className="ml-auto text-sm text-gray-500">
            {user ? (
              <Link href="/dashboard" className="text-green-700 font-semibold hover:text-green-800">← Dashboard</Link>
            ) : (
              <Link href="/browse" className="text-green-700 font-semibold hover:text-green-800">← Înapoi</Link>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-black text-gray-900 mb-2">Postează un anunț</h1>
        <p className="text-gray-500 mb-8">Completează formularul pentru a publica anunțul tău.</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Step 1: Basic Info */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-8 h-8 bg-green-700 text-white rounded-full flex items-center justify-center text-sm font-black">1</span>
              Informații de bază
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Titlu anunț *
                  {classifying && (
                    <span className="ml-2 text-xs font-normal text-green-600">⟳ detectând...</span>
                  )}
                  {!classifying && autoClassified && (
                    <span className="ml-2 text-xs font-normal text-green-600">✓ auto-detectat</span>
                  )}
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => {
                    setForm({ ...form, title: e.target.value })
                    triggerAutoClassify(e.target.value)
                  }}
                  placeholder="ex: John Deere 6155M, 2021, 4500 ore"
                  required
                  maxLength={200}
                  className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/10 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    Categorie *
                    {autoClassified?.category_id && form.category_id === autoClassified.category_id && (
                      <span className="ml-1.5 text-xs font-normal text-green-600 bg-green-50 px-1.5 py-0.5 rounded">✦ auto</span>
                    )}
                  </label>
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    required
                    className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/10 outline-none transition-all"
                  >
                    <option value="">Selectează categorie</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    Producător
                    {autoClassified?.manufacturer_id && form.manufacturer_id === autoClassified.manufacturer_id && (
                      <span className="ml-1.5 text-xs font-normal text-green-600 bg-green-50 px-1.5 py-0.5 rounded">✦ auto</span>
                    )}
                  </label>
                  <select
                    value={form.manufacturer_id}
                    onChange={(e) => setForm({ ...form, manufacturer_id: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/10 outline-none transition-all"
                  >
                    <option value="">Alt producător</option>
                    {manufacturers.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Tip anunț *</label>
                  <select
                    value={form.listing_type}
                    onChange={(e) => setForm({ ...form, listing_type: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/10 outline-none transition-all"
                  >
                    <option value="sale">De vânzare</option>
                    <option value="rent">De închiriat</option>
                    <option value="lease">Leasing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Stare *</label>
                  <select
                    value={form.condition}
                    onChange={(e) => setForm({ ...form, condition: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/10 outline-none transition-all"
                  >
                    <option value="new">Nou</option>
                    <option value="used">Folosit</option>
                    <option value="refurbished">Refurbished</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">An</label>
                  <input
                    type="number"
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    placeholder="2021"
                    min="1950"
                    max={new Date().getFullYear() + 1}
                    className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/10 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Price + Location */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-8 h-8 bg-green-700 text-white rounded-full flex items-center justify-center text-sm font-black">2</span>
              Preț și Locație
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Preț (€) *</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="50000"
                  required
                  min="0"
                  className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/10 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Tip preț</label>
                <select
                  value={form.price_type}
                  onChange={(e) => setForm({ ...form, price_type: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/10 outline-none transition-all"
                >
                  <option value="fixed">Fix</option>
                  <option value="negotiable">Negociabil</option>
                  <option value="on_request">La cerere</option>
                  <option value="auction">Licitație</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Țară *</label>
                <select
                  value={form.location_country}
                  onChange={(e) => setForm({ ...form, location_country: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/10 outline-none transition-all"
                >
                  {EU_COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Regiune / Județ</label>
                <input
                  type="text"
                  value={form.location_region}
                  onChange={(e) => setForm({ ...form, location_region: e.target.value })}
                  placeholder="ex: Timișoara, Bavaria"
                  className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/10 outline-none transition-all"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5 mt-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Ore de funcționare</label>
                <input
                  type="number"
                  value={form.hours}
                  onChange={(e) => setForm({ ...form, hours: e.target.value })}
                  placeholder="4500"
                  min="0"
                  className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/10 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Kilometraj (km)</label>
                <input
                  type="number"
                  value={form.mileage}
                  onChange={(e) => setForm({ ...form, mileage: e.target.value })}
                  placeholder="120000"
                  min="0"
                  className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/10 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Description */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-8 h-8 bg-green-700 text-white rounded-full flex items-center justify-center text-sm font-black">3</span>
              Descriere
            </h2>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Descriere detaliată</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Descrie starea utilajului, istoricul întreținerii, dotările extra, motivul vânzării..."
                rows={6}
                className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/10 outline-none transition-all resize-none"
              />
              <p className="text-xs text-gray-400 mt-1.5">{form.description.length} / 2000 caractere</p>
            </div>
          </div>

          {/* Step 4: Images */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-8 h-8 bg-green-700 text-white rounded-full flex items-center justify-center text-sm font-black">4</span>
              Imagini
            </h2>
            
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {/* Upload button */}
            <button
              type="button"
              onClick={handleUploadClick}
              className="w-full p-8 border-2 border-dashed border-gray-300 rounded-xl text-center hover:border-green-500 hover:bg-green-50 transition-all cursor-pointer"
            >
              <div className="text-4xl mb-2">📷</div>
              <p className="font-bold text-gray-700">Adaugă imagini</p>
              <p className="text-sm text-gray-500 mt-1">PNG, JPG, WEBP • Max 5MB per imagine</p>
            </button>

            {/* Upload progress indicator */}
            {uploadingCount > 0 && (
              <div className="mt-4 flex items-center gap-2 text-sm text-blue-600">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                Se încarcă {uploadingCount} {uploadingCount === 1 ? 'imagine' : 'imagini'}...
              </div>
            )}

            {/* Image previews */}
            {uploadedImages.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-bold text-gray-700 mb-3">
                  {uploadedImages.filter(img => !img.uploading && !img.error).length} {uploadedImages.filter(img => !img.uploading && !img.error).length === 1 ? 'imagine' : 'imagini'} selectate
                </p>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {uploadedImages.map((img, index) => (
                    <div key={index} className="relative group">
                      {img.uploading ? (
                        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : img.error ? (
                        <div className="aspect-square bg-red-50 rounded-lg flex items-center justify-center p-2">
                          <p className="text-xs text-red-600 text-center">{img.error}</p>
                        </div>
                      ) : (
                        <div className="relative">
                          <img
                            src={URL.createObjectURL(img.file)}
                            alt={`Preview ${index + 1}`}
                            className="aspect-square object-cover rounded-lg"
                          />
                          {index === 0 && (
                            <span className="absolute top-1 left-1 bg-green-600 text-white text-xs px-1.5 py-0.5 rounded font-bold">
                              Principală
                            </span>
                          )}
                        </div>
                      )}
                      {/* Remove button */}
                      {!img.uploading && (
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold shadow-lg"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900">
                  {form.status === 'draft' ? 'Salvează ca ciornă' : 'Publică anunțul'}
                </p>
                <p className="text-sm text-gray-500">
                  {form.status === 'draft'
                    ? 'Anunțul va fi salvat dar nu va fi vizibil public.'
                    : 'Anunțul va fi publicat imediat și vizibil pentru toți.'}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, status: 'draft' })}
                  className="px-5 py-3 border-2 border-gray-200 rounded-xl font-bold text-sm text-gray-700 hover:border-gray-400 transition-colors"
                >
                  💾 Salvează ciornă
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  onClick={() => setForm({ ...form, status: 'active' })}
                  className="px-6 py-3 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-green-700/30 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin size-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                      </svg>
                      Se publică...
                    </span>
                  ) : '🚀 Publică anunțul'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
