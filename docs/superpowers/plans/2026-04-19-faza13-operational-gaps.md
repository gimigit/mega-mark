# Faza 13 — Operational Gaps Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Completează funcționalitățile implementate în Faza 9-10 care au cod dar lipsesc din UI / nu sunt configurate operațional.

**Architecture:** 3 task-uri independente: (1) UI bump în Dashboard, (2) vercel.json cron config, (3) database.ts types fix + migration note. Fiecare task e un commit separat.

**Tech Stack:** Next.js 15, TypeScript, Supabase, Vercel Cron, Zustand

---

### Task 13.1: Bump button în Dashboard — tab "Anunțurile mele"

**Context:** API PATCH `/api/listings/[id]/bump` există și funcționează (cooldown 24h). UI există pe listing detail (pentru owner). Lipsește în Dashboard → tab listings.

**Files:**
- Modify: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Citește structura listing card din dashboard**

Deschide `src/app/dashboard/page.tsx`, găsește secțiunea unde se randează listing-urile owner-ului (tab `listings`). Caută pattern-ul de render al fiecărui listing (are butoane Edit/Delete).

- [ ] **Step 2: Adaugă state pentru bump**

În componenta Dashboard, adaugă state pentru tracking bump loading și cooldown per listing:

```tsx
const [bumpingId, setBumpingId] = useState<string | null>(null)
const [bumpedIds, setBumpedIds] = useState<Set<string>>(new Set())
```

- [ ] **Step 3: Adaugă funcția handleBump**

```tsx
const handleBump = async (listingId: string, updatedAt: string) => {
  const hoursSince = (Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60)
  if (hoursSince < 24) {
    toast.error('Poți face bump o singură dată la 24 de ore')
    return
  }
  setBumpingId(listingId)
  try {
    const res = await fetch(`/api/listings/${listingId}/bump`, { method: 'PATCH' })
    if (res.ok) {
      setBumpedIds(prev => new Set([...prev, listingId]))
      toast.success('Anunțul a fost reactualizat!')
      // Refresh listings
      const { data } = await supabase.from('listings').select('*, categories(name, slug)').eq('seller_id', user!.id).order('updated_at', { ascending: false })
      if (data) setListings(data)
    } else {
      const err = await res.json()
      toast.error(err.error || 'Eroare la reactualizare')
    }
  } finally {
    setBumpingId(null)
  }
}
```

- [ ] **Step 4: Adaugă butonul în card-ul de listing**

Găsește în JSX butonul "Edit" din listings tab și adaugă lângă el:

```tsx
<button
  onClick={() => handleBump(listing.id, listing.updated_at)}
  disabled={bumpingId === listing.id || bumpedIds.has(listing.id)}
  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-200 dark:border-amber-800 disabled:opacity-50 transition-colors"
  title="Reactualizează anunțul (1/zi gratuit)"
>
  {bumpingId === listing.id ? (
    <span className="animate-pulse">Se actualizează...</span>
  ) : bumpedIds.has(listing.id) ? (
    '✓ Reactualizat'
  ) : (
    '↑ Reactualizează'
  )}
</button>
```

- [ ] **Step 5: Build check**

```bash
cd ~/projects/mega-mark && npm run build
```
Expected: `✓ Compiled successfully`

- [ ] **Step 6: Commit**

```bash
git add src/app/dashboard/page.tsx
git commit -m "feat: add bump button in dashboard listings tab (Task 13.1)"
```

---

### Task 13.2: vercel.json cu cron jobs

**Context:** 3 cron routes există dar nu sunt configurate să ruleze automat:
- `/api/cron/expire-ads` — marchează listings ca expired
- `/api/cron/check-expiring-ads` — trimite email avertizare
- `/api/cron/check-saved-searches` — trimite email alertă căutare

Fără `vercel.json`, aceste cron-uri nu rulează niciodată.

**Files:**
- Create: `vercel.json`

- [ ] **Step 1: Creează vercel.json**

```json
{
  "crons": [
    {
      "path": "/api/cron/expire-ads",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/check-expiring-ads",
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/cron/check-saved-searches",
      "schedule": "0 * * * *"
    }
  ]
}
```

Explicație schedule:
- `expire-ads`: la 02:00 UTC zilnic
- `check-expiring-ads`: la 09:00 UTC zilnic (email de avertizare)
- `check-saved-searches`: în fiecare oră (`:00`)

- [ ] **Step 2: Adaugă CRON_SECRET în PLAN.md ca acțiune manuală**

Deschide `PLAN.md`, secțiunea "Actiuni manuale necesare", adaugă:
```
- ⚠️ **CRON_SECRET** — setează env var `CRON_SECRET=<random_string>` în Vercel Dashboard (Production + Preview) pentru securizarea cron-urilor
- ⚠️ **Migration 010** — aplică manual `supabase/migrations/010_listing_reports.sql` în Supabase SQL Editor (tabelul `listing_reports`)
```

- [ ] **Step 3: Build check**

```bash
cd ~/projects/mega-mark && npm run build
```
Expected: `✓ Compiled successfully`

- [ ] **Step 4: Commit**

```bash
git add vercel.json PLAN.md
git commit -m "chore: add vercel.json with cron schedule for expire-ads + search alerts (Task 13.2)"
```

---

### Task 13.3: Fix database.ts — adaugă listing_reports type

**Context:** `listing_reports` tabela există în DB (migration 010) și e folosită în 4 fișiere, dar nu e în `src/types/database.ts`. TypeScript nu prinde erori deoarece Supabase client returnează `any` pentru tabele necunoscute. Adăugăm tipul manual pentru type safety.

**Files:**
- Modify: `src/types/database.ts`

- [ ] **Step 1: Găsește locul în database.ts**

Deschide `src/types/database.ts`, găsește secțiunea `Tables:` și găsește un tabel existent ca model (ex: `favorites`).

- [ ] **Step 2: Adaugă `listing_reports` în Tables**

Găsește în `database.ts` secțiunea cu tabelele (după `Tables: {`) și adaugă înainte de `listings:`:

```typescript
        listing_reports: {
          Row: {
            id: string
            listing_id: string
            user_id: string | null
            reason: string
            description: string | null
            status: string
            reviewed_by: string | null
            reviewed_at: string | null
            created_at: string
          }
          Insert: {
            id?: string
            listing_id: string
            user_id?: string | null
            reason: string
            description?: string | null
            status?: string
            reviewed_by?: string | null
            reviewed_at?: string | null
            created_at?: string
          }
          Update: {
            id?: string
            listing_id?: string
            user_id?: string | null
            reason?: string
            description?: string | null
            status?: string
            reviewed_by?: string | null
            reviewed_at?: string | null
            created_at?: string
          }
          Relationships: []
        }
```

- [ ] **Step 3: Build check**

```bash
cd ~/projects/mega-mark && npm run build
```
Expected: `✓ Compiled successfully`

- [ ] **Step 4: Commit**

```bash
git add src/types/database.ts
git commit -m "chore: add listing_reports TypeScript type to database.ts (Task 13.3)"
```

---

### Task 13.4: Push și verificare Vercel

- [ ] **Step 1: Push la origin**

```bash
git push origin main
```

- [ ] **Step 2: Notează acțiuni manuale**

Comunică utilizatorului că trebuie:
1. `CRON_SECRET=<random>` setat în Vercel Dashboard → Settings → Environment Variables
2. Migration 010 aplicată în Supabase SQL Editor:
   ```sql
   -- Conținut din supabase/migrations/010_listing_reports.sql
   ```
