# PLAN.md — Mega-Mark Agricultural Marketplace

> **For Hermes:** Use `structured-project-execution` skill. Execute task-by-task, verify each step, update status here.

**Goal:** Marketplace agricol premium pentru Romania si UE — tractoare, combine, utilaje agricole.

**Stack:** Next.js 16 App Router · TypeScript · Supabase (direct, fara Prisma) · shadcn/ui · Tailwind · Stripe · Resend · Vercel

**Repo:** https://github.com/gimigit/mega-mark
**Live:** https://megamark.vercel.app (target)

---

## Status curent (15 Aprilie 2026)

**Build:** ✅ Trece local (`npm run build`)
**Deploy:** Nu e configurat inca pe Vercel (lipsesc env vars)
**DB:** Schema completa (461 linii) — NU e rulata inca pe Supabase

### Ce exista deja (portat din AgroMark-EU + 4sale)

**Pagini (20):**
- Homepage, Browse, Login, Signup, Forgot Password, Update Password
- Listings: create, [id] detail, [id]/edit
- Dashboard, Dashboard/billing, Profile/edit
- Sellers/[id], Admin, Pricing, About, FAQ, Terms, Privacy
- 404 not-found

**API Routes (18):**
- `/api/listings` (CRUD), `/api/listings/[id]`
- `/api/favorites` (toggle + list)
- `/api/reviews` (create + list)
- `/api/notifications/email`, `/api/notifications/events`, `/api/notifications/expiry-check`
- `/api/stripe/checkout`, `/api/stripe/portal`, `/api/stripe/webhook`
- `/api/subscriptions/cancel`
- `/api/cron/expire-ads`, `/api/cron/check-expiring-ads`
- `/api/admin/stats`, `/api/admin/listings`, `/api/admin/users`, `/api/admin/me`
- `/api/seed` (categorii + manufacturers)

**Componente UI:**
- ListingCard, ListingCardSkeleton, Navbar, Footer, SellerCard
- ReviewForm, ReviewCard, ReviewsList
- NotificationBell, NotificationDropdown
- ChatWindow, MessageBubble
- PhoneReveal, ShareButton, ThemeToggle, MapView

**Lib:**
- `supabase/` (client, server, admin, config, middleware) — lazy init la build time ✅
- `stripe.ts` — lazy Proxy pattern ✅
- `email.ts`, `notifications.ts`, `upload.ts`, `admin-utils.ts`

**DB Schema:** `supabase/schema.sql` (profiles, categories, manufacturers, listings, favorites, conversations, messages, reviews, notifications, search_history, api_keys) + 7 migratii + indexes + triggers + seed data

### Ce NU exista (API routes lipsa)

- ❌ `/api/conversations` — CRUD conversatii (mesagerie)
- ❌ `/api/messages/[id]/read` — mark message as read
- ❌ `/api/saved-searches` — CRUD saved searches
- ❌ `/api/auth/me` — sync user profile

### Ce NU e functional (UI fara backend)

- ChatWindow + MessageBubble — componente prezente, dar fara API
- NotificationBell + NotificationDropdown — componente prezente, dar fara Supabase Realtime
- SavedSearches — component prezent, dar fara API
- Search pe Homepage — UI doar, nu face fetch real
- Forms pe Homepage (Post Listing) — UI doar, nu trimite date

---

## Decizii tehnice (locked)

| Decizie | Alegere | Nota |
|---|---|---|
| DB calls la build time | NU — toate paginile cu DB sunt `force-dynamic` |
| Supabase client | Lazy init cu placeholders la build time |
| Stripe | Lazy Proxy pattern (nu arunca la import) |
| `generateStaticParams` | NU apela DB acolo |
| Vercel IPv4 + Supabase IPv6 | Foloseste pooler: `aws-0-eu-west-2.pooler.supabase.com:6543` |
| Navbar | In root layout — erori acolo afecteaza tot site-ul |

---

## Faza 1 — Database & Deploy

> **Obiectiv:** Supabase configurat, schema rulata, seed data, deploy pe Vercel functional.

