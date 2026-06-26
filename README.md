# ShilpSaarthi — Tribal Artisan CRM (POC)

Identify, onboard, verify and manage tribal artisans — a verified registry with
photos, craft details, location, documents, products and verification status.

Three surfaces, one Next.js app on Supabase:

- **Public WhatsApp-link registration** (`/register`) — mobile-first self-registration.
- **Field Verifier PWA** (`/field`) — offline-first verification on low-end Android.
- **Admin CRM Dashboard** (`/admin`) — registry, verification queue, assignments,
  field team, WhatsApp console, duplicate management, reports/export, audit log.

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind · Supabase (Postgres + Auth +
Storage, full RLS) · Vitest · Playwright · pgTAP.

## Quick start (local)

```bash
pnpm install
cp .env.example .env.local
supabase start
supabase db reset          # migrations + demo seed
pnpm dev                   # http://localhost:3000
```

Demo users share password `Password123!`; field verifiers use mock OTP `123456`.

| Role | Email | Entry |
|------|-------|-------|
| Admin | `admin@shilpsaarthi.test` | `/login` |
| Operator | `operator@shilpsaarthi.test` | `/login` |
| District Officer | `officer@shilpsaarthi.test` | `/login` |
| Field Verifier | `verifier@shilpsaarthi.test` | `/field/login` |

## Verify

```bash
pnpm verify   # db reset · pgTAP · db lint · lint · typecheck · vitest · build · playwright e2e
```

## Docs

- [docs/LOCAL_DEMO.md](docs/LOCAL_DEMO.md) — full setup, credentials, demo flows, limitations.
- [docs/CLOUD_DEPLOYMENT.md](docs/CLOUD_DEPLOYMENT.md) — hosted Supabase deployment.
- [FINAL_VERIFICATION_REPORT.md](FINAL_VERIFICATION_REPORT.md) — verification proof + acceptance checklist.
- [docs/Tribal_Artisan_CRM_POC.md](docs/Tribal_Artisan_CRM_POC.md) — product brief / PRD.

> POC notes: WhatsApp and OTP are mocked behind adapters (messages are persisted);
> demo auth uses a shared password and a fixed mock OTP for reproducibility.

🤖 Built with [Claude Code](https://claude.com/claude-code).
