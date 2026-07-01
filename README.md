# Next.js AI Portfolio Kit

An open-source developer portfolio system that anyone can fork, deploy to Vercel, edit one config file, and get a live engineering profile.

This is not a static resume. The app turns selected GitHub repositories into project pages, readable engineering activity, changelog-style updates, and grounded portfolio Q&A.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Dtem4ik/nextjs-portfolio-kit)

## What It Includes

- Next.js 16 App Router, React 19, TypeScript strict mode
- Tailwind CSS v4 with CSS-first OKLCH tokens
- Single source of truth in `portfolio.config.ts`
- GitHub API project import for selected repositories
- Activity feed that turns commits and releases into readable updates
- Optional OpenAI-powered ask endpoint grounded in indexed portfolio data
- Optional Supabase persistence for projects, commits, releases, activity, AI summaries, and chat logs
- Vercel Cron route for scheduled syncs
- SEO metadata, sitemap, robots, OG image, JSON-LD Person schema, and i18n routing

## Quick Start

```bash
git clone https://github.com/Dtem4ik/nextjs-portfolio-kit.git
cd nextjs-portfolio-kit
pnpm install
cp .env.example .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Configure Your Portfolio

Edit `portfolio.config.ts`. This is the main file fork users should change:
your name, role, bio, avatar, social links, skills, experience, and projects.

Each configured project can include fallback stats, commits, releases, stack, live demo URL, and a local AI summary. The site still renders if GitHub, Supabase, or AI credentials are not configured.

## Features & Integrations

Everything beyond Home is opt-in. On a fresh fork only **Home + About** are enabled and the site renders entirely from `portfolio.config.ts` with **zero external keys**. Turn things on as you need them.

`features` — which pages exist (Home is always on):

```ts
const features = {
  projects: false, // /projects + /projects/[slug]
  activity: false, // /activity + the home-page feed
  about: true, // /about (résumé from skills + experience)
  ask: false, // /ask + /api/ask (public LLM endpoint — costs money)
};
```

Disabled pages 404, drop out of the nav, and are excluded from the sitemap.

`integrations` — data sources that enrich enabled pages. When an integration is off (or its keys are missing) pages fall back to the data in `portfolio.config.ts`:

```ts
const integrations = {
  github: { enabled: false, username: "yourname", featuredRepositories: ["repo"] },
  ai: { enabled: false, provider: "openai", model: "gpt-4o-mini" }, // or "anthropic"
  supabase: { enabled: false, maxAgeMinutes: 720 }, // read-through cache; cron refreshes it
};
```

Data resolution order at request time: **fresh Supabase snapshot → live GitHub API → config fallback.** The `/api/cron/sync` job fetches fresh from GitHub and writes the snapshot Supabase serves.

## Environment Variables

All optional — add only the keys for integrations you enable.

```bash
GITHUB_TOKEN=                 # Raises GitHub API limits (github integration works without it too)

GEMINI_API_KEY=               # AI + news when integrations.ai.provider = "gemini" (free tier)
OPENAI_API_KEY=               # ...when integrations.ai.provider = "openai"
ANTHROPIC_API_KEY=            # ...when integrations.ai.provider = "anthropic"

NEXT_PUBLIC_SUPABASE_URL=     # Supabase snapshot cache (required for the AI changelog)
SUPABASE_SERVICE_ROLE_KEY=    # Server-only key for cron sync inserts

CRON_SECRET=                  # Bearer secret protecting /api/cron/sync
```

Do not expose `SUPABASE_SERVICE_ROLE_KEY` in client code.

## GitHub Setup

1. Create a fine-grained GitHub token with read-only access to public repositories.
2. Add it as `GITHUB_TOKEN` in `.env.local` and Vercel project settings.
3. Add repository names to `portfolioConfig.github.featuredRepositories`.
4. Add matching project objects in `portfolioConfig.projects`.

The data layer fetches repository stats, languages, latest commits, and releases. If GitHub is unavailable, the app uses the fallback content from config.

## Supabase Setup

1. Create a Supabase project.
2. Open SQL Editor.
3. Run [docs/supabase-schema.sql](docs/supabase-schema.sql).
4. Add `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to Vercel.
5. Trigger `/api/cron/sync` or wait for the Vercel Cron schedule.

Tables included:

- `profile`
- `projects`
- `commits`
- `releases`
- `activity_items`
- `ai_summaries`
- `chat_logs`

The app writes through Supabase REST, so no Supabase client dependency is required for the initial template.

## AI Setup

The AI integration powers two things, both governed by `integrations.ai`:

1. **Commit-to-news changelog** — during the cron sync, recent commits for each project are turned into a polished, plain-language news entry (headline, body, tags) and stored in Supabase. This is the site's signature feature. The model runs once per sync, not per visitor, so the feed is cheap to serve.
2. **Ask page** (`/api/ask`) — grounded Q&A over your indexed portfolio context, rate-limited to curb abuse.

Set `integrations.ai.provider` and the matching key:

- `"gemini"` (default) → `GEMINI_API_KEY` — free tier at https://aistudio.google.com/apikey, model e.g. `gemini-3.1-flash-lite` (with fallbacks)
- `"openai"` → `OPENAI_API_KEY`
- `"anthropic"` → `ANTHROPIC_API_KEY`

With no key configured, Ask returns a deterministic local fallback and no AI news is generated (the feed falls back to plain commit/release activity).

The AI changelog requires Supabase + the cron job: the cron generates and stores the news; pages read it from the cached snapshot.

## Vercel Cron

`vercel.json` schedules:

```json
{
  "path": "/api/cron/sync",
  "schedule": "0 */6 * * *"
}
```

If `CRON_SECRET` is set, call the route with:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://your-domain.com/api/cron/sync
```

## Pages

- `/` - live developer dashboard
- `/projects` - GitHub-powered project index
- `/projects/[slug]` - individual project page
- `/activity` - latest engineering activity feed
- `/about` - config-driven resume/profile
- `/ask` - grounded portfolio Q&A

Locale-prefixed routes are also generated for configured non-default locales.

## Commands

```bash
pnpm dev
pnpm build
pnpm lint
pnpm format
pnpm typecheck
```

## Project Structure

```text
app/
  [lang]/
    page.tsx
    projects/
    activity/
    about/
    ask/
  api/
    ask/
    cron/sync/
components/
  portfolio/
  ui/
lib/
  portfolio/
docs/
  supabase-schema.sql
portfolio.config.ts
vercel.json
```

## License

MIT
