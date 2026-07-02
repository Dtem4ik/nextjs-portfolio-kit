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
  en: "Frontend Engineer",
  ru: "Frontend-разработчик",
} as const;

const bio = {
  en: "Frontend Engineer with 7+ years of production experience across B2B SaaS, fintech, banking, and consumer products. Strong in React, Next.js, TypeScript, and Tailwind, with a deep Vue 3 / Nuxt 3 background — I own the full frontend lifecycle: architecture, CI/CD, performance, and releases. I ship fast because AI is wired deep into my daily work: Claude Code at the agent layer (hooks, MCP servers, custom skills, plugins), multi-agent systems, and an internal 8-lesson AI program I designed and delivered for executive leadership.",
  ru: "Frontend-разработчик с 7+ годами продакшен-опыта в B2B SaaS, финтехе, банках и потребительских продуктах. Уверенно работаю с React, Next.js, TypeScript и Tailwind, с сильным бэкграундом в Vue 3 / Nuxt 3 — веду весь фронтенд-цикл: архитектуру, CI/CD, производительность и релизы. Выкатываю быстро, потому что ИИ глубоко вшит в мою работу: Claude Code на уровне агентов (hooks, MCP-серверы, кастомные скиллы, плагины), мультиагентные системы и внутренний курс из 8 уроков по ИИ, который я разработал и провёл для топ-менеджмента.",
} as const;

/**
 * Short SEO description (~150 chars) used for <meta description>, Open Graph and
 * Twitter. Kept separate from `bio` so search snippets aren't truncated. The
 * full `bio` still powers the hero and the JSON-LD Person description.
 */
const tagline = {
  en: "Frontend Engineer — 7+ years in React, Next.js, TypeScript and Vue/Nuxt, with AI wired deep into the workflow. Open to strong product teams.",
  ru: "Frontend-разработчик — 7+ лет на React, Next.js, TypeScript и Vue/Nuxt, с глубоко вшитым в процесс ИИ. Открыт к сильным продуктовым командам.",
} as const;

const avatar = "/avatar.jpeg";
const location = "Haifa, Israel";
const url = "https://dtem4ik.dev";

// Optional downloadable CV/résumé. Drop the file in /public and point here, or
// set to "" to hide the download button. e.g. "/cv.pdf".
const resumeUrl = "/cv.pdf";