### Task 1.1: Setup Supabase project

**Obiectiv:** Proiect Supabase creat cu schema completa.

**Steps:**
1. Creeaza proiect nou pe supabase.com (region: eu-west)
2. Ruleaza `supabase/schema.sql` in SQL Editor
3. Ruleaza migratiile in ordine: `003_messages.sql` → `004_saved_searches.sql` → ... → `008_subscriptions_and_listing_boosts.sql` → `20240101000001_add_rls_policies.sql`
4. Verifica in Table Editor ca tabelele exista si seed data (categories, manufacturers) e populata
5. Creeaza Storage bucket `listings` (public: true, 5MB limit, image/jpeg + image/png + image/webp)
6. Activeaza Realtime pe tabelele `messages` si `notifications` (Database → Replication)

**Verificare:** Deschide Table Editor → `categories` → 11 randuri; `manufacturers` → 20 randuri

### Task 1.2: Environment variables local

**Obiectiv:** `.env.local` configurat cu credentiale reale.

**Files:** Create `.env.local` (NU se comite — e in .gitignore)

**Steps:**
1. Copiaza din Supabase Dashboard → Settings → API:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
2. Copiaza Connection String (pooler) → `DATABASE_URL`
3. Seteaza `NEXT_PUBLIC_APP_URL=http://localhost:3000`
4. Stripe keys pot ramane goale deocamdata

**Verificare:** `npm run dev` → Homepage incarca fara erori, categoriile apar din DB

### Task 1.3: Deploy Vercel

**Obiectiv:** Site live pe Vercel cu auto-deploy din `main`.

**Steps:**
1. Import repo `gimigit/mega-mark` pe Vercel
2. Seteaza env vars (aceleasi ca `.env.local` + Stripe keys)
3. Seteaza `DATABASE_URL` cu pooler connection string
4. Deploy si verifica ca build-ul trece
5. Testeaza homepage pe URL-ul live

**Verificare:** `https://mega-mark-*.vercel.app` incarca homepage cu categorii din DB

### Task 1.4: Seed data via API

**Obiectiv:** Creeaza cateva anunturi de test ca site-ul sa nu fie gol.

**Steps:**
1. Creeaza un user manual (signup pe site)
2. Seteaza-l admin: `UPDATE profiles SET role='admin' WHERE email='...'`
3. Verifica `/api/seed` — ruleaza seed-ul daca nu e deja populat
4. Creeaza 3-5 listings de test manual sau prin API

**Verificare:** Browse page arata listings; Homepage arata categorii cu count > 0

---

## Faza 2 — Auth & Core Flow

> **Obiectiv:** User poate crea cont, posta anunt cu poze, alt user il gaseste si il contacteaza.

### Task 2.1: Fix auth flow

**Obiectiv:** Register → Login → Dashboard functioneaza end-to-end.

**Files:**
- Verify: `src/app/login/page.tsx`, `src/app/signup/page.tsx`
- Verify: `src/app/auth/callback/route.ts`
- Verify: `src/lib/supabase/middleware.ts`

**Steps:**
1. Testeaza signup cu email → verifica ca profile se creeaza automat (trigger `handle_new_user`)
2. Testeaza login cu email + parola
3. Testeaza magic link (daca e configurat in Supabase Auth)
4. Verifica ca `/dashboard` e protejat (redirect la login daca nu e autentificat)
5. Testeaza logout

**Verificare:** User nou: signup → email confirmare → login → vede dashboard → logout → redirect login

### Task 2.2: Listing create flow

**Obiectiv:** User autentificat posteaza anunt cu poze.

**Files:**
- Verify: `src/app/listings/create/page.tsx`
- Verify: `src/app/api/listings/route.ts` (POST)
- Verify: `src/lib/upload.ts`

**Steps:**
1. Testeaza form-ul de creare anunt (all fields)
2. Testeaza upload imagini in Supabase Storage
3. Verifica ca listing-ul apare in browse cu status `active`
4. Testeaza edit listing (`src/app/listings/[id]/edit/page.tsx`)
5. Testeaza delete/archive listing

