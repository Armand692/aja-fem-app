-- ============================================================
-- AJ AUXERRE FÉM — Schéma Supabase
-- À exécuter dans Supabase > SQL Editor > New query > Run
-- ============================================================

-- Table des comptes (joueuses, staff, admin)
create table if not exists public.app_users (
  username text primary key,
  password_hash text not null,
  role text not null check (role in ('admin','staff','joueuse')),
  first_name text not null,
  last_name text not null,
  created_at timestamptz not null default now()
);

-- Table des réponses wellness quotidiennes (1 ligne par joueuse par jour)
create table if not exists public.wellness_entries (
  username text not null references public.app_users(username) on delete cascade,
  entry_date date not null,
  mood int not null,
  sleep int not null,
  energy int not null,
  soreness int not null,
  muscular_pain int not null,
  stress int not null,
  total int not null,
  cycle_pain boolean not null default false,
  cycle_pain_level int,
  submitted_at timestamptz not null default now(),
  last_edited_at timestamptz,
  primary key (username, entry_date)
);

-- Table du profil de cycle menstruel (1 ligne par joueuse)
create table if not exists public.cycle_profiles (
  username text primary key references public.app_users(username) on delete cascade,
  unknown boolean not null default false,
  last_period_start date,
  cycle_length int not null default 28,
  period_length int not null default 5,
  history jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- Métadonnées diverses (ex. date de dernière sauvegarde)
create table if not exists public.app_meta (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- ============================================================
-- Row Level Security : activé, avec accès géré par la clé "anon"
-- La vraie protection applicative se fait dans le code de l'app
-- (vérification du mot de passe côté client avant toute requête).
-- Ces règles permettent à la clé publique "anon" de lire/écrire,
-- ce qui est nécessaire pour un site sans compte Supabase Auth dédié.
-- ============================================================
alter table public.app_users enable row level security;
alter table public.wellness_entries enable row level security;
alter table public.cycle_profiles enable row level security;
alter table public.app_meta enable row level security;

create policy "anon full access users" on public.app_users for all using (true) with check (true);
create policy "anon full access entries" on public.wellness_entries for all using (true) with check (true);
create policy "anon full access profiles" on public.cycle_profiles for all using (true) with check (true);
create policy "anon full access meta" on public.app_meta for all using (true) with check (true);

-- Index utiles
create index if not exists idx_entries_date on public.wellness_entries(entry_date);
create index if not exists idx_entries_username on public.wellness_entries(username);
