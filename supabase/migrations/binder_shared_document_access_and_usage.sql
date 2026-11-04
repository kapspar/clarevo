-- Tighten access to shared-access check: public and anonymous callers do not
-- need direct function execution, but authenticated policy evaluation does.
revoke execute on function public.has_shared_access(uuid,text) from public, anon;
grant execute on function public.has_shared_access(uuid,text) to authenticated;

-- Correct three former shared-document predicates that accidentally referenced
-- the binder item's name instead of the storage object's name.
drop policy if exists "shared read documents" on storage.objects;
create policy "shared read documents" on storage.objects
for select to authenticated
using (
  bucket_id='documents'
  and (
    (public.has_shared_access(((storage.foldername(name))[1])::uuid,'legal')
      and exists (
        select 1 from public.legal_documents l
        where l.user_id::text=(storage.foldername(storage.objects.name))[1]
          and storage.objects.name in (l.will_file_path,l.poa_property_file_path,l.poa_care_file_path)
      ))
    or
    (public.has_shared_access(((storage.foldername(name))[1])::uuid,'finances')
      and exists (
        select 1 from public.account_items i
        where i.user_id::text=(storage.foldername(storage.objects.name))[1]
          and i.file_path=storage.objects.name
      ))
    or
    (public.has_shared_access(((storage.foldername(name))[1])::uuid,'insurance')
      and exists (
        select 1 from public.insurance_items i
        where i.user_id::text=(storage.foldername(storage.objects.name))[1]
          and i.file_path=storage.objects.name
      ))
    or
    (public.has_shared_access(((storage.foldername(name))[1])::uuid,'property')
      and exists (
        select 1 from public.property_items i
        where i.user_id::text=(storage.foldername(storage.objects.name))[1]
          and i.file_path=storage.objects.name
      ))
    or
    (public.has_shared_access(((storage.foldername(name))[1])::uuid,'bills')
      and exists (
        select 1 from public.bill_items i
        where i.user_id::text=(storage.foldername(storage.objects.name))[1]
          and i.file_path=storage.objects.name
      ))
    or
    (public.has_shared_access(((storage.foldername(name))[1])::uuid,'digital')
      and exists (
        select 1 from public.digital_items i
        where i.user_id::text=(storage.foldername(storage.objects.name))[1]
          and i.file_path=storage.objects.name
      ))
    or
    (public.has_shared_access(((storage.foldername(name))[1])::uuid,'kids')
      and exists (
        select 1 from public.kids_items i
        where i.user_id::text=(storage.foldername(storage.objects.name))[1]
          and i.file_path=storage.objects.name
      ))
    or
    (public.has_shared_access(((storage.foldername(name))[1])::uuid,'business')
      and exists (
        select 1 from public.business_items i
        where i.user_id::text=(storage.foldername(storage.objects.name))[1]
          and i.file_path=storage.objects.name
      ))
  )
);
-- Per-owner usage is computed under the authenticated caller's Storage RLS;
-- no elevated privileges are needed.
create or replace function public.clarevo_storage_usage()
returns table(used_bytes bigint, limit_bytes bigint)
language sql stable security invoker set search_path = ''
as $$
  select coalesce(sum((o.metadata->>'size')::bigint),0)::bigint as used_bytes,
         1073741824::bigint as limit_bytes
  from storage.objects o
  where auth.uid() is not null
    and o.bucket_id='documents'
    and (storage.foldername(o.name))[1] = auth.uid()::text;
$$;
revoke execute on function public.clarevo_storage_usage() from public, anon;
grant execute on function public.clarevo_storage_usage() to authenticated;