**Verificare:** Create listing → apare in Browse → Edit → Delete

### Task 2.3: Browse & Search

**Obiectiv:** Browse page cu filtre functionale.

**Files:**
- Verify: `src/app/browse/page.tsx`

**Steps:**
1. Verifica ca filtrele (categorie, tara, pret) functioneaza
2. Verifica paginare
3. Verifica sortare (pret, data, views)
4. Fix search box pe Homepage — conecteaza-l la `/browse?q=...`

**Verificare:** Browse cu filtre → rezultate corecte; Search din Homepage → redirect la Browse cu query

### Task 2.4: Listing detail page

**Obiectiv:** Pagina de detaliu anunt completa.

**Files:**
- Verify: `src/app/listings/[id]/page.tsx`
- Verify: `src/app/listings/[id]/ListingDetailClient.tsx`

**Steps:**
1. Verifica galerie foto, informatii listing, seller card
2. Verifica PhoneReveal (click-to-show)
3. Verifica ShareButton (copy link)
4. Verifica favorites toggle
5. Verifica increment view count

**Verificare:** Listing detail arata corect, phone reveal functioneaza, share copiaza link

---

## Faza 3 — Messaging & API routes lipsa

> **Obiectiv:** Mesagerie interna functionala + API routes pentru toate componentele UI existente.

### Task 3.1: Conversations API

**Obiectiv:** CRUD pentru conversatii intre buyer si seller.

**Files:**
- Create: `src/app/api/conversations/route.ts` (GET list, POST create)
- Create: `src/app/api/conversations/[id]/route.ts` (GET messages)
- Create: `src/app/api/conversations/[id]/messages/route.ts` (POST send message)

**Steps:**
1. GET `/api/conversations` — returneaza conversatiile userului curent (buyer sau seller)
2. POST `/api/conversations` — creeaza conversatie noua (body: `{ listing_id, message }`)
3. GET `/api/conversations/[id]` — returneaza mesajele unei conversatii
4. POST `/api/conversations/[id]/messages` — trimite mesaj nou
5. Conecteaza ChatWindow + MessageBubble la aceste API routes

**Verificare:** Buyer trimite mesaj pe listing → Seller vede conversatia → Reply → Buyer vede reply

### Task 3.2: Message read status API

**Obiectiv:** Mark messages as read, badge unread count.

**Files:**
- Create: `src/app/api/conversations/[id]/read/route.ts` (POST mark read)

**Steps:**
1. POST `/api/conversations/[id]/read` — seteaza `buyer_unread=0` sau `seller_unread=0`
2. Adauga badge unread in Navbar sau inbox page

**Verificare:** New message → badge unread → click → badge dispare

### Task 3.3: Saved searches API

**Obiectiv:** User salveaza cautari si primeste alerte.

**Files:**
- Create: `src/app/api/saved-searches/route.ts` (GET list, POST create, DELETE remove)

**Steps:**
1. GET `/api/saved-searches` — returneaza saved searches ale userului
2. POST `/api/saved-searches` — salveaza cautare (body: `{ name, filters }`)
3. DELETE `/api/saved-searches?id=...` — sterge saved search
4. Conecteaza componenta SavedSearches la API

**Verificare:** Save search pe browse → apare in lista → delete → dispare

### Task 3.4: Auth me API

**Obiectiv:** Endpoint pentru sync profil user curent.

**Files:**
- Create: `src/app/api/auth/me/route.ts` (GET profile)

**Steps:**
1. GET `/api/auth/me` — returneaza profilul userului autentificat (din `profiles` table)
2. Foloseste `supabase.auth.getUser()` pentru a identifica userul

**Verificare:** GET `/api/auth/me` cu auth header → returneaza profil complet

---

## Faza 4 — Engagement Features

> **Obiectiv:** Favorites, reviews, notifications, profil vanzator.

### Task 4.1: Favorites page

