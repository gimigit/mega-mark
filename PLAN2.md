# PLAN2.md — Mega-Mark Nivelul 2

> **Obiectiv:** Transformă Mega-Mark dintr-un marketplace funcțional într-un **platform agricol premium** comparabil cu landwirt.com, agriaffaires.com, mascus.com — dar cu avantaje locale pentru România și Europa de Est.
>
> **Live:** https://mega-mark-five.vercel.app
> **Baza:** PLAN.md (Faza 1-13 ✅ complete)

---

## De ce Nivelul 2?

** Piața agricolă EU crește** (US Agriculture Equipment Market: 300K→345K unități până în 2031, CAGR 2.38%)
** AgriAI se dublează** ( piața $4B până în 2026)
** Competitorii au:** financing, export, dealer verification, video walkarounds

**Ce ne lipsește vs. landwirt/agriaffaires:**
- Financing/Leasing integrat
- Video/3D preview
- Export internațional
- AI price estimation
- App mobil
- Push notifications

---

## 🎯 Faza 14 — Financing & Pagamenti

> **Obiectiv:** Financing integrat — cumparatorul poate aplica pentru leasing/credit direct pe site.
> **Referință:** landwirt.com are "financing" ca feature principal, Deutsche-Leasing oferă flex solutions pentru tractoare.

### Task 14.1: Financing Partner Integration

**Files:**
- Modify: `src/app/listings/[id]/ListingDetailClient.tsx`
- Create: `src/components/FinancingCalculator.tsx`
- Create: `src/app/api/financing/route.ts`

**UX:**
- Buton "Finanțare" pe listing detail (langa "Contactează")
- Calculator interactiv: prețul, avansul (%), perioada (luni), dobânda
- Rezultat lunar: "€350/lună" + "Aplică pentru financing"
- Formular aplicanți: nume, telefon, email, CNP (pentru scor credit)

**Steps:**
1. Creează `FinancingCalculator.tsx` cu inputs: price, downPayment%, termMonths, interestRate
2. Calculează lunar payment: `PMT = P * r(1+r)^n / ((1+r)^n - 1)`
3. Adaugă buton în ListingDetailClient (show doar daca price > 5000 EUR)
4. Creează `/api/financing/apply` — trimite aplicația la email dealer sau în DB pentru review
5. Pentru MVP: forwarding către parteneri externi (sau document "Coming soon")

**Verificare:** Calculator afișează corect lunar price pentru orice combinație.

---

### Task 14.2: Price History Chart

**Obiectiv:** Arată evoluția prețului pentru anunțuri cu price drop — crește încrederea.

**Files:**
- Create: `src/components/PriceHistoryChart.tsx`

**UX:**
- Mini chart pe listing detail: "Istoric preț" — line chart cu 3-6 puncte
- Tooltip la hover: dată + preț
- Badge "Pret redus" dacă current < initial

**Steps:**
1. Adaugă coloana `price_history` (JSON: `[{date, price}]`) în schema
2. La fiecare update de preț, append la array (nu înlocuire)
3. Afișează chart doar dacă are >= 2 entry-uri

**Verificare:** Chart vizibil doar dacă listing are istoric preț.

---

## 🎯 Faza 15 — Video & Media Upgrade

> **Obiectiv:** Video walkaround — cumparatorul poate vedea utilajul în acțiune înainte de vizionare.
> **Referință:** YouTube/video pe landwirt, mascus have video tours.

### Task 15.1: Video Upload Support

**Files:**
- Modify: `src/app/listings/create/page.tsx`
- Modify: `src/lib/upload.ts`

**UX:**
- Upload: images + video (max 100MB, mp4/webm)
- Galerie: poze + icon play pe video thumbnail
- Click → deschide video în lightbox sau embed YouTube

