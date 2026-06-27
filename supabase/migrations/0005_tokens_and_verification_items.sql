-- =============================================================================
-- Migration 0005: registration tokens, per-field verification items,
-- admin-override on final decision, and the 'public_link' registration source.
-- =============================================================================

-- New registration source for token-based public links.
alter type public.registration_source add value if not exists 'public_link';

-- Per-item verification status (field/section level).
create type public.verification_item_status as enum (
  'pending', 'verified', 'corrected', 'rejected', 'cancelled', 'not_applicable'
);

create type public.registration_token_status as enum (
  'active', 'used', 'revoked', 'expired'
);

-- -----------------------------------------------------------------------------
-- registration_tokens — blank/prefilled public registration links
-- -----------------------------------------------------------------------------
create table public.registration_tokens (
  id          uuid primary key default gen_random_uuid(),
  token       text not null unique,
  status      public.registration_token_status not null default 'active',
  prefill     jsonb not null default '{}'::jsonb,
  created_by  uuid references public.profiles (id) on delete set null,
  artisan_id  uuid references public.artisans (id) on delete set null,
  expires_at  timestamptz,
  used_at     timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index registration_tokens_token_idx  on public.registration_tokens (token);
create index registration_tokens_status_idx on public.registration_tokens (status);

-- -----------------------------------------------------------------------------
-- verifications: admin override flag for the final-decision rule
-- -----------------------------------------------------------------------------
alter table public.verifications
  add column admin_override boolean not null default false;

-- -----------------------------------------------------------------------------
-- verification_items — field/section level verification outcomes
-- -----------------------------------------------------------------------------
create table public.verification_items (
  id              uuid primary key default gen_random_uuid(),
  verification_id uuid not null references public.verifications (id) on delete cascade,
  artisan_id      uuid not null references public.artisans (id) on delete cascade,
  item_key        text not null,
  item_label      text not null,
  status          public.verification_item_status not null default 'pending',
  note            text,
  evidence_path   text,
  verified_by     uuid references public.profiles (id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (verification_id, item_key)
);
create index verification_items_verification_idx on public.verification_items (verification_id);
create index verification_items_artisan_idx      on public.verification_items (artisan_id);

-- updated_at maintenance
create trigger registration_tokens_set_updated_at before update on public.registration_tokens
  for each row execute function public.set_updated_at();
create trigger verification_items_set_updated_at before update on public.verification_items
  for each row execute function public.set_updated_at();

-- audit verification_items (reuses the generic audit trigger)
create trigger verification_items_audit
  after insert or update or delete on public.verification_items
  for each row execute function public.tg_audit('verification_item');

-- -----------------------------------------------------------------------------
-- Enforce: cannot mark a verification 'verified' (Fully Verified) while any of
-- its items are rejected/cancelled, unless admin_override is set.
-- -----------------------------------------------------------------------------
create or replace function public.tg_enforce_verification_decision()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.decision = 'verified' and coalesce(new.admin_override, false) = false then
    if exists (
      select 1 from public.verification_items vi
      where vi.verification_id = new.id and vi.status in ('rejected', 'cancelled')
    ) then
      raise exception 'Cannot set Fully Verified while items are rejected/cancelled without admin override'
        using errcode = 'check_violation';
    end if;
  end if;
  return new;
end;
$$;

create trigger verifications_enforce_decision
  before insert or update on public.verifications
  for each row execute function public.tg_enforce_verification_decision();

-- -----------------------------------------------------------------------------
-- Fix the generic audit trigger: read `status` via jsonb so it is safe for
-- tables without a status column (e.g. verifications, which are now UPDATEd).
-- -----------------------------------------------------------------------------
create or replace function public.tg_audit()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_entity text := tg_argv[0];
  v_action public.audit_action;
  v_old jsonb;
  v_new jsonb;
  v_id  text;
begin
  if tg_op = 'INSERT' then
    v_action := 'created';
    v_new := to_jsonb(new);
    v_id  := new.id::text;
  elsif tg_op = 'UPDATE' then
    v_old := to_jsonb(old);
    v_new := to_jsonb(new);
    v_id  := new.id::text;
    if v_entity = 'artisan' and (v_new->>'status') is distinct from (v_old->>'status') then
      v_action := 'status_changed';
    else
      v_action := 'updated';
    end if;
  else
    v_action := 'deleted';
    v_old := to_jsonb(old);
    v_id  := old.id::text;
  end if;

  insert into public.audit_logs (
    entity_type, entity_id, action, actor_id, actor_role, old_value, new_value, source
  ) values (
    v_entity, v_id, v_action, auth.uid(),
    (select role::text from public.profiles where id = auth.uid()),
    v_old, v_new,
    coalesce(current_setting('app.audit_source', true), 'system')
  );

  return coalesce(new, old);
end;
$$;

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------
alter table public.registration_tokens enable row level security;
alter table public.verification_items  enable row level security;

-- registration_tokens: CRM staff manage; the public form uses the service role
-- (which bypasses RLS), so no anon policy is needed.
create policy registration_tokens_select on public.registration_tokens
  for select to authenticated
  using (public.is_admin() or public.is_operator() or public.is_district_officer());
create policy registration_tokens_insert on public.registration_tokens
  for insert to authenticated
  with check (public.is_admin() or public.is_operator() or public.is_district_officer());
create policy registration_tokens_update on public.registration_tokens
  for update to authenticated
  using (public.is_admin() or public.is_operator() or public.is_district_officer())
  with check (public.is_admin() or public.is_operator() or public.is_district_officer());
create policy registration_tokens_delete on public.registration_tokens
  for delete to authenticated using (public.is_admin());

-- verification_items: visible to whoever can see the artisan; writable by admin
-- or the assigned verifier.
create policy verification_items_select on public.verification_items
  for select to authenticated
  using (public.can_read_artisan(artisan_id));
create policy verification_items_write on public.verification_items
  for all to authenticated
  using (public.is_admin() or public.is_assigned_verifier(artisan_id))
  with check (public.is_admin() or public.is_assigned_verifier(artisan_id));