**Obiectiv:** Pagina cu anunturile favorite ale userului.

**Files:**
- Create: `src/app/dashboard/favorites/page.tsx`
- Verify: `src/app/api/favorites/route.ts`

**Steps:**
1. Creeaza pagina `/dashboard/favorites` — lista de favorites
2. Verifica toggle favorite de pe ListingCard si ListingDetail
3. Adauga link in Dashboard navigation

**Verificare:** Toggle favorite → apare in `/dashboard/favorites` → toggle off → dispare

### Task 4.2: Reviews pe seller profile

**Obiectiv:** Reviews vizibile pe profilul vanzatorului.

**Files:**
- Verify: `src/app/sellers/[id]/page.tsx`
- Verify: `src/app/api/reviews/route.ts`
- Verify: ReviewForm, ReviewCard, ReviewsList components

**Steps:**
1. Verifica ca ReviewsList arata reviews pe `/sellers/[id]`
2. Verifica ca ReviewForm permite adaugare review (doar buyeri autentificati)
3. Verifica ca rating_avg se actualizeaza pe profil (trigger `update_review_stats`)

**Verificare:** Buyer adauga review → apare pe seller profile → rating_avg se actualizeaza

### Task 4.3: Notifications in-app

**Obiectiv:** NotificationBell functionala cu Supabase Realtime.

**Files:**
- Modify: `src/components/NotificationBell.tsx`
- Modify: `src/components/NotificationDropdown.tsx`
- Verify: `src/app/api/notifications/events/route.ts`

**Steps:**
1. Conecteaza NotificationBell la Supabase Realtime (subscribe pe `notifications` table)
2. Afiseaza count unread
3. NotificationDropdown listeaza ultimele notificari
4. Click pe notificare → marcheaza ca citita

**Verificare:** Actiune (mesaj nou, review nou) → bell arata count → click → notificari vizibile

### Task 4.4: Email notifications (Resend)

**Obiectiv:** Email-uri trimise la evenimente cheie.

**Files:**
- Verify: `src/lib/email.ts`
- Verify: `src/emails/` (WelcomeEmail, NewMessageEmail, NewReviewEmail, ListingPublishedEmail, ListingExpiringEmail, PasswordResetEmail)

**Steps:**
1. Configureaza RESEND_API_KEY in env
2. Testeaza welcome email la signup
3. Testeaza email la mesaj nou
4. Testeaza email la review nou
5. Testeaza email la listing publicat

**Verificare:** Signup → primeste welcome email; Mesaj nou → primeste email notificare

---

## Faza 5 — Monetizare

> **Obiectiv:** Stripe functional — promovare anunturi cu plata.

### Task 5.1: Stripe setup

**Obiectiv:** Stripe configurat cu produse si preturi.

