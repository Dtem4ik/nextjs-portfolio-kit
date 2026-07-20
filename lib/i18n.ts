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
