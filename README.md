# ClinConnect — GitHub Pages + Supabase Auth (final)

This build uses **Supabase Auth (email/password)** and Supabase DB/Storage. It’s fully static, so it runs perfectly on **GitHub Pages** and updates live via API—no redeploys needed.

## Structure
```
Main/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── config.js      # set your SUPABASE_URL + ANON KEY
│   └── app.js         # UI + Supabase Auth + DB/Storage calls
├── assets/
│   └── images/
│       └── logo.png
└── supabase_sql/
    ├── 01_schema.sql
    └── 02_policies.sql
```

---

## Step-by-step: Launch on GitHub Pages

### 1) Create a free Supabase project
- Sign up at https://supabase.com (free tier is fine).
- Create a new project.
- In **Authentication → Providers → Email**, for easiest testing, **disable “Confirm email”** so signups are immediately logged in. (You can re-enable later.)

### 2) Run SQL (tables + RLS)
- Open Supabase **SQL Editor**.
- Paste and run `supabase_sql/01_schema.sql`.
- Paste and run `supabase_sql/02_policies.sql`.

### 3) Create Storage bucket
- Go to **Storage → Create bucket** named `media`.
- Set it to **Public** (or Private if you prefer signed URLs; app currently expects Public).

### 4) Get your API keys
- **Project Settings → API**: copy
  - `Project URL` (e.g., `https://xxxx.supabase.co`)
  - `anon` (public) key

### 5) Configure the frontend
- Open `js/config.js` and set:
  ```js
  window.CLINCONNECT_SUPABASE = {
    SUPABASE_URL: "https://YOUR-PROJECT.ref.supabase.co",
    SUPABASE_ANON_KEY: "YOUR-ANON-PUBLIC-KEY"
  };
  ```

### 6) Push to GitHub and enable Pages
- Create a new GitHub repo, add this **Main/** folder to the root.
- Commit + push.
- In **Settings → Pages**, set **Source** to **Deploy from a branch**, choose the branch (e.g., `main`) and **root** (or `/Main` if you prefer publishing only that subfolder). Save.
- Visit the Pages URL to use the app.

> Done! Your site reads/writes via Supabase instantly. No redeploy required.

---

## How it works
- **Sign up:** Uses `supabase.auth.signUp(email, password)` then creates the user’s profile in `public.profiles` (category, fullname, username, phone, email). If the user is a patient, we also seed `public.medical`.
- **Login:** Accepts **username/email/phone** + password; if not an email, we look up the email in `profiles`, then call `signInWithPassword`.
- **Patient dashboard:** Edit **medical history**; submit **text feedback** or **photo** (uploads to `media/<username>/...`).
- **Doctor dashboard:** List all patients, open a patient to view profile/medical/timeline; add **doctor comments** to any feedback.
- **Timeline:** Reverse chronological for both patient & doctor entries.

### Security notes
- RLS policies are practical: patients can only read/write their own medical & feedback; **doctors can view all** and add comments. `profiles` is world-readable for duplicate checks and listing; tighten this if needed.
- For production hardening:
  - Keep **Confirm Email** enabled and handle “verify email” flow.
  - Make `media` **private** and use **signed URLs** with short expiry.
  - Restrict `profiles` SELECT to owner + doctors (remove public SELECT) and perform duplicate checks via a controlled RPC.