**Steps:**
1. Adaugă video la Supabase Storage bucket (accept: video/mp4, video/webm)
2. În create form: "Adaugă video" — drag & drop, maxim 1 video
3. În `ListingCard` + detail: detect video și afișează play button pe thumbnail
4. Frontend: Video lightbox cu controls (play/pause/seek/volume)

**Verificare:** Video se încarcă, se.playază în browser.

---

### Task 15.2: YouTube/Vimeo Embed

**Obiectiv:** Seller poate adăuga link YouTube/Vimeo pentru video existent.

**Files:**
- Modify: `src/app/listings/create/page.tsx`
- Modify: `src/app/listings/[id]/ListingDetailClient.tsx`

**UX:**
- Field opțional: "Link video (YouTube/Vimeo)"
- Auto-detect și embed în galerie
- Fallback: link click → deschide în tab nou

**Steps:**
1. Adaugă câmp `video_url` în schema
2. Parse: YouTube ID din `youtube.com/watch?v=ID` sau youtu.be/ID
3. Embed cu iframe în detail page

**Verificare:** YouTube link se embed-ează corect.

---

## 🎯 Faza 16 — Export & International

> **Obiectiv:** Shipping internațional — cumparator din DE poate cumpăra cu transport inclus.
> **Referință:** landwirt are "export" service, agriaffaires dealer network international.

### Task 16.1: Export Service Badge

**Obiectiv:** Dealer poate oferi transport internațional.

**Files:**
- Modify: `src/app/listings/create/page.tsx`
- Create: `src/components/ExportBadge.tsx`

**UX:**
- Checkbox: "Transport internațional disponibil"
- Lista țări selectabile (DE, FR, IT, HU, PL, BG, SK, CZ)
- Badge pe card: "🚚 Export"

**Steps:**
1. Adaugă `export_countries` (string[]) în schema
2. În create: checkbox + multi-select țări
3. În ListingCard: afișează badge dacă nu e gol

**Verificare:** Badge vizibil pe carduri cu export.

---

### Task 16.2: Shipping Calculator

**Obiectiv:** Estimare cost transport între țări.

**Files:**
- Create: `src/components/ShippingCalculator.tsx`

**UX:**
- Input: țara de origine → țara de destinație
- Output: estimare km + cost (€/km)
- Contact dealer pentru cotatie exactă

**Steps:**
1. Creează matrix: distanțe între capitalele țărilor (hardcoded sau API)
2. Cost: €1.5/km + fix €200 (fuel, asigurare)
3. Afișează pe /listings/[id] dacă export_countries include destinatia

**Verificare:** Calculator returnează estimare realistă.

---

## 🎯 Faza 17 — AI & Smart Features

> **Obiectiv:** AI-powered features — search, price estimation, recommendations.
> **Referință:** AgriAI market $4B by 2026.

### Task 17.1: AI Price Recommendation

**Obiectiv:** Estimează prețul corect bazat pe similar listings.

**Files:**
- Create: `src/app/api/listings/price-estimate/route.ts`

**UX:**
- Buton "Estimează preț" pe create/edit form
- Afișează range: "€45,000 - €52,000" bazat pe similar listings

**Steps:**
1. Creează endpoint: `/api/listings/price-estimate`
2. Query: similar listings (same category, manufacturer, year±5, hours±2000)
3. Calculează median + quartiles
4. Returnează `{ min, max, median, count }`

**Verificare:** Estimare afișează range corect.

---

### Task 17.2: Smart Recommendations

**Obiectiv:** "Pentru tine" — bazat pe browsing history.

**Files:**
- Modify: `src/app/dashboard/page.tsx`
- Create: `src/components/Recommendations.tsx`

**UX:**
- Sectiune pe dashboard: "Recomandări pentru tine"
- Bazat pe: viewed categories, searched terms, favorite brands
- AI-like (rule-based): similar la ce ai salvat/vizualizat

**Steps:**
1. Salvează în localStorage: viewedListings[], searchedTerms[], favoriteBrands[]
2. Reguli: category = most viewed, manufacturer = most favorited
3. Afișează max 4 listings matching
4. Refresh: la fiecare vizualizare/favorite

