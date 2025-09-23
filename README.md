# EMS Dashboard (Production)

## Setup
1. Copy `.env.example` to `.env` and set values.
2. In Supabase, run `src/lib/schema.sql` in SQL editor.
3. Create storage buckets `ticket-photos` and `park-assets` (public read).
4. Create admin user in Supabase Auth: `Anthony.McHughNH@gmail.com` (set password manually).
5. `npm install && npm run dev` locally.
6. Deploy to Netlify: build `npm run build`, publish `dist`. Add env vars `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_ADMIN_EMAIL`.
