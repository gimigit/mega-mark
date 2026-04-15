# PLAN.md — Mega-Mark Agricultural Marketplace

> **For Hermes:** Use `structured-project-execution` skill. Execute task-by-task, verify each step, update status here.
>
> **Cum sa lucrezi:**
> 1. Citeste tot PLAN.md inainte sa incepi
> 2. Gaseste markerul `← INCEPE AICI` — acolo e urmatoarea faza
> 3. Executa task-urile in ordine (Task N.1, N.2, ...)
> 4. Dupa fiecare task: ruleaza `npm run build` si verifica ca trece
> 5. Commit + push dupa fiecare task completat (format: `feat:`, `fix:`, `chore:`)
> 6. Marcheaza task-ul `✅` in acest fisier si muta `← INCEPE AICI` la urmatorul task/faza
> 7. Daca un task necesita actiune manuala (ex: Supabase Dashboard, Stripe Dashboard), scrie clar ce trebuie facut si treci la urmatorul task
>
> **Working directory:** `~/projects/mega-mark`
> **Test local:** `npm run dev` (port 3000)
> **Build check:** `npm run build`
> **Push:** `git push origin main` (Vercel rebuilds automat)

**Goal:** Marketplace agricol premium pentru Romania si UE — tractoare, combine, utilaje agricole.

**Stack:** Next.js 16 App Router · TypeScript · Supabase (direct, fara Prisma) · shadcn/ui · Tailwind · Stripe · Resend · Vercel

**Repo:** https://github.com/gimigit/mega-mark
**Live:** https://mega-mark-five.vercel.app

---

## Status curent (15 Aprilie 2026)

**Build:** ✅ Trece local (`npm run build`)
**Deploy:** ✅ Live pe https://mega-mark-five.vercel.app (auto-deploy din `main`)
**DB:** ✅ Schema rulata pe Supabase (proiect existent, env vars setate pe Vercel)

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

## ✅ Faza 1 — Database & Deploy (COMPLETA)

> Supabase configurat, schema rulata, env vars setate, deploy pe Vercel functional.
> Site live: https://mega-mark-five.vercel.app

- ✅ Task 1.1: Supabase project creat, schema rulata
- ✅ Task 1.2: Environment variables setate (Vercel)
- ✅ Task 1.3: Deploy Vercel functional, auto-deploy din `main`
- [ ] Task 1.4: Seed data — verifica ca `/api/seed` populeaza categorii + manufacturers, creeaza 3-5 listings de test

**NOTA pentru Hermes:** Storage bucket `listings` (public, 5MB, image/jpeg+png+webp) si Realtime pe tabelele `messages` + `notifications` — verifica in Supabase Dashboard ca sunt active. Daca nu, mentioneaza in output ca ownerul trebuie sa le activeze manual.

---

## Faza 2 — Auth & Core Flow ← INCEPE AICI

> **Obiectiv:** User poate crea cont, posta anunt cu poze, alt user il gaseste.
> **Referinta UX:** OLX.ro — signup simplu, formular clar, browse cu filtre laterale.

### Task 2.1: Fix auth flow

**Obiectiv:** Register → Login → Dashboard functioneaza end-to-end.

**Files:**
- Verify: `src/app/login/page.tsx`, `src/app/signup/page.tsx`
- Verify: `src/app/auth/callback/route.ts`
- Verify: `src/lib/supabase/middleware.ts`

**Steps:**
1. Testeaza signup cu email → verifica ca profile se creeaza automat (trigger `handle_new_user`)
2. Testeaza login cu email + parola
3. Verifica ca `/dashboard` e protejat (redirect la login daca nu e autentificat)
4. Testeaza logout
5. Adauga in Navbar: daca user e logat, arata avatar/numele + "Contul meu" + "Adauga anunt" (buton verde). Daca nu e logat, arata "Autentificare" + "Inregistrare"

**Verificare:** User nou: signup → login → vede dashboard cu Navbar actualizat → logout → Navbar revine la starea de guest

### Task 2.2: Listing create flow (stil OLX)

**Obiectiv:** Formular de creare anunt complet, cu upload poze si preview.

**Files:**
- Modify: `src/app/listings/create/page.tsx`
- Verify: `src/app/api/listings/route.ts` (POST)
- Verify: `src/lib/upload.ts`

