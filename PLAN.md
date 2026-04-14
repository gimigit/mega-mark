# PLAN.md — Mega-Mark Agricultural Marketplace

> **Status:** Planificare · Început: Aprilie 2026
> **Fuziune:** AgroMark-EU (Next.js 16, arhitectură curată) + 4sale (features complete, testate în producție)
> **Stack:** Next.js 16 App Router · TypeScript · Supabase (direct, fără Prisma) · shadcn/ui + base-ui · Tailwind · Vercel
> **Repo:** https://github.com/gimigit/mega-mark
> **Live:** https://megamark.vercel.app (target)

---

## Viziune

**Mega-Mark** — Marketplace agricol premium pentru România și UE.
Cel mai bun din AgroMark-EU (Next.js 16, arhitectură curată) + cel mai bun din 4sale (features complete, testate în producție).

**Piața țintă:** România-first → UE (PL, BG, HU, SK, CZ) în Faza 6.
**Diferențiator:** UX modern, performanță, trust (recenzii, dealer verificați), monetizare clară.

**De ce fuziune?**
- AgroMark-EU: Next.js 16, Supabase direct (fără Prisma overhead), shadcn/ui modern, arhitectură curată
- 4sale: Stripe complet, email Resend, cron jobs, admin dashboard, toast notifications, phone reveal, share button, promovare anunțuri — toate testate în producție
- Mega-Mark = baza AgroMark-EU + features complete din 4sale + features unice (recenzii, saved searches, notifications in-app)

---

## Stack & Decizii Tehnice (Locked)

| Decizie | Alegere | Motivație |
|---|---|---|
| Frontend | Next.js 16 App Router | Cel mai nou, React Server Components, performanță optimizată |
| Styling | Tailwind CSS + shadcn/ui + base-ui | Design system consistent, rapid, accesibil |
| Backend | Next.js API Routes | Full-stack în același repo |
| Database | PostgreSQL via Supabase | Full-text search, RLS, realtime, pooler |
| Auth | Supabase Auth (email + magic link + OAuth) | Hosted, secure, tested |
| Storage | Supabase Storage (CDN inclus) | Zero infra overhead |
| ORM | Supabase JS SDK (direct) | Fără Prisma overhead, mai simplu, mai rapid |
| Payments | Stripe | Industry standard, suport RON, testat în 4sale |
| Email | Resend | Developer-friendly, templates React, testat în 4sale |
| Deploy | Vercel | Preview per PR, Edge network, auto-deploy |
| Notifications | In-app (Supabase Realtime) + Email | Combinație din ambele proiecte |
| Analytics | Vercel Analytics | Zero-config, GDPR-friendly |
| Error Monitoring | Sentry | Error tracking production |
| i18n | next-intl | Pentru expansiune UE |

### Decizii tehnice cheie (din experiența 4sale)

1. **`generateStaticParams` rulează la BUILD TIME** — nu apela DB acolo
2. **`revalidate` + `cookies()` incompatibile** — folosește `force-dynamic`
3. **Toate paginile cu DB calls → `force-dynamic`** — altfel build crapa pe Vercel
4. **Navbar e în root layout** — eroare acolo = "Application error" pe toate paginile
5. **Stripe lazy init** — Proxy leneș, altfel aruncă la import time
6. **Supabase IPv6 + Vercel IPv4** — folosește pooler: `aws-0-eu-west-2.pooler.supabase.com:6543`

---

## Schema DB (Supabase direct, fără Prisma)

Bazat pe AgroMark-EU + îmbunătățiri din 4sale.

```sql
-- Bazat pe supabase/schema.sql din AgroMark-EU
-- + Adaugă: slug, viewCount, featured, featuredUntil, searchVector (din 4sale)
-- + Adaugă: AdReport, Review, SavedSearch (features noi)
-- + Adaugă: avatarUrl, bio, verified, website pe profiles (din 4sale)
-- + Adaugă: Notification model (din AgroMark-EU)

-- Model principal: listings (din AgroMark-EU)
-- + stripeSubscriptionId, stripePriceId, subscriptionStatus (din 4sale Stripe)
-- + reviewsCount, avgRating pe sellers profiles (features noi)

-- Vedere completă: supabase/schema.sql
```

### Features noi față de ambele proiecte

| Feature | Sursă | Descriere |
|---|---|---|
| Recenzii vânzători | AgroMark-EU | ReviewForm, ReviewCard, ReviewsList |
| Saved searches | AgroMark-EU | Migrare `004_saved_searches.sql` |
| Notifications in-app | AgroMark-EU | NotificationBell, NotificationDropdown |
| AI categorizare anunțuri | Mega-Mark nou | Clasificare automată bazată pe descriere |
| Comparator utilaje | Mega-Mark nou | Comparație side-by-side 2-3 anunțuri |
| Dealer tools | AgroMark-EU plan | Bulk upload, API dealer |

