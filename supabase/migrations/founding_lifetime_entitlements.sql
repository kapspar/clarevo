-- Founding-member lifetime entitlements are separate from beta and future Stripe billing.
-- Plaintext invitation codes are never stored in the database.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists public.account_entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  tier text not null check (tier = 'founding_lifetime'),
  granted_at timestamptz not null default now()
);
alter table public.account_entitlements enable row level security;
revoke all on public.account_entitlements from anon, authenticated;
grant select on public.account_entitlements to authenticated;
grant all on public.account_entitlements to service_role;
create policy "View own entitlement" on public.account_entitlements
  for select to authenticated using (user_id = (select auth.uid()));

create table if not exists private.founding_codes (
  id uuid primary key default gen_random_uuid(),
  code_hash text unique not null,
  issued_at timestamptz not null default now(),
  redeemed_by uuid references auth.users(id) on delete set null,
  redeemed_at timestamptz
);
create table if not exists private.founding_code_attempts (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  attempted_at timestamptz not null default now()
);
create index if not exists founding_code_attempts_by_user
  on private.founding_code_attempts (user_id, attempted_at desc);
revoke all on private.founding_codes, private.founding_code_attempts from public, anon, authenticated;

create or replace function public.redeem_founding_code(raw_code text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := auth.uid();
  cleaned text;
  code_id uuid;
begin
  if caller is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  if exists (select 1 from public.account_entitlements where user_id = caller and tier = 'founding_lifetime') then
    return jsonb_build_object('status', 'already_active');
  end if;
  if (select count(*) from private.founding_code_attempts where user_id = caller and attempted_at > now() - interval '1 hour') >= 5 then
    return jsonb_build_object('status', 'rate_limited');
  end if;
  insert into private.founding_code_attempts(user_id) values (caller);
  cleaned := upper(trim(coalesce(raw_code,'')));
  if cleaned !~ '^CLV-[A-F0-9]{32}$' then
    return jsonb_build_object('status', 'invalid');
  end if;
  update private.founding_codes
     set redeemed_by = caller, redeemed_at = now()
   where code_hash = encode(sha256(convert_to(cleaned, 'UTF8')), 'hex')
     and redeemed_at is null
   returning id into code_id;
  if code_id is null then
    return jsonb_build_object('status', 'invalid');
  end if;
  insert into public.account_entitlements(user_id,tier) values (caller,'founding_lifetime');
  return jsonb_build_object('status', 'redeemed');
end $$;
revoke all on function public.redeem_founding_code(text) from public, anon;
grant execute on function public.redeem_founding_code(text) to authenticated;

-- Admin-only issuance example (execute as postgres, never from browser):
-- with generated as (
--   select 'CLV-' || upper(replace(gen_random_uuid()::text, '-', '')) as code
--   from generate_series(1, 25)
-- ), inserted as (
--   insert into private.founding_codes(code_hash)
--   select encode(sha256(convert_to(code, 'UTF8')), 'hex') from generated
--   returning id
-- )
-- select count(*) from inserted;
-- For one-time printable codes, use a DB transaction/script that outputs the
-- generated plaintext codes at issuance; they CANNOT be retrieved later.