**Verificare:** Recomandări relevante pentru user.

---

### Task 17.3: Reverse Image Search

**Obiectiv:** Caută cu poza — încarcă o poză și găsește listings similare.

**Files:**
- Create: `src/components/ImageSearch.tsx`
- Create: `src/app/api/listings/image-search/route.ts`

**UX:**
- Upload poza → afișează top 5 listings cu imagini similare
- Use case: ai văzut un tractor într-o poză și vrei să afli modelul

**Implementation MVP:**
1. Hash imaginea → compară cu hash-uri existente
2. Sau:CLIP embeddings (dacă e disponibile)
3. Pentru MVP: search după dominant color + category filter

**Verificare:** Poate găsi listings cu imagini asemănătoare.

---

## 🎯 Faza 18 — Trust & Verification

> **Obiectiv:** Dealer verificați, warranty, protecție cumpărător.
> **Referință:** OLX "Pro" sellers, autovit verificat.

### Task 18.1: Enhanced Dealer Verification

**Obiectiv:** Dealer verificat vizibil — badge mai prominent + verificare document.

**Files:**
- Modify: `src/components/SellerCard.tsx`
- Modify: `src/app/profile/edit/page.tsx`

**UX:**
- Badge "✓ Verificat" cu icon verificare checkmark (nu simplu check)
- "Verificat de Mega-Mark" sub nume
- Tooltip: "Dealer autorizat [marcă], verificat 2026"
- Upload documente: certificate înregistrare, CUI

**Steps:**
1. Adaugă `verification_level`: 'none' | 'basic' | 'premium' | 'verified'
2. Adaugă `verified_brands` (manufacturer_id[])
3. În SellerCard: afișează badge colorat (gold pentru verified)
4. În profile edit: upload documente verificare

**Verificare:** Badge colorat pe dealer verificate.

---

### Task 18.2: Buyer Protection Badge

**Obiectiv:** Protecție la cumpărare — "Garanție Mega-Mark" pentru listings verificate.

**Files:**
- Create: `src/components/BuyerProtectionBadge.tsx`

**UX:**
- Badge "🛡️ Garanție" pe anunțuri de dealeri verificati
- Popup: "Ce include: verificare dealer, istoric pret, transport asigurat"

**Steps:**
1. Adaugă flag `buyer_protection` pe listing (dealer opt-in)
2. Afișează badge pe card + detail

**Verificare:** Badge vizibil doar pentru dealeri.

---

### Task 18.3: Listing Quality Score

**Obiectiv:** Scor calitate anunț — ajută cumparatorul să evalueze.

**Files:**
- Modify: `src/components/ListingCard.tsx`
- Create: `src/lib/listingQuality.ts`

**UX:**
- Scor 0-100 pe card: "Calitate: 85/100"
- Factors: poze (20pt), descriere (20pt), specificatii (20pt), pret competitiv (20pt), video (20pt)
- Color: verde >80, galben 60-80, roșu <60

**Steps:**
1. Creează funcție `calculateQualityScore(listing)`
2. Afișează pe ListingCard (colț dreapta-sus)
3. Tooltip detalii: care factori lipsesc

**Verificare:** Scor calculat corect pentru orice listing.

---

## 🎯 Faza 19 — Mobile & PWA

> **Obiectiv:** App mobil sau PWA — пользователи pot accesa rapid.
> **Referință:** landwirt are app în App Store/Play Store (130K+ listings).

### Task 19.1: PWA Configuration

**Obiectiv:** Instalează ca app pe telefon.

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `public/manifest.json`
- Create: `public/icon-192.png`, `public/icon-512.png`

**Steps:**
1. Creează manifest.json cu name, short_name, icons, theme_color
2. Adaugă `<link rel="manifest" href="/manifest.json">` în layout
3. Service worker pentru offline caching (poze vizualizate)
4. Verifică "Add to Home Screen" în Chrome/Safari

