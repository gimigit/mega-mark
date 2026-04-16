# CLAUDE.md — Mega-Mark Agricultural Marketplace

## Proiect

**Mega-Mark** — Marketplace agricol premium pentru Romania si UE.

- **Repo:** https://github.com/gimigit/mega-mark
- **Live:** https://mega-mark-five.vercel.app
- **Stack:** Next.js 16 + TypeScript + Tailwind + shadcn/ui + Framer Motion + Zustand + Supabase + Stripe + Resend
- **Deploy:** Vercel (auto-deploy la push pe `main`)
- **Supabase project:** `4sale` (ref: `aexqwefkytwmppeyxlvg`, region: eu-west-1)

## Plan detaliat

Citeste `PLAN.md` pentru toate fazele de dezvoltare si status curent.

## Structura proiectului

```
src/
├── app/              # Next.js App Router (pages + API routes)
├── components/       # Componente React reutilizabile
│   └── ui/           # shadcn/ui components (button, card, input, etc.)
├── hooks/            # React hooks custom (useMessages, useNotifications)
├── emails/           # Template-uri email (React Email + Resend)
├── store/            # Zustand stores (favorites, unread count, UI state)
├── lib/
│   ├── supabase/     # client.ts, server.ts, admin.ts, config.ts, middleware.ts
│   ├── stripe.ts     # Lazy Proxy pattern
│   ├── categories.ts # Lucide icon map + EU countries + manufacturers
│   ├── email.ts      # Resend wrapper
│   ├── upload.ts     # Supabase Storage upload
│   └── utils.ts      # cn() helper
└── types/
    └── database.ts   # Tipuri TypeScript generate din Supabase
supabase/
├── migrations/       # Migratii SQL (prefix timestamp obligatoriu)
├── schema.sql        # Schema completa (aplicata pe DB)
└── config.toml       # Supabase CLI config
```

## Reguli de lucru

### Git & Commits
- Commit-uri in engleza, format conventional: `feat:`, `fix:`, `chore:`, `docs:`
- Un commit per feature/fix
- NU comite `.env`, `.env.local`, chei API sau date sensibile
- `git status` inainte de commit
- `npm run build` inainte de push

### Cod
- TypeScript strict — fara `any` fara motiv
- shadcn/ui pentru UI — nu reinventa butoane, inputs
- Lucide React pentru iconite — nu emoji
- Supabase client: `src/lib/supabase/client.ts`; server: `src/lib/supabase/server.ts`; admin: `admin.ts`
- Imagini: `next/image` (nu `<img>`)
- Category icons: `src/lib/categories.ts` → `getCategoryIcon(slug)`
- Animatii: Framer Motion (`motion.div`, `AnimatePresence`) — nu CSS keyframes pentru interactiuni complexe
- State global client: Zustand (`src/store/`) — favorites set, unread count, UI flags
- Fonturi: `next/font/google` (Fraunces = display/headings, DM Sans = body) — nu import CSS Google direct

### Baza de date
- Schema completa in `supabase/schema.sql` — aplicata pe DB (16 Apr 2026)
- Schimbari schema → fisier nou in `supabase/migrations/` (format: `00N_descriere.sql`)
- NU modifica migratii existente — adauga fisiere noi
- RLS activ pe toate tabelele — policies definite
- Soft delete (`deleted_at`) — nu sterge date
- Conectare: pooler `aws-0-eu-west-1.pooler.supabase.com:6543`

### Design System
- CSS variables in `globals.css` (shadcn standard: `--background`, `--foreground`, etc.)
- Tailwind semantic colors: `bg-background`, `text-foreground`, `bg-surface`, `text-muted-foreground`
- Brand colors: green-700/800 (primary), amber-400/500 (accent)
- Dark mode: class-based (`dark:` prefix)
- Fonturi: `--font-display` (Fraunces) pe H1/H2/logo, `--font-body` (DM Sans) pe body/UI
- Animatii: staggered reveal pe grids (Framer Motion variants), hover Y-4 + shadow pe cards

## Note tehnice (gotchas)

1. **Supabase la build time** — `config.ts` returneaza placeholders daca env vars lipsesc. NU arunca erori la build.
2. **Stripe lazy init** — Proxy pattern in `src/lib/stripe.ts`. NU initializa Stripe la import time.
3. **`force-dynamic`** — toate paginile cu DB calls. Altfel build crapa pe Vercel.
4. **`generateStaticParams`** — NU apela DB acolo (ruleaza la build time).
5. **Supabase Realtime** — activeaza pe tabelele `messages` si `notifications` in Dashboard → Database → Replication.
6. **Admin role** — seteaza manual: `UPDATE profiles SET role='admin' WHERE email='...'`
7. **Stripe webhooks** — in dev: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
8. **Vercel IPv4 + Supabase IPv6** — foloseste pooler connection string (`DATABASE_URL`)
9. **Seed endpoint** — `/api/seed` foloseste `createAdminClient()` (bypass RLS). Ruleaza o singura data.
10. **DB schema** — Schema veche 4sale a fost inlocuita complet cu schema Mega-Mark (16 Apr 2026). Migratia 009 (fix trigger mesaje) e in repo dar trebuie aplicata manual pe DB.
11. **Conversations FK joins** — Supabase nu rezolva ambiguitatea pe FK-uri duble spre aceeasi tabela. Foloseste sintaxa explicita: `buyer:profiles!conversations_buyer_id_fkey(...)`.
12. **`next/og`** — OG image dinamica per listing: `src/app/listings/[id]/opengraph-image.tsx` cu `ImageResponse`. Runtime: nodejs.
13. **Zustand store** — la creare: `src/store/useFavoritesStore.ts`, `src/store/useUIStore.ts`. Nu pune logica DB in store — doar state UI.

## Environment variables (Vercel)

```
# ✅ Setate
NEXT_PUBLIC_SUPABASE_URL        # https://aexqwefkytwmppeyxlvg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY   # anon JWT key
SUPABASE_SERVICE_ROLE_KEY       # service_role JWT key
NEXT_PUBLIC_APP_URL             # https://mega-mark-five.vercel.app

# ⚠️ De setat (manual — actiuni owner)
STRIPE_SECRET_KEY               # Stripe Dashboard → Developers → API Keys
STRIPE_WEBHOOK_SECRET           # Stripe Dashboard → Webhooks → signing secret
STRIPE_PRICE_7_DAYS             # Price ID produs "Promovare 7 zile"
STRIPE_PRICE_30_DAYS            # Price ID produs "Promovare 30 zile"
RESEND_API_KEY                  # resend.com → API Keys
```

## DB Schema (tabele)

profiles, categories (11), manufacturers (20), listings, favorites, conversations, messages, reviews, notifications, search_history, api_keys

## CLI Tools disponibile local

- `supabase` CLI (v2.90.0) — linked la proiect
- `vercel` CLI — linked la `gimigits-projects/mega-mark`
- `psql` — `/usr/local/opt/libpq/bin/psql`
- `gh` — GitHub CLI (user: `gimigit`)
