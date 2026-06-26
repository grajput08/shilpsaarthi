# ShilpSaarthi — Cloud Deployment

A hosted Supabase project was provisioned and the full schema + seed deployed to
it, and the app is deployed to Vercel. The local stack still works for
development; the **production build** points at the cloud project.

## Live

| | |
|---|---|
| App (Vercel) | https://shilpsaarthi.vercel.app |
| Vercel project | `gatik-abm/shilpsaarthi` |
| GitHub repo | https://github.com/grajput08/shilpsaarthi (public) |

Production env vars set on Vercel (encrypted): `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DEMO_USER_PASSWORD`.
Redeploy with `vercel deploy --prod --scope gatik-abm`.

## Project

| | |
|---|---|
| Name | `shilpsaarthi` |
| Project ref | `rvnpwuflnrweclpxhsfq` |
| API URL | `https://rvnpwuflnrweclpxhsfq.supabase.co` |
| Region | South Asia (Mumbai) · `ap-south-1` |
| Org | `grajput08's Org` (`wlqjpeefmrxkvcitgjsi`) |
| Dashboard | https://supabase.com/dashboard/project/rvnpwuflnrweclpxhsfq |
| Postgres | 17.6 |

The database password was generated during creation and is **not stored in the
repo**. Rotate or retrieve it from the dashboard
(*Project Settings → Database*) if needed.

## What was deployed

- All 4 migrations (`supabase db push`): schema, functions/triggers, RLS, and the
  three private storage buckets.
- The full demo seed (`supabase/seed.sql` applied via the session pooler): 5
  users, 15 artisans across every status, craft/address/product/document rows,
  assignments, verifications, 8 WhatsApp templates, mocked messages, an
  auto-detected duplicate, and the audit trail.

## How the app chooses local vs cloud

Next.js env precedence does the switching automatically:

| Command | Env file used | Backend |
|---------|---------------|---------|
| `pnpm dev` | `.env.local` | **Local** Supabase (`supabase start`) |
| `pnpm build` + `pnpm start` | `.env.production.local` (overrides `.env.local`) | **Cloud** project |

`.env.production.local` holds the cloud URL + anon key + service-role key and is
gitignored. All Supabase access in the app is server-side (Server Components,
Server Actions, the public-registration route), so these are read at runtime —
no rebuild needed to change backend, just the env file.

## Verified against cloud

- `supabase db push` → migrations 0001–0004 applied.
- Seed applied → 15 artisans / 5 profiles / 8 templates / 6 verifications /
  1 duplicate candidate / 31 audit logs.
- Auth: admin / operator / verifier password login → HTTP 200.
- RLS: anonymous read of `artisans` → `[]` (denied).
- Runtime: production build (cloud env) created an artisan via the public
  registration route → row confirmed on the cloud DB, then removed to keep the
  seed pristine.

## Re-deploying / managing

```bash
# the CLI is already linked to this project
supabase db push                       # apply new migrations to cloud
supabase db pull                       # pull remote schema changes
supabase projects api-keys --project-ref rvnpwuflnrweclpxhsfq   # keys

# re-apply the seed (session pooler; needs the DB password):
psql "postgresql://postgres.rvnpwuflnrweclpxhsfq:<DB_PASSWORD>@aws-1-ap-south-1.pooler.supabase.com:5432/postgres" \
  -f supabase/seed.sql
```

## Notes / limitations

- Cloud auth has email confirmations **on** by default; the seeded users are
  inserted pre-confirmed, so password login works. New self-signups via Supabase
  Auth would require confirmation (not used by this POC — registration is via the
  service-role route, and field/admin login uses pre-seeded users).
- WhatsApp/OTP remain mocked behind adapters; messages persist in the cloud DB.
- Storage buckets are private; images use short-lived signed URLs.