**UX inspirat OLX:**
- Formular pe o singura pagina (nu multi-step) cu sectiuni vizuale: Categorie, Detalii, Poze, Pret, Locatie
- Upload poze: drag & drop + click, preview thumbnails, reordonare, minim 1 poza obligatorie, max 10
- Selectie categorie: dropdown cu iconite (din tabel `categories`)
- Selectie producator: dropdown (din tabel `manufacturers`)
- Campuri specifice agricole: An fabricatie, Ore functionare, CP (putere), Stare (nou/folosit/refurbished)
- Pret: input + selectie moneda (RON/EUR) + checkbox "Pret negociabil"
- Locatie: dropdown judet/oras (Romania-first) sau tara UE
- Preview anunt inainte de publicare

**Steps:**
1. Verifica ca formularul existent acopera campurile de mai sus
2. Daca lipsesc campuri (producator, ore, CP), adauga-le
3. Testeaza upload imagini in Supabase Storage — verifica ca se salveaza in `listings/{user_id}/`
4. Adauga preview inainte de submit
5. Dupa publicare → redirect la pagina anuntului

**Verificare:** Create listing cu poze → apare in Browse → Edit → poza se schimba → Delete/Archive

### Task 2.3: Browse & Search (stil OLX)

**Obiectiv:** Browse page cu filtre laterale, sortare, paginare — ca OLX.

**Files:**
- Modify: `src/app/browse/page.tsx`, `src/app/browse/BrowseClient.tsx`

**UX inspirat OLX:**
- **Layout 2 coloane:** filtre stanga (sidebar) + listings dreapta (grid sau lista)
- **Filtre sidebar:**
  - Categorie (radio buttons cu count per categorie)
  - Producator/Marca (dropdown sau checkboxes — John Deere, Case IH, etc.)
  - Pret: min-max (inputuri) + toggle RON/EUR
  - An fabricatie: min-max
  - Ore functionare: min-max
  - Stare: Nou / Folosit / Refurbished (checkboxes)
  - Locatie: Judet dropdown (Romania) sau Tara (UE)
- **Sortare:** Cele mai recente, Pret crescator, Pret descrescator, Cele mai vizualizate
- **Paginare:** Numbered pages (1, 2, 3... 25)
- **Listing card OLX-style:** Poza stanga, detalii dreapta (pe list view) sau card vertical (pe grid view)
- **Toggle view:** Grid (carduri) / Lista (randuri ca pe OLX)
- **Active filters:** Chips vizuale cu X de stergere (ex: "Categorie: Tractoare ✕")
- **Rezultate count:** "234 anunturi gasite"
- **Anunturi promovate:** Primele in lista, cu badge "Promovat" vizibil

**Steps:**
1. Verifica ca BrowseClient are filtrele de mai sus (deja are categorii, tari, pret — adauga ce lipseste: producator, an, ore, stare)
2. Adauga toggle Grid/Lista view
3. Adauga "X rezultate gasite" count
4. Verifica ca filtrele se reflecta in URL (query params) — ca sa poti share link cu filtre
5. Verifica paginare functionala
6. Fix search box pe Homepage — form submit redirect la `/browse?keyword=...`

**Verificare:** Browse cu filtre → URL se actualizeaza → refresh pastreaza filtrele → paginare merge → search din Homepage duce la Browse

### Task 2.4: Listing card imbunatatit (stil OLX)

**Obiectiv:** Card de anunt cu toate informatiile relevante la prima vedere.

**Files:**
- Modify: `src/components/ListingCard.tsx`

**Ce arata un card pe OLX:**
- Poza principala (thumbnail)
- Titlu (bold, max 2 linii)
- Pret + moneda + badge "Negociabil" daca e cazul
- Locatie (oras, judet)
- Data publicarii sau "Reactualizat azi"
- Specs relevante: An, Ore, km (inline, text mic)
- Badge "Promovat" (daca e featured)
- Buton Save/Favorite (heart icon, top-right pe poza)

**Steps:**
1. Adauga data publicarii pe card (format relativ: "acum 2 ore", "ieri", "14 apr")
2. Adauga locatie completa (oras + judet, nu doar tara)
3. Adauga buton favorite (heart icon) direct pe card, deasupra pozei
4. Inlocuieste `<img>` cu `next/image` (performance)
5. Adauga lista view variant (poza stanga, detalii dreapta — layout orizontal)

**Verificare:** Card-ul arata: poza, titlu, pret, locatie, data, specs, badge featured, heart favorite

### Task 2.5: Listing detail page (stil OLX)

