# EMS Dashboard (Production)

## Setup
1. Copy `.env.example` to `.env` and set values.
2. Run `src/lib/schema.sql` in Supabase SQL editor.
3. Create storage buckets `ticket-photos` and `park-assets`.
4. Add admin user in Supabase Auth: `Anthony.McHughNH@gmail.com`.
5. `npm install && npm run dev` locally.
6. Deploy to Netlify with env vars and build command `npm run build`.
