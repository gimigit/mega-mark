# CLAUDE.md — Mega-Mark Agricultural Marketplace

## Proiect

**Mega-Mark** — Marketplace agricol premium pentru Romania si UE.

- **Repo:** https://github.com/gimigit/mega-mark
- **Live:** https://mega-mark-five.vercel.app
- **Stack:** Next.js 16 + TypeScript + Tailwind + shadcn/ui + Supabase + Stripe + Resend
- **Deploy:** Vercel (auto-deploy la push pe `main`)

## Plan detaliat

Citeste `PLAN.md` pentru toate fazele de dezvoltare si status curent.

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
├── migrations/       # Migratii SQL (prefix timestamp obligatoriu)
├── schema.sql        # Schema completa
└── functions/        # Supabase Edge Functions
```

## Reguli de lucru

### Git & Commits
- Commit-uri in engleza, format conventional: `feat:`, `fix:`, `chore:`, `docs:`
- Un commit per feature/fix
- NU comite `.env`, chei API sau date sensibile
- `git status` inainte de commit
- `npm run build` inainte de push

### Cod
- TypeScript strict — fara `any` fara motiv
- shadcn/ui pentru UI — nu reinventa butoane, inputs
- Supabase client: `src/lib/supabase/client.ts`; server: `src/lib/supabase/server.ts`
- Imagini: `next/image` (nu `<img>`)

### Baza de date
- Schimbari schema → fisier nou in `supabase/migrations/` (format: `00N_descriere.sql`)
- NU modifica migratii existente — adauga fisiere noi
- Testeaza RLS policies
- Soft delete (`deleted_at`) — nu sterge date

## Note tehnice (gotchas)

1. **Supabase la build time** — `config.ts` returneaza placeholders daca env vars lipsesc. NU arunca erori la build.
2. **Stripe lazy init** — Proxy pattern in `src/lib/stripe.ts`. NU initializa Stripe la import time.
3. **`force-dynamic`** — toate paginile cu DB calls. Altfel build crapa pe Vercel.
4. **`generateStaticParams`** — NU apela DB acolo (ruleaza la build time).
5. **Supabase Realtime** — activeaza pe tabelele `messages` si `notifications` in Dashboard → Database → Replication.
6. **Admin role** — seteaza manual: `UPDATE profiles SET role='admin' WHERE email='...'`
7. **Stripe webhooks** — in dev: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
8. **Vercel IPv4 + Supabase IPv6** — foloseste pooler connection string (`DATABASE_URL`)

## Environment variables

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