**Obiectiv:** Pagina completa de detaliu anunt.

**Files:**
- Modify: `src/app/listings/[id]/page.tsx`
- Modify: `src/app/listings/[id]/ListingDetailClient.tsx`

**UX inspirat OLX — layout 2 coloane:**

**Coloana stanga (70%):**
- Galerie foto: poza mare + thumbnails jos, click pentru fullscreen/lightbox
- Titlu anunt (H1, bold)
- Pret mare + moneda + "Negociabil" badge
- Data publicarii + numar vizualizari
- Breadcrumbs: Home > Categorie > Anunt
- Descriere completa
- Specificatii tehnice (tabel sau grid): An, Ore, CP, Stare, Transmisie, Greutate, Tip motor

**Coloana dreapta (30%, sticky):**
- Seller card: avatar, nume, "Membru din ...", rating, numar anunturi active, badge "Verificat"
- Buton "Afiseaza telefon" (PhoneReveal — click-to-show, ca pe OLX)
- Buton "Trimite mesaj" → deschide chat/form
- Buton "Adauga la favorite" (heart)
- Buton "Distribuie" (share: copy link, WhatsApp)
- Buton "Raporteaza anuntul"
- Locatie pe harta mica (MapView daca are coordonate)

**Sub anunt:**
- "Anunturi similare" — 3-4 anunturi din aceeasi categorie/producator

**Steps:**
1. Verifica layout-ul curent si adauga ce lipseste din lista de mai sus
2. Adauga lightbox pe galeria foto (click pe poza → fullscreen cu sageata stanga/dreapta)
3. Adauga sectiune specificatii tehnice (tabel cu chei-valori din campurile listing)
4. Adauga breadcrumbs: Home > {category.name} > {listing.title}
5. Adauga "Anunturi similare" (query: aceeasi categorie, exclude current, limit 4)
6. Verifica PhoneReveal, ShareButton, favorite toggle

**Verificare:** Detail page arata complet cu galerie, specs, seller card sticky, anunturi similare

---

## Faza 3 — Mesagerie & Comunicare

> **Obiectiv:** Buyer poate contacta seller, mesagerie interna, notificari.
> **Referinta UX:** OLX Chat — mesaje instant pe anunt.

### Task 3.1: Conversations API

**Obiectiv:** Backend complet pentru mesagerie.

**Files:**
- Create: `src/app/api/conversations/route.ts` (GET list, POST create)
- Create: `src/app/api/conversations/[id]/route.ts` (GET detail cu mesaje)
- Create: `src/app/api/conversations/[id]/messages/route.ts` (POST send)
- Create: `src/app/api/conversations/[id]/read/route.ts` (POST mark read)

**Steps:**
1. GET `/api/conversations` — lista conversatii ale userului curent, ordered by `last_message_at DESC`, include: listing title + thumbnail, celalalt user name + avatar, last message preview, unread count
2. POST `/api/conversations` — creeaza conversatie noua (body: `{ listing_id, message }`). Daca exista deja conversatie intre buyer si seller pe acel listing, adauga mesajul la conversatia existenta
3. GET `/api/conversations/[id]` — mesajele conversatiei, ordered by `created_at ASC`, include: sender name + avatar
4. POST `/api/conversations/[id]/messages` — trimite mesaj nou, actualizeaza `last_message_preview` si `last_message_at` pe conversatie
5. POST `/api/conversations/[id]/read` — seteaza `buyer_unread=0` sau `seller_unread=0` (in functie de cine e userul curent)

**Verificare:** Create conversation → GET listeaza → send message → GET arata mesajul → mark read → unread count = 0

### Task 3.2: Inbox page + Chat UI

**Obiectiv:** Pagina de mesaje cu lista conversatii si chat.

**Files:**
- Create: `src/app/dashboard/messages/page.tsx`
- Modify: `src/components/ChatWindow.tsx` (conecteaza la API)
- Modify: `src/components/MessageBubble.tsx`

**UX:**
- Layout 2 coloane: lista conversatii (stanga) + chat activ (dreapta)
- Lista conversatii: avatar seller/buyer, nume, listing thumbnail mic, preview ultimul mesaj, timestamp, badge unread
- Chat: mesaje in bule (stanga/dreapta), input text + send button
- Pe mobile: lista full-width, click → chat full-width cu back button
- Badge unread total in Navbar pe iconita Chat

