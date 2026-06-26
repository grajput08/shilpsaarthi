-- pgTAP: schema constraints + generated columns
begin;
create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(7);

-- phone check constraint
select throws_ok(
  $$ insert into artisans (full_name, phone, registration_source) values ('Bad Phone', '12345', 'admin_manual') $$,
  '23514',
  null,
  'rejects an invalid phone number'
);

-- valid artisan + auto-generated code
insert into artisans (full_name, phone, registration_source, state, district, village)
  values ('Code Test', '9811112222', 'admin_manual', 'Madhya Pradesh', 'Dindori', 'Karanjia');
select matches(
  (select artisan_code from artisans where full_name = 'Code Test' limit 1),
  '^ART-[0-9]{4}-[0-9]{5}$',
  'artisan_code is auto-generated in ART-YYYY-NNNNN format'
);

-- pin code check on addresses
select throws_ok(
  $$ insert into addresses (artisan_id, pin_code)
     values ((select id from artisans where full_name = 'Code Test' limit 1), '12') $$,
  '23514',
  null,
  'rejects an invalid pin code'
);

-- product price ordering
select throws_ok(
  $$ insert into products (artisan_id, name, price_min, price_max)
     values ((select id from artisans where full_name = 'Code Test' limit 1), 'Bad Price', 500, 100) $$,
  '23514',
  null,
  'rejects price_max < price_min'
);

-- only one active assignment per artisan
select lives_ok(
  $$ insert into assignments (artisan_id, verifier_id, status)
     values ('a1a1a1a1-0000-0000-0000-000000000005', '33333333-3333-3333-3333-333333333333', 'assigned') $$,
  'first active assignment is allowed'
);
select throws_ok(
  $$ insert into assignments (artisan_id, verifier_id, status)
     values ('a1a1a1a1-0000-0000-0000-000000000005', '44444444-4444-4444-4444-444444444444', 'assigned') $$,
  '23505',
  null,
  'rejects a second active assignment for the same artisan'
);

-- duplicate candidate cannot reference itself
select throws_ok(
  $$ insert into duplicate_candidates (artisan_id, match_artisan_id, signal)
     values ('a1a1a1a1-0000-0000-0000-000000000005', 'a1a1a1a1-0000-0000-0000-000000000005', 'same_phone') $$,
  '23514',
  null,
  'rejects a duplicate candidate that references itself'
);

select * from finish();
rollback;
