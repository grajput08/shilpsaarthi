-- =============================================================================
-- ShilpSaarthi — Tribal Artisan CRM POC
-- Migration 0001: extensions, enums, core tables, indexes
-- =============================================================================

create extension if not exists "pgcrypto";      -- gen_random_uuid()
create extension if not exists "citext";         -- case-insensitive text

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
create type public.app_role as enum (
  'admin', 'operator', 'verifier', 'district_officer'
);

create type public.artisan_status as enum (
  'lead_created',
  'contacted',
  'registration_started',
  'registration_submitted',
  'pending_verification',
  'assigned',
  'verification_in_progress',
  'verified',
  'needs_correction',
  'revisit_required',
  'rejected',
  'duplicate',
  'market_ready'
);

create type public.registration_source as enum (
  'whatsapp_self', 'call_center', 'admin_manual', 'csv_import', 'ngo', 'campaign'
);

create type public.consent_status as enum (
  'not_captured', 'granted', 'declined'
);

create type public.gender_type as enum (
  'male', 'female', 'other', 'undisclosed'
);

create type public.craft_category as enum (
  'textile', 'painting', 'jewellery', 'metal_craft', 'cane_bamboo',
  'pottery', 'wood_craft', 'natural_products', 'tribal_food', 'other'
);

create type public.verification_decision as enum (
  'verified', 'needs_correction', 'revisit_required', 'rejected', 'duplicate'
);

create type public.doc_status as enum (
  'available', 'not_available', 'not_asked', 'not_required'
);

create type public.document_type as enum (
  'id_proof', 'address_proof', 'caste_tribe_certificate', 'bank_passbook',
  'pan', 'gst', 'shg_membership', 'training_certificate', 'artisan_card', 'other'
);

create type public.assignment_status as enum (
  'assigned', 'in_progress', 'completed', 'reassigned', 'cancelled'
);

create type public.priority_level as enum (
  'high', 'normal', 'revisit', 'correction'
);

create type public.whatsapp_status as enum (
  'queued', 'sent', 'delivered', 'read', 'failed', 'replied'
);

create type public.message_direction as enum (
  'outbound', 'inbound'
);

create type public.sync_status as enum (
  'synced', 'pending', 'failed'
);

create type public.audit_action as enum (
  'created', 'updated', 'deleted', 'status_changed', 'consent_captured',
  'verifier_assigned', 'whatsapp_sent', 'verification_submitted',
  'approved', 'rejected', 'duplicate_merged', 'export_downloaded', 'form_submitted'
);

create type public.duplicate_signal as enum (
  'same_phone', 'same_name_village', 'same_id_ref', 'same_gps_name', 'same_group'
);

create type public.duplicate_state as enum (
  'open', 'confirmed', 'dismissed', 'merged'
);

-- -----------------------------------------------------------------------------
-- profiles — application users, mirrors auth.users, carries role + geo scope
-- -----------------------------------------------------------------------------
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  full_name    text not null default '',
  email        citext,
  phone        text,
  role         public.app_role not null default 'operator',
  employee_id  text,
  state        text,
  district     text,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
comment on table public.profiles is 'Application users with role and geographic scope (state/district).';

-- -----------------------------------------------------------------------------
-- artisans — master record
-- -----------------------------------------------------------------------------
create sequence if not exists public.artisan_code_seq;

create table public.artisans (
  id                 uuid primary key default gen_random_uuid(),
  artisan_code       text unique,
  full_name          text not null,
  phone              text,
  alternate_phone    text,
  gender             public.gender_type,
  date_of_birth      date,
  tribe_community    text,
  primary_craft      public.craft_category,
  status             public.artisan_status not null default 'lead_created',
  registration_source public.registration_source not null default 'admin_manual',
  consent_status     public.consent_status not null default 'not_captured',
  preferred_language text not null default 'en',
  assigned_verifier  uuid references public.profiles (id) on delete set null,
  state              text,
  district           text,
  block              text,
  village            text,
  priority           public.priority_level not null default 'normal',
  data_completeness  int not null default 0 check (data_completeness between 0 and 100),
  duplicate_risk     text not null default 'none' check (duplicate_risk in ('none','low','medium','high')),
  notes              text,
  created_by         uuid references public.profiles (id) on delete set null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint artisans_phone_chk check (phone is null or phone ~ '^[6-9][0-9]{9}$'),
  constraint artisans_alt_phone_chk check (alternate_phone is null or alternate_phone ~ '^[6-9][0-9]{9}$')
);
comment on table public.artisans is 'Master artisan registry record across the full status lifecycle.';