---

## Faze de dezvoltare

```
Faza 0 — Setup & Migrare        ← ÎNCEPEM AICI
Faza 1 — Core MVP                (Auth, CRUD, Browse, Search)
Faza 2 — Engagement             (Mesagerie, Favorite, Profil)
Faza 3 — Monetizare            (Stripe, Promovare, Admin)
Faza 4 — SEO & Launch          (Sitemap, Meta, GDPR, Performance)
Faza 5 — Polish & UX           (Toast, Share, Phone reveal, Animations)
Faza 6 — Scale & i18n          (Multi-limbă, UE expansion)
Faza 7 — Advanced              (AI, Comparator, Dealer tools, App)
```

---

## 🔄 Faza 0 — Setup & Migrare (NOUĂ)

> **Obiectiv:** Creează Mega-Mark pornind de la AgroMark-EU, cu features complete din 4sale.
> **Bază:** AgroMark-EU (Next.js 16, arhitectură curată)
> **Adaugă:** Features testate din 4sale

### Step 0 — Setup proiect nou

- [ ] **0a** Creează folder `mega-mark` în `~/Projects/Mega-Mark/`
- [ ] **0b** Copiază structura AgroMark-EU: `src/`, `supabase/`, `package.json`, configs
- [ ] **0c** Upgrade la Next.js 16 (dacă AgroMark-EU are 16 deja, păstrează)
- [ ] **0d** Setup git: `git init`, repo GitHub `gimigit/mega-mark`
- [ ] **0e** Configurează Vercel project + env vars

### Step 1 — Port features complete din 4sale

- [ ] **1a** Copiază `src/app/api/stripe/*` din 4sale → Mega-Mark
  - checkout, webhook, portal, cancel subscriptions
  - Verify: `npm run build`
- [ ] **1b** Copiază `src/app/api/cron/*` din 4sale → Mega-Mark
  - `expire-ads`: marchează anunțuri expirate
  - `check-expiring-ads`: notifică înainte de expirare
  - Verify: `npm run build`
- [ ] **1c** Copiază paginile de Stripe din 4sale → Mega-Mark
  - `/promoveaza/[slug]`: checkout flow (din 4sale)
  - `/pricing`: pagina de prețuri
  - Verify: `npm run build`
- [ ] **1d** Copiază admin dashboard din 4sale → Mega-Mark
  - `/admin`: tabel anunțuri, acțiuni, rapoarte
  - Verify: `npm run build`
- [ ] **1e** Copiază email templates din 4sale → Mega-Mark
  - Mesaj nou, expirare anunț, confirmare plată
  - Resend integration (verifică că RESEND_API_KEY funcționează pe Vercel)
  - Verify: `npm run build`
- [ ] **1f** Copiază Toast notifications din 4sale → Mega-Mark
  - `sonner` already in AgroMark-EU deps? Verifică
  - Adaugă `<Toaster />` în layout
  - Verify: `npm run build`
- [ ] **1g** Copiază PhoneReveal + ShareButton din 4sale → Mega-Mark
  - Phone reveal cu click-to-show
  - Share WhatsApp + Copy link
  - Verify: `npm run build`
- [ ] **1h** Copiază cron email notifications din 4sale → Mega-Mark
  - Verifică Supabase Realtime activ pe tabelele `messages` și `notifications`
  - Verify: `npm run build`

### Step 2 — Port features unice AgroMark-EU

- [ ] **2a** Port recenziilor (ReviewForm, ReviewCard, ReviewsList) la Mega-Mark
  - Rulează migrarea `004_reviews.sql` din AgroMark-EU
  - Verifică că funcționează pe noua schema
  - Verify: `npm run build`
- [ ] **2b** Port saved searches (migrare `004_saved_searches.sql`) la Mega-Mark
  - API routes + UI
  - Verify: `npm run build`
- [ ] **2c** Port in-app notifications (NotificationBell, NotificationDropdown) la Mega-Mark
  - Supabase Realtime pentru notificări live
  - Verify: `npm run build`
- [ ] **2d** Port profilul public vânzător `/sellers/[id]` la Mega-Mark
  - Cu recenzii și statistici
  - Verify: `npm run build`

### Step 3 — Unifică cele mai bune UI components

- [ ] **3a** Alege design system: StyleSeed (din 4sale) sau shadcn/ui curat (AgroMark)
  - Decision: shadcn/ui curat (mai simplu, baza AgroMark)
  - Adaugă StyleSeed tokens în Tailwind pentru consistență
  - Verify: `npm run build`
