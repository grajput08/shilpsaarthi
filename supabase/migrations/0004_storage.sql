-- =============================================================================
-- Migration 0004: private storage buckets + access policies
--   artisan-photos   — self / live photos
--   product-photos   — product catalogue images
--   document-images  — ID / address / certificate scans (most sensitive)
-- Path convention: <artisan_id>/...  (first folder segment is the artisan id)
--
-- The storage schema is provisioned by the Storage service. On a brand-new
-- local volume that service may not have initialised when migrations first run,
-- so the bucket/policy setup is guarded and re-applied on the next
-- `supabase db reset` / `supabase db push` (when storage.* exists).
-- =============================================================================

-- Safe uuid parse for path-based authorization.
create or replace function public.try_uuid(t text)
returns uuid language plpgsql immutable as $$
begin
  return t::uuid;
exception when others then
  return null;
end;
$$;

-- Artisan whose id is encoded in the first path segment.
-- plpgsql so the storage.foldername reference is resolved at call time (the
-- storage schema may not exist yet when this migration first runs).
create or replace function public.storage_artisan_id(object_name text)
returns uuid language plpgsql immutable as $$
begin
  return public.try_uuid((storage.foldername(object_name))[1]);
end;
$$;

do $do$
begin
  if to_regclass('storage.buckets') is null then
    raise notice 'storage schema not ready — skipping bucket setup (re-applied on db reset/push)';
    return;
  end if;

  insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values
    ('artisan-photos',  'artisan-photos',  false, 10485760, array['image/jpeg','image/png','image/webp']),
    ('product-photos',  'product-photos',  false, 10485760, array['image/jpeg','image/png','image/webp']),
    ('document-images', 'document-images', false, 10485760, array['image/jpeg','image/png','image/webp','application/pdf'])
  on conflict (id) do nothing;

  -- (re)create policies idempotently
  perform 1;
  -- artisan-photos
  drop policy if exists "artisan_photos_read"   on storage.objects;
  drop policy if exists "artisan_photos_write"  on storage.objects;
  drop policy if exists "artisan_photos_update" on storage.objects;
  drop policy if exists "artisan_photos_delete" on storage.objects;
  execute $p$ create policy "artisan_photos_read" on storage.objects for select to authenticated
    using (bucket_id = 'artisan-photos' and public.can_read_artisan(public.storage_artisan_id(name))) $p$;
  execute $p$ create policy "artisan_photos_write" on storage.objects for insert to authenticated
    with check (bucket_id = 'artisan-photos' and public.can_read_artisan(public.storage_artisan_id(name))) $p$;
  execute $p$ create policy "artisan_photos_update" on storage.objects for update to authenticated
    using (bucket_id = 'artisan-photos' and public.can_read_artisan(public.storage_artisan_id(name))) $p$;
  execute $p$ create policy "artisan_photos_delete" on storage.objects for delete to authenticated
    using (bucket_id = 'artisan-photos' and public.is_admin()) $p$;

  -- product-photos
  drop policy if exists "product_photos_read"   on storage.objects;
  drop policy if exists "product_photos_write"  on storage.objects;
  drop policy if exists "product_photos_update" on storage.objects;
  drop policy if exists "product_photos_delete" on storage.objects;
  execute $p$ create policy "product_photos_read" on storage.objects for select to authenticated
    using (bucket_id = 'product-photos' and public.can_read_artisan(public.storage_artisan_id(name))) $p$;
  execute $p$ create policy "product_photos_write" on storage.objects for insert to authenticated
    with check (bucket_id = 'product-photos' and public.can_read_artisan(public.storage_artisan_id(name))) $p$;
  execute $p$ create policy "product_photos_update" on storage.objects for update to authenticated
    using (bucket_id = 'product-photos' and public.can_read_artisan(public.storage_artisan_id(name))) $p$;
  execute $p$ create policy "product_photos_delete" on storage.objects for delete to authenticated
    using (bucket_id = 'product-photos' and public.is_admin()) $p$;

  -- document-images
  drop policy if exists "document_images_read"   on storage.objects;
  drop policy if exists "document_images_write"  on storage.objects;
  drop policy if exists "document_images_update" on storage.objects;
  drop policy if exists "document_images_delete" on storage.objects;
  execute $p$ create policy "document_images_read" on storage.objects for select to authenticated
    using (bucket_id = 'document-images' and public.can_read_artisan(public.storage_artisan_id(name))) $p$;
  execute $p$ create policy "document_images_write" on storage.objects for insert to authenticated
    with check (bucket_id = 'document-images' and public.can_read_artisan(public.storage_artisan_id(name))) $p$;
  execute $p$ create policy "document_images_update" on storage.objects for update to authenticated
    using (bucket_id = 'document-images' and public.can_read_artisan(public.storage_artisan_id(name))) $p$;
  execute $p$ create policy "document_images_delete" on storage.objects for delete to authenticated
    using (bucket_id = 'document-images' and public.is_admin()) $p$;
end
$do$;
