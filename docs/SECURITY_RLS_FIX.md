# Security fix: enable RLS on the `portfolio` schema

**Date:** 2026-07-29
**Project:** Supabase `zlcifmgakksqxkpowzaa`
**Advisor errors resolved:** 8 × `rls_disabled_in_public` (one per table in the `portfolio` schema).

> ⚠️ **Shared project.** This Supabase project hosts a **second application (Olim
> App) in the `public` schema**, with its own tables and RLS policies. Nothing in
> this fix touches `public`. Never alter, drop, or re-grant anything there.

## The problem

The `portfolio` schema (8 tables) is exposed through the Supabase Data API
(PostgREST) — it is listed under **Exposed schemas** so the site could reach it —
and the API roles `anon` / `authenticated` hold **full DML grants** on every
table (`SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER`). With no
Row-Level Security, anyone holding the project's public **anon / publishable key**
(which ships in every page) could **read, insert, update and delete** these rows.

- `chat_logs` → privacy (visitor questions must never be publicly readable).
- `projects` / `commits` / `activity_items` / `releases` → data integrity.

## 1. Backup (taken first)

Full `pg_dump` (schema + data) of only the `portfolio` schema, stored **outside
the repo** and never committed:

```
/Users/tem4ik/Desktop/dtem4ik.dev/_db-backups/portfolio-schema-20260729-143228.sql
```

- Size: **181 KB**, **8** `CREATE TABLE`, **8** `COPY` data blocks.
- Row counts at backup time: `projects` 4, `commits` 289, `activity_items` 117,
  `releases` 5, `sync_state` 1, and `profile` / `chat_logs` / `ai_summaries` 0.
- `pg_dump` 16 refused the 17.6 server; used the installed
  `postgresql@17` binary (`/usr/local/Cellar/postgresql@17/17.10/bin/pg_dump`).

## 2. Access audit (who really touches these tables)

All portfolio DB access lives in [`lib/portfolio/supabase.ts`](../lib/portfolio/supabase.ts),
which starts with `import "server-only"` and authenticates with
`SUPABASE_SERVICE_ROLE_KEY` (never the anon key). It sets `Accept-Profile` /
`Content-Profile: portfolio` so PostgREST targets the schema. The browser only
ever calls **server routes** (`/api/ask`, `/api/cron/sync`); it never sends a
request to the `portfolio` schema itself.

- **Read path:** `readPortfolioSnapshot()` in `lib/portfolio/supabase.ts`, called
  by `getPortfolioData()` in `lib/portfolio/data.ts`, rendered by the server
  components under `app/[lang]/**`.
- **Write path:** the daily GitHub sync `GET /api/cron/sync`
  (`app/api/cron/sync/route.ts`) → `persistPortfolioSnapshot()` +
  `deleteChangelogForDay()`.
- **Ask chat:** `POST /api/ask` (`app/api/ask/route.ts`) runs server-side; it
  _reads_ portfolio context via service_role and streams an answer. **It does not
  write to `chat_logs`.** `chat_logs`, `ai_summaries` and `profile` are defined in
  the schema but the current app never reads or writes them (0 rows, no code path).

| Table            | Server (service_role) | Browser (anon) | Access in code                                                                                           |
| ---------------- | --------------------- | -------------- | -------------------------------------------------------------------------------------------------------- |
| `projects`       | read + write          | **none**       | `readPortfolioSnapshot`, `persistPortfolioSnapshot`                                                      |
| `commits`        | read + write          | **none**       | same                                                                                                     |
| `releases`       | read + write          | **none**       | same                                                                                                     |
| `activity_items` | read + write + delete | **none**       | `readPortfolioSnapshot`, `persistPortfolioSnapshot`, `deleteChangelogForDay`, `readExistingChangelogIds` |
| `sync_state`     | read + write          | **none**       | freshness marker in `readPortfolioSnapshot` / `persistPortfolioSnapshot`                                 |
| `profile`        | — (defined, unused)   | **none**       | none                                                                                                     |
| `chat_logs`      | — (defined, unused)   | **none**       | none                                                                                                     |
| `ai_summaries`   | — (defined, unused)   | **none**       | none                                                                                                     |

**Conclusion:** the browser (anon) never talks to the `portfolio` schema. Every
access is server-side through `service_role`, which **bypasses RLS**. So the fix
is: enable RLS everywhere and add **no policies**. Least privilege — anon gets
nothing, and nothing in the app breaks.

## 3. The migration

[`docs/migrations/2026-07-29-enable-rls-portfolio.sql`](migrations/2026-07-29-enable-rls-portfolio.sql) —
idempotent, non-destructive (changes no data, drops nothing), scoped to
`portfolio.*` only:

