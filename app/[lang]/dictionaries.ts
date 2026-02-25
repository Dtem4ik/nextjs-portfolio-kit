import "server-only";
import { locales, type Locale } from "@/lib/i18n";

export type { Locale };

type Dictionary = typeof import("@/dictionaries/en.json");

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("@/dictionaries/en.json") as Promise<Dictionary>,
  ru: () => import("@/dictionaries/ru.json") as Promise<Dictionary>,
};

export const hasLocale = (locale: string): locale is Locale =>
  (locales as readonly string[]).includes(locale);

export const getDictionary = async (locale: Locale): Promise<Dictionary> => dictionaries[locale]();
