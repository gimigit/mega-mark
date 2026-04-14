# AGENTS.md — AgroMark EU

> Instrucțiuni pentru agenți care lucrează în acest repo.

## Proiect

**AgroMark EU** — Platformă marketplace agro-industrială (utilaje agricole, tractoare, echipamente).
- **URL producție:** https://agromark-eu.vercel.app
- **Repo:** https://github.com/gimigit/agromark-eu
- **Stack:** Next.js 16 + TypeScript + Tailwind CSS + shadcn/ui + Supabase

## Plan complet

Planul detaliat de implementare se află în:
```
/Users/tizo/projects/AgroMark-EU/Agromark-eu-plan.md
```
Citește-l înainte de a începe orice task. Respectă fazele și prioritățile din plan.

## Structura proiectului

```
src/
├── app/              # Next.js App Router (pages + API routes)
├── components/       # Componente React reutilizabile
│   └── ui/           # shadcn/ui components
├── hooks/            # React hooks custom
├── emails/           # Template-uri email (React Email)
├── lib/              # Utilitare: supabase, stripe, email, upload
└── types/
    └── database.ts   # Tipuri TypeScript generate din Supabase schema
supabase/
├── migrations/       # Migrări SQL (prefix timestamp obligatoriu)
├── schema.sql        # Schema completă
└── functions/        # Supabase Edge Functions
```

## Reguli de lucru

### Git & Commits
- Commit-uri în engleză, format convențional: `feat:`, `fix:`, `chore:`, `docs:`
- Un commit per feature/fix — nu bate mai multe lucruri într-un singur commit
- Nu comite fișiere `.env`, chei API sau date sensibile
- Verifică întotdeauna cu `git status` înainte de commit

### Cod
- TypeScript strict — nu folosi `any` fără motiv întemeiat
- Componente noi → în `src/components/` (reutilizabile) sau direct în `src/app/` (page-specific)
- Folosește shadcn/ui pentru UI components — nu reinventa butoane, inputs, etc.
- Supabase client-side: `src/lib/supabase/client.ts`; server-side: `src/lib/supabase/server.ts`
- Imagini: folosește `next/image` (nu `<img>` direct)

### Baza de date
- Orice schimbare de schemă → fișier nou în `supabase/migrations/` cu format: `00N_descriere.sql`
- Testează RLS policies — userul nu trebuie să poată edita datele altcuiva
- Nu șterge date, folosește soft delete (`deleted_at TIMESTAMPTZ`)

### Environment variables
Disponibile pe Vercel și local în `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
RESEND_API_KEY
NEXT_PUBLIC_APP_URL
```

## Stare curentă (Aprilie 2026)

**MVP ~65% complet.**

### Implementat ✅
- Auth (login / signup / magic link / OAuth)
- Creare anunț multi-step + upload imagini (Supabase Storage)
- Browse + filtre + căutare
- Detaliu anunț + galerie imagini
- Mesagerie basic (contact seller, inbox, thread replies)
- Favorite anunțuri
- Dashboard utilizator
- Profil edit cu avatar upload
- Pagini legale: terms, privacy, about, faq (necommit-uite încă)
- Notificări in-app: NotificationBell, NotificationDropdown (necommit-uite)
- Profil public vânzător: `/sellers/[id]` (necommit-uit)
- Recenzii: ReviewForm, ReviewCard, ReviewsList (necommit-uite)
- Chat real-time: ChatWindow, MessageBubble (necommit-uit)
- Email: `src/lib/email.ts` + templates (necommit-uite)
- SEO: `sitemap.ts`, `robots.ts` (necommit-uite)
- Căutări salvate: migrare `004_saved_searches.sql` (necommit-uită)

### De implementat ❌
- Stripe — plăți, abonamente, pagina prețuri
- Panou admin (`/admin`)
- Sistem raportare anunțuri
- Comparator utilaje
- Hartă (react-leaflet)
- Dealer tools (bulk upload, API)
- Optimizare imagini (compresie la upload)

## Deployment

- **Vercel** — deploy automat la push pe `main`
- Verifică că build-ul trece local: `npm run build` înainte de push
- Nu face push direct pe `main` dacă există erori TypeScript sau de build

## Note tehnice importante

1. **Supabase Realtime** — activează `REALTIME` pe tabelele `messages` și `notifications` în Supabase Dashboard → Database → Replication
2. **Admin role** — setează manual: `UPDATE profiles SET role='admin' WHERE email='...'`
3. **Migrări** — rulează în ordine; nu modifica migrările existente, adaugă fișiere noi
4. **Stripe webhooks** — în dev: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
