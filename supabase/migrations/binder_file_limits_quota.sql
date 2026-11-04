-- Clarevo is an emergency binder, not unlimited cloud storage.
-- One authenticated owner corresponds to one current family binder.
-- Bucket-level limits are applied to Supabase Storage's configured documents bucket.
update storage.buckets
set file_size_limit = 10485760,
    allowed_mime_types = array['application/pdf','image/jpeg','image/png']::text[]
where id = 'documents';

-- The quota helper is deliberately outside the exposed API schemas and only
-- evaluates the current authenticated user's own folder.
create schema if not exists private;
create or replace function private.clarevo_document_quota_ok(object_name text, proposed_metadata jsonb)
returns boolean
language plpgsql volatile security definer set search_path = ''
as $$
declare
  viewer uuid := auth.uid();
  incoming bigint;
  used_bytes bigint;
begin
  if viewer is null or (storage.foldername(object_name))[1] is distinct from viewer::text then
    return false;
  end if;
  if proposed_metadata->>'size' is null or not pg_catalog.pg_input_is_valid(proposed_metadata->>'size', 'bigint') then
    return false;
  end if;
  incoming := (proposed_metadata->>'size')::bigint;
  if incoming <= 0 or incoming > 10485760 then return false; end if;
  -- Serialize uploads for this owner's folder when using the Storage API.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(viewer::text, 2026));
  select coalesce(sum((obj.metadata->>'size')::bigint), 0)
    into used_bytes
    from storage.objects obj
   where obj.bucket_id='documents'
     and (storage.foldername(obj.name))[1]=viewer::text
     and obj.name<>object_name;
  return used_bytes + incoming <= 1073741824;
end
$$;
revoke all on function private.clarevo_document_quota_ok(text,jsonb) from public,anon;
grant usage on schema private to authenticated;
grant execute on function private.clarevo_document_quota_ok(text,jsonb) to authenticated;
drop policy if exists "Clarevo per household file quota" on storage.objects;
create policy "Clarevo per household file quota" on storage.objects
  as restrictive for insert to authenticated
  with check (
    bucket_id <> 'documents'
    or private.clarevo_document_quota_ok(name, metadata)
  );
-- Existing ownership and section-sharing policies remain unchanged.