**Steps:**
1. Creeaza pagina `/dashboard/messages` cu layout-ul descris
2. Conecteaza ChatWindow la API conversations
3. Adauga badge unread in Navbar (numar total mesaje necitite)
4. Butonul "Trimite mesaj" de pe listing detail → creeaza/deschide conversatia

**Verificare:** Listing detail → "Trimite mesaj" → se deschide conversatia → reply → badge unread pe celalalt user

### Task 3.3: Saved searches API

**Obiectiv:** User salveaza cautari favorite.

**Files:**
- Create: `src/app/api/saved-searches/route.ts` (GET, POST, DELETE)
- Create: `src/app/dashboard/saved-searches/page.tsx`

**Steps:**
1. API: GET list, POST create (`{ name, filters }`), DELETE by id
2. Pe browse page: buton "Salveaza cautarea" (apare dupa ce ai setat filtre)
3. Pagina `/dashboard/saved-searches` — lista cautari salvate, click → redirect la browse cu filtrele respective
4. Link in Dashboard navigation

**Verificare:** Browse cu filtre → "Salveaza cautarea" → apare in dashboard → click → browse cu filtrele

### Task 3.4: Auth me API

**Obiectiv:** Endpoint pentru profil user curent.

**Files:**
- Create: `src/app/api/auth/me/route.ts`

**Steps:**
1. GET `/api/auth/me` — returneaza profilul complet din `profiles` table
2. Foloseste `supabase.auth.getUser()` + join pe `profiles`

**Verificare:** GET cu auth → profil complet; GET fara auth → 401

---

## Faza 4 — Engagement & Trust

> **Obiectiv:** Features care construiesc incredere: reviews, favorites, notifications, profil public.
> **Referinta UX:** OLX — profil seller cu rating, badge verificat, istoric.

### Task 4.1: Favorites system

**Obiectiv:** User poate salva anunturi favorite si le vede intr-o pagina dedicata.

**Files:**
- Create: `src/app/dashboard/favorites/page.tsx`
- Modify: `src/components/ListingCard.tsx` (heart icon functional)
- Verify: `src/app/api/favorites/route.ts`

**Steps:**
1. Heart icon pe ListingCard: click → toggle favorite (API call), filled/outline state
2. Heart icon pe listing detail: same behavior
3. Pagina `/dashboard/favorites` — grid de ListingCards (doar cele salvate)
4. Daca userul nu e logat si da click pe heart → redirect la login
5. Adauga link "Favorite" in Navbar (heart icon + count)

**Verificare:** Click heart → filled → apare in favorites page → click again → unfilled → dispare din favorites

### Task 4.2: Seller profile page (stil OLX)

**Obiectiv:** Profil public vanzator cu incredere si transparenta.

**Files:**
- Modify: `src/app/sellers/[id]/page.tsx`
- Modify: `src/app/sellers/[id]/SellerProfileClient.tsx`

**UX inspirat OLX:**
- Header: Avatar mare, nume, "Membru din {data}", locatie
- Badges: "Verificat" (daca `is_verified`), "Dealer" (daca `is_dealer`)
- Stats bar: Rating mediu (stele), numar reviews, numar anunturi active
- Tab 1: Anunturi active (grid de ListingCards)
- Tab 2: Reviews (ReviewsList)
- Sidebar: buton "Contacteaza", telefon (PhoneReveal), link WhatsApp

**Steps:**
1. Verifica ca pagina seller arata informatiile de mai sus
2. Adauga tabs (Anunturi / Reviews)
3. Adauga "Membru din" (format: "Membru din martie 2026")
4. Adauga stats bar cu rating, reviews count, listings count

**Verificare:** Seller profile arata: info completa, anunturi, reviews, rating

### Task 4.3: Reviews system

**Obiectiv:** Buyeri pot lasa review pe seller dupa o tranzactie/interactiune.

**Files:**
- Verify: `src/app/api/reviews/route.ts`
- Verify: ReviewForm, ReviewCard, ReviewsList

**Steps:**
1. ReviewForm pe seller profile: rating (1-5 stele click), titlu, comentariu
2. Doar useri autentificati pot lasa review (nu pe tine insuti)
3. Un review per buyer per listing (UNIQUE constraint exista in DB)
4. Dupa submit → review apare in lista, rating_avg se actualizeaza (trigger DB)
5. ReviewCard: stele, titlu, comentariu, autor, data

**Verificare:** Buyer lasa review → apare pe seller profile → rating_avg se schimba

