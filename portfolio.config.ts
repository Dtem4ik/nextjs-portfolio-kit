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
  en: "Frontend & Full-Stack Engineer",
  ru: "Frontend & Full-Stack разработчик",
} as const;

const bio = {
  en: "Frontend engineer who builds products, not just screens. 7+ years of production experience with React, Next.js, TypeScript, Vue 3 and Nuxt 3, now growing into full-stack with Node.js and FastAPI. I built from scratch the inventory and sales platform a real estate developer runs on every day, shipped three LLM features to production (call QA agents, AI search, a live sales assistant) and was the sole frontend engineer at Satya, an Israeli B2B SaaS in Herzliya. I care about accessibility, i18n, SEO and design systems. Israeli citizen based in the Haifa area, open to Frontend and Full-Stack roles in Haifa or hybrid in Tel Aviv / Herzliya.",
  ru: "Frontend-разработчик, который делает продукты, а не просто экраны. 7+ лет продакшен-опыта с React, Next.js, TypeScript, Vue 3 и Nuxt 3, расту в full-stack на Node.js и FastAPI. С нуля построил платформу квартир и продаж, на которой каждый день работает застройщик, выкатил в продакшен три LLM-фичи (агенты контроля качества звонков, AI-поиск, ассистент для продаж) и был единственным фронтенд-разработчиком в Satya, израильском B2B SaaS в Герцлии. Мне важны доступность, i18n, SEO и дизайн-системы. Гражданин Израиля, живу в районе Хайфы, открыт к Frontend и Full-Stack ролям в Хайфе или гибриду в Тель-Авиве / Герцлии.",
} as const;

/**
 * Short SEO description (~150 chars) used for <meta description>, Open Graph and
 * Twitter. Kept separate from `bio` so search snippets aren't truncated. The
 * full `bio` still powers the hero and the JSON-LD Person description.
 */
const tagline = {
  en: "Frontend & Full-Stack Engineer: 7+ years with React, Next.js and TypeScript. Built a sales platform used daily and shipped LLM features to production. Haifa, Israel.",
  ru: "Frontend & Full-Stack разработчик: 7+ лет на React, Next.js и TypeScript. Построил платформу продаж и выкатил LLM-фичи в продакшен. Хайфа, Израиль.",
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
  whatsapp: "https://wa.me/972532881015",
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
    // News is a weekly digest: the model groups each week's commits into ONE
    // entry per project (dedupes, drops trivia). Far fewer API calls + no
    // repetitive per-commit spam.
    newsDays: 30, // how many recent days per project to summarize
    // The model decides how many entries a day deserves: 1 for a normal day of
    // work, up to `newsMaxPerDay` when the day has clearly distinct features, 0 if
    // only trivial changes. So the number of news follows the work, not the clock.
    newsMaxPerDay: 2,
    maxNewsPerSync: 12, // safety cap on model calls per run (a big backfill drains over runs)
  },
  // Read-through cache: the cron job fetches from GitHub, generates the AI news,
  // and writes a snapshot to Supabase; pages then read that snapshot instead of
  // hitting GitHub/AI on every request. This is what makes the AI changelog
  // affordable — the model runs once per sync, not once per visitor.
  // Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY. See docs/supabase-schema.sql.
  supabase: {
    enabled: true,
    maxAgeMinutes: 720, // treat a cached snapshot older than this as stale
    // Pages cache the Supabase read for this long (ISR) instead of hitting the
    // DB on every request. The cron refreshes data daily, so 15 min is safe.
    revalidateSeconds: 900,
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
  "Node.js",
  "REST APIs",
  "PostgreSQL",
  "FastAPI",
  "Tailwind CSS",
  "shadcn/ui",
  "TanStack Query",
  "Redux / Jotai",
  "Zod",
  "Accessibility (ARIA, WCAG)",
  "i18n & SEO",
  "Storybook + Chromatic",
  "Playwright",
  "GitLab CI/CD",
  "LLM integrations",
] as const;

