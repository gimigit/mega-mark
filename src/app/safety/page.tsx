'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { ShieldCheck, AlertTriangle, Phone, Mail, Lock, UserCheck, CreditCard, ArrowRight } from 'lucide-react'

export default function SafetyPage() {
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
            Mega<em className="text-amber-500 not-italic">Mark</em>
          </Link>
          <div className="ml-auto text-sm text-gray-500">
            <Link href="/" className={`font-semibold hover:text-green-700 ${isDark ? 'text-gray-400 hover:text-green-400' : ''}`}>
              ← Acasă
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-gray-900">Siguranță & Protecție</h1>
            <p className="text-gray-600">Ghid pentru tranzacții sigure pe Mega-Mark</p>
          </div>
        </div>
        
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-900 dark:text-amber-100 mb-2">Important</h3>
              <p className="text-amber-800 dark:text-amber-200 text-sm">
                Mega-Mark nu procesează plăți și nu intervine în tranzacțiile dintre utilizatori. 
                Toate plățile se fac direct între cumpărător și vânzător. Fiți vigilenți la încercările de fraudă.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <section className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <span className="text-red-600 font-bold">1</span>
              </span>
              Semne de Avertizare
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Preț prea mic</h4>
                  <p className="text-gray-600 text-sm">Dacă prețul pare prea bun pentru a fi adevărat, probabil este.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Urgenta artificială</h4>
                  <p className="text-gray-600 text-sm">Vânzătorul creează presiune: "Achiziționează acum sau mâine e vândut!"</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Cerere de avans</h4>
                  <p className="text-gray-600 text-sm">Vânzătorul cere bani în avans înainte de a vedea produsul.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Comunicare în afara platformei</h4>
                  <p className="text-gray-600 text-sm">Vânzătorul încearcă să mute conversația pe WhatsApp, email, SMS.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Poze furate</h4>
                  <p className="text-gray-600 text-sm">Caută poza pe Google Images — poate fi din alt anunț sau de pe alt site.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Refuză întâlnire</h4>
                  <p className="text-gray-600 text-sm">Vânzătorul nu vrea să te întâlnești sau să verifici produsul.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-bold">2</span>
              </span>
              Cum să Tranzacționezi în Siguranță
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <UserCheck className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">Verifică profilul vânzătorului</h4>
                  <p className="text-gray-600 text-sm">Verifică rating-ul, numărul de anunțuri și data înregistrării. Vânzători legitimi au istoric.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Phone className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">Sună înainte de a cumpăra</h4>
                  <p className="text-gray-600 text-sm">O convorbire telefonică te poate ajuta să evaluezi seriozitatea vânzătorului.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Lock className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">Folosește plata la livrare</h4>
                  <p className="text-gray-600 text-sm">Când este posibil, plătește după ce vezi și verifici produsul.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CreditCard className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">Nu trimite bani prin transfer bancar</h4>
                  <p className="text-gray-600 text-sm">Metodele reversibile (plata la livrare, plata în persoană) sunt mai sigure.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold">3</span>
              </span>
              Ce Să Faci Dacă Crezi Că Este Fraudă
            </h2>
            <ol className="space-y-4">
              <li className="flex items-start gap-4">
                <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold text-sm">1</span>
                </span>
                <div>
                  <h4 className="font-semibold text-gray-900">Nu trimite bani</h4>
                  <p className="text-gray-600 text-sm">Oprește orice comunicare și nu face plăți.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold text-sm">2</span>
                </span>
                <div>
                  <h4 className="font-semibold text-gray-900">Raportează anunțul</h4>
                  <p className="text-gray-600 text-sm">Folosește butonul "Raportează" pe pagina anunțului pentru a ne alerta.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold text-sm">3</span>
                </span>
                <div>
                  <h4 className="font-semibold text-gray-900">Contactează poliția</h4>
                  <p className="text-gray-600 text-sm">Dacă ai pierdut bani, depune plângere la poliție (DIICOT pentru fraude online).</p>
                </div>
              </li>
            </ol>
          </section>

          <section className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Suport</h2>
            <p className="text-gray-600 mb-6">
              Dacă ai întâmpinat probleme sau suspectezi o fraudă, contactează-ne imediat:
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="mailto:safety@mega-mark.eu" className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Mail className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-900">safety@mega-mark.eu</span>
              </a>
              <Link href="/dashboard/messages" className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <ArrowRight className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-900">Mesaj direct</span>
              </Link>
            </div>
          </section>
        </div>

        <div className="mt-10 flex justify-center gap-4">
          <Link href="/terms" className="text-green-700 font-semibold hover:text-green-800">
            ← Termeni și Condiții
          </Link>
          <Link href="/privacy" className="text-green-700 font-semibold hover:text-green-800">
            Politica de Confidențialitate →
          </Link>
        </div>
      </div>
    </div>
  )
}