// The ONLY file you need to edit to make this portfolio yours.
// Fork it, edit this config, deploy to Vercel — and the site is your portfolio.
//
// Everything below is opt-in. Out of the box only Home + About are enabled and
// the site renders entirely from this file with ZERO external keys. Turn on the
// heavier features (Projects, Activity, Ask) and the integrations that power
// them (GitHub, AI, Supabase) when you actually want them — see `features` and
// `integrations` at the bottom of this file.

const name = "Artyom Friedman";

const role = {
  en: "Senior Frontend Engineer",
  ru: "Senior Frontend Engineer",
} as const;

const bio = {
  en: "Senior Frontend Engineer · 7+ years shipping React, Next.js, TypeScript, and Tailwind in production, with a deep Vue/Nuxt background. I ship fast because AI is wired into my engineering: Claude Code at the agent layer, MCP servers, and multi-agent systems; I recently delivered an internal 8-lesson AI program for executive leadership. Open to strong product-driven teams where engineering quality and AI-native development matter.",
  ru: "Senior Frontend Engineer · 7+ лет в продакшен-разработке на React, Next.js, TypeScript и Tailwind, с сильным бэкграундом в Vue/Nuxt. Выкатываю быстро, потому что ИИ глубоко вшит в моё инженерное мышление: Claude Code на уровне агентов, MCP-серверы и мультиагентные системы; недавно провёл внутренний курс из 8 уроков по ИИ для топ-менеджмента. Открыт к сильным продуктовым командам, где инженерное качество и AI-native-разработка важны не на словах.",
} as const;

/**
 * Short SEO description (~150 chars) used for <meta description>, Open Graph and
 * Twitter. Kept separate from `bio` so search snippets aren't truncated. The
 * full `bio` still powers the hero and the JSON-LD Person description.
 */
const tagline = {
  en: "Senior Frontend Engineer shipping production React, Next.js & TypeScript with AI wired into the workflow. Open to strong product teams.",
  ru: "Senior Frontend Engineer: продакшен на React, Next.js и TypeScript с ИИ, вшитым в процесс. Открыт к сильным продуктовым командам.",
} as const;

const avatar = "/photo.jpeg";
const location = "Almaty, Kazakhstan";
const url = "https://dtem4ik.dev";

const social = {
  github: "https://github.com/Dtem4ik",
  linkedin: "https://www.linkedin.com/in/dtem4ik/",
  email: "", // e.g. "you@example.com"
  telegram: "", // e.g. "https://t.me/username"
  instagram: "",
  facebook: "",
  whatsapp: "",
} as const;

// Which pages exist on the site. Home is always on. Everything else is opt-in.
// A fresh fork can safely set these all to false except `about` and still get a
// working portfolio from config data alone.
const features = {
  projects: true, // /projects + /projects/[slug]
  activity: true, // /activity + the activity feed on the home page (AI changelog lives here)
  about: true, // /about (résumé-style page built from skills + experience)
  ask: true, // /ask + /api/ask — public LLM endpoint (rate-limited); needs an AI key to answer richly
} as const;

// Data sources that enrich the site. Pages still render from the fallback data
// in this file when an integration is disabled or its keys are missing.
const integrations = {
  // Pull live repository stats, commits and releases from the GitHub API.
  // Works without a token (low anonymous rate limit); set GITHUB_TOKEN to raise it.
  github: {
    enabled: true,
    username: "Dtem4ik",
    featuredRepositories: ["nextjs-portfolio-kit"],
    includePinnedFallbacks: true,
  },
  // Powers the Ask page AND the AI changelog/news generated from commits.
  // Provider "gemini" uses Google AI Studio's free tier (GEMINI_API_KEY).
  // Also supports "openai" (OPENAI_API_KEY) and "anthropic" (ANTHROPIC_API_KEY).
  // With no key, Ask falls back to a local answer and no AI news is generated.
  ai: {
    enabled: true,
    provider: "gemini", // "gemini" | "openai" | "anthropic"
    model: "gemini-3.1-flash-lite", // primary model
    // Tried in order when the primary is unavailable (quota/404/error). Gemini only.
    fallbackModels: ["gemini-3.1-flash-lite-preview", "gemini-2.5-flash-lite"],
    temperature: 0.4,
    maxInputItems: 48,
  },
  // Read-through cache: the cron job fetches from GitHub, generates the AI news,
  // and writes a snapshot to Supabase; pages then read that snapshot instead of
  // hitting GitHub/AI on every request. This is what makes the AI changelog
  // affordable — the model runs once per sync, not once per visitor.
  // Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY. See docs/supabase-schema.sql.
  supabase: {
    enabled: true,
    maxAgeMinutes: 720, // treat a cached snapshot older than this as stale
  },
} as const;

