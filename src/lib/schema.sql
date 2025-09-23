-- Enable UUID generation
create extension if not exists pgcrypto;

-- PROFILES (auth.users.id is UUID)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  approved boolean default false,
  created_at timestamptz default now()
);

-- TICKETS (UUID ids)
create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete set null,
  title text not null,
  description text,
  photo_url text,
  status text check (status in ('Open','Closed')) default 'Open',
  created_at timestamptz default now()
);

create table if not exists public.ticket_updates (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  note text not null,
  created_at timestamptz default now()
);

-- PROJECTS (UUID ids)
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text check (status in ('Open','Closed')) default 'Open',
  created_at timestamptz default now()
);

create table if not exists public.project_updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  note text not null,
  created_at timestamptz default now()
);

-- PROCEDURES (UUID ids)
create table if not exists public.procedures (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete set null,
  title text not null,
  content text not null,
  is_public boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- updated_at trigger
create or replace function public.touch_updated_at()
returns trigger as $$ begin new.updated_at = now(); return new; end; $$ language plpgsql;
drop trigger if exists procedures_touch on public.procedures;
create trigger procedures_touch before update on public.procedures
for each row execute procedure public.touch_updated_at();

-- RLS
alter table public.profiles enable row level security;
alter table public.tickets enable row level security;
alter table public.ticket_updates enable row level security;
alter table public.projects enable row level security;
alter table public.project_updates enable row level security;
alter table public.procedures enable row level security;

-- Profiles policies
drop policy if exists profiles_select_all on public.profiles;
drop policy if exists profiles_update_self on public.profiles;
drop policy if exists profiles_insert_self on public.profiles;

create policy profiles_select_all on public.profiles for select using ( true );
create policy profiles_update_self on public.profiles for update using ( auth.uid() = id );
create policy profiles_insert_self on public.profiles for insert with check ( auth.uid() = id );

-- Tickets policies
drop policy if exists tickets_insert_if_approved on public.tickets;
drop policy if exists tickets_select_all on public.tickets;
drop policy if exists tickets_update_own_or_admin on public.tickets;

create policy tickets_insert_if_approved on public.tickets for insert with check (
  exists(select 1 from public.profiles p where p.id=auth.uid() and p.approved = true)
);
create policy tickets_select_all on public.tickets for select using ( true );
-- Store admin email in DB setting so RLS can read it
-- Run once (after adjusting if needed):
-- select set_config('app.admin_email', 'Anthony.McHughNH@gmail.com', false);

create policy tickets_update_own_or_admin on public.tickets for update using (
  owner_id = auth.uid() or auth.jwt() ->> 'email' = current_setting('app.admin_email', true)
);

-- Ticket updates policies
drop policy if exists ticket_updates_insert_if_approved on public.ticket_updates;
drop policy if exists ticket_updates_select_all on public.ticket_updates;

create policy ticket_updates_insert_if_approved on public.ticket_updates for insert with check (
  exists(select 1 from public.profiles p where p.id=auth.uid() and p.approved=true)
);
create policy ticket_updates_select_all on public.ticket_updates for select using ( true );

-- Projects policies
drop policy if exists projects_insert_if_approved on public.projects;
drop policy if exists projects_select_all on public.projects;
drop policy if exists projects_update_if_approved on public.projects;

create policy projects_insert_if_approved on public.projects for insert with check (
  exists(select 1 from public.profiles p where p.id=auth.uid() and p.approved=true)
);
create policy projects_select_all on public.projects for select using ( true );
create policy projects_update_if_approved on public.projects for update using (
  exists(select 1 from public.profiles p where p.id=auth.uid() and p.approved=true)
);

-- Project updates policies
drop policy if exists project_updates_insert_if_approved on public.project_updates;
drop policy if exists project_updates_select_all on public.project_updates;

create policy project_updates_insert_if_approved on public.project_updates for insert with check (
  exists(select 1 from public.profiles p where p.id=auth.uid() and p.approved=true)
);
create policy project_updates_select_all on public.project_updates for select using ( true );

-- Procedures policies
drop policy if exists procedures_insert_if_approved on public.procedures;
drop policy if exists procedures_select_public_or_own on public.procedures;
drop policy if exists procedures_update_own on public.procedures;

create policy procedures_insert_if_approved on public.procedures for insert with check (
  exists(select 1 from public.profiles p where p.id=auth.uid() and p.approved=true)
);
create policy procedures_select_public_or_own on public.procedures for select using (
  is_public = true or owner_id = auth.uid()
);
create policy procedures_update_own on public.procedures for update using (
  owner_id = auth.uid()
);
