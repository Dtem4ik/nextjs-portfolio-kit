<div align="center">

# Next.js AI Portfolio Kit

**Turn your GitHub commits into a live, bilingual engineering profile** — with AI-written changelog news, a grounded "Ask", and everything driven by one config file.

![Next.js 16](https://img.shields.io/badge/Next.js_16-000?style=for-the-badge&logo=next.js&logoColor=white)
![React 19](https://img.shields.io/badge/React_19-149ECA?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind v4](https://img.shields.io/badge/Tailwind_v4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Vercel AI SDK](https://img.shields.io/badge/Vercel_AI_SDK-000?style=for-the-badge&logo=vercel&logoColor=white)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](https://opensource.org/licenses/MIT)

[**🔗 Live demo**](https://dtem4ik.dev) &nbsp;·&nbsp; [**🚀 Deploy your own**](#deploy-your-own) &nbsp;·&nbsp; [**🩺 Troubleshooting**](#-troubleshooting)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Dtem4ik/nextjs-portfolio-kit&env=GEMINI_API_KEY,NEXT_PUBLIC_SUPABASE_URL,SUPABASE_SERVICE_ROLE_KEY,CRON_SECRET,GITHUB_TOKEN&envDescription=All%20optional%20%E2%80%94%20leave%20blank%20to%20run%20on%20config%20data%20only)

</div>

> One-click deploy gives you a working site immediately (it renders from `portfolio.config.ts`). It shows the template owner's data until you edit the config — see **Deploy your own** below. AI news + Ask and the Supabase cache light up once you add the matching env vars.

## ✨ What's Inside

- ⚡ Next.js 16 App Router, React 19, TypeScript strict mode
- 🎨 Tailwind CSS v4 with CSS-first OKLCH tokens + dark mode
- 🧩 Single source of truth in `portfolio.config.ts`
- 🐙 GitHub API import — project stats, commits, releases pulled live
- 📰 **AI changelog** — recent commits become dated, per-locale news entries
- 💬 **AI "Ask"** — grounded Q&A, streamed via the Vercel AI SDK, rendered as Markdown (Gemini by default; OpenAI/Anthropic supported)
- 🗄️ Optional Supabase snapshot cache (read-through, ISR-cached) refreshed by a Vercel Cron
- 🌍 Full i18n (en/ru), SEO metadata, sitemap, robots, dynamic OG image, JSON-LD Person schema

## Deploy Your Own

Three levels — do as much as you want; each builds on the previous. Level 2 already gives you a complete portfolio with **no keys required**.

### Level 1 — Get it live (~2 min)

- **One click:** press **Deploy with Vercel** above. Vercel forks the repo and deploys it. Leave the env prompts blank for now.
- **Or run locally:**

```bash
git clone https://github.com/Dtem4ik/nextjs-portfolio-kit.git
cd nextjs-portfolio-kit
pnpm install
cp .env.example .env.local
pnpm dev   # http://localhost:3000
```

You now have a working site rendered from `portfolio.config.ts` — still showing the template owner's data.

### Level 2 — Make it yours (~10 min, no keys)

Edit the single file **`portfolio.config.ts`**:

1. **Identity** — `name`, `role`, `bio`, `tagline`, `location`, `url`, `social`. Drop your photo at `/public/avatar.jpeg` and (optional) CV at `/public/cv.pdf`.
2. **GitHub** — set `integrations.github.username` to **your** handle and list your repos in `projects` (`{ repo, slug }` is enough; name/description/stack/stars/commits come from GitHub).
3. **About** — fill `skills` and the localized `experience` entries (en/ru).
4. **Toggles** — turn pages on/off in `features`.

Commit & push → Vercel redeploys. That's a full portfolio already.

### Level 3 — Turn on AI news + Ask (~20–30 min)

The signature feature: your commits become dated news, plus a grounded Q&A. Needs a **free** Gemini key; the news feed also needs a **free** Supabase database.

**a) AI key — enables the Ask page:**

1. Get a free key at <https://aistudio.google.com/apikey>.
2. In Vercel → **Settings → Environment Variables**, add `GEMINI_API_KEY` (Production). Redeploy → **Ask** now answers.

**b) Supabase — powers the AI news feed:**

1. Create a free project at <https://supabase.com>.
2. **SQL Editor → New query** → paste all of [`docs/supabase-schema.sql`](docs/supabase-schema.sql) → **Run**.
3. **Settings → API** → copy the **Project URL** and the **`service_role`** key (the secret one, not `anon`).
4. Add to Vercel (Production): `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and a random `CRON_SECRET`.
   _If you added Supabase through the Vercel integration, the URL + key are already there — just add `GEMINI_API_KEY` and `CRON_SECRET`._
5. Redeploy, then trigger the first sync:
   ```bash
   curl -H "Authorization: Bearer <CRON_SECRET>" https://<your-domain>/api/cron/sync
   ```
6. From then on the daily Vercel Cron re-syncs and generates news for new commits automatically.

> This repo ships configured as the author's live portfolio (all pages + integrations enabled, pointing at `github.com/Dtem4ik`). After forking, at minimum change the identity fields and `github.username`.

## ⚙️ Features & Integrations

Each toggle is opt-in. With an integration off — or its keys missing — pages fall back to the data in `portfolio.config.ts`, so the site always renders. The snippets below show the schema (in this repo they are enabled):

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
  github: { enabled: false, username: "yourname" },
  ai: { enabled: false, provider: "gemini", model: "gemini-3.1-flash-lite", newsPerProject: 5 },
  supabase: { enabled: false, maxAgeMinutes: 720 }, // read-through cache; cron refreshes it
};

// Projects only need repo + slug; name, description, stack, stars, commits and
// releases are pulled from GitHub. Optional fields override or act as fallback.
const projects = [{ repo: "your-repo", slug: "your-repo", stack: ["Next.js"] }];
```

Data resolution order at request time: **fresh Supabase snapshot → live GitHub API → config fallback.** The `/api/cron/sync` job fetches fresh from GitHub and writes the snapshot Supabase serves.

## 🔑 Environment Variables

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

## 🐙 GitHub Setup

1. Create a fine-grained GitHub token with read-only access to public repositories.
2. Add it as `GITHUB_TOKEN` in `.env.local` and Vercel project settings.
3. Add entries to `portfolioConfig.projects` — each just needs `repo` + `slug`.

The data layer fetches repository stats, languages, latest commits, and releases. If GitHub is unavailable, the app uses the fallback content from config. The AI changelog turns the last `newsPerProject` commits of each project into dated news entries (per locale).

## 🗄️ Supabase Setup

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

## 🤖 AI Setup

The AI integration powers two things, both governed by `integrations.ai`:

1. **Commit-to-news changelog** — during the cron sync, recent commits for each project are turned into a polished, plain-language news entry (headline, body, tags) and stored in Supabase. This is the site's signature feature. The model runs once per sync, not per visitor, so the feed is cheap to serve.
2. **Ask page** (`/api/ask`) — grounded Q&A over your indexed portfolio context, rate-limited to curb abuse.

Set `integrations.ai.provider` and the matching key:

- `"gemini"` (default) → `GEMINI_API_KEY` — free tier at https://aistudio.google.com/apikey, model e.g. `gemini-3.1-flash-lite` (with fallbacks)
- `"openai"` → `OPENAI_API_KEY`
- `"anthropic"` → `ANTHROPIC_API_KEY`

With no key configured, Ask returns a deterministic local fallback and no AI news is generated (the feed falls back to plain commit/release activity).

The AI changelog requires Supabase + the cron job: the cron generates and stores the news; pages read it from the cached snapshot.

## ⏰ Vercel Cron

`vercel.json` runs the sync once a day (the Vercel Hobby plan allows one cron run per day; upgrade for more frequent schedules):

```json
{
  "crons": [{ "path": "/api/cron/sync", "schedule": "0 6 * * *" }]
}
```

Cron runs only on **production** deployments and only when the Supabase env vars are set. To trigger a sync manually (e.g. right after deploy):

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://your-domain.com/api/cron/sync
```

Each run generates AI news only for **new** commits (already-processed ones are skipped), so the daily job is cheap and the feed grows over time.

## 📄 Pages

- `/` - live developer dashboard
- `/projects` - GitHub-powered project index
- `/projects/[slug]` - individual project page
- `/activity` - latest engineering activity feed
- `/about` - config-driven resume/profile
- `/ask` - grounded portfolio Q&A

Locale-prefixed routes are also generated for configured non-default locales.

## 🧰 Commands

```bash
pnpm dev
pnpm build
pnpm lint
pnpm format
pnpm typecheck
```

## 🗂️ Project Structure

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

## 🩺 Troubleshooting

- **Site shows the template owner's name / repos** — you haven't changed `name` and `integrations.github.username` in `portfolio.config.ts`.
- **No AI news appear** — check, in order: `GEMINI_API_KEY` is set (Production); `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` are set; you ran `docs/supabase-schema.sql`; you triggered `/api/cron/sync`. Cron runs only on production and once per day on the Hobby plan.
- **`/api/cron/sync` returns `persisted: false`** — the schema wasn't applied, or the key you used is `anon` instead of `service_role`.
- **Ask replies but the feed is empty** — Ask needs only the AI key; the news feed additionally needs Supabase + a sync.
- **Gemini 429 / empty answer** — your key may lack quota for the configured model. Change `integrations.ai.model` (e.g. `gemini-2.5-flash-lite`); the built-in fallback chain also tries alternates.
- **Updated photo still shows the old one** — image URLs are cached; rename the file (e.g. `avatar-2.jpeg`) and update `avatar` in the config.

## 📜 License

MIT

---

<div align="center">

[↑ Back to top](#nextjs-ai-portfolio-kit)

Made with ❤️ by [Dtem4ik](https://github.com/Dtem4ik)

</div>
