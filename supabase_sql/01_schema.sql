-- 01_schema.sql (Supabase Auth edition)
-- Uses auth.users for authentication; stores domain data in public tables.

-- PROFILE DATA (linked 1:1 to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  category text check (category in ('doctor','patient')) not null,
  fullname text not null,
  employee_id text unique,
  patient_id text unique,
  assigned_doctor text,
  assigned_doctor_employee_id text,
  phone text unique not null,
  email text unique not null,
  created_at timestamptz not null default now(),
  constraint profiles_role_fields_chk check (
    (category = 'doctor' and employee_id is not null and patient_id is null and assigned_doctor is null and assigned_doctor_employee_id is null)
    or (category = 'patient' and patient_id is not null and employee_id is null and assigned_doctor is not null and assigned_doctor_employee_id is not null)
  )
);

-- DOCTOR REGISTRY (manual doctor enrollment list)
create table if not exists public.doctor_registry (
  employee_id text primary key,
  full_name text not null,
  created_at timestamptz not null default now(),
  constraint doctor_registry_employee_upper check (employee_id = upper(employee_id)),
  constraint doctor_registry_full_name_not_blank check (char_length(trim(full_name)) > 0)
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

create index if not exists idx_profiles_employee_id on public.profiles using btree (employee_id);
create index if not exists idx_profiles_patient_id on public.profiles using btree (patient_id);
create index if not exists idx_profiles_phone on public.profiles using btree (phone);
create index if not exists idx_feedback_user_id_created on public.feedback (user_id, created_at desc);
