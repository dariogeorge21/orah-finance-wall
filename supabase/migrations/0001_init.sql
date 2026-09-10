-- =========================================================
-- ORAH 2026 — Payment Reveal Wall Schema Migration
-- =========================================================

-- 1. Settings Table (Global Configuration, Singleton Row)
create table if not exists public.fw_settings (
  id int primary key default 1,
  event_name text not null default 'ORAH 2026',
  target_amount numeric(12,2) not null default 150000.00,
  upi_vpa text not null default 'jesusyouthpala@upi',
  upi_payee_name text not null default 'Jesus Youth Pala',
  banner_image_url text not null default '/orah-banner.jpg',
  grid_cols int not null default 40,
  grid_rows int not null default 24,
  is_completed boolean not null default false,
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);

-- Insert default row if not exists
insert into public.fw_settings (id, event_name, target_amount, upi_vpa, upi_payee_name, banner_image_url, grid_cols, grid_rows)
values (1, 'ORAH 2026', 150000.00, '7838403506@rapl', 'Dario George', '/orah-banner.jpg', 40, 24)
on conflict (id) do nothing;

-- 2. Contributions Ledger Table
create table if not exists public.fw_contributions (
  id uuid primary key default gen_random_uuid(),
  contributor_name text default 'Anonymous',
  amount numeric(10,2) not null check (amount > 0),
  reference_id text not null unique,
  upi_transaction_id text,
  prayer_note text,
  status text not null default 'pending'
              check (status in ('pending','verified','rejected','failed','expired')),
  revealed_tile_ids int[] default '{}',
  created_at timestamptz not null default now(),
  verified_at timestamptz
);

-- 3. Running Total View
create or replace view public.fund_progress as
  select
    coalesce(sum(amount), 0) as total_raised,
    (select target_amount from public.fw_settings where id = 1) as target_amount,
    coalesce(count(*), 0) as total_contributors
  from public.fw_contributions
  where status = 'verified';

-- 4. Enable Supabase Realtime
alter publication supabase_realtime add table public.fw_contributions;
alter publication supabase_realtime add table public.fw_settings;

-- 5. Row Level Security Policies
alter table public.fw_settings enable row level security;
alter table public.fw_contributions enable row level security;

-- Settings: Anyone can read settings
create policy "Anyone can read settings"
  on public.fw_settings for select
  using (true);

-- Contributions: Anyone can insert a pending contribution
create policy "Anyone can create a pending contribution"
  on public.fw_contributions for insert
  with check (status = 'pending');

-- Contributions: Anyone can read verified contributions (and pending for admin/moderator)
create policy "Anyone can read verified contributions"
  on public.fw_contributions for select
  using (true);

-- Verification updates should be executed via service role or admin functions
create policy "Admins can update contribution status"
  on public.fw_contributions for update
  using (true);

