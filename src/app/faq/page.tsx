'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'

export default function FAQPage() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [openSection, setOpenSection] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === 'dark'

  const toggleSection = (id: string) => {
    setOpenSection(openSection === id ? null : id)
  }

  const sections = [
    {
      id: 'vanzatori',
      title: 'Pentru Vânzători',
      questions: [
        {
          q: 'Cum public un anunț?',
          a: 'Pentru a publica un anunț, trebuie să aveți un cont pe Mega-Mark. După autentificare, accesați Dashboard și faceți clic pe "Crează Anunț". Completați formularul cu informațiile despre utilaj, încărcați fotografii și publicați.'
        },
        {
          q: 'Câte anunțuri pot publica?',
          a: 'Numărul de anunțuri depinde de planul ales. Planul gratuit permite 3 anunțuri active. Planurile Seller, Dealer și Enterprise oferă mai multe anunțuri și funcționalități suplimentare.'
        },
        {
          q: 'Cum adaug mai multe fotografii?',
          a: 'La crearea sau editarea anunțului, accesați secțiunea "Imagini". Puteți încărca până la 10 fotografii. Prima imagine va fi imaginea principală a anunțului.'
        },
        {
          q: 'Pot edita un anunț după publicare?',
          a: 'Da! Accesați anunțul din Dashboard și faceți clic pe "Editează". Puteți modifica orice informație, inclusiv imaginile.'
        },
        {
          q: 'Cum marchez un anunț ca vândut?',
          a: 'Din pagina de editare a anunțului, puteți schimba statusul în "Vândut" sau șterge anunțul dacă nu mai este relevant.'
        },
        {
          q: 'Ce informații sunt vizibile public?',
          a: 'Anunțurile publice arată: titlu, descriere, preț, fotografii, locație, și datele de contact. Profilul vânzătorului afișează: nume, rating, număr de anunțuri active.'
        }
      ]
    },
    {
      id: 'cumparatori',
      title: 'Pentru Cumpărători',
      questions: [
        {
          q: 'Cum caut un utilaj specific?',
          a: 'Folosiți bara de căutare de pe pagina principală sau accesați secțiunea "Browse". Puteți filtra după: categorie, producător, țară, preț, an de fabricație, ore de funcționare și stare.'
        },
        {
          q: 'Cum contactez un vânzător?',
          a: 'De pe pagina anunțului, faceți clic pe "Contactează Vânzătorul". Completați formularul cu mesajul dvs. și îl vom trimite vânzătorului.'
        },
        {
          q: 'Pot salva anunțuri favorite?',
          a: 'Da! Faceți clic pe iconița de inimă de pe orice anunț pentru a-l adăuga la favorite. Le puteți accesa din Dashboard în secțiunea "Favorite".'
        },
        {
          q: 'Cum verific rating-ul unui vânzător?',
          a: 'Rating-ul vânzătorului este afișat pe pagina anunțului și pe profilul public. Faceți clic pe numele vânzătorului pentru a vedea recenziile primite.'
        },
        {
          q: 'Mega-Mark procesează plățile?',
          a: 'Nu, Mega-Mark este o platformă de conectare între vânzători și cumpărători. Plățile se efectuează direct între părți, prin metodele convenite de comun acord.'
        }
      ]
    },
    {
      id: 'cont',
      title: 'Cont și Autentificare',
      questions: [
        {
          q: 'Cum îmi creez un cont?',
          a: 'Accesați pagina de înregistrare și introduceți email-ul dvs. Veți primi un link de conectare prin email (magic link) — nu aveți nevoie de parolă.'
        },
        {
          q: 'Am uitat parola, ce fac?',
          a: 'Mega-Mark folosește autentificare prin magic link — nu aveți o parolă tradițională. Dacă nu primiți emailul de conectare, verificați dosarul de spam.'
        },
        {
          q: 'Cum îmi modific profilul?',
          a: 'Accesați Dashboard → Setări profil. Aici puteți modifica: numele, fotografia, descrierea, locația și preferințele.'
        },
        {
          q: 'Pot șterge contul?',
          a: 'Da. Din Setări profil, aveți opțiunea de a șterge contul. Această acțiune este ireversibilă — toate anunțurile și datele vor fi șterse.'
        },
        {
          q: 'Ce este badge-ul "Dealer Verificat"?',
          a: 'Badge-ul "Dealer Verificat" este acordat vânzătorilor profesioniști care au fost verificați de echipa Mega-Mark. Indică încredere și profesionalism.'
        }
      ]
    },
    {
      id: 'tehnice',
      title: 'Întrebări Tehnice',
      questions: [
        {
          q: 'Site-ul funcționează pe mobil?',
          a: 'Da! Mega-Mark este complet responsive și funcționează excelent pe smartphone, tabletă și desktop.'
        },
        {
          q: 'Ce browsere sunt suportate?',
          a: 'Recomandăm Chrome, Firefox, Safari sau Edge în versiunile lor cele mai recente pentru cea mai bună experiență.'
        },
        {
          q: 'Cum raportez un anunț suspect?',
          a: 'Dacă un anunț pare suspect sau încalcă regulile platformei, folosiți butonul "Raportează Anunțul" din partea de jos a paginii anunțului.'
        },
        {
          q: 'Mega-Mark este gratuit?',
          a: 'Planul de bază este gratuit și include: 3 anunțuri active, căutare nelimitată, mesagerie. Planurile cu funcționalități extinse sunt disponibile contra cost.'
        },
        {
          q: 'Unde găsesc ajutor suplimentar?',
          a: 'Pentru asistență, ne puteți contacta la support@agromark.eu sau accesați această pagină FAQ.'
        }
      ]
    },
    {
      id: 'legal',
      title: 'Informații Legale',
      questions: [
        {
          q: 'Care este politica de returnare?',
          a: 'Mega-Mark nu are o politică de returnare proprie, deoarece nu procesăm tranzacțiile. Returnările sunt stabilite între vânzător și cumpărător.'
        },
        {
          q: 'Sunteți responsabil pentru tranzacțiile mele?',
          a: 'Nu. Mega-Mark facilitează conexiunea dintre vânzători și cumpărători, dar nu este parte din tranzacții și nu este responsabil pentru acestea.'
        },
        {
          q: 'Cum îmi protejez datele personale?',
          a: 'Consultați Politica noastră de Confidențialitate pentru detalii complete despre cum protejăm datele dvs. conform GDPR.'
        },
        {
          q: 'Care sunt Termenii și Condițiile?',
          a: 'Termenii și Condițiile completi sunt disponibili pe pagina Termeni. Prin utilizarea platformei, acceptați acești termeni.'
        }
      ]
    }
  ]

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
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-gray-900 mb-4">Întrebări Frecvente</h1>
          <p className="text-xl text-gray-600">
            Găsiți răspunsuri la cele mai comune întrebări despre Mega-Mark
          </p>
        </div>

        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="text-xl font-bold text-gray-900">{section.title}</span>
                <span className={`text-2xl text-gray-500 transition-transform ${openSection === section.id ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              
              {openSection === section.id && (
                <div className="px-6 pb-6 border-t border-gray-100">
                  <div className="space-y-4 pt-4">
                    {section.questions.map((item, index) => (
                      <div key={index} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                        <h3 className="font-bold text-gray-900 mb-2">{item.q}</h3>
                        <p className="text-gray-600">{item.a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-r from-green-700 to-green-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Nu ai găsit răspunsul?</h2>
          <p className="text-green-100 mb-6">
            Contactează-ne și vom fi bucuroși să te ajutăm
          </p>
          <a
            href="mailto:support@agromark.eu"
            className="inline-block bg-white text-green-700 font-bold px-6 py-3 rounded-xl hover:bg-green-50 transition-colors"
          >
            Contactează Suport
          </a>
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
          <Link href="/about" className="text-green-700 font-semibold hover:text-green-800">
            Despre Noi
          </Link>
        </div>
      </div>
    </div>
  )
}
