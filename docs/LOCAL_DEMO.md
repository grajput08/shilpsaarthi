# ShilpSaarthi — Local Demo Guide

Tribal Artisan CRM POC: a **public WhatsApp-link registration** flow, a **field
verifier PWA**, and an **admin CRM dashboard**, on a fully local Supabase stack.
Everything runs locally — no remote Supabase project and no real WhatsApp/OTP
credentials.

---

## 1. Prerequisites

| Tool | Version used |
|------|--------------|
| Node | 20+ (tested on 22) |
| pnpm | 10.x |
| Docker | running (for local Supabase) |
| Supabase CLI | 2.x |

## 2. First-time setup

```bash
# 1. install dependencies
pnpm install

# 2. local environment (well-known Supabase local demo keys — safe to commit/share)
cp .env.example .env.local

# 3. start the local Supabase stack (Postgres, Auth, Storage, Studio, Inbucket)
supabase start

# 4. apply migrations + seed demo data
supabase db reset

# 5. (optional) regenerate TypeScript types from the schema
pnpm db:types
```

## 3. Run the app

```bash
pnpm dev           # http://localhost:3000
# or a production build:
pnpm build && pnpm start
```

## 4. Local URLs

| Surface | URL |
|---------|-----|
| Landing (links to all three apps) | http://localhost:3000 |
| Public registration | http://localhost:3000/register |
| Field verifier PWA | http://localhost:3000/field |
| Admin CRM dashboard | http://localhost:3000/admin |
| Supabase Studio | http://127.0.0.1:54323 |
| Inbucket (local email) | http://127.0.0.1:54324 |
| Postgres | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` |

## 5. Seeded demo credentials

All demo users share the password **`Password123!`** (local only).

| Role | Email | Where to sign in | Scope |
|------|-------|------------------|-------|
| Admin | `admin@shilpsaarthi.test` | `/login` | All |
| Operator (call-center) | `operator@shilpsaarthi.test` | `/login` | All (read/write artisans) |
| District Officer | `officer@shilpsaarthi.test` | `/login` | Madhya Pradesh / Dindori |
| Field Verifier | `verifier@shilpsaarthi.test` | `/field/login` | Assigned artisans |
| Field Verifier 2 | `verifier2@shilpsaarthi.test` | `/field/login` | Assigned artisans |

> **Field login uses a mock OTP.** Enter the email, tap **Send code**, then use
> code **`123456`** (the demo also shows the code on screen). The OTP provider is
> mocked behind an adapter (`src/lib/adapters/otp.ts`); no SMS is sent.

The seed includes 15 artisans spanning every lifecycle status, craft profiles,
addresses with GPS, products, documents, assignments, verifications, the 8
WhatsApp templates, mocked WhatsApp messages, an auto-detected duplicate
candidate, and an audit trail.

---

## 6. Guided demo flows

### A. Public WhatsApp-link self-registration → Pending Verification
1. Open `/register`.
2. Pick a language → accept consent → fill name + 10-digit mobile → address →
   craft → (optionally attach product photos) → review → **Submit**.
3. You get a confirmation screen with an Artisan ID, and a mock WhatsApp
   confirmation is logged. The artisan is created as **Registration Submitted**
   and transitioned to **Pending Verification**.
4. Sign in as **admin** → **Artisan Registry** → filter status *Pending
   Verification* → the new artisan appears.

### B. Admin assignment → verifier sees the task
1. As **admin**, open a *Pending Verification* artisan (e.g. *Phoolwati Bai*).
2. In **Admin actions → Assign verifier**, choose *Sunita Marko* → **Assign**.
   Status becomes **Assigned to Verifier** and an assignment + audit entry are
   created.
3. Sign out, sign in as **verifier** (`verifier@shilpsaarthi.test`, OTP
   `123456`). The artisan now appears in **Today's Work**.

### C. Field verification (consent → identity → GPS → craft → products → docs → decision)
1. As **verifier**, open an assigned artisan → **Start Verification**.
2. Step through: capture consent, confirm identity (attach a photo), **Capture
   GPS**, confirm craft, capture product photos, check documents.
3. Choose **Verified** → **Submit Verification**.
   - The verification is saved (idempotent), the artisan becomes **Verified**
     (or **Market Ready**), the assignment is completed, a mock WhatsApp status
     update is sent, and an audit entry is written.
   - Drafts autosave on-device; a failed sync lands in the **Sync** tab for retry.

### D. Admin sends a mocked WhatsApp
1. As **admin**, open **WhatsApp Console**.
2. Pick an audience artisan + a template → preview updates live → **Send now**.
3. The message is persisted and appears in the **Message log** and the artisan's
   **WhatsApp timeline**.

### E. Duplicates, reports, audit
- **Duplicates**: open `/admin/duplicates` — a same-phone candidate is
  auto-detected from the seed; choose a master to merge, or dismiss.
- **Reports & Export**: `/admin/reports` → **Export registry CSV** (download is
  itself audited).
- **Audit Log**: `/admin/audit` — full, immutable trail of created/updated/
  status-changed/assigned/whatsapp/verification/approved/export events.

---

## 7. Verification commands

```bash
supabase start                 # start local stack (once)
supabase db reset              # fresh migrations + seed
supabase test db               # pgTAP: constraints, triggers/audit, RLS (24 tests)
supabase db lint               # schema lint
pnpm lint                      # ESLint
pnpm typecheck                 # tsc --noEmit
pnpm test                      # Vitest unit/component (25 tests)
pnpm build                     # Next.js production build
pnpm exec playwright test      # Playwright E2E (6 tests) — needs server on :3100

# one-shot (assumes `supabase start` already ran):
pnpm verify
```

The Playwright config builds + starts the app on port **3100** automatically
(`reuseExistingServer` reuses one if already running).

---

## 8. Architecture notes

- **Next.js 14 (App Router) + TypeScript + Tailwind**, single app with three
  surfaces: `/register` (public), `/field` (PWA), `/admin` (dashboard).
- **Supabase** for Postgres, Auth (email/password + mock OTP), and private
  Storage buckets (`artisan-photos`, `product-photos`, `document-images`).
- **RLS everywhere**, with role + geographic scoping for admin / operator /
  verifier / district officer. Anonymous users never write directly — public
  registration goes through a server route using the service-role key.
- **Mock provider adapters** for WhatsApp (`src/lib/adapters/whatsapp.ts`) and
  OTP (`src/lib/adapters/otp.ts`); WhatsApp messages are persisted to the DB.
- **Audit**: DB triggers record created / updated / status-changed; the app
  writes explicit business-event audit rows (consent, assignment, whatsapp,
  verification, approval, export).

---

## 9. Known limitations (POC scope)

- WhatsApp and OTP are **mocked** behind adapters — no real BSP/SMS integration.
  Messages are stored locally; delivery/read statuses are simulated.
- The "map view" is represented as **district cluster distributions**, not an
  interactive tiled map (avoids external map-tile dependencies for offline use).
- Offline sync uses **localStorage** drafts + a sync queue (sufficient to prove
  the field offline-first UX); a production build would use IndexedDB +
  background sync / service worker.
- Storage objects are private; images render via short-lived signed URLs.
- Bank/payment capture is intentionally minimal per the brief (no full account
  numbers collected).
- CSV export is implemented; Excel/PDF export are out of POC scope.
- Demo auth uses a shared password and a fixed mock OTP for reproducibility.