### Task 4.4: Notifications (in-app + email)

**Obiectiv:** Userul e notificat la evenimente importante.

**Files:**
- Modify: `src/components/NotificationBell.tsx`
- Modify: `src/components/NotificationDropdown.tsx`
- Verify: `src/lib/email.ts`, `src/emails/*`

**Notificari in-app (Supabase Realtime pe tabel `notifications`):**
- Mesaj nou primit
- Review nou primit
- Anunt expirat / aproape de expirare
- Anunt promovat cu succes

**Notificari email (Resend):**
- Welcome la signup
- Mesaj nou (daca userul nu e online)
- Listing publicat
- Listing aproape de expirare (3 zile inainte)

**Steps:**
1. Conecteaza NotificationBell la Supabase Realtime: subscribe pe `notifications` where `user_id = current_user`
2. Afiseaza badge count (numar unread)
3. Click bell → dropdown cu ultimele 10 notificari
4. Click pe notificare → marcheaza citita + redirect la resursa (mesaj, listing, review)
5. Configureaza RESEND_API_KEY si testeaza trimiterea emailurilor

**Verificare:** Mesaj nou → bell badge +1 → click → dropdown arata notificarea → click → redirect la conversatie

---

## Faza 5 — Monetizare & Admin

> **Obiectiv:** Stripe functional, promovare anunturi, admin dashboard.

### Task 5.1: Stripe setup

**Obiectiv:** Stripe configurat cu produse si preturi.

