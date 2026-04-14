'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'

export default function AboutPage() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === 'dark'

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className={`sticky top-0 z-50 ${isDark ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur-md border-b ${isDark ? 'border-gray-800' : 'border-gray-200'} shadow-sm`}>
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/" className={`text-2xl font-black ${isDark ? 'text-green-400' : 'text-green-800'} flex items-center gap-1`}>
            AgroMark <em className="text-amber-500 not-italic">EU</em>
          </Link>
          <div className="ml-auto text-sm text-gray-500">
            <Link href="/" className={`font-semibold hover:text-green-700 ${isDark ? 'text-gray-400 hover:text-green-400' : ''}`}>
              ← Acasă
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-gray-900 mb-4">Despre AgroMark EU</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Marketplace-ul #1 pentru utilaje agricole și echipamente industriale în Europa
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Misiunea Noastră</h2>
          <p className="text-gray-700 mb-4">
            AgroMark EU a fost creat pentru a conecta fermierii, dealerii și profesioniștii 
            din agricultura europeană cu utilajele de care au nevoie. Credem că accesul la 
            echipamente agricole de calitate ar trebui să fie simplu, transparent și accesibil 
            pentru toți cei care lucrează în acest domeniu esențial.
          </p>
          <p className="text-gray-700">
            Platforma noastră reunește vânzători și cumpărători din 16 țări europene, 
            oferind un spațiu sigur și eficient pentru tranzacții care ajută agricultura 
            europeană să prospere.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">🌾</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Pentru Vânzători</h3>
            <p className="text-gray-600">
              Publicați anunțuri rapid, ajungeți la mii de potențiali cumpărători din 
              toată Europa, și gestionați-vă vânzările direct din dashboard.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">🚜</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Pentru Cumpărători</h3>
            <p className="text-gray-600">
              Căutați și comparați utilaje din întreaga Europă, contactați direct 
              vânzătorii, și găsiți echipamentul perfect pentru ferma dvs.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">🏢</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Pentru Dealeri</h3>
            <p className="text-gray-600">
              Instrumente specializate pentru dealeri profesioniști: bulk upload, 
              profil dedicat, și vizibilitate premium pentru afacerea dvs.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">🛡️</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Siguranță și Încredere</h3>
            <p className="text-gray-600">
              Verificăm dealerii, oferim rating-uri transparente, și facilităm 
              comunicarea sigură între utilizatori.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Platforma Noastră</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-black text-green-700 mb-1">16</div>
              <div className="text-sm text-gray-600">Țări EU</div>
            </div>
            <div>
              <div className="text-3xl font-black text-green-700 mb-1">10K+</div>
              <div className="text-sm text-gray-600">Anunțuri Active</div>
            </div>
            <div>
              <div className="text-3xl font-black text-green-700 mb-1">5K+</div>
              <div className="text-sm text-gray-600">Utilizatori</div>
            </div>
            <div>
              <div className="text-3xl font-black text-green-700 mb-1">24/7</div>
              <div className="text-sm text-gray-600">Online</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-700 to-green-600 rounded-2xl p-8 text-white mb-8">
          <h2 className="text-2xl font-bold mb-4">Tehnologie și Inovație</h2>
          <p className="text-green-100 mb-4">
            AgroMark EU este construit pe o infrastructură modernă care oferă:
          </p>
          <ul className="space-y-2 text-green-100">
            <li className="flex items-center gap-2">
              <span className="text-green-300">✓</span>
              Căutare avansată cu filtre specifice pentru utilaje agricole
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-300">✓</span>
              Galerie foto de înaltă rezoluție pentru fiecare anunț
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-300">✓</span>
              Mesagerie securizată între vânzători și cumpărători
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-300">✓</span>
              Sistem de rating și recenzii verificat
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-300">✓</span>
              Notificări în timp real pentru mesaje și actualizări
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Echipa</h2>
          <p className="text-gray-700 mb-4">
            Suntem o echipă pasionată de tehnologie și agricultură, dedicată creării 
            celei mai bune platforme de marketplace pentru comunitatea agricolă europeană.
          </p>
          <p className="text-gray-700">
            Credem în transparență, inovație și sprijinirea fermierilor și profesioniștilor 
            din agricultură prin tehnologie de ultimă generație.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact</h2>
          <p className="text-gray-700 mb-4">
            Aveți întrebări sau sugestii? Ne puteți contacta:
          </p>
          <ul className="space-y-3 text-gray-700">
            <li>
              <strong>Email:</strong>{' '}
              <a href="mailto:contact@agromark.eu" className="text-green-700 hover:underline">
                contact@agromark.eu
              </a>
            </li>
            <li>
              <strong>Suport tehnic:</strong>{' '}
              <a href="mailto:support@agromark.eu" className="text-green-700 hover:underline">
                support@agromark.eu
              </a>
            </li>
            <li>
              <strong>Adresă:</strong> București, România
            </li>
          </ul>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <Link href="/terms" className="text-green-700 font-semibold hover:text-green-800">
            Termeni și Condiții
          </Link>
          <span className="text-gray-400">|</span>
          <Link href="/privacy" className="text-green-700 font-semibold hover:text-green-800">
            Politica de Confidențialitate
          </Link>
          <span className="text-gray-400">|</span>
          <Link href="/faq" className="text-green-700 font-semibold hover:text-green-800">
            FAQ
          </Link>
        </div>
      </div>
    </div>
  )
}