// Work experience. `company` and `period` are shared; `role` and `summary` are
// localized per supported locale.
const experience = [
  {
    company: "Satya Digital Intelligence",
    period: "Sep 2025 — Mar 2026",
    role: {
      en: "Frontend Engineer (Contract)",
      ru: "Frontend-разработчик (контракт)",
    },
    summary: {
      en: "Sole frontend engineer on a multi-tenant OSINT B2B SaaS platform sold to enterprise clients, on-site in Herzliya (React, Next.js, TypeScript, shadcn/ui, TanStack Query, Jotai, Zod). Owned the entire frontend: reworked 15+ screens and shipped 6+ new ones from whiteboard sketch to production without a designer. Moved authentication to Descope in under 3 weeks together with the backend and built a permission model of ~50 granular permissions combined into custom roles. Built usage and analytics dashboards and a Node.js microservice for person reports.",
      ru: "Единственный фронтенд-разработчик мультитенантной OSINT B2B SaaS-платформы для корпоративных клиентов, в офисе в Герцлии (React, Next.js, TypeScript, shadcn/ui, TanStack Query, Jotai, Zod). Отвечал за весь фронтенд: переработал 15+ экранов и выпустил 6+ новых, от наброска на доске до продакшена, без дизайнера. Перевёл авторизацию на Descope меньше чем за 3 недели вместе с бэкендом и построил модель доступа примерно из 50 пермишенов, из которых собираются любые роли. Сделал дашборды аналитики и микросервис отчётов на Node.js.",
    },
  },
  {
    company: "Galereya Novostroek",
    period: "Oct 2024 — Jul 2026",
    role: {
      en: "Frontend Engineer",
      ru: "Frontend-разработчик",
    },
    summary: {
      en: 'Owned the frontend of a real estate developer\'s sales platforms (Nuxt 3, TypeScript), remote from Israel from Sep 2025. Built from scratch the inventory and sales platform (Shakhmatka) that replaced Flatris and Excel: 40+ residential complexes, live CRM sync, 40–60 daily users, one source of truth for prices and bookings, with a bulk editor for complexes of up to 10,000 units. Took call QA from Excel to AI: a web checklist with per-manager analytics, then LLM agents (I wrote the prompts) that score transcribed calls and give coaching tips. Added AI search that turns "2 rooms under 15M" into filters and a live assistant that suggests talking points. Also moved the website to Nuxt 3 with SEO and i18n, built a WebView buyer app and GitLab CI/CD, and mentored a junior developer.',
      ru: "Отвечал за фронтенд платформ отдела продаж застройщика (Nuxt 3, TypeScript), с сентября 2025 — удалённо из Израиля. С нуля построил платформу квартир и продаж («Шахматку»), которая заменила Flatris и Excel: 40+ ЖК, синхронизация с CRM в реальном времени, 40–60 пользователей в день, единый источник правды по ценам и броням, плюс массовый редактор для ЖК до 10 000 квартир. Перевёл контроль качества звонков с Excel на AI: сначала веб-чеклист с аналитикой по каждому менеджеру, потом LLM-агенты (промпты писал я), которые оценивают расшифровки и дают советы. Добавил AI-поиск, который превращает «2 комнаты до 15 млн» в фильтры, и ассистента, подсказывающего аргументы во время звонка. Также перенёс сайт на Nuxt 3 с SEO и i18n, сделал WebView-приложение для покупателей и GitLab CI/CD, менторил джуна.",
    },
  },
  {
    company: "Ibec Systems",
    period: "Nov 2019 — Sep 2024",
    role: {
      en: "Frontend Engineer",
      ru: "Frontend-разработчик",
    },
    summary: {
      en: "Grew from junior to owning frontend architecture at a web agency. Delivered 30+ projects for banking, fintech, e-commerce and media clients (React / Next.js, Vue 3 / Nuxt 3), all with i18n in 3 languages and full technical SEO. Kino.kz: one of 3 frontend developers on a full redesign, rebuilt the home page and owned the Apple Pay checkout. Bigroup: full redesign on React and Next.js. BankRBK: full redesign on Nuxt plus a complete accessibility version for blind and low-vision users. Co-authored the agency's nuxt3-ui-kit, tested with Storybook and Chromatic.",
      ru: "Вырос в веб-агентстве от джуна до ответственного за фронтенд-архитектуру. Сделал 30+ проектов для банков, финтеха, e-commerce и медиа (React / Next.js, Vue 3 / Nuxt 3), все с i18n на 3 языках и полным техническим SEO. Kino.kz: один из 3 фронтендеров на полном редизайне, переделал главную и целиком отвечал за оплату Apple Pay. Bigroup: полный редизайн на React и Next.js. BankRBK: полный редизайн на Nuxt и отдельная версия сайта для незрячих и слабовидящих. Соавтор библиотеки компонентов nuxt3-ui-kit с тестами в Storybook и Chromatic.",
    },
  },
  {
    company: "Aida Service",
    period: "Sep 2018 — Aug 2019",
    role: {
      en: "Web Developer",
      ru: "Веб-разработчик",
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
  { label: "WhatsApp", href: social.whatsapp },
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
    repo: "olim-app",
    slug: "olim-app",
    name: "Olim App",
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Supabase", "PWA"],
    featured: true,
    aiSummary:
      "An adaptation navigator for new immigrants (olim) in Israel: a personalized home screen, practical guides (banking, rent, healthcare, work, benefits, Hebrew), and a trackable plan with deadline warnings — RU/EN, light/dark, PWA-first.",
  },
  {
    repo: "genwidget-ai",
    slug: "genwidget-ai",
    name: "GenWidget AI",
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
    name: "Carwash SaaS",
    stack: ["Next.js", "FastAPI", "TypeScript", "Monorepo"],
    aiSummary:
      "Multi-tenant SaaS for car-wash networks, built end to end: Next.js frontend, FastAPI backend, Playwright e2e tests.",
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
    "full-stack engineer",
    "node.js",
    "llm",
    "accessibility",
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
    "full-stack разработчик",
    "node.js",
    "llm",
    "доступность",
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
