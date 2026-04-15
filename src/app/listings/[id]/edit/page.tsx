'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { uploadListingImage, deleteListingImage } from '@/lib/upload'
import type { Database } from '@/types/database'

type Category = { id: string; slug: string; name: string; icon: string | null }
type Manufacturer = { id: string; slug: string; name: string }

type UploadedImage = {
  url: string
  file?: File
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

type ListingRow = Database['public']['Tables']['listings']['Row']

export default function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { user, isLoading: authLoading } = useSupabase()
  const supabase = createClient()

  const [listingId, setListingId] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [fetchError, setFetchError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Image upload state
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [uploadingCount, setUploadingCount] = useState(0)
  const [existingImages, setExistingImages] = useState<string[]>([])

  const [form, setForm] = useState({
    title: '',
    category_id: '',
    manufacturer_id: '',
    listing_type: 'sale' as 'sale' | 'rent' | 'lease',
    price: '',
    price_type: 'fixed' as 'fixed' | 'negotiable' | 'on_request' | 'auction',
    condition: 'used' as 'new' | 'used' | 'refurbished',
    year: '',
    hours: '',
    mileage: '',
    location_country: 'RO',
    location_region: '',
    description: '',
    status: 'active' as 'active' | 'draft',
  })

  // Unwrap params
  useEffect(() => {
    params.then(p => setListingId(p.id))
  }, [params])

  // Auth redirect
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  // Fetch listing and dropdown data
  useEffect(() => {
    if (!user || !listingId) return

    const fetchData = async () => {
      setLoading(true)
      setFetchError('')

      // Fetch listing
      const { data: listingData, error: listingError } = await supabase
        .from('listings')
        .select('*')
        .eq('id', listingId)
        .single()

      if (listingError || !listingData) {
        setFetchError('Anunțul nu a fost găsit.')
        setLoading(false)
        return
      }

      // Check ownership
      if (listingData.seller_id !== user.id) {
        router.push('/dashboard')
        return
      }

      // Pre-fill form
      setForm({
        title: listingData.title || '',
        category_id: listingData.category_id || '',
        manufacturer_id: listingData.manufacturer_id || '',
        listing_type: (listingData.listing_type as 'sale' | 'rent' | 'lease') || 'sale',
        price: listingData.price?.toString() || '',
        price_type: (listingData.price_type as 'fixed' | 'negotiable' | 'on_request' | 'auction') || 'fixed',
        condition: (listingData.condition as 'new' | 'used' | 'refurbished') || 'used',
        year: listingData.year?.toString() || '',
        hours: listingData.hours?.toString() || '',
        mileage: listingData.mileage?.toString() || '',
        location_country: listingData.location_country || 'RO',
        location_region: listingData.location_region || '',
        description: listingData.description || '',
        status: (listingData.status as 'active' | 'draft') || 'active',
      })

      // Load existing images
      const images = listingData.images || []
      setExistingImages(images as string[])

      // Fetch categories and manufacturers
      const [catRes, mfgRes] = await Promise.all([
        supabase.from('categories').select('id, slug, name, icon').eq('is_active', true).order('sort_order'),
        supabase.from('manufacturers').select('id, slug, name').eq('is_active', true).order('name'),
      ])
      if (catRes.data) setCategories(catRes.data as Category[])
      if (mfgRes.data) setManufacturers(mfgRes.data as Manufacturer[])

      setLoading(false)
    }

    fetchData()
  }, [user, listingId, supabase, router])

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

  // Remove uploaded image
  const handleRemoveUploadedImage = async (index: number) => {
    if (!user) return
    const image = uploadedImages[index]
    
    // If it was uploaded, try to delete from storage
    if (image.url) {
      await deleteListingImage(image.url, user.id)
    }
    
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

  // Remove existing image
  const handleRemoveExistingImage = async (index: number) => {
    if (!user) return
    const imageUrl = existingImages[index]
    await deleteListingImage(imageUrl, user.id)
    setExistingImages(prev => prev.filter((_, i) => i !== index))
  }

  // Trigger file input
  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !listingId) return
    setError('')
    setSubmitting(true)

    const { error: submitError } = await supabase
      .from('listings')
      .update({
        category_id: form.category_id || null,
        manufacturer_id: form.manufacturer_id || null,
        title: form.title,
        description: form.description || null,
        price: Number(form.price),
        currency: 'EUR',
        price_type: form.price_type,
        listing_type: form.listing_type,
        condition: form.condition,
        year: form.year ? Number(form.year) : null,
        hours: form.hours ? Number(form.hours) : null,
        mileage: form.mileage ? Number(form.mileage) : null,
        location_country: form.location_country,
        location_region: form.location_region || null,
        status: form.status,
        images: [...existingImages, ...uploadedImages.filter(img => img.url && !img.error).map(img => img.url)],
      })
      .eq('id', listingId)

    setSubmitting(false)

    if (submitError) {
      setError(submitError.message)
    } else {
      router.push(`/listings/${listingId}`)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-green-700 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl block mb-4">❌</span>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{fetchError}</h2>
          <Link href="/dashboard" className="text-green-700 font-semibold hover:text-green-800">
            ← Înapoi la Dashboard
          </Link>
        </div>
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
            <Link href="/dashboard" className="text-green-700 font-semibold hover:text-green-800">← Dashboard</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-black text-gray-900 mb-2">Editează anunțul</h1>
        <p className="text-gray-500 mb-8">Modifică informațiile anunțului tău.</p>

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
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Titlu anunț *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="ex: John Deere 6155M, 2021, 4500 ore"
                  required
                  maxLength={200}
                  className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/10 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Categorie *</label>
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
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Producător</label>
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
                    onChange={(e) => setForm({ ...form, listing_type: e.target.value as 'sale' | 'rent' | 'lease' })}
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
                    onChange={(e) => setForm({ ...form, condition: e.target.value as 'new' | 'used' | 'refurbished' })}
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
                  onChange={(e) => setForm({ ...form, price_type: e.target.value as 'fixed' | 'negotiable' | 'on_request' | 'auction' })}
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
              <p className="font-bold text-gray-700">Adaugă mai multe imagini</p>
              <p className="text-sm text-gray-500 mt-1">PNG, JPG, WEBP • Max 5MB per imagine</p>
            </button>

            {/* Upload progress indicator */}
            {uploadingCount > 0 && (
              <div className="mt-4 flex items-center gap-2 text-sm text-blue-600">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                Se încarcă {uploadingCount} {uploadingCount === 1 ? 'imagine' : 'imagini'}...
              </div>
            )}

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-bold text-gray-700 mb-3">
                  {existingImages.length} {existingImages.length === 1 ? 'imagine existentă' : 'imagini existente'}
                </p>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {existingImages.map((url, index) => (
                    <div key={url} className="relative group">
                      <img
                        src={url}
                        alt={`Imagine existentă ${index + 1}`}
                        className="aspect-square object-cover rounded-lg"
                      />
                      {index === 0 && (
                        <span className="absolute top-1 left-1 bg-green-600 text-white text-xs px-1.5 py-0.5 rounded font-bold">
                          Principală
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold shadow-lg"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Image previews */}
            {uploadedImages.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-bold text-gray-700 mb-3">
                  {uploadedImages.filter(img => !img.uploading && !img.error).length} {uploadedImages.filter(img => !img.uploading && !img.error).length === 1 ? 'imagine nouă' : 'imagini noi'} de adăugat
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
                            src={URL.createObjectURL(img.file!)}
                            alt={`Preview ${index + 1}`}
                            className="aspect-square object-cover rounded-lg"
                          />
                          <span className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded font-bold">
                            Nou
                          </span>
                        </div>
                      )}
                      {/* Remove button */}
                      {!img.uploading && (
                        <button
                          type="button"
                          onClick={() => handleRemoveUploadedImage(index)}
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
                  {form.status === 'draft' ? 'Salvează ca ciornă' : 'Salvează modificările'}
                </p>
                <p className="text-sm text-gray-500">
                  {form.status === 'draft'
                    ? 'Anunțul va fi salvat dar nu va fi vizibil public.'
                    : 'Modificările vor fi vizibile public.'}
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
                  disabled={submitting}
                  onClick={() => setForm({ ...form, status: 'active' })}
                  className="px-6 py-3 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-green-700/30 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Se salvează...' : '💾 Salvează modificările'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
