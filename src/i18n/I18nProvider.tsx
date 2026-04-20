'use client'

import {createContext, useContext, useState, useEffect, ReactNode} from 'react'
import roMessages from './locales/ro'
import enMessages from './locales/en'

const messages = {ro: roMessages, en: enMessages}

type I18nContextType = {
  locale: string
  setLocale: (locale: string) => void
  t: (key: string) => string
}

// Default context for server components
const defaultContext: I18nContextType = {
  locale: 'ro',
  setLocale: () => {},
  t: (key: string) => key
}

const I18nContext = createContext<I18nContextType>(defaultContext)

export function I18nProvider({children}: {children: ReactNode}) {
  const [locale, setLocaleState] = useState('ro')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('locale')
    if (saved && (saved === 'ro' || saved === 'en')) {
      setLocaleState(saved)
    }
    setMounted(true)
  }, [])

  const setLocale = (newLocale: string) => {
    setLocaleState(newLocale)
    localStorage.setItem('locale', newLocale)
  }

  const t = (key: string): string => {
    const keys = key.split('.')
    let value: any = messages[locale as keyof typeof messages] || messages.ro
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        return key
      }
    }
    
    return typeof value === 'string' ? value : key
  }

  if (!mounted) {
    return <I18nContext.Provider value={defaultContext}>{children}</I18nContext.Provider>
  }

  return (
    <I18nContext.Provider value={{locale, setLocale, t}}>
      {children}
    </I18nContext.Provider>
  )
}

export function useTranslations() {
  return useContext(I18nContext)
}