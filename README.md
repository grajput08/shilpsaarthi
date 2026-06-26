# ShilpSaarthi — Tribal Artisan CRM (POC)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fgrajput08%2Fshilpsaarthi&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY,DEMO_USER_PASSWORD&envDescription=Supabase%20cloud%20URL%2Fkeys%20%2B%20demo%20password&envLink=https%3A%2F%2Fgithub.com%2Fgrajput08%2Fshilpsaarthi%2Fblob%2Fmain%2Fdocs%2FCLOUD_DEPLOYMENT.md)

**Live demo:** https://shilpsaarthi.vercel.app · **Repo:** https://github.com/grajput08/shilpsaarthi

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

## Deploy (Vercel)

The app is a Next.js server app backed by the hosted Supabase project. Two ways:

**One click:** use the **Deploy with Vercel** button above and paste the four env
vars when prompted (values are in your local `.env.production.local`):

```
NEXT_PUBLIC_SUPABASE_URL        https://rvnpwuflnrweclpxhsfq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY   <anon key>
SUPABASE_SERVICE_ROLE_KEY       <service-role key>   # server-only
DEMO_USER_PASSWORD              Password123!
```

**CLI:**

```bash
vercel login            # one-time, interactive
vercel link             # or: vercel --yes to create a project
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add DEMO_USER_PASSWORD production
vercel --prod           # build + deploy
```

The hosted Supabase project (schema + seed) is already live, so the deploy needs
no DB setup. See [docs/CLOUD_DEPLOYMENT.md](docs/CLOUD_DEPLOYMENT.md).

## Docs

- [docs/LOCAL_DEMO.md](docs/LOCAL_DEMO.md) — full setup, credentials, demo flows, limitations.
- [docs/CLOUD_DEPLOYMENT.md](docs/CLOUD_DEPLOYMENT.md) — hosted Supabase deployment.
- [FINAL_VERIFICATION_REPORT.md](FINAL_VERIFICATION_REPORT.md) — verification proof + acceptance checklist.
- [docs/Tribal_Artisan_CRM_POC.md](docs/Tribal_Artisan_CRM_POC.md) — product brief / PRD.

> POC notes: WhatsApp and OTP are mocked behind adapters (messages are persisted);
> demo auth uses a shared password and a fixed mock OTP for reproducibility.

🤖 Built with [Claude Code](https://claude.com/claude-code).
