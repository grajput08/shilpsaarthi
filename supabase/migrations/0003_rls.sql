-- =============================================================================
-- Migration 0003: Row Level Security
--
-- Roles:
--   admin            — full access
--   operator         — call-center; create/read/update artisans + child data
--                      across all geographies; cannot manage verification ops
--   verifier         — field worker; sees only assigned artisans, writes
--                      verification + child data for them
--   district_officer — scoped to their state (+ optional district)
--
-- Anonymous (public registration) never touches these tables directly: it goes
-- through a server route using the service-role key, which bypasses RLS.
-- =============================================================================

-- Artisan visibility predicate used across child tables.
create or replace function public.can_read_artisan(p_artisan uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_admin()
      or public.is_assigned_verifier(p_artisan)
      or exists (
        select 1 from public.artisans a
        where a.id = p_artisan
          and public.can_access_geo(a.state, a.district)
      );
$$;

-- Enable RLS everywhere.
alter table public.profiles             enable row level security;
alter table public.artisans             enable row level security;
alter table public.addresses            enable row level security;
alter table public.craft_profiles       enable row level security;
alter table public.products             enable row level security;
alter table public.documents            enable row level security;
alter table public.assignments          enable row level security;
alter table public.verifications        enable row level security;
alter table public.whatsapp_templates   enable row level security;
alter table public.whatsapp_messages    enable row level security;
alter table public.audit_logs           enable row level security;
alter table public.duplicate_candidates enable row level security;

-- -----------------------------------------------------------------------------
-- profiles
-- -----------------------------------------------------------------------------
create policy profiles_select on public.profiles
  for select to authenticated
  using (true);  -- names/roles are needed across the app

create policy profiles_insert on public.profiles
  for insert to authenticated
  with check (public.is_admin());

create policy profiles_update on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

create policy profiles_delete on public.profiles
  for delete to authenticated
  using (public.is_admin());

-- -----------------------------------------------------------------------------
-- artisans
-- -----------------------------------------------------------------------------
create policy artisans_select on public.artisans
  for select to authenticated
  using (
    public.is_admin()
    or public.can_access_geo(state, district)
    or public.is_assigned_verifier(id)
  );

create policy artisans_insert on public.artisans
  for insert to authenticated
  with check (
    public.is_admin()
    or public.is_operator()
    or (public.is_district_officer() and public.can_access_geo(state, district))
  );

create policy artisans_update on public.artisans
  for update to authenticated
  using (
    public.is_admin()
    or public.is_operator()
    or public.is_assigned_verifier(id)
    or (public.is_district_officer() and public.can_access_geo(state, district))
  )
  with check (
    public.is_admin()
    or public.is_operator()
    or public.is_assigned_verifier(id)
    or (public.is_district_officer() and public.can_access_geo(state, district))
  );

create policy artisans_delete on public.artisans
  for delete to authenticated
  using (public.is_admin());

-- -----------------------------------------------------------------------------
-- Child tables (addresses, craft_profiles, products, documents)
-- mirror artisan visibility.
-- -----------------------------------------------------------------------------
create policy addresses_all on public.addresses
  for all to authenticated
  using (public.can_read_artisan(artisan_id))
  with check (public.can_read_artisan(artisan_id));

create policy craft_profiles_all on public.craft_profiles
  for all to authenticated
  using (public.can_read_artisan(artisan_id))
  with check (public.can_read_artisan(artisan_id));

create policy products_all on public.products
  for all to authenticated
  using (public.can_read_artisan(artisan_id))
  with check (public.can_read_artisan(artisan_id));

create policy documents_all on public.documents
  for all to authenticated
  using (public.can_read_artisan(artisan_id))
  with check (public.can_read_artisan(artisan_id));

-- -----------------------------------------------------------------------------
-- assignments
-- -----------------------------------------------------------------------------
create policy assignments_select on public.assignments
  for select to authenticated
  using (
    public.is_admin()
    or verifier_id = auth.uid()
    or exists (
      select 1 from public.artisans a
      where a.id = artisan_id and public.can_access_geo(a.state, a.district)
    )
  );

create policy assignments_insert on public.assignments
  for insert to authenticated
  with check (
    public.is_admin()
    or (public.is_district_officer() and exists (
          select 1 from public.artisans a
          where a.id = artisan_id and public.can_access_geo(a.state, a.district)))
  );

create policy assignments_update on public.assignments
  for update to authenticated
  using (
    public.is_admin()
    or verifier_id = auth.uid()
    or (public.is_district_officer() and exists (
          select 1 from public.artisans a
          where a.id = artisan_id and public.can_access_geo(a.state, a.district)))
  )
  with check (
    public.is_admin()
    or verifier_id = auth.uid()
    or (public.is_district_officer() and exists (
          select 1 from public.artisans a
          where a.id = artisan_id and public.can_access_geo(a.state, a.district)))
  );

create policy assignments_delete on public.assignments
  for delete to authenticated
  using (public.is_admin());

-- -----------------------------------------------------------------------------
-- verifications
-- -----------------------------------------------------------------------------
create policy verifications_select on public.verifications
  for select to authenticated
  using (public.can_read_artisan(artisan_id));

create policy verifications_insert on public.verifications
  for insert to authenticated
  with check (
    public.is_admin()
    or (public.is_assigned_verifier(artisan_id) and verifier_id = auth.uid())
  );

create policy verifications_update on public.verifications
  for update to authenticated
  using (public.is_admin() or verifier_id = auth.uid())
  with check (public.is_admin() or verifier_id = auth.uid());

create policy verifications_delete on public.verifications
  for delete to authenticated
  using (public.is_admin());

-- -----------------------------------------------------------------------------
-- whatsapp_templates — readable by all authenticated, managed by admin
-- -----------------------------------------------------------------------------
create policy whatsapp_templates_select on public.whatsapp_templates
  for select to authenticated using (true);

create policy whatsapp_templates_write on public.whatsapp_templates
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- whatsapp_messages
-- -----------------------------------------------------------------------------
create policy whatsapp_messages_select on public.whatsapp_messages
  for select to authenticated
  using (
    public.is_admin()
    or (artisan_id is not null and public.can_read_artisan(artisan_id))
  );

create policy whatsapp_messages_insert on public.whatsapp_messages
  for insert to authenticated
  with check (public.is_admin() or public.is_operator() or public.is_district_officer());

create policy whatsapp_messages_update on public.whatsapp_messages
  for update to authenticated
  using (public.is_admin() or public.is_operator())
  with check (public.is_admin() or public.is_operator());

create policy whatsapp_messages_delete on public.whatsapp_messages
  for delete to authenticated
  using (public.is_admin());

-- -----------------------------------------------------------------------------
-- audit_logs — read for admin + district officer; never written via RLS
-- (triggers and service-role bypass RLS)
-- -----------------------------------------------------------------------------
create policy audit_logs_select on public.audit_logs
  for select to authenticated
  using (public.is_admin() or public.is_district_officer());

-- -----------------------------------------------------------------------------
-- duplicate_candidates
-- -----------------------------------------------------------------------------
create policy duplicate_candidates_select on public.duplicate_candidates
  for select to authenticated
  using (public.is_admin() or public.can_read_artisan(artisan_id));

create policy duplicate_candidates_write on public.duplicate_candidates
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
