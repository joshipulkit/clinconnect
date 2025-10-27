-- 02_policies.sql (RLS policies)
-- WARNING: This is a practical starting point. Tighten for production as needed.

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.medical enable row level security;
alter table public.feedback enable row level security;
alter table public.doctor_registry enable row level security;
alter table public.checkins enable row level security;

-- PROFILES
drop policy if exists profiles_select_all on public.profiles;
drop policy if exists profiles_insert_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;

-- Anyone may read (used for identifier availability and doctor lists)
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
drop policy if exists feedback_delete_owner_or_author on public.feedback;

create policy feedback_select_owner_or_doctor on public.feedback
for select using (
  auth.uid() = user_id or exists (select 1 from public.profiles p where p.id = auth.uid() and p.category = 'doctor')
);

create policy feedback_insert_patient_or_doctor on public.feedback
for insert with check (
  (auth.uid() = user_id and author = 'patient')
  or (exists (select 1 from public.profiles p where p.id = auth.uid() and p.category = 'doctor') and author = 'doctor')
);

create policy feedback_delete_owner_or_author on public.feedback
for delete using (
  (auth.uid() = user_id and author = 'patient')
  or (exists (select 1 from public.profiles p where p.id = auth.uid() and p.category = 'doctor') and author = 'doctor')
);

-- CHECKINS
drop policy if exists checkins_select_access on public.checkins;
drop policy if exists checkins_insert_owner on public.checkins;

create policy checkins_select_access on public.checkins
for select using (
  auth.uid() = user_id
  or exists (
    select 1
    from public.profiles patient
    join public.profiles doctor on doctor.employee_id = patient.assigned_doctor_employee_id
    where patient.id = user_id and doctor.id = auth.uid()
  )
);

create policy checkins_insert_owner on public.checkins
for insert with check (auth.uid() = user_id);

-- DOCTOR REGISTRY
drop policy if exists doctor_registry_select_any on public.doctor_registry;

create policy doctor_registry_select_any on public.doctor_registry
for select using (true);

-- STORAGE NOTE:
-- Create a public bucket named 'media' in Supabase Storage (or make it private and use signed URLs in the app).

drop policy if exists storage_media_select on storage.objects;
drop policy if exists storage_media_insert on storage.objects;
drop policy if exists storage_media_delete on storage.objects;

create policy storage_media_select on storage.objects
for select using (
  bucket_id = 'media' and auth.role() = 'authenticated'
);

create policy storage_media_insert on storage.objects
for insert with check (
  bucket_id = 'media' and auth.role() = 'authenticated'
);

create policy storage_media_delete on storage.objects
for delete using (
  bucket_id = 'media' and auth.uid() = owner
);

-- APPOINTMENTS
alter table public.appointments enable row level security;

drop policy if exists appointments_select_access on public.appointments;
drop policy if exists appointments_insert_doctor on public.appointments;
drop policy if exists appointments_delete_doctor on public.appointments;

create policy appointments_select_access on public.appointments
for select using (
  auth.uid() = doctor_id or auth.uid() = patient_id
);

create policy appointments_insert_doctor on public.appointments
for insert with check (auth.uid() = doctor_id);

create policy appointments_delete_doctor on public.appointments
for delete using (auth.uid() = doctor_id);
