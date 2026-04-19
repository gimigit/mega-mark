'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { uploadListingImage } from '@/lib/upload'
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

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

const ACCOUNT_TYPES = [
  { value: 'buyer', label: 'Cumpărător' },
  { value: 'seller', label: 'Vânzător' },
  { value: 'dealer', label: 'Dealer' },
]

export default function ProfileEditPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useSupabase()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [profile, setProfile] = useState<Profile | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  const [form, setForm] = useState({
    full_name: '',
    bio: '',
    phone: '',
    location_country: 'RO',
    location_region: '',
    role: 'seller',
    company_name: '',
    vat_number: '',
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (!user) return

    const fetchProfile = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile(data)
        setAvatarUrl(data.avatar_url)
        setForm({
          full_name: data.full_name || '',
          bio: data.bio || '',
          phone: data.phone || '',
          location_country: data.location_country || 'RO',
          location_region: data.location_region || '',
          role: data.role || 'seller',
          company_name: data.company_name || '',
          vat_number: data.vat_number || '',
        })
      }
      setLoading(false)
    }

    fetchProfile()
  }, [user, supabase])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setUploadingAvatar(true)
    const { url, error: uploadError } = await uploadListingImage(file, user.id)
    setUploadingAvatar(false)

    if (uploadError) {
      setError(uploadError)
    } else if (url) {
      setAvatarUrl(url)
      // Update profile immediately with avatar
      await supabase
        .from('profiles')
        .update({ avatar_url: url, updated_at: new Date().toISOString() })
        .eq('id', user.id)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setError('')
    setSuccess('')
    setSaving(true)

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: form.full_name || null,
        bio: form.bio || null,
        phone: form.phone || null,
        location_country: form.location_country,
        location_region: form.location_region || null,
        role: form.role,
        company_name: form.company_name || null,
        vat_number: form.vat_number || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    setSaving(false)

    if (updateError) {
      setError('Eroare la salvare: ' + updateError.message)
    } else {
      setSuccess('Profil salvat cu succes!')
      setTimeout(() => setSuccess(''), 3000)
    }
  }

  if (authLoading || !user) {
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
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/" className="text-2xl font-black text-green-800 flex items-center gap-1">
            Mega<em className="text-amber-500 not-italic">Mark</em>
          </Link>
          <div className="ml-auto text-sm text-gray-500">
            <Link href="/dashboard" className="text-green-700 font-semibold hover:text-green-800">← Dashboard</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-black text-gray-900 mb-1">Editare Profil</h1>
        <p className="text-gray-500 mb-8">Actualizează informațiile publice ale profilului tău.</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-6 text-sm flex items-center gap-2">
            ✅ {success}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-green-700 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Section */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Fotografie de profil</h2>
              <div className="flex items-center gap-6">
                <div className="relative">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt="Avatar"
                      fill
                      sizes="96px"
                      className="w-24 h-24 rounded-full object-cover border-4 border-gray-100"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-3xl font-black text-green-700 border-4 border-green-200">
                      {form.full_name?.charAt(0) || user.email?.charAt(0) || '?'}
                    </div>
                  )}
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="px-5 py-2.5 border-2 border-gray-200 rounded-xl font-bold text-sm text-gray-700 hover:border-green-500 hover:text-green-700 transition-colors disabled:opacity-50"
                  >
                    📷 {uploadingAvatar ? 'Se încarcă...' : 'Schimbă poza'}
                  </button>
                  <p className="text-xs text-gray-400 mt-2">JPG, PNG sau WebP · max 5MB</p>
                </div>
              </div>
            </div>

            {/* Personal Info */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Informații personale</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Nume complet</label>
                  <input
                    type="text"
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    placeholder="Ion Popescu"
                    maxLength={100}
                    className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/10 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Tip cont</label>
                  <select
                    value={form.role || 'seller'}
                    onChange={(e) => setForm({ ...form, role: e.target.value as 'seller' | 'dealer' | 'buyer' | 'admin' })}
                    className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/10 outline-none transition-all"
                  >
                    {ACCOUNT_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Telefon</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+40 721 234 567"
                    className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/10 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Locație</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Țară</label>
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
                    placeholder="Timișoara, Bavaria"
                    className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/10 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Despre tine</h2>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Descrie experiența ta în agricultură, tipul de echipamente pe care le vinzi sau cauți..."
                  rows={4}
                  maxLength={500}
                  className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/10 outline-none transition-all resize-none"
                />
                <p className="text-xs text-gray-400 mt-1.5">{form.bio.length} / 500 caractere</p>
              </div>
            </div>

            {/* Dealer Info */}
            {form.role === 'dealer' && (
              <div className="bg-white rounded-2xl border border-amber-200 p-8 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-1">Informații dealer 🏢</h2>
                <p className="text-sm text-gray-500 mb-6">Vizibile pe profilul tău public și pe anunțurile tale.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Denumire firmă</label>
                    <input
                      type="text"
                      value={form.company_name}
                      onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                      placeholder="SC Agro SRL"
                      maxLength={100}
                      className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/10 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">CUI / VAT</label>
                    <input
                      type="text"
                      value={form.vat_number}
                      onChange={(e) => setForm({ ...form, vat_number: e.target.value })}
                      placeholder="RO12345678"
                      maxLength={20}
                      className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/10 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Submit */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-green-700/30 transition-all disabled:opacity-50"
              >
                {saving ? 'Se salvează...' : '💾 Salvează modificările'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
