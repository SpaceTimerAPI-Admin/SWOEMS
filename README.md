# EMS Dashboard (Production, UUID IDs)

## Setup
1. Copy `.env.example` to `.env` and set values.
2. In Supabase SQL editor, run `src/lib/schema.sql` (UUID primary keys + RLS).
3. Storage buckets (public read): `ticket-photos`, `park-assets`.
4. Supabase Auth: create admin user `Anthony.McHughNH@gmail.com` (set password manually).
5. Local: `npm install && npm run dev`.
6. Netlify: build `npm run build`, publish `dist`. ENV: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_ADMIN_EMAIL`.
