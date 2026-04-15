# CLAUDE.md — Mega-Mark Agricultural Marketplace

## Proiect

**Mega-Mark** — Marketplace agricol premium pentru România și UE.
Fuziune între AgroMark-EU (Next.js 16, arhitectură curată) + 4sale (features complete, testate în producție).

- **Repo:** https://github.com/gimigit/mega-mark
- **Stack:** Next.js 16 + TypeScript + Tailwind + shadcn/ui + Supabase + Stripe + Resend
- **Deploy:** Vercel

## Plan detaliat

Citește `PLAN.md` pentru toate fazele de dezvoltare. Lucrăm în ordine: Faza 0 → 1 → 2 → ...

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
    └── database.ts   # Tipuri TypeScript
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
- Nu șterge date, folosește soft delete (`deleted_at`)

### Environment variables
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_7_DAYS
STRIPE_PRICE_30_DAYS
RESEND_API_KEY
NEXT_PUBLIC_APP_URL
```

## Deployment

- **Vercel** — deploy automat la push pe `main`
- Verifică că build-ul trece local: `npm run build` înainte de push
- Nu face push direct pe `main` dacă există erori TypeScript sau de build

## Note tehnice importante

1. **Supabase Realtime** — activează `REALTIME` pe tabelele `messages` și `notifications` în Supabase Dashboard → Database → Replication
2. **Admin role** — setează manual: `UPDATE profiles SET role='admin' WHERE email='...'`
3. **Migrări** — rulează în ordine; nu modifica migrările existente, adaugă fișiere noi
4. **Stripe webhooks** — în dev: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

## Note tehnice importante (din experienta 4sale + AgroMark-EU)

1. **Supabase client la build time** — config.ts returneaza placeholders daca env vars lipsesc la build. NU arunca erori.
2. **Stripe lazy init** — Proxy pattern in `src/lib/stripe.ts`. NU initializa Stripe la import time.
3. **`force-dynamic` pe toate paginile cu DB** — altfel build crapa pe Vercel
4. **`generateStaticParams` nu apeleaza DB** — ruleaza la build time
5. **Supabase Realtime** — activeaza pe tabelele `messages` si `notifications` in Dashboard → Database → Replication
6. **Admin role** — seteaza manual: `UPDATE profiles SET role='admin' WHERE email='...'`
7. **Stripe webhooks** — in dev: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

## Referinta proiecte sursa

- **AgroMark-EU:** https://github.com/gimigit/agromark-eu (Next.js 16, Supabase direct)
- **4sale:** https://github.com/gimigit/4sale (features complete, testate in productie)
