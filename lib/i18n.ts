import type { Metadata } from "next";
import { portfolioConfig, type Locale } from "@/portfolio.config";

export type { Locale };
export const locales = portfolioConfig.locale.supported;
export const defaultLocale = portfolioConfig.locale.default;

/**
 * Builds the absolute URL for a given locale + route, matching the URL scheme
 * enforced by `proxy.ts`: the default locale has no prefix, others are prefixed
 * with `/<locale>`. `route` is the path without a leading slash (e.g. "projects").
 */
export function localizedUrl(locale: Locale, route = ""): string {
  const { url } = portfolioConfig;
  const segments = [locale === defaultLocale ? "" : locale, route].filter(Boolean);
  return segments.length ? `${url}/${segments.join("/")}` : url;
}

/**
 * Per-page canonical + hreflang alternates. Every page must set this so its
 * canonical points to itself rather than inheriting the layout's homepage
 * canonical (which makes Google treat subpages as "alternate page with proper
 * canonical tag" and skip indexing them).
 */
export function buildAlternates(locale: Locale, route = ""): Metadata["alternates"] {
  return {
    canonical: localizedUrl(locale, route),
    languages: {
      ...Object.fromEntries(locales.map((l) => [l, localizedUrl(l, route)])),
      "x-default": localizedUrl(defaultLocale, route),
    },
  };
}

export const localeLabels: Record<Locale, string> = {
  en: "English",
  ru: "Русский",
};

/** Maps locale codes to Open Graph locale format (language_TERRITORY) */
export const ogLocale: Record<Locale, string> = {
  en: "en_US",
  ru: "ru_RU",
};

/**
 * Per-page SEO metadata: self-referencing canonical/hreflang plus Open Graph and
 * Twitter tags that reflect *this* page. Subpages must spread this so their OG
 * title/url/description don't inherit the layout's homepage values (which would
 * make every shared subpage preview as the homepage).
 *
 * `title` is the visible page title (without the site suffix); it's composed into
 * the OG/Twitter title as `"<title> — <name>"` to match the `%s — <name>` template
 * used for the document <title>.
 */
export function buildPageMetadata(
  locale: Locale,
  route: string,
  { title, description }: { title: string; description: string },
): Pick<Metadata, "alternates" | "openGraph" | "twitter"> {
  const { name } = portfolioConfig;
  const ogTitle = `${title} — ${name}`;

  return {
    alternates: buildAlternates(locale, route),
    openGraph: {
      type: "website",
      url: localizedUrl(locale, route),
      siteName: name,
      title: ogTitle,
      description,
      locale: ogLocale[locale],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
    },
  };
}