// Kept as top-level aliases for backwards-compatible imports.
const github = integrations.github;
const ai = integrations.ai;

const skills = [
  "React",
  "Next.js",
  "TypeScript",
  "Tailwind CSS",
  "Design systems",
  "AI agents",
  "GitHub API",
  "Supabase",
  "Vercel",
] as const;

const experience = [
  {
    company: "Product engineering teams",
    role: "Senior Frontend Engineer",
    period: "2017 - Present",
    summary:
      "Shipped production web applications across React, Next.js, Vue, Nuxt, TypeScript, and Tailwind with a focus on UX quality, maintainable architecture, and delivery speed.",
  },
  {
    company: "Internal AI enablement",
    role: "AI Engineering Instructor",
    period: "2025",
    summary:
      "Designed and delivered an 8-lesson AI program for executive leadership, covering agent workflows, MCP servers, and practical AI-native delivery.",
  },
] as const;

const contact = [
  { label: "GitHub", href: social.github },
  { label: "LinkedIn", href: social.linkedin },
  { label: "Email", href: social.email ? `mailto:${social.email}` : "" },
] as const;

const projects = [
  {
    repo: "nextjs-portfolio-kit",
    slug: "nextjs-portfolio-kit",
    name: "Next.js Portfolio Kit",
    description:
      "A forkable AI-powered developer portfolio template that turns GitHub activity into a live engineering profile.",
    liveDemoUrl: url,
    homepageUrl: url,
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "GitHub API", "Supabase"],
    featured: true,
    aiSummary:
      "A reusable portfolio system designed for developers who want a live profile instead of a static resume. It centralizes personal data in one config file, syncs selected GitHub repositories, and prepares AI summaries from indexed portfolio data.",
    fallbackStats: {
      stars: 18,
      forks: 3,
      watchers: 4,
      openIssues: 2,
    },
    fallbackCommits: [
      {
        sha: "local-activity-1",
        message: "Add AI portfolio data model",
        date: "2026-06-20T09:30:00.000Z",
        url: "https://github.com/Dtem4ik/nextjs-portfolio-kit",
      },
      {
        sha: "local-activity-2",
        message: "Improve activity feed copy",
        date: "2026-06-18T14:10:00.000Z",
        url: "https://github.com/Dtem4ik/nextjs-portfolio-kit",
      },
    ],
    fallbackReleases: [
      {
        tagName: "v0.1.0",
        name: "Template foundation",
        publishedAt: "2026-06-21T12:00:00.000Z",
        url: "https://github.com/Dtem4ik/nextjs-portfolio-kit/releases",
      },
    ],
  },
] as const;

const keywords = {
  en: [
    "developer portfolio",
    "AI portfolio",
    "frontend engineer",
    "react",
    "next.js",
    "typescript",
    "github activity",
    "supabase",
  ],
  ru: [
    "портфолио разработчика",
    "AI портфолио",
    "фронтенд разработчик",
    "react",
    "next.js",
    "typescript",
    "github activity",
    "supabase",
  ],
} as const;

const locale = {
  default: "en",
  supported: ["en", "ru"] as const,
} as const;

export const portfolioConfig = {
  name,
  role,
  bio,
  tagline,
  avatar,
  location,
  url,
  social,
  features,
  integrations,
  github,
  ai,
  skills,
  experience,
  contact,
  projects,
  keywords,
  locale,
} as const;

export type Locale = (typeof portfolioConfig.locale.supported)[number];
export type PortfolioProjectConfig = (typeof portfolioConfig.projects)[number];
export type FeatureKey = keyof typeof portfolioConfig.features;