**Steps:**
1. Creeaza produse in Stripe Dashboard: "Promovare 7 zile" (15 RON), "Promovare 30 zile" (45 RON)
2. Seteaza env vars: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_7_DAYS`, `STRIPE_PRICE_30_DAYS`
3. Configureaza webhook: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

**Verificare:** Webhook events apar in terminal

### Task 5.2: Promovare anunt flow

**Obiectiv:** User plateste sa promoveze anuntul.

**Files:**
- Verify: `src/app/api/stripe/checkout/route.ts`
- Verify: `src/app/api/stripe/webhook/route.ts`
- Create: `src/app/listings/[id]/promote/page.tsx` (daca nu exista)

**Steps:**
1. Testeaza checkout flow: listing → promote → Stripe → redirect inapoi
2. Verifica webhook: payment success → `is_featured = true` + `expires_at` setat
3. Verifica badge "Promovat" pe ListingCard
4. Verifica ca anunturile promovate apar primele in Browse

**Verificare:** Promote listing → plata Stripe (test card) → listing devine featured → apare sus in Browse

### Task 5.3: Admin dashboard

**Obiectiv:** Admin poate vedea stats si gestiona anunturi/useri.

**Files:**
- Verify: `src/app/admin/page.tsx`
- Verify: `src/app/api/admin/*`

**Steps:**
1. Seteaza un user ca admin: `UPDATE profiles SET role='admin' WHERE email='...'`
2. Testeaza `/admin` — stats, lista anunturi, lista useri
3. Verifica ca non-admin nu poate accesa `/admin`

**Verificare:** Admin vede dashboard cu stats; Non-admin primeste 403 sau redirect

---

## Faza 6 — SEO & Launch

> **Obiectiv:** Site optimizat pentru motoare de cautare, GDPR compliant, performant.

### Task 6.1: Meta tags & Open Graph

**Obiectiv:** Fiecare pagina are meta tags corecte.

**Files:**
- Modify: `src/app/layout.tsx` (metadata globala — deja partiala)
- Verify: listing detail, browse, seller profile — metadata dinamica

**Steps:**
1. Verifica `<title>` si `<meta description>` pe fiecare pagina
2. Adauga Open Graph tags pe listing detail (title, description, image)
3. Testeaza cu Facebook Sharing Debugger

### Task 6.2: Sitemap & robots.txt

**Files:**
- Verify: `src/app/sitemap.ts` (deja exista)
- Verify: `src/app/robots.ts` (deja exista)

**Steps:**
1. Verifica ca sitemap include toate paginile statice + listings active + categorii
2. Verifica robots.txt — permite crawling pe paginile publice

### Task 6.3: JSON-LD Schema.org

**Obiectiv:** Structured data pe listing detail.

**Files:**
- Modify: `src/app/listings/[id]/page.tsx`

**Steps:**
1. Adauga JSON-LD `Product` schema pe listing detail
2. Testeaza cu Google Rich Results Test

### Task 6.4: Performance & images

**Steps:**
1. Verifica ca toate `<img>` sunt `next/image`
2. Verifica lazy loading pe imagini in browse/listing
3. Ruleaza Lighthouse — target: Performance > 90

### Task 6.5: GDPR compliance

**Files:**
- Verify: `src/app/terms/page.tsx`, `src/app/privacy/page.tsx`

**Steps:**
1. Verifica paginile Terms si Privacy — contin info corecta
2. Adauga cookie banner (daca lipseste)

---

## Backlog (post-launch)

> Aceste features sunt planificate dar NU sunt prioritare. Se implementeaza dupa ce MVP-ul e live si functional.

- **i18n:** next-intl — RO (default), EN, HU, PL, BG, SK, CZ
- **SEO pages programatice:** `/tractoare/cluj`, `/combine/timis` etc.
- **AI categorizare:** Clasificare automata bazata pe titlu + descriere
- **Comparator utilaje:** Side-by-side 2-3 anunturi
- **Dealer tools:** Bulk upload, API dealer, logo, ore program, locatie pe harta
- **App mobil:** React Native / Expo
- **Push notifications mobile**
- **Full-text search avansat:** Autocomplete, suggestions
- **Alerta cautare:** Email cand apare anunt nou matching saved search

---

## Reguli de lucru

### Build & Deploy
- Verifica `npm run build` inainte de orice commit
- Toate paginile cu DB calls → `force-dynamic`
- NU apela DB in `generateStaticParams`
- Supabase + Stripe → lazy init (nu arunca la import time)

### Git
- Commit-uri in engleza: `feat:`, `fix:`, `chore:`, `docs:`
- Un commit per feature/fix
- NU comite `.env`, chei API, date sensibile
- `git status` inainte de commit

### Cod
- TypeScript strict — fara `any` fara motiv
- shadcn/ui pentru UI — nu reinventa
- `next/image` pentru imagini — nu `<img>`
- Supabase client: `src/lib/supabase/client.ts`; server: `src/lib/supabase/server.ts`

### DB
- Schimbari schema → fisier nou in `supabase/migrations/` (format: `00N_descriere.sql`)
- NU modifica migratii existente
- Testeaza RLS policies
- Soft delete (`deleted_at`) — nu sterge date

---

## Environment Variables

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL              # pooler pentru Vercel

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