**Steps:**
1. Creeaza produse in Stripe Dashboard: "Promovare 7 zile" (15 RON), "Promovare 30 zile" (45 RON)
2. Seteaza env vars: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_7_DAYS`, `STRIPE_PRICE_30_DAYS`
3. Configureaza webhook local: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
4. **NOTA:** Aceasta e actiune manuala a ownerului — Hermes nu poate accesa Stripe Dashboard

**Verificare:** Env vars setate, webhook events apar in terminal

### Task 5.2: Promovare anunt flow (stil OLX "Promoveaza")

**Obiectiv:** User plateste sa-si promoveze anuntul — apare primul in rezultate.

**Files:**
- Create: `src/app/listings/[id]/promote/page.tsx`
- Verify: `src/app/api/stripe/checkout/route.ts`
- Verify: `src/app/api/stripe/webhook/route.ts`

**UX:**
- Pe listing detail (daca e al tau): buton "Promoveaza anuntul"
- Click → pagina `/listings/[id]/promote` cu 2 optiuni: 7 zile (15 RON), 30 zile (45 RON)
- Selectie → redirect la Stripe Checkout
- Dupa plata → redirect inapoi cu success message
- Webhook: `checkout.session.completed` → seteaza `is_featured=true`, `featured_until=NOW()+7/30 days`
- Pe ListingCard: badge "Promovat" vizibil
- In Browse: anunturile promovate apar primele (ORDER BY `is_featured DESC, created_at DESC`)

**Steps:**
1. Creeaza pagina promote cu cele 2 optiuni
2. Verifica checkout API route → creeaza Stripe session cu price_id corect
3. Verifica webhook → actualizeaza listing in DB
4. Verifica ca Browse ordoneaza featured first
5. Adauga cron job: expira promotii (`is_featured=false` cand `featured_until < NOW()`) — verifica ca exista deja in `/api/cron/expire-ads`

**Verificare:** Promote → Stripe checkout (test card 4242...) → listing devine featured → apare sus in Browse → dupa expirare → revine normal

### Task 5.3: Admin dashboard

**Obiectiv:** Admin gestioneaza platforma.

**Files:**
- Verify: `src/app/admin/page.tsx`
- Verify: `src/app/api/admin/*`

**Dashboard admin include:**
- Stats: total users, total listings, active listings, revenue (promoted), users today
- Tabel anunturi: status, seller, data, actiuni (approve, archive, delete)
- Tabel useri: email, rol, data inregistrare, numar anunturi, actiuni (verify, ban)
- Acces restrictionat: doar useri cu `role='admin'`

**Steps:**
1. **ACTIUNE MANUALA:** Owner seteaza admin: `UPDATE profiles SET role='admin' WHERE email='...'`
2. Verifica ca `/admin` afiseaza stats si tabele
3. Verifica ca non-admin primeste redirect sau 403
4. Testeaza actiunile: approve/archive listing, verify user

**Verificare:** Admin → dashboard cu date reale; Non-admin → acces refuzat

---

## Faza 6 — SEO, Performance & Launch

> **Obiectiv:** Site optimizat pentru Google, rapid, GDPR compliant — gata de launch.

### Task 6.1: Meta tags & Open Graph

**Obiectiv:** Fiecare pagina rankeaza bine si arata bine cand e share-uita.

**Files:**
- Modify: `src/app/layout.tsx` (metadata globala)
- Verify: listing detail, browse, seller profile — metadata dinamica

**Steps:**
1. Homepage: title "Mega-Mark — Utilaje Agricole Romania si UE", description cu keywords
2. Browse: title dinamic "Tractoare de vanzare | Mega-Mark" (bazat pe filtru activ)
3. Listing detail: title = "{listing.title} | Mega-Mark", og:image = prima poza, og:price
4. Seller profile: title = "{seller.name} — Vanzator | Mega-Mark"

**Verificare:** View page source → meta tags corecte pe fiecare pagina

### Task 6.2: Sitemap & robots.txt

**Files:**
- Verify: `src/app/sitemap.ts`, `src/app/robots.ts`

**Steps:**
1. Sitemap include: homepage, browse, toate listings active (URL + lastmod + poza), categorii, sellers
2. robots.txt: Allow pe tot ce e public, Disallow pe /dashboard, /admin, /api
3. Adauga `<link rel="sitemap" href="/sitemap.xml">` in layout

**Verificare:** `/sitemap.xml` listeaza pagini reale; `/robots.txt` e corect

### Task 6.3: JSON-LD Schema.org

**Files:**
- Modify: `src/app/listings/[id]/page.tsx`

**Steps:**
1. Adauga JSON-LD `Product` schema pe listing detail: name, description, image, price, currency, condition, seller, availability
2. Adauga JSON-LD `WebSite` cu `SearchAction` pe homepage (pentru Google search box)

**Verificare:** Google Rich Results Test → valid

### Task 6.4: Performance

**Steps:**
1. Inlocuieste TOATE `<img>` cu `next/image` (ListingCard deja are `<img>` — trebuie schimbat)
2. Adauga `loading="lazy"` pe imagini sub fold
3. Verifica ca fontul Inter se incarca cu `display: swap`
4. Ruleaza Lighthouse pe homepage, browse, listing detail — target: Performance > 85

**Verificare:** Lighthouse Performance > 85 pe mobile

### Task 6.5: GDPR & Legal

**Files:**
- Verify: `src/app/terms/page.tsx`, `src/app/privacy/page.tsx`
- Create: `src/components/CookieBanner.tsx`

**Steps:**
1. Actualizeaza Terms si Privacy cu informatii Mega-Mark (nu AgroMark EU — deja rebranded)
2. Creeaza CookieBanner: bar in footer "Folosim cookies..." cu Accept/Reject, salveaza preferinta in localStorage
3. Adauga CookieBanner in layout.tsx
4. Adauga link "Cum sa te feresti de fraude" in footer (trust element, ca OLX)

**Verificare:** Cookie banner apare la prima vizita → Accept → nu mai apare; Terms/Privacy au info corecta

---

## Backlog (post-launch)

> Aceste features se implementeaza dupa ce MVP-ul e live, testat si are useri reali.

**Prioritate medie (urmatoarele 2-3 luni):**
- **SEO pages programatice:** `/tractoare/cluj`, `/combine/timis` — pagini generate pentru fiecare combinatie categorie × judet, cu meta tags si content unic
- **Alerta cautare:** Email automat cand apare anunt nou matching saved search
- **"Reactualizat azi":** Buton pe listing → bumps `updated_at`, reapare sus in rezultate (feature OLX)
- **Report listing:** Buton "Raporteaza" pe listing detail → salveaza in DB → admin review
- **Currency toggle:** RON / EUR pe browse (ca OLX — switch in header)

**Prioritate scazuta (6+ luni):**
- **i18n:** next-intl — RO (default), EN, HU, PL, BG, SK, CZ
- **AI categorizare:** Clasificare automata bazata pe titlu + descriere
- **Comparator utilaje:** Side-by-side 2-3 anunturi
- **Dealer tools:** Bulk upload, API dealer, logo, ore program, locatie pe harta
- **App mobil:** React Native / Expo
- **Push notifications mobile
- **Full-text search avansat:** Autocomplete cu suggestions din titluri existente

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