- [ ] **3b** Redesign AdCard — ia best from both:
  - Badge "Promovat" (din 4sale)
  - Image optimization cu next/image (din AgroMark)
  - Rating stele pentru vânzători (nou)
  - Verify: `npm run build`
- [ ] **3c** Redesign Homepage — hero section + search + categorii + anunțuri recente (din 4sale)
  - Folosește Next.js 16 features
  - Verify: `npm run build`
- [ ] **3d** Crează `/contul-meu/dashboard` unificat
  - Anunțuri active + statistici + quick actions
  - Verify: `npm run build`

### Step 4 — Fix critical issues (din experiența 4sale)

- [ ] **4a** Supabase IPv6 + Vercel IPv4 fix
  - DATABASE_URL pooler: `aws-0-eu-west-2.pooler.supabase.com:6543?pgbouncer=true`
  - DIRECT_URL = direct db URL
  - Verify: deploy pe Vercel funcționează
- [ ] **4b** Pagini blocate pe loading skeleton fix
  - `force-dynamic` + try/catch pe toate DB calls
  - Verify: `npm run build`
- [ ] **4c** Stripe lazy init (Proxy pattern din 4sale)
  - Verify: `npm run build`
- [ ] **4d** Sitemap force-dynamic + try/catch
  - Verify: `curl localhost:3000/sitemap.xml`

### Step 5 — Database setup

- [ ] **5a** Unifică schema din AgroMark-EU + features noi
  - Fuzionează: slug, viewCount, featured, featuredUntil, searchVector
  - Adaugă: Review, SavedSearch, Notification models
  - Rulează migrări în ordine
  - Verify: `npm run build`
- [ ] **5b** Setup Supabase Storage bucket pentru photos
  - Verifică RLS policies
  - Verify: upload foto funcționează

### Step 6 — Test integration

- [ ] **6a** Test complet flow: register → login → creare anunț → checkout Stripe → email Resend
- [ ] **6b** Verifică că toate paginile încarcă fără erori
- [ ] **6c** Deploy pe Vercel, verifică production

---

## ✅ Faza 1 — Core MVP

Utilizator poate crea cont, posta anunț cu poze, alt utilizator îl găsește.

- [ ] Step 1 — Scaffold (Next.js 16, Tailwind, Supabase, folder structure) ← din AgroMark-EU
- [ ] Step 2 — Schema DB + migrații + seed categorii ← unificat
- [ ] Step 3 — Auth (register, login, forgot-password, middleware, OAuth)
- [ ] Step 4 — Listing CRUD API (create, read, update, delete, sold, photo upload)
- [ ] Step 5 — UI Browse & Search (filtre: categorie, județ, preț, stare; paginare; sortare)
- [ ] Step 6 — UI Detaliu anunț (galerie foto, telefon, favorite, card vânzător)
- [ ] Step 7 — UI Creare/Editare anunț (form multi-step, drag&drop poze)
- [ ] Step 8 — Favorite (API + pagina)

---

## ✅ Faza 2 — Engagement

- [ ] Step 9 — Mesagerie internă (inbox, conversații, badge unread, mark-read)
- [ ] Step 10 — Email notifications (Resend: mesaj nou, anunț expiră, plată confirmată)
- [ ] Step 11 — Profil public vânzător (`/sellers/[id]` cu anunțuri active + recenzii + rating)
- [ ] Step 12 — In-app notifications (NotificationBell, NotificationDropdown, Supabase Realtime)

---

## ✅ Faza 3 — Monetizare

- [ ] Step 13 — Stripe Checkout + Webhooks (din 4sale — deja testat)
- [ ] Step 14 — Promovare anunțuri: 7 zile (15 RON) / 30 zile (45 RON)
- [ ] Step 15 — Badge "Promovat" în AdCard + anunțuri featured primele
- [ ] Step 16 — Pagina `/promoveaza/[slug]` — checkout flow complet
- [ ] Step 17 — Dashboard Admin (din 4sale — deja testat)
- [ ] Step 18 — Cron jobs: expirare anunțuri + notificări înainte de expirare

---

## ✅ Faza 4 — SEO & Launch

- [ ] Step 19 — Sitemap dinamic `/sitemap.xml`
- [ ] Step 20 — Meta tags + Open Graph pe toate paginile
- [ ] Step 21 — JSON-LD Schema.org Product pe paginile de anunț
- [ ] Step 22 — Pagini SEO programatice: categorie × județ (ex: `/tractoare/cluj`)
- [ ] Step 23 — robots.txt corect
- [ ] Step 24 — Footer cu linkuri interne la categorii + județe
- [ ] Step 25 — GDPR pages: Termeni, Confidențialitate, Despre, Cookie banner

---

## ✅ Faza 5 — Polish & UX

