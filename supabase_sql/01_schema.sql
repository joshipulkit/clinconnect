-- 01_schema.sql (Supabase Auth edition)
-- Uses auth.users for authentication; stores domain data in public tables.

-- PROFILE DATA (linked 1:1 to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  category text check (category in ('doctor','patient')) not null,
  fullname text not null,
  username text unique not null,
  phone text unique not null,
  email text unique not null,
  created_at timestamptz not null default now()
);

-- MEDICAL (per patient)
create table if not exists public.medical (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  history text default '',
  updated_at timestamptz not null default now()
);

-- FEEDBACK (patient feedback + doctor comments)
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  author text check (author in ('patient','doctor')) not null,
  type text check (type in ('text','image')) not null,
  text text,
  image_path text,
  reply_to uuid references public.feedback(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_profiles_username on public.profiles using btree (username);
create index if not exists idx_profiles_phone on public.profiles using btree (phone);
create index if not exists idx_feedback_user_id_created on public.feedback (user_id, created_at desc);
