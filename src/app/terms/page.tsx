'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'

export default function TermsPage() {
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
        <h1 className="text-4xl font-black text-gray-900 mb-8">Termeni și Condiții</h1>
        
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6"><strong>Ultima actualizare:</strong> Aprilie 2026</p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Introducere</h2>
          <p className="text-gray-700 mb-4">
            Mega-Mark (&quot;noi&quot;, &quot;nostru&quot; sau &quot;platforma&quot;) este o platformă online care facilitează 
            cumpărarea și vânzarea de utilaje agricole și echipamente industriale între utilizatori 
            din Spațiul Economic European.
          </p>
          <p className="text-gray-700 mb-4">
            Prin accesarea și utilizarea platformei Mega-Mark, acceptați acești Termeni și Condiții 
            în totalitate. Dacă nu sunteți de acord cu oricare parte a acestor termeni, vă rugăm să 
            nu utilizați platforma noastră.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Definiții</h2>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li><strong>Utilizator</strong> — orice persoană care accesează sau utilizează platforma Mega-Mark</li>
            <li><strong>Vânzător</strong> — utilizatorul care oferă bunuri sau servicii spre vânzare</li>
            <li><strong>Cumpărător</strong> — utilizatorul care achiziționează bunuri sau servicii</li>
            <li><strong>Anunț</strong> — lista unui bun sau serviciu publicat pe platformă</li>
            <li><strong>Conținut</strong> — texte, imagini, video și alte materiale postate de utilizatori</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Utilizarea Platformei</h2>
          <p className="text-gray-700 mb-4">
            Pentru a utiliza platforma Mega-Mark, trebuie să:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>Aveți cel puțin 18 ani sau vârsta legală pentru a încheia contracte în țara dvs. de reședință</li>
            <li>Creați un cont cu informații reale și actualizate</li>
            <li>Nu partajați credențialele de acces cu alte persoane</li>
            <li>Respectați toate legile applicable din țara dvs.</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Publicarea Anunțurilor</h2>
          <p className="text-gray-700 mb-4">
            Vânzătorii sunt responsabili pentru exactitatea și completitudinea informațiilor din anunțurile lor. 
            Este strict interzisă publicarea de:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>Bunuri ilegale sau furate</li>
            <li>Conținut înșelător sau fals</li>
            <li>Materiale protejate de drepturi de autor fără permisiune</li>
            <li>Anunțuri discriminatorii sau care încalcă drepturile omului</li>
            <li>Conținut obscen sau ofensator</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Tranzacții și Plăți</h2>
          <p className="text-gray-700 mb-4">
            Mega-Mark facilitează conexiunea dintre vânzători și cumpărători, dar nu este parte 
            din tranzacțiile efective de vânzare-cumpărare. Plățile se efectuează direct între 
            părți, prin metodele convenite de comun acord.
          </p>
          <p className="text-gray-700 mb-4">
            <strong>Notă importantă:</strong> Mega-Mark nu procesează plăți în numele utilizatorilor 
            și nu este responsabil pentru pierderile rezultate din tranzacții directe între părți.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Responsabilitățile Utilizatorilor</h2>
          <p className="text-gray-700 mb-4">
            Fiecare utilizator este responsabil pentru:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>Verificarea bunurilor înainte de achiziție</li>
            <li>Asigurarea legalității tranzacțiilor în țara lor</li>
            <li>Plata taxelor și impozitelor relevante</li>
            <li>Transportul și înmatricularea bunurilor achiziționate</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Limitarea Răspunderii</h2>
          <p className="text-gray-700 mb-4">
            Mega-Mark nu este responsabil pentru:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>Calitatea, starea sau funcționalitatea bunurilor vândute</li>
            <li>Actele sau omisiunile vânzătorilor sau cumpărătorilor</li>
            <li>Pierderile indirecte sau consecințiale rezultate din utilizarea platformei</li>
            <li>Disputele dintre utilizatori legate de tranzacții</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Proprietatea Intelectuală</h2>
          <p className="text-gray-700 mb-4">
            Conținutul platformei Mega-Mark (texte, design, logo-uri, imagini) este protejat 
            prin drepturi de autor. Este interzisă reproducerea sau distribuirea neautorizată a 
            acestui conținut.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Încetarea Accesului</h2>
          <p className="text-gray-700 mb-4">
            Ne rezervăm dreptul de a suspenda sau termina conturile utilizatorilor care încalcă 
            acești termeni sau care se implică în activități ilegale sau frauduloase.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Modificări ale Termenilor</h2>
          <p className="text-gray-700 mb-4">
            Putem modifica acești termeni periodic. Vă vom notifica despre modificări semnificative 
            prin intermediul platformei sau prin email. Continuitatea utilizării după modificări 
            reprezintă acceptarea noilor termeni.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">11. Legislație Aplicabilă</h2>
          <p className="text-gray-700 mb-4">
            Acești termeni sunt guvernați de legislația din România. Orice dispută va fi 
            rezolvată în instanțele competente din România.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">12. Contact</h2>
          <p className="text-gray-700 mb-4">
            Pentru întrebări sau sesizări legate de acești termeni, ne puteți contacta la:
          </p>
          <ul className="list-none pl-6 text-gray-700 mb-4 space-y-2">
            <li><strong>Email:</strong> legal@agromark.eu</li>
            <li><strong>Adresă:</strong> București, România</li>
          </ul>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <Link href="/privacy" className="text-green-700 font-semibold hover:text-green-800">
            Politica de Confidențialitate →
          </Link>
          <Link href="/faq" className="text-green-700 font-semibold hover:text-green-800">
            Întrebări Frecvente →
          </Link>
        </div>
      </div>
    </div>
  )
}
