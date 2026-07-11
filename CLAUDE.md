# CLAUDE.md

The full agent guide for this repo lives in **[AGENTS.md](AGENTS.md)** — read it
first. It covers the architecture, data/AI flow, key files, and conventions.

Most important, at a glance:

- **`portfolio.config.ts` is the single source of truth** — prefer config over hardcoding.
- **Don't hardcode UI text** — use `dictionaries/en.json` + `ru.json` (keep both in sync, identical keys).
- **Server Components by default**; `"use client"` only on the smallest leaf that needs it.
- **Semantic Tailwind tokens only** (Tailwind v4 CSS-first; no `tailwind.config`).
- **pnpm**; Conventional Commits; run `pnpm typecheck && pnpm lint && pnpm build` before finishing.
- **DB data lives in the `portfolio` schema, not `public`** — the Supabase project is shared with olim-app (which owns `public`). Don't touch `public` or drop the schema-profile headers in `lib/portfolio/supabase.ts`. See [docs/DB_MIGRATION.md](docs/DB_MIGRATION.md).
