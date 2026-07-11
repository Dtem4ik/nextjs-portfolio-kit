# Database migration — portfolio moved to the `portfolio` schema

**Date:** 2026-07-11
**Type:** in-place schema move (no project change, no data transfer between projects)

## What changed and why

The Supabase project `supabase-nextjs-portfolio-kit` (ref `zlcifmgakksqxkpowzaa`,
region `us-east-1`, Free plan) is being repurposed as the database for a second app
(**olim-app**). To keep the two apps from colliding in `public`, this portfolio's
tables were moved out of `public` into a dedicated **`portfolio`** schema. The
`public` schema is now empty and reserved for olim-app (its tables/migrations will be
added later, separately).

Tables moved (with data, indexes, constraints and FKs intact, via
`ALTER TABLE ... SET SCHEMA portfolio`):

    profile, projects, commits, releases, activity_items, ai_summaries,
    sync_state, chat_logs

Row counts were identical before/after (e.g. commits 233, activity_items 73,
projects 3). `public` REST now returns 404 for these tables; `portfolio` returns 200.

## Code change

One file: [`lib/portfolio/supabase.ts`](../lib/portfolio/supabase.ts). The app talks to
PostgREST with raw `fetch` and the `service_role` key. `supabaseHeaders()` now sends
the PostgREST schema-profile headers so every request targets `portfolio`:

    "Accept-Profile": "portfolio",   // reads (GET)
    "Content-Profile": "portfolio",  // writes (POST/PATCH/DELETE)

No call sites changed.

## Environment matrix

**No env values changed** — it is the same Supabase project. `NEXT_PUBLIC_SUPABASE_URL`
and `SUPABASE_SERVICE_ROLE_KEY` point at the same project as before; only the schema
(selected in-code via the headers above) is different.

> Caveat: `.env.local` contains duplicate keys (a manual block + a Vercel-integration
> block). The real values are the **later, non-empty** occurrences; the first
> `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` are empty placeholders.
> dotenv resolves to the last non-empty value, so the app is unaffected.

## Required dashboard setting

Project Settings → Integrations → **Data API → Settings → Exposed schemas** must
include `portfolio` (alongside `public`, `graphql_public`). Without it PostgREST
silently returns nothing. This was enabled as part of the migration.

## Rollback (fast, reversible)

Nothing was destroyed. To fully revert:

1. DB — move tables back to `public`:

   ALTER TABLE portfolio.<t> SET SCHEMA public; -- for each of the 8 tables

2. Code — revert the `Accept-Profile` / `Content-Profile` headers in `supabaseHeaders()`.

A full `pg_dump` of `public` was taken immediately before the move as an extra safety
net (kept outside the repo).

## Moving portfolio back out to its own project (later)

If the two apps outgrow the shared Free-plan database (500 MB, shared egress), split:

    pg_dump "$SHARED_DB_URL" --no-owner --no-privileges -n portfolio > p.sql
    sed -E 's/\bportfolio\./public./g; s/^COPY portfolio\./COPY public./' p.sql \
      | psql "$NEW_STANDALONE_DB_URL"

Then revert the header change (or repoint it) and update env to the new project.

### Split trigger (decide now, not "when it grows")

Split when **either** is true:

- olim-app gains real users, **or**
- the shared DB passes ~300 MB (check Project Settings → Usage periodically).

## Verification performed

- Row counts identical for all 8 tables (pre-move public vs post-move portfolio).
- REST: `portfolio` schema → HTTP 200 with real rows; `public` → HTTP 404.
- `pnpm typecheck`, `pnpm lint`, `pnpm build` all clean; build generated project
  routes from the DB (read path).
- Local `/api/ask` returned real project data (read path); `/api/cron/sync` returned
  `{"ok":true,"persisted":true,"projects":3}` and `portfolio.sync_state` updated
  (write path).