const social = {
  github: "https://github.com/Dtem4ik",
  linkedin: "https://www.linkedin.com/in/dtem4ik/",
  email: "d.tem4ik@gmail.com",
  telegram: "https://t.me/dtem4ik",
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
    // How many recent commits per project become individual news entries.
    newsPerProject: 5,
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

// Tech skills stay in English (proper names) in both locales.
const skills = [
  "React",
  "Next.js",
  "TypeScript",
  "Vue 3",
  "Nuxt 3",
  "Tailwind CSS",
  "shadcn/ui",
  "TanStack Query",
  "Redux / Pinia",
  "React Native",
  "Node.js",
  "REST APIs",
  "GitLab CI/CD",
  "Design systems",
  "Claude Code",
  "MCP servers",
  "Multi-agent systems",
] as const;

// Work experience. `company` and `period` are shared; `role` and `summary` are
// localized per supported locale.
const experience = [
  {
    company: "Galereya Novostroek",
    period: "Oct 2024 — Present",
    role: {
      en: "Frontend Engineer",
      ru: "Frontend-разработчик",
    },
    summary: {
      en: "Lead frontend of internal web products on Nuxt 3 / Vue integrated with Bitrix24; built the client-facing WebView app, designed the architecture from scratch, and set up GitLab CI/CD (commit → production). Embedded AI tooling into team workflows and delivered an 8-lesson AI program for executive leadership.",
      ru: "Веду фронтенд внутренних веб-продуктов на Nuxt 3 / Vue с интеграцией в Bitrix24; собрал клиентское WebView-приложение, спроектировал архитектуру с нуля и настроил GitLab CI/CD (коммит → прод). Внедрил AI-инструменты в процессы команды и провёл курс из 8 уроков по ИИ для топ-менеджмента.",
    },
  },
  {
    company: "Satya Digital Intelligence",
    period: "Sep 2025 — Mar 2026",
    role: {
      en: "Lead Frontend Engineer (Contract)",
      ru: "Lead Frontend-разработчик (контракт)",
    },
    summary: {
      en: "Sole frontend engineer on a B2B SaaS platform (React, Next.js, TypeScript, Tailwind). Shipped product features, built analytics and reporting pages with data visualizations, integrated Descope authentication, and owned frontend architecture and the release process.",
      ru: "Единственный фронтенд-инженер на B2B SaaS-платформе (React, Next.js, TypeScript, Tailwind). Выпускал фичи, делал страницы аналитики и отчётности с визуализацией данных, интегрировал аутентификацию Descope, отвечал за архитектуру фронтенда и релизы.",
    },
  },
  {
    company: "Ibec Systems",
    period: "Nov 2019 — Jan 2025",
    role: {
      en: "Frontend Engineer",
      ru: "Frontend-разработчик",
    },
    summary: {
      en: "Grew from Junior to strong Middle over 5+ years, delivering frontend across marketing sites, banking and product platforms (Vue 3 / Nuxt 3, React / Next.js). Co-authored the internal nuxt3-ui-kit. Selected projects: BankRBK, Eurasia Life, Bigroup, Kino.kz.",
      ru: "За 5+ лет вырос от Junior до крепкого Middle, делал фронтенд для промо-сайтов, банковских и продуктовых платформ (Vue 3 / Nuxt 3, React / Next.js). Соавтор внутренней библиотеки nuxt3-ui-kit. Проекты: BankRBK, Eurasia Life, Bigroup, Kino.kz.",
    },
  },
  {
    company: "Aida Service",
    period: "Sep 2018 — Aug 2019",
    role: {
      en: "Junior Full-Stack Developer",
      ru: "Junior Full-Stack разработчик",
    },
    summary: {
      en: "First production role — built the aida.market site and internal SSR / SPA apps (Vue / Nuxt, Node.js). Also built two side projects: a car-wash automation system with real-time WebSockets and an accounting system for a car-parts store.",
      ru: "Первая продакшен-роль — сделал сайт aida.market и внутренние SSR / SPA-приложения (Vue / Nuxt, Node.js). Плюс два пет-проекта: система автоматизации автомойки с реалтаймом на WebSockets и учётная система для магазина автозапчастей.",
    },
  },
] as const;

const contact = [
  { label: "GitHub", href: social.github },
  { label: "LinkedIn", href: social.linkedin },
  { label: "Telegram", href: social.telegram },
  { label: "Email", href: social.email ? `mailto:${social.email}` : "" },
] as const;

// A project only needs `repo` + `slug`. Everything else (name, description,
// languages/stack, stars, commits, releases) is pulled live from GitHub. The
// optional fields below override the GitHub data or serve as fallbacks when the
// GitHub fetch fails.
type ProjectConfig = {
  repo: string;
  slug: string;
  name?: string;
  description?: string;
  liveDemoUrl?: string;
  homepageUrl?: string;
  stack?: string[];
  featured?: boolean;
  aiSummary?: string;
  fallbackStats?: { stars: number; forks: number; watchers: number; openIssues: number };
  fallbackCommits?: { sha: string; message: string; date: string; url: string }[];
  fallbackReleases?: { tagName: string; name: string; publishedAt: string; url: string }[];
};

const projects: ProjectConfig[] = [
  {
    repo: "genwidget-ai",
    slug: "genwidget-ai",
    stack: ["Next.js", "TypeScript", "AI"],
  },
  {
    repo: "nextjs-portfolio-kit",
    slug: "nextjs-portfolio-kit",
    name: "Next.js AI Portfolio Kit",
    liveDemoUrl: url,
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Supabase"],
    featured: true,
    aiSummary:
      "A forkable AI-powered developer portfolio: edit one config file, deploy to Vercel, and your GitHub activity becomes a live engineering profile with AI-written changelog news.",
  },
  {
    repo: "carswash-new-mono",
    slug: "carswash-new-mono",
    stack: ["TypeScript", "Monorepo"],
  },
];

const keywords = {
  en: [
    "Artyom Friedman",
    "frontend engineer",
    "react",
    "next.js",
    "typescript",
    "vue",
    "nuxt",
    "tailwind",
    "claude code",
    "ai engineer",
    "multi-agent systems",
  ],
  ru: [
    "Артём Фридман",
    "фронтенд разработчик",
    "react",
    "next.js",
    "typescript",
    "vue",
    "nuxt",
    "tailwind",
    "claude code",
    "ai разработчик",
    "мультиагентные системы",
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
  resumeUrl,
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
