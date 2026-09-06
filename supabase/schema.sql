-- =============================================================================
-- "₦200 TO WIN ₦200M" SUPABASE POSTGRESQL PRODUCTION SCHEMA
-- =============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Enums
create type slip_category as enum (
  'MEGA_ACCUMULATOR', 
  'BANKER', 
  'OVER_UNDER', 
  'ROLLOVER', 
  'VIP'
);

create type slip_status as enum (
  'PENDING', 
  'WON', 
  'LOST', 
  'VOID'
);

create type bookmaker_code as enum (
  'STAKE.COM',
  'SPORTYBET', 
  'BET9JA', 
  '1XBET', 
  'BETKING', 
  'MSPORT'
);

-- 1. Bookmakers Table
create table public.bookmakers (
  id uuid primary key default uuid_generate_v4(),
  code bookmaker_code unique not null,
  name text not null,
  brand_color text not null default '#00E676',
  affiliate_url_template text not null,
  app_scheme text,
  created_at timestamptz default now()
);

-- Seed Bookmakers
insert into public.bookmakers (code, name, brand_color, affiliate_url_template, app_scheme)
values 
  ('STAKE.COM', 'Stake.com', '#00E701', 'https://stake.com/?c=Jareddad&offer=jareddad', null),
  ('SPORTYBET', 'SportyBet', '#E50914', 'https://www.sportybet.com/ng/?ref=200to200m&code={CODE}', 'sportybet://loadslip?code={CODE}'),
  ('BET9JA', 'Bet9ja', '#008751', 'https://sports.bet9ja.com/?ref=200to200m&code={CODE}', 'bet9ja://loadslip?code={CODE}'),
  ('1XBET', '1xBet', '#1160AA', 'https://1xbet.ng/?ref=200to200m&code={CODE}', null),
  ('BETKING', 'BetKing', '#0B3C84', 'https://www.betking.com/?ref=200to200m&code={CODE}', null),
  ('MSPORT', 'MSport', '#FFA000', 'https://www.msport.com/ng/?ref=200to200m&code={CODE}', null);

-- 2. Slips Table (Core Betting Slips)
create table public.slips (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  category slip_category not null default 'MEGA_ACCUMULATOR',
  bookmaker_code bookmaker_code not null,
  booking_code text not null,
  total_odds numeric(10, 2) not null,
  stake_amount numeric(10, 2) default 200.00,
  potential_win numeric(14, 2) generated always as (stake_amount * total_odds) stored,
  match_count integer not null default 1,
  kickoff_time timestamptz not null,
  status slip_status not null default 'PENDING',
  is_pinned boolean default false,
  is_cut_one boolean default false,
  is_vip boolean default false,
  views_count integer default 0,
  copies_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexing for high-frequency queries
create index idx_slips_status_kickoff on public.slips(status, kickoff_time desc);
create index idx_slips_category on public.slips(category);
create index idx_slips_pinned on public.slips(is_pinned) where is_pinned = true;

-- 3. Slip Matches (Optional Granular Breakdown)
create table public.slip_matches (
  id uuid primary key default uuid_generate_v4(),
  slip_id uuid references public.slips(id) on delete cascade,
  teams text not null,
  league text,
  market_selection text not null,
  odds numeric(6, 2) not null,
  match_time timestamptz not null,
  status slip_status default 'PENDING'
);

-- 4. Platform Aggregate Stats (Single row for ultra-fast reading without aggregations)
create table public.platform_stats (
  id integer primary key default 1,
  total_slips integer default 0,
  slips_won integer default 0,
  slips_lost integer default 0,
  win_rate numeric(5, 2) default 0.00,
  total_odds_landed numeric(10, 2) default 0.00,
  updated_at timestamptz default now(),
  constraint single_row_check check (id = 1)
);

-- Seed initial stats
insert into public.platform_stats (id, total_slips, slips_won, slips_lost, win_rate, total_odds_landed)
values (1, 48, 38, 10, 79.17, 18420.50);

-- Enable Row Level Security (RLS)
alter table public.bookmakers enable row level security;
alter table public.slips enable row level security;
alter table public.slip_matches enable row level security;
alter table public.platform_stats enable row level security;

-- Public read policies (All visitors can read public slips)
create policy "Public slips are viewable by everyone" 
on public.slips for select 
using (true);

create policy "Bookmakers are viewable by everyone" 
on public.bookmakers for select 
using (true);

create policy "Platform stats are viewable by everyone" 
on public.platform_stats for select 
using (true);

-- Admin write policies (Authenticated admins can write)
create policy "Admins can manage slips" 
on public.slips for all 
using (auth.role() = 'authenticated');
