-- =============================================================================
-- Migration 0002: helper functions + triggers
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Role / scope helpers (SECURITY DEFINER so they can read profiles under RLS)
-- -----------------------------------------------------------------------------
create or replace function public.current_app_role()
returns public.app_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.current_app_role() = 'admin', false);
$$;

create or replace function public.is_operator()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.current_app_role() = 'operator', false);
$$;

create or replace function public.is_verifier()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.current_app_role() = 'verifier', false);
$$;

create or replace function public.is_district_officer()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.current_app_role() = 'district_officer', false);
$$;

create or replace function public.profile_state()
returns text language sql stable security definer set search_path = public as $$
  select state from public.profiles where id = auth.uid();
$$;

create or replace function public.profile_district()
returns text language sql stable security definer set search_path = public as $$
  select district from public.profiles where id = auth.uid();
$$;

-- Geo / role visibility used by artisan-scoped tables.
create or replace function public.can_access_geo(p_state text, p_district text)
returns boolean language sql stable security definer set search_path = public as $$
  select case
    when public.is_admin() or public.is_operator() then true
    when public.is_district_officer() then
      (public.profile_state() is not distinct from p_state)
      and (public.profile_district() is null
           or public.profile_district() is not distinct from p_district)
    else false
  end;
$$;

-- Is the current user the verifier assigned to this artisan?
create or replace function public.is_assigned_verifier(p_artisan uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.assignments a
    where a.artisan_id = p_artisan
      and a.verifier_id = auth.uid()
      and a.status in ('assigned', 'in_progress', 'completed')
  ) or exists (
    select 1 from public.artisans ar
    where ar.id = p_artisan and ar.assigned_verifier = auth.uid()
  );
$$;

-- Convenience: full artisan visibility predicate (admin / geo / assigned verifier).
create or replace function public.can_view_artisan(p_artisan uuid, p_state text, p_district text)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_admin()
      or public.can_access_geo(p_state, p_district)
      or public.is_assigned_verifier(p_artisan);
$$;

-- -----------------------------------------------------------------------------
-- updated_at maintenance
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'profiles','artisans','addresses','craft_profiles','products','documents',
    'assignments','verifications','whatsapp_templates','whatsapp_messages',
    'duplicate_candidates'
  ] loop
    execute format(
      'create trigger %I_set_updated_at before update on public.%I
         for each row execute function public.set_updated_at();',
      t, t);
  end loop;
end $$;

-- -----------------------------------------------------------------------------
-- artisan_code / product_code generation
-- -----------------------------------------------------------------------------
create or replace function public.set_artisan_code()
returns trigger language plpgsql as $$
begin
  if new.artisan_code is null then
    new.artisan_code := 'ART-' || to_char(now(), 'YYYY') || '-' ||
      lpad(nextval('public.artisan_code_seq')::text, 5, '0');
  end if;
  return new;
end;
$$;
create trigger artisans_set_code before insert on public.artisans
  for each row execute function public.set_artisan_code();

create or replace function public.set_product_code()
returns trigger language plpgsql as $$
begin
  if new.product_code is null then
    new.product_code := 'PRD-' ||
      lpad(nextval('public.product_code_seq')::text, 6, '0');
  end if;
  return new;
end;
$$;
create trigger products_set_code before insert on public.products
  for each row execute function public.set_product_code();

-- -----------------------------------------------------------------------------
-- Generic audit trigger — records created / updated / status_changed
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
    if v_entity = 'artisan' and new.status is distinct from old.status then
      v_action := 'status_changed';
    else
      v_action := 'updated';
    end if;
  else -- DELETE
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

create trigger artisans_audit
  after insert or update or delete on public.artisans
  for each row execute function public.tg_audit('artisan');

create trigger verifications_audit
  after insert or update or delete on public.verifications
  for each row execute function public.tg_audit('verification');

create trigger assignments_audit
  after insert or update or delete on public.assignments
  for each row execute function public.tg_audit('assignment');

-- -----------------------------------------------------------------------------
-- Auto-detect duplicate candidates on artisan insert (same phone / name+village)
-- -----------------------------------------------------------------------------
create or replace function public.tg_detect_duplicates()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- same phone number
  if new.phone is not null then
    insert into public.duplicate_candidates (artisan_id, match_artisan_id, signal, score)
    select new.id, a.id, 'same_phone', 0.900
    from public.artisans a
    where a.id <> new.id
      and a.phone = new.phone
      and a.status not in ('rejected', 'duplicate')
    on conflict (artisan_id, match_artisan_id, signal) do nothing;
  end if;

  -- same name + same village
  if new.village is not null then
    insert into public.duplicate_candidates (artisan_id, match_artisan_id, signal, score)
    select new.id, a.id, 'same_name_village', 0.650
    from public.artisans a
    where a.id <> new.id
      and lower(a.full_name) = lower(new.full_name)
      and lower(coalesce(a.village,'')) = lower(coalesce(new.village,''))
      and a.status not in ('rejected', 'duplicate')
    on conflict (artisan_id, match_artisan_id, signal) do nothing;
  end if;

  -- raise duplicate_risk flag on the new record if any candidate found
  update public.artisans
    set duplicate_risk = 'high'
  where id = new.id
    and exists (select 1 from public.duplicate_candidates d where d.artisan_id = new.id);

  return new;
end;
$$;

create trigger artisans_detect_duplicates
  after insert on public.artisans
  for each row execute function public.tg_detect_duplicates();

-- -----------------------------------------------------------------------------
-- Auto-provision a profile row when an auth user is created
-- (idempotent: seed scripts may insert the profile explicitly afterwards)
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce((new.raw_user_meta_data ->> 'role')::public.app_role, 'operator')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
