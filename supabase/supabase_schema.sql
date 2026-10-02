-- ==============================================================================
-- ORAH 2026 — Payment Reveal Wall Complete Supabase Schema
-- Unified schema file containing all tables, views, indexes, triggers,
-- realtime publications, and row-level security (RLS) policies.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. EXTENSIONS
-- ------------------------------------------------------------------------------
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 2. TABLES
-- ------------------------------------------------------------------------------

-- fw_settings: Global event configuration (Singleton row with id = 1)
create table if not exists public.fw_settings (
  id integer primary key default 1,
  event_name text not null default 'ORAH 2026',
  target_amount numeric(12, 2) not null default 150000.00,
  upi_vpa text not null default '7838403506@rapl',
  upi_payee_name text not null default 'Dario George',
  banner_image_url text not null default '/jesusAndChildren.jpg',
  grid_cols integer not null default 40,
  grid_rows integer not null default 24,
  is_completed boolean not null default false,
  updated_at timestamp with time zone not null default now(),
  constraint single_row check (id = 1)
);

-- fw_contributions: Ledger of contributions and revealed mosaic tile states
create table if not exists public.fw_contributions (
  id uuid primary key default gen_random_uuid(),
  contributor_name text default 'Anonymous',
  amount numeric(10, 2) not null check (amount > 0),
  reference_id text not null unique,
  upi_transaction_id text,
  prayer_note text,
  status text not null default 'pending'
    check (status in ('pending', 'verified', 'rejected', 'failed', 'expired')),
  revealed_tile_ids integer[] default '{}'::integer[],
  created_at timestamp with time zone not null default now(),
  verified_at timestamp with time zone
);

-- ------------------------------------------------------------------------------
-- 3. INITIAL SEED DATA
-- ------------------------------------------------------------------------------
insert into public.fw_settings (
  id,
  event_name,
  target_amount,
  upi_vpa,
  upi_payee_name,
  banner_image_url,
  grid_cols,
  grid_rows,
  is_completed
)
values (
  1,
  'ORAH 2026',
  150000.00,
  '7838403506@rapl',
  'Dario George',
  '/jesusAndChildren.jpg',
  40,
  24,
  false
)
on conflict (id) do nothing;

-- ------------------------------------------------------------------------------
-- 4. VIEWS
-- ------------------------------------------------------------------------------
-- fund_progress: Aggregates verified funds raised against the target
create or replace view public.fund_progress as
select
  coalesce(sum(amount), 0) as total_raised,
  (select target_amount from public.fw_settings where id = 1) as target_amount,
  coalesce(count(*), 0) as total_contributors
from public.fw_contributions
where status = 'verified';

-- ------------------------------------------------------------------------------
-- 5. PERFORMANCE INDEXES
-- ------------------------------------------------------------------------------
create index if not exists idx_fw_contributions_status 
  on public.fw_contributions(status);

create index if not exists idx_fw_contributions_created_at 
  on public.fw_contributions(created_at desc);

create index if not exists idx_fw_contributions_reference_id 
  on public.fw_contributions(reference_id);

create index if not exists idx_fw_contributions_dedup 
  on public.fw_contributions(contributor_name, amount, status, created_at desc);

-- ------------------------------------------------------------------------------
-- 6. AUTOMATED TIMESTAMP TRIGGER
-- ------------------------------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_fw_settings_updated_at on public.fw_settings;
create trigger set_fw_settings_updated_at
  before update on public.fw_settings
  for each row
  execute function public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 7. REPLICA IDENTITY & REALTIME SUBSCRIPTION
-- ------------------------------------------------------------------------------
alter table public.fw_settings replica identity full;
alter table public.fw_contributions replica identity full;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'fw_settings'
  ) then
    alter publication supabase_realtime add table public.fw_settings;
  end if;

  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'fw_contributions'
  ) then
    alter publication supabase_realtime add table public.fw_contributions;
  end if;
exception
  when undefined_object then
    null;
end;
$$;

-- ------------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
alter table public.fw_settings enable row level security;
alter table public.fw_contributions enable row level security;

-- fw_settings policies
drop policy if exists "Anyone can read settings" on public.fw_settings;
create policy "Anyone can read settings"
  on public.fw_settings for select
  using (true);

drop policy if exists "Admins can update settings" on public.fw_settings;
create policy "Admins can update settings"
  on public.fw_settings for all
  using (true)
  with check (true);

-- fw_contributions policies
drop policy if exists "Anyone can read verified contributions" on public.fw_contributions;
create policy "Anyone can read verified contributions"
  on public.fw_contributions for select
  using (true);

drop policy if exists "Anyone can create a pending contribution" on public.fw_contributions;
create policy "Anyone can create a pending contribution"
  on public.fw_contributions for insert
  with check (status = 'pending');

drop policy if exists "Admins can update contribution status" on public.fw_contributions;
create policy "Admins can update contribution status"
  on public.fw_contributions for update
  using (true)
  with check (true);

drop policy if exists "Admins can delete contributions" on public.fw_contributions;
create policy "Admins can delete contributions"
  on public.fw_contributions for delete
  using (true);