- [ ] Step 26 — Toast notifications (Sonner) — global
- [ ] Step 27 — Phone reveal (click-to-show)
- [ ] Step 28 — Share button (WhatsApp + Copy link)
- [ ] Step 29 — Recenzii vânzători (ReviewForm, ReviewCard, ReviewsList)
- [ ] Step 30 — Saved searches (create, list, delete, email alert)
- [ ] Step 31 — Empty states pe toate paginile
- [ ] Step 32 — Skeleton loaders (page + browse)
- [ ] Step 33 — Performance: next/image pe toate imaginile, lazy loading
- [ ] Step 34 — Mobile responsive polish
- [ ] Step 35 — Not-found page custom cu search bar

---

## Faza 6 — Scale & Internațional

> **Obiectiv:** Expansiune UE: Polonia, Bulgaria, Ungaria, Slovacia, Cehia.

- [ ] Step 36 — i18n cu next-intl: RO (default), EN, HU, PL, BG, SK, CZ
- [ ] Step 37 — URL structure: `/en/listings`, `/hu/hirdetesek`
- [ ] Step 38 — Traduceri interfață + meta tags + categorii
- [ ] Step 39 — hreflang tags în `<head>`
- [ ] Step 40 — Adaptare monedă + TVA per țară
- [ ] Step 41 — Locale-aware SEO (subdomain: ro.megamark.eu, en.megamark.eu)

---

## Faza 7 — Advanced Features

- [ ] Step 42 — AI categorizare anunțuri (clasificare automată bazată pe descriere + titlu)
- [ ] Step 43 — Comparator utilaje (side-by-side 2-3 anunțuri)
- [ ] Step 44 — Dealer tools: bulk upload, API access
- [ ] Step 45 — App Mobil (React Native / Expo)
- [ ] Step 46 — Push notifications mobile
- [ ] Step 47 — Dealer accounts extins: logo, descriere, locație pe hartă, ore program
- [ ] Step 48 — Badge "Dealer Verificat" (admin approval)
- [ ] Step 49 — Full-text search avansat (autocomplete, suggestions)
- [ ] Step 50 — "Alertă căutare" — notify email când apare anunț nou

---

## De ce Mega-Mark e mai bun decât ambele

| Aspect | AgroMark-EU | 4sale | Mega-Mark |
|---|---|---|---|
| Next.js | 16 ✅ | 14 | **16 ✅** |
| Arhitectură DB | Supabase direct ✅ | Prisma ⚠️ | **Supabase direct ✅** |
| Stripe | În lucru | ✅ Complet | **✅ Complet** |
| Email | În lucru | ✅ Complet | **✅ Complet** |
| Cron jobs | — | ✅ | **✅** |
| Admin dashboard | — | ✅ | **✅** |
| Toast notifications | — | ✅ | **✅** |
| Phone reveal | — | ✅ | **✅** |
| Share button | — | ✅ | **✅** |
| Recenzii | În lucru | — | **✅** |
| Saved searches | În lucru | — | **✅** |
| In-app notifications | În lucru | — | **✅** |
| i18n | — | — | **✅ Planificat** |
| Design system | shadcn/ui | StyleSeed | **shadcn/ui + StyleSeed tokens** |
| Maturitate | 65% MVP | ✅ 7 faze | **Bază testată + features complete** |

---

## Git Workflow

- Commit-uri în engleză, format convențional: `feat:`, `fix:`, `chore:`, `docs:`
- Un commit per feature/fix
- Nu comite `.env`, chei API sau date sensibile
- Verifică `npm run build` înainte de orice commit
- Nu face push direct pe `main` dacă build-ul nu trece

---

## Environment Variables

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL              # pooler pentru Vercel
DIRECT_URL                # direct connection

# Stripe
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_7_DAYS
STRIPE_PRICE_30_DAYS

# Email
RESEND_API_KEY

# App
NEXT_PUBLIC_APP_URL
```

---

## Jurnal de progres

| Data | Faza | Activitate | Agent |
|---|---|---|---|
| 2026-04-14 | Plan | Plan fuziune creat (AgroMark-EU + 4sale) | Hermes |
| 2026-04-14 | Faza 0 | Setup proiect nou Mega-Mark | — |
| 2026-04-14 | Faza 0 | Port features complete din 4sale | — |
| 2026-04-14 | Faza 0 | Port features AgroMark-EU | — |
| 2026-04-14 | Faza 0 | Fix critical issues | — |

---

## Link-uri utile

- **Repo:** https://github.com/gimigit/mega-mark
- **Repo AgroMark-EU:** https://github.com/gimigit/agromark-eu
- **Repo 4sale:** https://github.com/gimigit/4sale
- **Live 4sale:** https://4sale-roan.vercel.app
- **Vercel Dashboard:** https://vercel.com/gimigits-projects
