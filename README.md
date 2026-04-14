# Mega-Mark — Marketplace Agricol Premium

> Marketplace agricol pentru România și UE. Cel mai bun din AgroMark-EU + 4sale.

## Stack

- **Next.js 16** — React framework cu App Router
- **TypeScript** — Type safety
- **Tailwind CSS + shadcn/ui** — Design system
- **Supabase** — Database, Auth, Storage, Realtime
- **Stripe** — Plăți și promovare anunțuri
- **Resend** — Email notifications
- **Vercel** — Deployment

## Setup

```bash
# Instalează dependențele
npm install

# Setup Supabase local (opțional)
npx supabase init
npx supabase start

# Copiază .env.example în .env.local și completează variabilele
cp .env.example .env.local

# Rulează migrațiile
npx supabase db push

# Pornește development server
npm run dev
```

## Features

- ✅ Auth (email, magic link, OAuth)
- ✅ Creare anunțuri cu galerii foto
- ✅ Căutare cu filtre avansate
- ✅ Mesagerie internă
- ✅ Promovare anunțuri (Stripe)
- ✅ Notificări email (Resend)
- ✅ Dashboard utilizator
- ✅ Admin panel
- ✅ SEO optimizat

## Deploy

Deploy automat pe Vercel la push pe `main`.

## Documentație

- [PLAN.md](./PLAN.md) — Plan complet de dezvoltare
- [CLAUDE.md](./CLAUDE.md) — Instrucțiuni pentru agenți AI
