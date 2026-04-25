# Supabase setup (audience mode)

Audience mode adds a phone-friendly companion view to your presentation: live polls, anonymous Q&A, real-time slide sync, and reaction reflections. It runs on Supabase Realtime.

**You can skip this entirely** if you only need offline slide-presenting. The app works without Supabase — the audience features just won't be available.

## What you get

When Supabase is configured:

- A 6-digit **session code** generated when you start presenting. Audience scans your QR or enters the code at `/join`.
- Live **slide sync** — when you advance a slide, the audience view updates instantly.
- **Audience questions** — anyone can submit anonymous questions tied to the current slide. Presenter sees them in an overlay.
- **Live polls / quizzes** — `<LivePoll>` and `<PollQuestion>` templates collect votes in real time and reveal results when you choose.
- **Reflections** — open-text responses, optionally featured on screen.
- **Audience nav controls** — let the audience scroll back through slides they missed (toggleable).

## Step 1 — Create a Supabase project

1. Go to <https://supabase.com> and sign in (free tier is enough to start).
2. Create a new project. Pick the region closest to where you usually present.
3. Wait ~2 minutes for the database to provision.

## Step 2 — Run the migrations

The repo ships with three SQL migrations in `supabase/migrations/`:

```
0001_audience_mode.sql      sessions + audience_questions + RLS + Realtime
0002_interactions.sql       polls/quizzes + responses
0003_audience_nav.sql       allow_back / allow_forward flags
```

In your Supabase project:

1. Open the **SQL Editor** (left sidebar).
2. Click **New query**.
3. Paste the contents of `supabase/migrations/0001_audience_mode.sql` → **Run**.
4. Repeat for `0002_interactions.sql`.
5. Repeat for `0003_audience_nav.sql`.

You should see no errors. Each script is idempotent (`if not exists`) so re-running is safe.

## Step 3 — Wire up env vars

In your Supabase project, go to **Settings → API**. Copy:

- **Project URL** (looks like `https://abcdefgh.supabase.co`)
- **anon public key** (starts with `eyJhbG...`)

In your local Slidecraft repo:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
```

Restart the dev server. From now on the audience features are live.

> **Both env vars are `NEXT_PUBLIC_*`.** That's intentional — they ship to the browser. The anon key is *meant* to be public; security comes from Row Level Security (RLS) policies set up by the migrations.

## Step 4 — Try it

1. `npm run dev`
2. Open any presentation, e.g. <http://localhost:3000/demo>
3. Press **`S`** (or click the share icon) to start an audience session — you'll get a 6-digit code and a QR.
4. On your phone, open <http://localhost:3000/join> (or scan the QR) and enter the code.
5. Watch the audience view follow your slides as you press space.

## Schema summary

What the migrations actually create:

```
sessions
├── id (uuid)
├── code (6-digit, unique while active)
├── slug, theme, title
├── current_slide (presenter updates, audience reads)
├── allow_back, allow_forward (presenter controls)
└── active, expires_at (24h auto-expire)

audience_questions
├── session_id → sessions
├── slide_index (which slide it was asked on)
├── question (1-2000 chars)
└── seen (presenter marks read)

interactions   (polls / reflections)
├── session_id → sessions
├── type ('quiz' | 'reflection')
├── prompt, options (jsonb)
└── reveal_results (presenter toggles)

interaction_responses
├── interaction_id → interactions
├── audience_id (anonymous UUID kept in browser localStorage)
└── option_index | text
```

All four tables are published to `supabase_realtime` so the app gets live `postgres_changes` events.

## Security model

The migrations create **fully open RLS policies for `anon`**. Anyone with the anon key can read/write the four tables. Security comes from:

- **Session codes are 6 digits** (~1M combinations) and active for 24 hours.
- **Codes regenerate per session.** A leaked code is dead by tomorrow.
- **Anonymous IDs** are random UUIDs in audience-side localStorage — no user accounts, nothing to leak.

This is fine for typical conference / classroom use. **If you need stricter access** (private internal company decks, legally sensitive content), tighten the RLS policies and add Supabase Auth.

## Housekeeping

Sessions expire after 24h but the rows linger. Clean up periodically:

```sql
update public.sessions set active = false where expires_at < now();
delete from public.sessions where expires_at < now() - interval '30 days';
```

Schedule this as a [Supabase pg_cron job](https://supabase.com/docs/guides/database/extensions/pg_cron) once a day.

## Self-hosted Supabase

The same migrations run against a self-hosted Supabase instance. Just set `NEXT_PUBLIC_SUPABASE_URL` to your self-hosted URL. No code changes needed.

## Troubleshooting

**"Failed to start session"** → check the env vars are loaded. `NEXT_PUBLIC_*` requires a dev-server restart after editing `.env.local`.

**Audience joins but doesn't see slide changes** → Realtime publication wasn't applied. Re-run `0001_audience_mode.sql` (the do/end block at the bottom adds the tables to `supabase_realtime`).

**Connection drops during long talks** → free Supabase tier has connection limits. Upgrade or self-host if you regularly present to >200 audience members.

**RLS blocks inserts** → the migrations should have created `*_anon_insert` policies. Check **Database → Policies** in Supabase Studio. If missing, re-run the migration.
