'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    })

    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-950 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">📧</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-3">Verifică-ți email-ul</h1>
          <p className="text-gray-600 mb-8">
            Am trimis instrucțiunile de resetare a parolei la <strong>{email}</strong>.
            Verifică-ți inbox-ul și spam-ul.
          </p>
          <Link href="/login" className="text-green-700 font-semibold hover:text-green-800 transition-colors">
            ← Înapoi la login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-950 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-black text-green-800 flex items-center justify-center gap-1 mb-2">
            Mega<em className="text-amber-500 not-italic">Mark</em>
          </Link>
          <p className="text-gray-500 text-sm">Ai uitat parola? Nu-ți face griji.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplu.ro"
              required
              className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/10 outline-none transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-xl font-bold text-base hover:shadow-lg hover:shadow-green-700/30 transition-all disabled:opacity-50"
          >
            {loading ? 'Se trimite...' : 'Trimite instrucțiuni'}
          </button>
        </form>

        <div className="border-t border-gray-100 mt-6 pt-6 text-center">
          <p className="text-sm text-gray-500">
            Ți-ai amintit parola?{' '}
            <Link href="/login" className="text-green-700 font-bold hover:text-green-800 transition-colors">
              Conectează-te
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