**Verificare:** Se instalează ca PWA pe mobil.

---

### Task 19.2: Mobile Optimizations

**Obiectiv:** UX optimizat pentru touch.

**UX:**
- Swipe between images în carousel
- Pull-to-refresh pe browse
- Bottom navigation (hamburger → tabs: Caută, Favorite, Mesaje, Profil)
- Faster images (WebP, lazy loading agresiv)

**Files:**
- Modify: `src/components/ListingCard.tsx`
- Modify: `src/app/browse/BrowseClient.tsx`

**Steps:**
1. Swipe pe image gallery (useSwipeable sau Framer Motion)
2. Pull-to-refresh: React RefreshControl sau similar
3. Bottom tabs pe mobile (hidden pe desktop)

**Verificare:** Swipe funcționează pe mobil.

---

## 🎯 Faza 20 — Advanced Engagement

> **Obiectiv:** Alte engagement features — alerts, sharing, social.

### Task 20.1: Price Drop Alert

**Obiectiv:** Notificare când prețul scade la un listing favoritat.

**Files:**
- Modify: `src/app/api/notifications/email/route.ts`
- Create: `src/components/PriceDropToggle.tsx`

**UX:**
- Buton "Alerte preț" pe listing (heart-alike dar pentru price)
- Toggle: "Anunță-mă la scădere de preț"
- Email când price < previous -5%

**Steps:**
1. Adaugă `price_alert_users` (user_id[]) în listing
2. În cron: verifică price changes
3. Trimite email la users cu alert activ

**Verificare:** Alert se activează, email se trimite.

---

### Task 20.2: Social Share Enhancement

**Obiectiv:** Share mai bun — Facebook, WhatsApp, email cu imagine.

**Files:**
- Modify: `src/components/ShareButton.tsx`

**UX:**
- Modal cu butoane mari: WhatsApp, Facebook, Email, Copy link
- Preview imagine + titlu în share dialog
- OG image deja configurată - folosește-o

**Steps:**
1. Expand ShareButton modal
2. WhatsApp: `wa.me/?text=...`
3. Facebook: sharer.php
4. Email: `mailto:?subject=...&body=...`

**Verificare:** Share funcționează pe toate platformele.

---

### Task 20.3: QR Code Listing

**Obiectiv:** QR code pe listing — scanează și accesează de pe telefon.

**Files:**
- Create: `src/components/ListingQRCode.tsx`

**UX:**
- Buton "QR Code" în listing detail
- Generate QR cu URL listing
- Print option pentru dealer

**Steps:**
1. Adaugă库 `qrcode` sau `react-qr-code`
2. Generează QR cu current URL
3. Afișează în modal

**Verificare:** QR code scanează corect.

---

## 🎯 Faza 21 — Maps & Location

> **Obiectiv:** Vedere pe hartă — clustere de listings per regiune.
> **Referință:** OLX maps, Google Maps clusters.

### Task 21.1: Map View Clusters

**Obiectiv:** Browse map cu clustere — vezi densitate per judet/regiune.

**Files:**
- Create: `src/components/MapClusters.tsx`
- Modify: `src/app/browse/BrowseClient.tsx`

**UX:**
- Toggle "Hartă" în browse (pe lângă Grid/List)
- Mapbox sau Google Maps cu markers
- Cluster la zoom out: "42 anunțuri în Cluj"
- Click cluster → zoom in, click marker → detail

**Steps:**
1. Adaugă coordinates pe listings (geocoding din location_city)
2. Afișează markers pe map
3. Cluster cu supercluster sau similar

**Verificare:** Map afișează correct.

---

### Task 21.2: Distance Filter

**Obiectiv:** Filtru rază km de la locația userului.

**Files:**
- Modify: `src/app/browse/BrowseClient.tsx`

**UX:**
- Filtru: "În max X km de [locatie]"
- Use geolocation API pentru poziția userului
- Calculează distanța haversine