create index artisans_status_idx       on public.artisans (status);
create index artisans_state_idx        on public.artisans (state);
create index artisans_district_idx     on public.artisans (district);
create index artisans_craft_idx        on public.artisans (primary_craft);
create index artisans_verifier_idx     on public.artisans (assigned_verifier);
create index artisans_phone_idx        on public.artisans (phone);
create index artisans_source_idx       on public.artisans (registration_source);

-- -----------------------------------------------------------------------------
-- addresses — detailed address + GPS (verified location)
-- -----------------------------------------------------------------------------
create table public.addresses (
  id              uuid primary key default gen_random_uuid(),
  artisan_id      uuid not null references public.artisans (id) on delete cascade,
  address_type    text not null default 'primary',
  state           text,
  district        text,
  block           text,
  gram_panchayat  text,
  village         text,
  hamlet          text,
  pin_code        text check (pin_code is null or pin_code ~ '^[1-9][0-9]{5}$'),
  address_line    text,
  landmark        text,
  latitude        double precision check (latitude is null or latitude between -90 and 90),
  longitude       double precision check (longitude is null or longitude between -180 and 180),
  gps_accuracy_m  double precision,
  gps_captured_at timestamptz,
  captured_by     uuid references public.profiles (id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index addresses_artisan_idx on public.addresses (artisan_id);

-- -----------------------------------------------------------------------------
-- craft_profiles — one per artisan
-- -----------------------------------------------------------------------------
create table public.craft_profiles (
  id                     uuid primary key default gen_random_uuid(),
  artisan_id             uuid not null unique references public.artisans (id) on delete cascade,
  craft_category         public.craft_category,
  sub_category           text,
  experience_years       int check (experience_years is null or experience_years >= 0),
  learned_from           text,
  works_in_group         boolean,
  group_name             text,
  monthly_capacity       int check (monthly_capacity is null or monthly_capacity >= 0),
  seasonal_availability  text,
  tools_used             text,
  raw_materials          text,
  training_needs         text,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);
create index craft_profiles_artisan_idx on public.craft_profiles (artisan_id);

-- -----------------------------------------------------------------------------
-- products — catalogue items
-- -----------------------------------------------------------------------------
create sequence if not exists public.product_code_seq;

create table public.products (
  id                  uuid primary key default gen_random_uuid(),
  product_code        text unique,
  artisan_id          uuid not null references public.artisans (id) on delete cascade,
  name                text not null,
  category            public.craft_category,
  description         text,
  materials           text,
  dimensions          text,
  weight              text,
  price_min           numeric(10,2) check (price_min is null or price_min >= 0),
  price_max           numeric(10,2) check (price_max is null or price_max >= 0),
  min_order_qty       int check (min_order_qty is null or min_order_qty >= 0),
  monthly_capacity    int check (monthly_capacity is null or monthly_capacity >= 0),
  production_time     text,
  buyers              text[] not null default '{}',
  packaging_available boolean,
  can_ship            boolean,
  quality_notes       text,
  photo_paths         text[] not null default '{}',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint products_price_order_chk check (price_min is null or price_max is null or price_max >= price_min)
);
create index products_artisan_idx on public.products (artisan_id);

-- -----------------------------------------------------------------------------
-- documents — document checklist + uploads
-- -----------------------------------------------------------------------------
create table public.documents (
  id                  uuid primary key default gen_random_uuid(),
  artisan_id          uuid not null references public.artisans (id) on delete cascade,
  doc_type            public.document_type not null,
  status              public.doc_status not null default 'not_asked',
  reference_masked    text,
  file_path           text,
  unavailable_reason  text,
  checked_by          uuid references public.profiles (id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (artisan_id, doc_type)
);
create index documents_artisan_idx on public.documents (artisan_id);

-- -----------------------------------------------------------------------------
-- assignments — field verification tasks
-- -----------------------------------------------------------------------------
create table public.assignments (
  id              uuid primary key default gen_random_uuid(),
  artisan_id      uuid not null references public.artisans (id) on delete cascade,
  verifier_id     uuid not null references public.profiles (id) on delete cascade,
  assigned_by     uuid references public.profiles (id) on delete set null,
  status          public.assignment_status not null default 'assigned',
  priority        public.priority_level not null default 'normal',
  due_date        date,
  supervisor_note text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index assignments_artisan_idx  on public.assignments (artisan_id);
create index assignments_verifier_idx on public.assignments (verifier_id);
create index assignments_status_idx   on public.assignments (status);
-- at most one active assignment per artisan
create unique index assignments_one_active_idx
  on public.assignments (artisan_id)
  where status in ('assigned', 'in_progress');

-- -----------------------------------------------------------------------------
-- verifications — field visit outcomes
-- -----------------------------------------------------------------------------
create table public.verifications (
  id                   uuid primary key default gen_random_uuid(),
  artisan_id           uuid not null references public.artisans (id) on delete cascade,
  assignment_id        uuid references public.assignments (id) on delete set null,
  verifier_id          uuid references public.profiles (id) on delete set null,
  client_generated_id  text unique,   -- idempotency key for offline sync
  visit_date           date not null default current_date,
  latitude             double precision check (latitude is null or latitude between -90 and 90),
  longitude            double precision check (longitude is null or longitude between -180 and 180),
  gps_accuracy_m       double precision,
  consent_captured     boolean not null default false,
  consent_mode         text,
  consent_timestamp    timestamptz,
  identity_verified    boolean not null default false,
  location_verified    boolean not null default false,
  craft_verified       boolean not null default false,
  products_captured    boolean not null default false,
  documents_checked    boolean not null default false,
  duplicate_checked    boolean not null default false,
  market_ready         boolean not null default false,
  decision             public.verification_decision,
  reason               text,
  notes                text,
  photo_paths          text[] not null default '{}',
  sync_status          public.sync_status not null default 'synced',
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create index verifications_artisan_idx  on public.verifications (artisan_id);
create index verifications_verifier_idx on public.verifications (verifier_id);
create index verifications_decision_idx on public.verifications (decision);

-- -----------------------------------------------------------------------------
-- whatsapp_templates
-- -----------------------------------------------------------------------------
create table public.whatsapp_templates (
  id           uuid primary key default gen_random_uuid(),
  template_key text not null unique,
  name         text not null,
  category     text not null,
  language     text not null default 'en',
  body         text not null,
  variables    text[] not null default '{}',
  is_approved  boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- whatsapp_messages — persisted (mocked) message log
-- -----------------------------------------------------------------------------
create table public.whatsapp_messages (
  id                  uuid primary key default gen_random_uuid(),
  artisan_id          uuid references public.artisans (id) on delete set null,
  template_key        text references public.whatsapp_templates (template_key) on delete set null,
  direction           public.message_direction not null default 'outbound',
  language            text not null default 'en',
  to_phone            text,
  body                text not null,
  variables           jsonb not null default '{}'::jsonb,
  status              public.whatsapp_status not null default 'queued',
  sent_by             uuid references public.profiles (id) on delete set null,
  sent_at             timestamptz,
  delivered_at        timestamptz,
  read_at             timestamptz,
  reply_body          text,
  campaign_id         text,
  provider_message_id text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index whatsapp_messages_artisan_idx on public.whatsapp_messages (artisan_id);
create index whatsapp_messages_status_idx  on public.whatsapp_messages (status);

-- -----------------------------------------------------------------------------
-- audit_logs — who changed what
-- -----------------------------------------------------------------------------
create table public.audit_logs (
  id          bigint generated always as identity primary key,
  entity_type text not null,
  entity_id   text,
  action      public.audit_action not null,
  actor_id    uuid references public.profiles (id) on delete set null,
  actor_role  text,
  old_value   jsonb,
  new_value   jsonb,
  reason      text,
  source      text not null default 'system',
  ip_address  text,
  created_at  timestamptz not null default now()
);
create index audit_logs_entity_idx  on public.audit_logs (entity_type, entity_id);
create index audit_logs_actor_idx   on public.audit_logs (actor_id);
create index audit_logs_created_idx on public.audit_logs (created_at desc);

-- -----------------------------------------------------------------------------
-- duplicate_candidates — flagged potential duplicates
-- -----------------------------------------------------------------------------
create table public.duplicate_candidates (
  id                uuid primary key default gen_random_uuid(),
  artisan_id        uuid not null references public.artisans (id) on delete cascade,
  match_artisan_id  uuid not null references public.artisans (id) on delete cascade,
  signal            public.duplicate_signal not null,
  score             numeric(4,3) not null default 0.5 check (score between 0 and 1),
  status            public.duplicate_state not null default 'open',
  master_artisan_id uuid references public.artisans (id) on delete set null,
  resolved_by       uuid references public.profiles (id) on delete set null,
  resolved_at       timestamptz,
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint duplicate_distinct_chk check (artisan_id <> match_artisan_id),
  unique (artisan_id, match_artisan_id, signal)
);
create index duplicate_candidates_artisan_idx on public.duplicate_candidates (artisan_id);
create index duplicate_candidates_status_idx  on public.duplicate_candidates (status);
