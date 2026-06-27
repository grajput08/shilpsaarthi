# FINAL VERIFICATION REPORT — ShilpSaarthi (single-domain, path-separated)

**Date:** 2026-06-27
**Result:** ✅ ALL ACCEPTANCE CHECKS PASS — one app, one server/deploy, path-separated routes.

The POC is a **single Next.js app on one port** (no 3-port split). Routing:

| Route | Purpose | Auth |
|-------|---------|------|
| `/`, `/dashboard`, `/crm` | CRM admin (login → dashboard/registry) | redirects to `/admin` → `/login` |
| `/a/form?id=<token>` | Public artisan registration form | **none** (token-gated, no CRM UI) |
| `/verifier`, `/verifier/login` | Mobile verifier PWA | **verifier only** |

Local URL: **http://localhost:3000** (E2E/prod build runs on **http://127.0.0.1:3100**).

---

## 1. Acceptance commands (run locally) — all green

| Command | Result | Evidence |
|---|---|---|
| `supabase db reset` | ✅ exit 0 | `Finished supabase db reset on branch main` |
| `supabase db lint` | ✅ | `No schema errors found` |
| `pnpm lint` | ✅ | `✔ No ESLint warnings or errors` |
| `pnpm typecheck` | ✅ | `tsc --noEmit` exit 0 |
| `pnpm test` | ✅ | **6 files · 30 tests passed** (Vitest) |
| `pnpm build` | ✅ | `BUILD OK` (Next.js 14, all routes compiled) |
| `pnpm test:e2e` | ✅ | **6 passed** (Playwright: 5 desktop + 1 mobile) |
| `supabase test db` (bonus, pgTAP) | ✅ | **4 files · 30 assertions passed** |

### Playwright E2E (the required flow) — 6 passed

```
✓ CRM admin generates a unique blank registration link (no name/phone)
✓ public link needs no login, shows no CRM UI, and creates a Pending Verification record
✓ admin assigns the artisan to a verifier; verifier sees the task
✓ verifier edits a field, cancels an item, and Fully Verified is blocked without override
✓ CRM shows verification items + audit log, and admin override fully verifies
✓ verifier PWA works on a mobile viewport (Pixel 5)
```

### pgTAP — 30 assertions across 4 files

```
./01_constraints.sql ................ ok
./02_triggers_audit.sql ............. ok
./03_rls.sql ........................ ok      # admin/operator/verifier/district/anon scoping
./04_tokens_verification_items.sql .. ok      # tokens, item uniqueness, Fully-Verified rule, override
All tests successful. Files=4, Tests=30, Result: PASS
```

### Vitest — 30 tests

```
✓ src/lib/format.test.ts (9) · src/lib/template.test.ts (3) · src/lib/token.test.ts (3)
✓ src/lib/validation.test.ts (9) · src/components/badges.test.tsx (4)
✓ src/app/a/form/RegistrationForm.test.tsx (2)
```

---

## 2. Acceptance criteria → evidence

| # | Criterion | Status / how |
|---|-----------|--------------|
| 1 | Admin logs in, sees dashboard/registry, generates a link with **no name/phone** (optional prefill) | ✅ `/admin/links` → "Generate blank link"; `createRegistrationToken` requires nothing; prefill optional. E2E test 1. |
| 2 | Link is same host, public path `/a/form?id=<token>`, no CRM UI, no login | ✅ token URL `…/a/form?id=<token>`; page validated via service role; E2E clears cookies, asserts form shown + "Artisan Registry" absent. |
| 3 | Public submit → CRM shows record, status **Pending Verification**, source **Public Link** | ✅ API sets `registration_source='public_link'`, status `pending_verification`, marks token `used`. E2E asserts registry row + "Public Link". |
| 4 | `/verifier` is a separate mobile PWA on same host, verifier login only, no CRM nav | ✅ `/verifier/(secure)` requires role `verifier`; unauth → `/verifier/login`; mobile E2E asserts no "Artisan Registry". |
| 5 | Roles separated, enforced server-side / RLS (not just UI) | ✅ `requireProfile` server checks + RLS policies (pgTAP `03_rls` proves verifier/operator/officer/anon scoping). |
| 6 | Verifier can edit any field; mark items verified/corrected/rejected/cancelled/NA; notes/evidence; final status; **Fully Verified blocked if any rejected/cancelled unless admin override** | ✅ `verification_items` table + per-item UI; rule enforced in server action **and** a DB trigger (`tg_enforce_verification_decision`); pgTAP test 4 + E2E test 4/5. |
| 7 | Supabase DB/Auth/Storage; tables present | ✅ `artisans, registration_tokens, assignments, verifications, verification_items, whatsapp_messages, audit_logs, profiles` (+craft/addresses/products/documents/duplicate_candidates). |
| 8 | Mock WhatsApp — CRM "sends" link/reminders by saving to Supabase | ✅ `sendRegistrationLink` + WhatsApp console persist to `whatsapp_messages`; no real provider. |
| 9 | Tests prove the full flow incl. verification items + audit | ✅ Playwright `poc.spec.ts` (the exact flow) + pgTAP + Vitest. |
| 10 | Run all commands locally, fix failures | ✅ all pass (table above). Fixes: storage fresh-init guard, `tg_audit` jsonb-safe status, stale `.temp` version pins. |

