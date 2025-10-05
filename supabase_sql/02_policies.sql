-- 02_policies.sql (RLS policies)
-- WARNING: This is a practical starting point. Tighten for production as needed.

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.medical enable row level security;
alter table public.feedback enable row level security;

-- PROFILES
drop policy if exists profiles_select_all on public.profiles;
drop policy if exists profiles_insert_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;

-- Anyone may read (used for username/phone availability and doctor lists)
create policy profiles_select_all on public.profiles
for select using (true);

-- Only the authenticated user can insert/update their own profile
create policy profiles_insert_own on public.profiles
for insert with check (auth.uid() = id);

create policy profiles_update_own on public.profiles
for update using (auth.uid() = id);

-- MEDICAL
drop policy if exists medical_select_owner_or_doctor on public.medical;
drop policy if exists medical_insert_owner on public.medical;
drop policy if exists medical_update_owner on public.medical;

create policy medical_select_owner_or_doctor on public.medical
for select using (
  auth.uid() = user_id or exists (select 1 from public.profiles p where p.id = auth.uid() and p.category = 'doctor')
);

create policy medical_insert_owner on public.medical
for insert with check (auth.uid() = user_id);

create policy medical_update_owner on public.medical
for update using (auth.uid() = user_id);

-- FEEDBACK
drop policy if exists feedback_select_owner_or_doctor on public.feedback;
drop policy if exists feedback_insert_patient_or_doctor on public.feedback;

create policy feedback_select_owner_or_doctor on public.feedback
for select using (
  auth.uid() = user_id or exists (select 1 from public.profiles p where p.id = auth.uid() and p.category = 'doctor')
);

create policy feedback_insert_patient_or_doctor on public.feedback
for insert with check (
  (auth.uid() = user_id and author = 'patient')
  or (exists (select 1 from public.profiles p where p.id = auth.uid() and p.category = 'doctor') and author = 'doctor')
);

-- STORAGE NOTE:
-- Create a public bucket named 'media' in Supabase Storage (or make it private and use signed URLs in the app).
