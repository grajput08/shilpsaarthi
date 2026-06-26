-- pgTAP: triggers (updated_at, audit, duplicate detection)
begin;
create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(6);

-- INSERT writes a 'created' audit row
insert into artisans (id, full_name, phone, registration_source, state, district, village)
  values ('cccccccc-0000-0000-0000-000000000001', 'Audit Insert', '9812223333', 'admin_manual', 'Madhya Pradesh', 'Dindori', 'Karanjia');
select is(
  (select count(*)::int from audit_logs where entity_type = 'artisan' and entity_id = 'cccccccc-0000-0000-0000-000000000001' and action = 'created'),
  1,
  'inserting an artisan writes a created audit row'
);

-- status change writes a 'status_changed' audit row
update artisans set status = 'contacted' where id = 'cccccccc-0000-0000-0000-000000000001';
select is(
  (select count(*)::int from audit_logs where entity_id = 'cccccccc-0000-0000-0000-000000000001' and action = 'status_changed'),
  1,
  'changing artisan status writes a status_changed audit row'
);

-- updated_at trigger advances the timestamp
select ok(
  (select updated_at from artisans where id = 'cccccccc-0000-0000-0000-000000000001')
    >= (select created_at from artisans where id = 'cccccccc-0000-0000-0000-000000000001'),
  'updated_at is maintained by trigger'
);

-- duplicate auto-detection on same phone
insert into artisans (id, full_name, phone, registration_source, state, district, village)
  values ('cccccccc-0000-0000-0000-000000000002', 'Dup One', '9899990000', 'admin_manual', 'Madhya Pradesh', 'Dindori', 'Karanjia');
insert into artisans (id, full_name, phone, registration_source, state, district, village)
  values ('cccccccc-0000-0000-0000-000000000003', 'Dup Two', '9899990000', 'admin_manual', 'Madhya Pradesh', 'Dindori', 'Karanjia');
select is(
  (select count(*)::int from duplicate_candidates
    where artisan_id = 'cccccccc-0000-0000-0000-000000000003' and signal = 'same_phone'),
  1,
  'a same-phone registration auto-creates a duplicate candidate'
);

-- and flags duplicate_risk on the new record
select is(
  (select duplicate_risk from artisans where id = 'cccccccc-0000-0000-0000-000000000003'),
  'high',
  'duplicate_risk is raised to high when a candidate is found'
);

-- seed already produced audit rows
select cmp_ok(
  (select count(*)::int from audit_logs),
  '>=',
  10,
  'audit log is populated from seed activity'
);

select * from finish();
rollback;