---

## 3. Seeded logins (local)

Password for all: **`Password123!`**. Verifier login at `/verifier/login` uses mock OTP **`123456`**.

| Role | Email | Entry |
|------|-------|-------|
| Admin | `admin@shilpsaarthi.test` | `/login` |
| Operator | `operator@shilpsaarthi.test` | `/login` |
| District Officer | `officer@shilpsaarthi.test` | `/login` |
| Field Verifier | `verifier@shilpsaarthi.test` | `/verifier/login` |

Seed also includes 2 demo registration tokens and verification items (one with a rejected item to demo the override rule).

---

## 4. Key changes (reused existing code)

- **Migration `0005_tokens_and_verification_items.sql`**: `registration_tokens`, `verification_items`, `verifications.admin_override`, `public_link` source, enforcement trigger, RLS, and a jsonb-safe `tg_audit` fix.
- **Routes**: `field/` → `verifier/`; root/`/dashboard`/`/crm` → `/admin`; new `/a/form` (token) + `/admin/links`; `/register` retired.
- **CRM**: `createRegistrationToken` / `sendRegistrationLink` actions, `LinksManager`, `VerificationItems` panel + `overrideVerification`.
- **Verifier**: rewritten `VerifyFlow` (edit fields + per-item statuses + notes/evidence + GPS + final decision rule); submit writes `verification_items`.

---

## 5. Live deployment (same single app)

- App: **https://shilpsaarthi.vercel.app** (Vercel `gatik-abm/shilpsaarthi`)
- Backend: cloud Supabase `rvnpwuflnrweclpxhsfq` (migration 0005 applied via `supabase db push`)
- Repo: **https://github.com/grajput08/shilpsaarthi** (public)
- Live smoke: `/`,`/dashboard`,`/crm` → CRM; `/verifier` → `/verifier/login`; `/a/form?id=invalid` → public "link invalid" (no login); `POST /api/public/register` without token → `400`.

---

## 6. `git status` — changed-file summary (48 entries)

```
M  .gitignore, src/lib/auth.ts, src/lib/domain.ts, src/lib/validation.ts (+test),
   src/app/page.tsx, src/app/manifest.ts, src/app/login/{page,actions},
   src/app/admin/actions.ts, src/app/admin/registry/[id]/page.tsx,
   src/app/api/public/register/route.ts, src/components/admin/AdminNav.tsx,
   src/components/field/*, supabase/migrations/0004_storage.sql, supabase/seed.sql,
   src/lib/supabase/database.types.ts, e2e/helpers.ts, e2e/poc.spec.ts
R  src/app/field/** -> src/app/verifier/**  (route rename, ~12 files)
R  src/app/register/RegistrationForm.* -> src/app/a/form/RegistrationForm.*
R  e2e/field.mobile.spec.ts -> e2e/verifier.mobile.spec.ts
?? src/app/a/form/page.tsx, src/app/admin/links/, src/app/crm/, src/app/dashboard/,
   src/components/admin/{LinksManager,VerificationItems}.tsx, src/lib/token.ts (+test),
   supabase/migrations/0005_tokens_and_verification_items.sql,
   supabase/tests/04_tokens_verification_items.sql, .vercelignore
```

Totals: **5 migrations · 4 pgTAP files (30 assertions) · 6 Vitest files (30 tests) · 2 Playwright specs (6 tests)**.
