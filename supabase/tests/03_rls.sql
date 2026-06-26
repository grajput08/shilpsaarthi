-- pgTAP: Row Level Security for admin / operator / verifier / district officer / anon
begin;
create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(11);

-- Helper: attempt an artisan insert under the *current* role, report success/failure.
create or replace function public._rls_try_insert_artisan() returns boolean
language plpgsql security invoker as $fn$
begin
  insert into public.artisans (full_name, registration_source, state, district, village)
    values ('RLS Insert Probe', 'admin_manual', 'Madhya Pradesh', 'Dindori', 'Karanjia');
  return true;
exception when insufficient_privilege then
  return false;
end;
$fn$;

-- ---- Verifier (assigned to artisans 6, 7, 8, 13) -------------------------------
reset role;
set local "request.jwt.claims" to '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}';
set local role authenticated;
select
  (select count(*) from artisans where id = 'a1a1a1a1-0000-0000-0000-000000000006')::int as v_assigned,
  (select count(*) from artisans where id = 'a1a1a1a1-0000-0000-0000-000000000001')::int as v_unassigned,
  (select count(*) from audit_logs)::int as v_audit,
  public._rls_try_insert_artisan() as v_can_insert
\gset
reset role;
select is(:v_assigned, 1, 'verifier can see an artisan assigned to them');
select is(:v_unassigned, 0, 'verifier cannot see an unassigned artisan');
select is(:v_audit, 0, 'verifier cannot read the audit log');
select is(:'v_can_insert'::text, 'f', 'verifier cannot insert an artisan');

-- ---- Operator (cross-geography read/write) -------------------------------------
set local "request.jwt.claims" to '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';
set local role authenticated;
select
  (select count(*) from artisans)::int as o_total,
  (select count(*) from artisans where id = 'a1a1a1a1-0000-0000-0000-000000000011')::int as o_jharkhand,
  public._rls_try_insert_artisan() as o_can_insert
\gset
reset role;
select cmp_ok(:o_total, '>=', 15, 'operator can see all artisans');
select is(:o_jharkhand, 1, 'operator sees artisans in any state');
select is(:'o_can_insert'::text, 't', 'operator can insert an artisan');

-- ---- District officer (Madhya Pradesh / Dindori) -------------------------------
set local "request.jwt.claims" to '{"sub":"55555555-5555-5555-5555-555555555555","role":"authenticated"}';
set local role authenticated;
select
  (select count(*) from artisans where id = 'a1a1a1a1-0000-0000-0000-000000000001')::int as d_dindori,
  (select count(*) from artisans where id = 'a1a1a1a1-0000-0000-0000-000000000004')::int as d_mandla
\gset
reset role;
select is(:d_dindori, 1, 'district officer sees an artisan in their district');
select is(:d_mandla, 0, 'district officer cannot see an artisan outside their district');

-- ---- Admin ---------------------------------------------------------------------
set local "request.jwt.claims" to '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';
set local role authenticated;
select (select count(*) from audit_logs)::int as a_audit \gset
reset role;
select cmp_ok(:a_audit, '>', 0, 'admin can read the audit log');

-- ---- Anonymous -----------------------------------------------------------------
set local "request.jwt.claims" to '';
set local role anon;
select (select count(*) from artisans)::int as anon_total \gset
reset role;
select is(:anon_total, 0, 'anonymous role cannot read artisans');

select * from finish();
rollback;
