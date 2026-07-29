-- Migration: enable Row-Level Security on every table in the `portfolio` schema.
--
-- Why: the `portfolio` schema is exposed through the Supabase Data API (PostgREST)
-- and the API roles (`anon`, `authenticated`) hold table grants on it. Without RLS,
-- anyone holding the project's public anon/publishable key — which ships in every
-- page — could read, insert, update and delete these rows. Supabase Security
-- Advisor flagged all 8 tables with `rls_disabled_in_public`.
--
-- Access audit (see docs/SECURITY_RLS_FIX.md): the portfolio app reaches these
-- tables ONLY server-side, through `SUPABASE_SERVICE_ROLE_KEY` in
-- lib/portfolio/supabase.ts (`import "server-only"`). The browser never talks to
-- the `portfolio` schema directly — the Ask chat calls the server route /api/ask,
-- and the GitHub sync runs in the /api/cron/sync server route. `service_role`
-- BYPASSES RLS, so enabling RLS does not affect any server path.
--
-- Therefore the correct fix is: enable RLS on all 8 tables and add NO policies.
-- With RLS on and no policy, `anon`/`authenticated` are denied on every command
-- (select returns zero rows; insert/update/delete are rejected), while the
-- server's `service_role` keeps full access.
--
-- Idempotent: `enable row level security` is a no-op if RLS is already on.
-- Non-destructive: it changes no data and drops nothing.
--
-- Scope: this touches ONLY the `portfolio` schema. The project's `public` schema
-- belongs to a second application (Olim App) and MUST NOT be altered here.

alter table portfolio.profile        enable row level security;
alter table portfolio.projects       enable row level security;
alter table portfolio.commits        enable row level security;
alter table portfolio.releases       enable row level security;
alter table portfolio.activity_items enable row level security;
alter table portfolio.ai_summaries   enable row level security;
alter table portfolio.sync_state     enable row level security;
alter table portfolio.chat_logs      enable row level security;

-- No policies are created. The audit proved no browser (anon) path exists, so
-- least privilege = zero policies. If a future feature reads a table directly
-- from the browser, add the narrowest policy it needs, e.g.:
--   create policy "public read" on portfolio.projects for select to anon using (true);
-- and for browser-written visitor logs (insert only, never publicly readable):
--   create policy "anon insert" on portfolio.chat_logs for insert to anon with check (true);
-- Add such a policy only after a real breakage proves it is needed.

-- ---------------------------------------------------------------------------
-- OPTIONAL defence-in-depth (NOT required; RLS above already closes the hole).
-- Left here for the project owner to apply from the Supabase SQL editor if
-- desired. Both are safe: `service_role` keeps its own grants and bypasses RLS.
--
-- 1) Revoke the blanket DML grants the API roles currently hold on the schema:
--
--   revoke all on all tables in schema portfolio from anon, authenticated;
--   alter default privileges in schema portfolio revoke all on tables from anon, authenticated;
--
-- 2) Remove `portfolio` from the Data API "Exposed schemas" (Dashboard →
--    Project Settings → API → Exposed schemas). The app uses `service_role`,
--    which is not restricted by the exposed-schema list, so removing it does
--    not break the site and stops PostgREST from serving the schema to anon.
-- ---------------------------------------------------------------------------
