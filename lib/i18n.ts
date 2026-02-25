import { portfolioConfig, type Locale } from "@/portfolio.config";

export type { Locale };
export const locales = portfolioConfig.locale.supported;
export const defaultLocale = portfolioConfig.locale.default;

export const localeLabels: Record<Locale, string> = {
  en: "English",
  ru: "Русский",
};

/** Maps locale codes to Open Graph locale format (language_TERRITORY) */
export const ogLocale: Record<Locale, string> = {
  en: "en_US",
  ru: "ru_RU",
};
