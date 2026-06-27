-- pgTAP: registration tokens, verification items, and the Fully-Verified rule
begin;
create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(6);

-- seed contains active registration tokens
select cmp_ok(
  (select count(*)::int from registration_tokens where status = 'active'),
  '>=', 2,
  'seed has active registration tokens'
);

-- token status defaults to active
insert into registration_tokens (token) values ('pgtap-token-xyz');
select is(
  (select status::text from registration_tokens where token = 'pgtap-token-xyz'),
  'active',
  'registration token status defaults to active'
);

-- verification_items are unique per (verification, item_key)
insert into verifications (id, artisan_id, verifier_id, decision)
  values ('dddddddd-0000-0000-0000-000000000001', 'a1a1a1a1-0000-0000-0000-000000000006',
          '33333333-3333-3333-3333-333333333333', null);
insert into verification_items (verification_id, artisan_id, item_key, item_label, status)
  values ('dddddddd-0000-0000-0000-000000000001', 'a1a1a1a1-0000-0000-0000-000000000006',
          'address', 'Address & GPS', 'rejected');
select throws_ok(
  $$ insert into verification_items (verification_id, artisan_id, item_key, item_label, status)
     values ('dddddddd-0000-0000-0000-000000000001', 'a1a1a1a1-0000-0000-0000-000000000006',
             'address', 'Address & GPS', 'verified') $$,
  '23505',
  null,
  'verification_items are unique per (verification, item_key)'
);

-- cannot set Fully Verified while an item is rejected and no admin override
select throws_ok(
  $$ update verifications set decision = 'verified' where id = 'dddddddd-0000-0000-0000-000000000001' $$,
  '23514',
  null,
  'blocked: Fully Verified while an item is rejected without admin override'
);

-- admin override permits Fully Verified despite the rejected item
select lives_ok(
  $$ update verifications set admin_override = true, decision = 'verified'
     where id = 'dddddddd-0000-0000-0000-000000000001' $$,
  'admin override allows Fully Verified despite a rejected item'
);

-- the public_link registration source exists
select is(
  (select count(*)::int from pg_enum e join pg_type t on t.oid = e.enumtypid
   where t.typname = 'registration_source' and e.enumlabel = 'public_link'),
  1,
  'public_link registration source exists'
);

select * from finish();
rollback;