**Steps:**
1. Get user location (navigator.geolocation)
2. Filtrare: distance <= X km
3. Sortare: cele mai aproape primele

**Verificare:** Filtru funcționează.

---

## 🎯 Faza 22 — Admin & Operations

> **Obiectiv:** Admin îmbunătățit — analytics, bulk actions.

### Task 22.1: Dashboard Analytics

**Obiectiv:** Stats avansate pe admin — trends, GEO distribution.

**Files:**
- Modify: `src/app/admin/page.tsx`

**UX:**
- Charts: listings over time, by category, by region
- Revenue (din Stripe dacă e activ)
- User growth chart

**Steps:**
1. Adaugă chart library (chart.js sau recharts)
2. Query aggregate pentru stats
3. Afișează cu grafic

**Verificare:** Stats afișate corect.

---

### Task 22.2: Bulk Actions

**Obiectiv:** Admin poate face bulk delete/flag/archive.

**Files:**
- Modify: `src/app/admin/listings/page.tsx`

**UX:**
- Checkbox pe fiecare listing
- Bulk: "Șterge selectate", "Flag ca verificate", "Arhivează"
- Confirm dialog

**Steps:**
1. Adaugă select mode
2. Batch API: `/api/admin/listings/bulk-action`
3. Execute + refresh

**Verificare:** Bulk actions funcționează.

---

## 📋 Prioritizare MVP (Nivel 2)

| Priority | Feature | Complexitate | Impact |
|----------|---------|--------------|--------|
| **P1** | Financing Calculator | Medie | High (conversie) |
| **P2** | Video Upload/Embed | Medie | High (engagement) |
| **P3** | Export Badge | Mică | Medie |
| **P4** | AI Price Estimate | Medie | High (trust) |
| **P5** | Dealer Verification | Mică | High (trust) |
| **P6** | PWA | Mare | Medie |
| **P7** | Map Clusters | Mare | Medie |
| **P8** | Price Drop Alert | Medie | Medie |
| **P9** | Buyer Protection | Mică | Medie |
| **P10** | Quality Score | Mică | Medie |

---

## 📊 Milestones

### Milestone 14.1: Financing (1 săpt.)
- Financing calculator integrat
- Price history chart

### Milestone 15.1: Video (1 săpt.)
- Video upload support
- YouTube embed

### Milestone 16.1: Export (1 săpt.)
- Export badge
- Shipping calculator

### Milestone 17.1: AI Features (2 săpt.)
- Price estimate
- Recommendations
- Image search (optional)

### Milestone 18.1: Trust (1 săpt.)
- Enhanced verification
- Buyer protection
- Quality score

### Milestone 19.1: Mobile (1 săpt.)
- PWA config
- Mobile optimizations

### Milestone 20.1: Engagement (1 săpt.)
- Price drop alert
- Social share
- QR code

### Milestone 21.1: Maps (1 săpt.)
- Map clusters
- Distance filter

### Milestone 22.1: Admin (1 săpt.)
- Analytics
- Bulk actions

---

## ✅ Actiuni Manuale

- Stripe financing API key (dacă oferim direct) → Vercel Dashboard
- Mapbox/Google Maps API key → Vercel Dashboard
- PWA icons → generate și adăugat în /public
- Resend API key → Vercel (pentru notifications)

---

## Status

| Faza | Status |
|-----|--------|
| Faza 14 | ✅ Financing Calculator + Price History |
| Faza 15 | ✅ Video Upload + YouTube/Vimeo Embed |
| Faza 16 | ✅ Export Badge + Shipping Calculator |
| Faza 17 | 🔄 In Progress |
| Faza 18 | ✅ Listing Quality Score |
| Faza 19 | ❌ |
| Faza 20 | ✅ Social Share |
| Faza 21 | ❌ |
| Faza 22 | ❌ |

**Start:** 
**← INCEPE AICI →**