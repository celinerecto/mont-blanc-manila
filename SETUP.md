# Mont Blanc Manila — Setup Guide

## 1. Install dependencies

```bash
npm install
```

## 2. Create Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Copy your **Project URL** and **anon key** from Settings → API.
3. Copy your `.env.local.example` to `.env.local` and fill in the values:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## 3. Run database migrations

In the Supabase dashboard → SQL Editor, paste and run each file in order:
- `supabase/migrations/001_initial_schema.sql`
- `supabase/migrations/002_storage.sql`

This creates all tables, indexes, RLS policies, views, and seeds the 5 starter cafés.

## 4. Enable Google OAuth

1. In Supabase Dashboard → Authentication → Providers → Google
2. Enable it and add your Google OAuth Client ID + Secret
3. Add `https://your-project.supabase.co/auth/v1/callback` as an authorized redirect URI in Google Cloud Console
4. Also add `http://localhost:3000/auth/callback` for local dev

## 5. Enable Realtime

In Supabase Dashboard → Database → Replication, enable realtime for the `votes` table.

## 6. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 7. Deploy to Vercel

```bash
npx vercel --prod
```

Add your three env vars in the Vercel dashboard under Settings → Environment Variables.

---

## Data model overview

| Table   | Key columns                                           |
|---------|-------------------------------------------------------|
| cafes   | name, address, neighborhood, lat/lng, is_verified     |
| items   | cafe_id, name, variant, price, description            |
| photos  | item_id, cafe_id, user_id, storage_url                |
| reviews | item_id, user_id, body, rating (1–5)                  |
| votes   | item_id, user_id, week_number, year (unique per week) |

## Color palette

| Name          | Hex       | Usage                              |
|---------------|-----------|------------------------------------|
| Warm cream    | #FFF8F0   | Page background                    |
| Off-white     | #FFFDF9   | Card/surface background            |
| Burnt orange  | #E8621A   | Buttons, badges, vote button       |
| Caramel brown | #C4873A   | Hover states, secondary            |
| Deep espresso | #2C1A0E   | Headings                           |
| Medium brown  | #5C3D2E   | Body text                          |
| Light brown   | #A07850   | Muted text, timestamps             |
| Pale cream    | #EDD9C0   | Borders, dividers                  |
| Pale orange   | #FDE8CC   | Tags, chips, highlights            |
