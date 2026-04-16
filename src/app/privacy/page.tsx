'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'

export default function PrivacyPage() {
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
        <h1 className="text-4xl font-black text-gray-900 mb-8">Politica de Confidențialitate</h1>
        
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6"><strong>Ultima actualizare:</strong> Aprilie 2026</p>

          <p className="text-gray-700 mb-4">
            Mega-Mark (&quot;noi&quot;, &quot;nostru&quot; sau &quot;platforma&quot;) se angajează să protejeze 
            confidențialitatea și securitatea datelor dvs. personale. Această Politică de 
            Confidențialitate explică ce date colectăm, cum le utilizăm și ce drepturi aveți.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Operatorul de Date</h2>
          <p className="text-gray-700 mb-4">
            Operatorul de date pentru procesarea datelor dvs. personale este:
          </p>
          <ul className="list-none pl-6 text-gray-700 mb-4 space-y-2">
            <li><strong>Denumire:</strong> Mega-Mark SRL</li>
            <li><strong>CUI:</strong> RO12345678</li>
            <li><strong>Adresă:</strong> București, România</li>
            <li><strong>Email:</strong> privacy@mega-mark.eu</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Datele Personale pe Care le Colectăm</h2>
          
          <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">2.1 Informații de înregistrare</h3>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>Nume și prenume</li>
            <li>Adresă de email</li>
            <li>Număr de telefon (opțional)</li>
            <li>Parolă criptată</li>
            <li>Adresă IP și date de autentificare</li>
          </ul>

          <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">2.2 Informații de profil</h3>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>Fotografie de profil (opțional)</li>
            <li>Locație (țară și regiune)</li>
            <li>Descriere / Bio</li>
            <li>Rating și recenzii</li>
          </ul>

          <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">2.3 Informații despre anunțuri</h3>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>Fotografii și descrieri ale bunurilor</li>
            <li>Preț și condiții de vânzare</li>
            <li>Date tehnice ale utilajelor</li>
            <li>Locația bunurilor</li>
          </ul>

          <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">2.4 Date de utilizare</h3>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>Date despre interacțiunile cu platforma</li>
            <li>Preferințe și setări</li>
            <li>Date despre dispozitiv și browser</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Scopurile și Temeiul Legal al Procesării</h2>
          
          <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">3.1 Executarea contractului (Art. 6 alin. 1 lit. b GDPR)</h3>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>Crearea și gestionarea contului</li>
            <li>Publicarea și administrarea anunțurilor</li>
            <li>Facilitarea comunicării între utilizatori</li>
          </ul>

          <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">3.2 Interes legitim (Art. 6 alin. 1 lit. f GDPR)</h3>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>Îmbunătățirea serviciilor și experienței utilizatorilor</li>
            <li>Prevenirea fraudelor și abuzurilor</li>
            <li>Suport tehnic și asistență clienți</li>
          </ul>

          <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">3.3 Consimțământ (Art. 6 alin. 1 lit. a GDPR)</h3>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>Newsletter și notificări de marketing</li>
            <li>Module cookie non-esențiale</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Cookie-uri și Tehnologii Similare</h2>
          
          <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">4.1 Ce sunt cookie-urile?</h3>
          <p className="text-gray-700 mb-4">
            Cookie-urile sunt fișiere mici stocate pe dispozitivul dvs. care ne ajută să vă 
            oferim o experiență mai bună de navigare.
          </p>

          <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">4.2 Tipuri de cookie-uri utilizate</h3>
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-bold text-gray-900">Tip</th>
                  <th className="px-4 py-2 text-left text-sm font-bold text-gray-900">Scop</th>
                  <th className="px-4 py-2 text-left text-sm font-bold text-gray-900">Durată</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-2 text-sm text-gray-700">Esențiale</td>
                  <td className="px-4 py-2 text-sm text-gray-700">Autentificare, securitate</td>
                  <td className="px-4 py-2 text-sm text-gray-700">Session</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-sm text-gray-700">Funcționale</td>
                  <td className="px-4 py-2 text-sm text-gray-700">Preferințe, setări</td>
                  <td className="px-4 py-2 text-sm text-gray-700">1 an</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-sm text-gray-700">Analitice</td>
                  <td className="px-4 py-2 text-sm text-gray-700">Statistici utilizare</td>
                  <td className="px-4 py-2 text-sm text-gray-700">2 ani</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-sm text-gray-700">Marketing</td>
                  <td className="px-4 py-2 text-sm text-gray-700">Publicitate personalizată</td>
                  <td className="px-4 py-2 text-sm text-gray-700">La consimțământ</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Partajarea Datelor</h2>
          <p className="text-gray-700 mb-4">
            Nu vindem datele dvs. personale. Putem partaja date cu:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li><strong>Furnizori de servicii:</strong> Supabase (infrastructură), Vercel (hosting)</li>
            <li><strong>Alți utilizatori:</strong> Datele publice din profilul dvs. și anunțuri</li>
            <li><strong>Autorități:</strong> Când este cerut legal sau pentru prevenirea fraudelor</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Transferul Datelor</h2>
          <p className="text-gray-700 mb-4">
            Datele dvs. sunt procesate în principal în cadrul Uniunii Europene. Dacă transferăm 
            date în afara UE, ne asigurăm că există garanții adecvate conform GDPR.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Perioada de Retenție</h2>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li><strong>Date cont:</strong> Până la ștergerea contului</li>
            <li><strong>Anunțuri:</strong> 3 ani după ultima activitate</li>
            <li><strong>Mesaje:</strong> 2 ani</li>
            <li><strong>Log-uri tehnice:</strong> 90 zile</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Drepturile Dumneavoastră (GDPR)</h2>
          <p className="text-gray-700 mb-4">Aveți următoarele drepturi:</p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li><strong>Acces:</strong> Accesați datele dvs. personale</li>
            <li><strong>Rectificare:</strong> Corectați datele inexacte</li>
            <li><strong>Ștergere:</strong> &quot;Dreptul de a fi uitat&quot;</li>
            <li><strong>Portabilitate:</strong> Primiți datele în format structurat</li>
            <li><strong>Opoziție:</strong> Vă opuneți procesării</li>
            <li><strong>Restricționare:</strong> Limitați procesarea</li>
          </ul>
          <p className="text-gray-700 mb-4">
            Pentru a vă exercita drepturile, ne puteți contacta la: <strong>privacy@mega-mark.eu</strong>
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Securitatea Datelor</h2>
          <p className="text-gray-700 mb-4">
            Implementăm măsuri tehnice și organizatorice adecvate pentru a proteja datele dvs.:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>Criptare TLS pentru transmisia datelor</li>
            <li>Stocare criptată a paroleler (bcrypt)</li>
            <li>Acces restricționat la date personale</li>
            <li>Monitorizare continuă pentru detectarea breșelor</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Minorii</h2>
          <p className="text-gray-700 mb-4">
            Platforma noastră nu este destinată persoanelor sub 18 ani. Nu colectăm în mod 
            conștient date de la minori. Dacă descoperim că am colectat date de la un minor, 
            le vom șterge imediat.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">11. Modificări ale Politicii</h2>
          <p className="text-gray-700 mb-4">
            Putem actualiza această Politică periodic. Vă vom notifica despre modificări 
            semnificative prin email sau printr-o notificare pe platformă.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">12. Contact</h2>
          <p className="text-gray-700 mb-4">
            Pentru întrebări despre această Politică de Confidențialitate sau pentru a vă 
            exercita drepturile:
          </p>
          <ul className="list-none pl-6 text-gray-700 mb-4 space-y-2">
            <li><strong>Email:</strong> privacy@mega-mark.eu</li>
            <li><strong>Adresă:</strong> București, România</li>
            <li><strong>Autoritate de supraveghere:</strong> ANSPDCP (România) — <a href="https://www.dataprotection.ro" className="text-green-700 hover:underline">www.dataprotection.ro</a></li>
          </ul>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <Link href="/terms" className="text-green-700 font-semibold hover:text-green-800">
            ← Termeni și Condiții
          </Link>
          <Link href="/about" className="text-green-700 font-semibold hover:text-green-800">
            Despre Noi →
          </Link>
        </div>
      </div>
    </div>
  )
}
