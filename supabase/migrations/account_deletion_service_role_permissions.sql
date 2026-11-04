-- Privileged Edge Function account cleanup needs SELECT/DELETE on owned records.
-- No additional privileges are granted to anon or authenticated roles.
grant select, delete on table
 public.legal_documents,
 public.account_items,
 public.insurance_items,
 public.property_items,
 public.business_items,
 public.bill_items,
 public.contact_items,
 public.emergency_settings,
 public.digital_items,
 public.kids_items,
 public.shared_access
to service_role;
