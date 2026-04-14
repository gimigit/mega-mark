'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<string | null>(null)
  const [magicLink, setMagicLink] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const supabase = createClient()

  const handleOAuthLogin = async (provider: 'google' | 'apple') => {
    setError('')
    setOauthLoading(provider)
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    
    setOauthLoading(null)
    
    if (error) {
      setError(error.message)
    }
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      window.location.href = '/dashboard'
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setMagicLinkSent(true)
    }
  }

  if (magicLinkSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-950 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">📧</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-3">Verifică-ți email-ul</h1>
          <p className="text-gray-600 mb-8">
            Am trimis un link de conectare la <strong>{email}</strong>. Verifică-ți inbox-ul și spam-ul.
          </p>
          <button
            onClick={() => setMagicLinkSent(false)}
            className="text-green-700 font-semibold hover:text-green-800 transition-colors"
          >
            ← Înapoi la login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-950 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-black text-green-800 flex items-center justify-center gap-1 mb-2">
            AgroMark <em className="text-amber-500 not-italic">EU</em>
          </Link>
          <p className="text-gray-500 text-sm">
            {magicLink ? 'Trimite-ți un link de conectare' : 'Conectează-te la contul tău'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {!magicLink ? (
          <form onSubmit={handleEmailLogin} className="space-y-5">
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
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Parolă</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/10 outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-xl font-bold text-base hover:shadow-lg hover:shadow-green-700/30 transition-all disabled:opacity-50"
            >
              {loading ? 'Se conectează...' : 'Conectează-te'}
            </button>
            <div className="text-right">
              <Link href="/forgot-password" className="text-sm text-green-700 font-semibold hover:text-green-800 transition-colors">
                Ai uitat parola?
              </Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleMagicLink} className="space-y-5">
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
              {loading ? 'Se trimite...' : 'Trimite link de conectare'}
            </button>
          </form>
        )}

        {/* Toggle mode */}
        <div className="mt-5 text-center">
          <button
            onClick={() => { setMagicLink(!magicLink); setError('') }}
            className="text-sm text-green-700 font-semibold hover:text-green-800 transition-colors"
          >
            {magicLink ? '← Conectează-te cu parolă' : '📧 Trimite-mi un link magic'}
          </button>
        </div>

        <div className="border-t border-gray-100 mt-6 pt-6">
          <p className="text-sm text-gray-500 text-center mb-4">sau conectează-te cu</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleOAuthLogin('google')}
              disabled={oauthLoading !== null}
              className="flex items-center justify-center gap-2 py-2.5 border-2 border-gray-200 rounded-xl font-bold text-sm text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              {oauthLoading === 'google' ? (
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Google
            </button>
            <button
              type="button"
              onClick={() => handleOAuthLogin('apple')}
              disabled={oauthLoading !== null}
              className="flex items-center justify-center gap-2 py-2.5 border-2 border-gray-200 rounded-xl font-bold text-sm text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              {oauthLoading === 'apple' ? (
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
              )}
              Apple
            </button>
          </div>
          <div className="border-t border-gray-100 mt-6 pt-6 text-center">
          <p className="text-sm text-gray-500">
            Nu ai cont?{' '}
            <Link href="/signup" className="text-green-700 font-bold hover:text-green-800 transition-colors">
              Creează un cont gratuit
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
