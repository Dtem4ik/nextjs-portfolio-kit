# AGENTS.md

Guide for AI coding agents (Claude Code, Codex, Cursor, …) working in this repo.

## What this project is

A forkable **AI developer portfolio** built on Next.js 16. Everything is driven by
one config file; pages and data sources are opt-in. Signature feature: a Vercel
Cron turns GitHub commits into AI-written, per-locale changelog "news" (Gemini via
the Vercel AI SDK), cached in Supabase — plus a streaming "Ask" Q&A grounded in the
portfolio data.

## Golden rules

- **`portfolio.config.ts` is the single source of truth.** Identity, skills,
  experience, projects, page toggles (`features`), integration settings
  (`integrations`), and locales all live here. Prefer editing config over
  hardcoding values in components.
- **Never hardcode user-facing text.** Read it from `dictionaries/en.json` /
  `dictionaries/ru.json` via `getDictionary(locale)`. When you add or change a
  string, update **both** files — they must have identical key structure (there is
  no compile-time check for parity).
- **Server Components by default.** Add `"use client"` only on the smallest leaf
  that truly needs hooks/browser APIs (e.g. `ask-panel`, `mobile-nav`, toggles).
- **Semantic Tailwind tokens** (`bg-background`, `text-muted-foreground`, …), never
  hardcoded colors. Tailwind v4 is CSS-first — there is **no `tailwind.config`**.
- **pnpm only.** Conventional Commits (English, imperative).
- Run `pnpm typecheck && pnpm lint && pnpm build` before finishing a change.
- **All DB data lives in the `portfolio` schema, NOT `public`.** This Supabase
  project is shared with another app (olim-app), which owns `public`. Never create,
  read, write, or migrate tables in `public`, and never remove the `Accept-Profile` /
  `Content-Profile: portfolio` headers in `lib/portfolio/supabase.ts` — doing so
  silently breaks every DB read/write (PostgREST 404s in `public`). See
  [`docs/DB_MIGRATION.md`](docs/DB_MIGRATION.md).

## Stack

Next.js 16 (App Router) · React 19 · TypeScript 5 (strict) · Tailwind CSS v4 ·
shadcn/ui (New York) · Vercel AI SDK (`ai` + `@ai-sdk/google`) · Supabase (REST) ·
next-themes · react-markdown · pnpm · Vercel.

## Key files

- `portfolio.config.ts` — config: `features` (which pages exist), `integrations`
  (`github` / `ai` / `supabase`), profile fields, `projects`, `locale`.
- `lib/portfolio/`
  - `types.ts` — domain types (`PortfolioProject`, `ActivityItem`, …).
  - `github.ts` — fetch repo stats / commits / releases / languages, with config fallback.
  - `data.ts` — `getPortfolioData(locale)` resolves **Supabase snapshot → live GitHub → config fallback**; `buildFreshPortfolioData()` is used by the cron.
  - `supabase.ts` — server-only REST read/write of the snapshot cache; reads are ISR-cached. Targets the **`portfolio`** schema via `Accept-Profile`/`Content-Profile` headers (the shared project's `public` belongs to olim-app).
  - `ai.ts` — `generateChangelogActivity()` (commit → news, per locale, skips already-stored commits) and `createAskResponse()` (streaming Ask); provider dispatch gemini/openai/anthropic.
  - `dictionaries.ts` / `structured-data.ts` — i18n loader / JSON-LD Person.
- `app/[lang]/` — locale-prefixed pages (`page`, `about`, `projects`, `projects/[slug]`, `activity`, `ask`). Each optional page guards its `features` flag → `notFound()` when off.
- `app/api/cron/sync/route.ts` — daily cron: fresh GitHub → generate news → persist to Supabase.
- `app/api/ask/route.ts` — feature-gated + rate-limited streaming Ask endpoint.
- `components/portfolio/` — presentational pieces + `site-shell` (nav derived from `features` + dict), `ask-panel` (client; streams and renders Markdown), `mobile-nav`.
- `dictionaries/{en,ru}.json` — all UI strings. `docs/supabase-schema.sql` — DB schema.

## Data & AI flow

- Pages → `getPortfolioData(locale)` → ISR-cached Supabase read (`revalidate`), else
  live GitHub, else config fallback. Missing keys degrade gracefully.
- Cron (`/api/cron/sync`, daily, **production only**) fetches fresh GitHub, generates
  AI news for **new** commits only, and writes the snapshot. Needs Supabase env +
  `CRON_SECRET`.
- Ask streams tokens via the Vercel AI SDK; the client renders them as Markdown.

## Commands

```bash
pnpm dev        # dev server
pnpm build      # production build
pnpm lint       # ESLint  (lint:fix to auto-fix)
pnpm format     # Prettier
pnpm typecheck  # tsc --noEmit
```

## Environment (all optional — see `.env.example` and README → "Deploy Your Own")

`GEMINI_API_KEY` (or `OPENAI_API_KEY` / `ANTHROPIC_API_KEY`),
`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`, `GITHUB_TOKEN`.

## Gotchas

- Toggling a page in `features` updates the nav, sitemap, and route guard together — a disabled page 404s.
- Adding a project: `{ repo, slug }` is enough; name/description/stack/stars/commits come from GitHub.
- `integrations.ai.model` has a fallback chain; a given API key may lack quota for a specific Gemini model.
- Updating the avatar: image URLs are cached — rename the file and update `avatar` in config.
- `components/ui/` is shadcn CLI-managed — add via `pnpm dlx shadcn@latest add <name>`, don't hand-edit.
- **Shared Supabase project.** `public` is reserved for olim-app; portfolio tables
  live in `portfolio`. A new table must be created **in `portfolio`** (`create table
portfolio.<name> …`), exposed in Data API → Exposed schemas, and granted to the API
  roles — otherwise the REST call 404s. Don't `pg_dump`/restore or truncate `public`.
  `docs/supabase-schema.sql` documents the tables (now under `portfolio`).