```sql
alter table portfolio.profile        enable row level security;
alter table portfolio.projects       enable row level security;
alter table portfolio.commits        enable row level security;
alter table portfolio.releases       enable row level security;
alter table portfolio.activity_items enable row level security;
alter table portfolio.ai_summaries   enable row level security;
alter table portfolio.sync_state     enable row level security;
alter table portfolio.chat_logs      enable row level security;
```

Applied to the remote inside a single transaction (`psql --single-transaction`,
`ON_ERROR_STOP=1`). No errors.

## 4. Policies

**None.** The audit proved there is no browser (anon) path to any of these
tables, so the minimum set of policies is the empty set. With RLS **on** and **no
policy**, `anon`/`authenticated` are denied on every command while `service_role`
(the only role the app uses) keeps full access.

Guidance for the future, if a feature ever reads/writes from the browser:

- Table read directly in the browser → `... for select to anon using (true);`
- `chat_logs` written from the browser → **insert-only, no select**:
  `create policy "anon insert" on portfolio.chat_logs for insert to anon with check (true);`
  (never add a `select` policy — visitor questions must not be publicly readable).

Add such a policy **only after a real breakage proves it is needed.**

## 5. Verification (real, not assumed)

### RLS state after the migration

```
portfolio: 8 tables, 8 with rowsecurity=on, 0 policies
public (Olim): 7 tables, 7 with rowsecurity=on, 12 policies  ← unchanged
```

### Attack test — project **anon** key vs. all 8 tables (via PostgREST REST)

The anon key is valid (SELECT returns HTTP 200), but RLS returns **zero rows**
even for tables with real data, and every write is rejected:

```
                 SELECT        INSERT                         UPDATE (all rows)   DELETE (all rows)
profile          200 []        401 42501 RLS violation        200 []              200 []
projects         200 []        401 42501 RLS violation        200 []              200 []
commits          200 []        401 42501 RLS violation        200 []              200 []
releases         200 []        401 42501 RLS violation        200 []              200 []
activity_items   200 []        401 42501 RLS violation        200 []              200 []
ai_summaries     200 []        401 42501 RLS violation        200 []              200 []
sync_state       200 []        401 42501 RLS violation        200 []              200 []
chat_logs        200 []        401 42501 RLS violation        200 []              200 []
```

- `INSERT` → `HTTP 401 {"code":"42501","message":"new row violates row-level
security policy for table \"…\""}`.
- `UPDATE`/`DELETE` with an always-true PK filter → `HTTP 200 []`: **0 rows
  affected**, because RLS hides every row from anon.
- Residue check via service_role afterwards: **0** rows containing the `__atk`
  test marker in any table — no injected row survived.

**Control (same REST endpoint):**

```
service_role  projects → 4 rows    commits → 289    activity_items → 117    sync_state → 1
anon          projects → 0 rows    commits → 0      activity_items → 0      sync_state → 0
```

Same key type is the only difference — proving RLS (not a broken request) is what
blocks anon, and that the server's service_role path still sees everything.

### Site regression test (dev server, real requests)

- `GET /`, `/en`, `/en/projects`, `/en/activity` → **HTTP 200**, all rendering
  real DB data (GenWidget AI, Olim App, releases, AI changelog items).
- `POST /api/ask` "What projects are in this portfolio?" → **HTTP 200**, answered
  from live DB context ("Olim App…", "GenWidget AI…").
- `GET /api/cron/sync` (with `CRON_SECRET`) → **HTTP 200**
  `{"ok":true,"persisted":true,"source":"github","projects":4}`. `sync_state`
  advanced `06:48 → 09:38Z` and `commits` went **289 → 290** — a real
  service_role write succeeded **under RLS**.

### Olim App unaffected

`public` schema was never referenced by the migration and is unchanged: still 7
tables, all RLS on, 12 policies intact.

## Recommended follow-ups (defence-in-depth — optional, owner action)

RLS above already closes the hole. As extra hardening the owner can, from the
Supabase SQL editor / dashboard:

1. **Revoke the blanket API-role grants** (service_role keeps its own and bypasses
   RLS regardless):
   ```sql
   revoke all on all tables in schema portfolio from anon, authenticated;
   alter default privileges in schema portfolio revoke all on tables from anon, authenticated;
   ```
2. **Remove `portfolio` from Exposed schemas** (Project Settings → API → Exposed
   schemas). The app uses `service_role`, which is not gated by that list, so
   PostgREST no longer needs to serve `portfolio` to anon at all. The audit shows
   this breaks nothing.
