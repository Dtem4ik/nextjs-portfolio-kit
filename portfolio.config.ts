// The ONLY file you need to edit to make this portfolio yours.
// All metadata, SEO, structured data, OG image, sitemap and page content derive from this config.

/** Full name — used in page titles, JSON-LD Person schema, OG image and header */
const name = "Artyom Friedman";

/** Job title per locale — used in hero section, OG image and JSON-LD jobTitle */
const title = {
  en: "Senior Frontend Engineer",
  ru: "Senior Frontend Engineer",
} as const;

/**
 * Short bio per locale (2–3 sentences).
 * Used in the hero section, meta description, OG description and JSON-LD description.
 */
const bio = {
  en: "Senior Frontend Engineer with 7+ years of experience building production-grade web apps and internal platforms. I specialize in React and Next.js, focusing on architecture, performance, and clean UI systems. Open to strong product-driven teams where frontend quality and engineering excellence truly matter.",
  ru: "Senior Frontend Engineer с 7+ годами опыта в создании production-приложений и внутренних платформ. Специализируюсь на React и Next.js: архитектура, производительность, чистые UI-системы. Открыт к сильным product-командам, где качество фронтенда действительно важно.",
} as const;

/**
 * Path to your photo relative to /public.
 * Download your photo and place it at /public/photo.jpg (recommended: 400×400px, WebP or JPEG).
 * ⚠️  Do NOT use the LinkedIn URL directly — it is temporary and will expire.
 */
const photo = "/photo.jpeg";

/**
 * Canonical domain — no trailing slash.
 * Used in: canonical URL, sitemap, robots.txt, OG url, JSON-LD url, metadataBase.
 */
const url = "https://dtem4ik.dev";

/**
 * Social links — leave empty string "" to hide the link on the page.
 * Used in: social buttons on the page, JSON-LD sameAs array.
 */
const social = {
  github: "https://github.com/Dtem4ik",
  linkedin: "https://www.linkedin.com/in/dtem4ik/",
  email: "", // e.g. "you@example.com"
  telegram: "", // e.g. "https://t.me/username"
  instagram: "", // e.g. "https://instagram.com/username"
  facebook: "", // e.g. "https://facebook.com/username"
  whatsapp: "", // e.g. "https://wa.me/1234567890"
} as const;

/**
 * SEO keywords per locale.
 * Used in: <meta name="keywords"> via generateMetadata.
 */
const keywords = {
  en: [
    "frontend engineer",
    "react",
    "next.js",
    "vue",
    "nuxt",
    "typescript",
    "web development",
    "frontend architecture",
  ],
  ru: [
    "фронтенд разработчик",
    "react",
    "next.js",
    "vue",
    "nuxt",
    "typescript",
    "веб разработка",
    "фронтенд архитектура",
  ],
} as const;

/**
 * Locale configuration.
 * default — served at / (no prefix in URL).
 * supported — all locales; each gets its own /[lang] route and dictionary file.
 */
const locale = {
  default: "en",
  supported: ["en", "ru"] as const,
} as const;

export const portfolioConfig = {
  name,
  title,
  bio,
  photo,
  url,
  social,
  keywords,
  locale,
} as const;

export type Locale = (typeof portfolioConfig.locale.supported)[number];
