import type { Person, WithContext } from "schema-dts";
import { portfolioConfig, type Locale } from "@/portfolio.config";

export function buildPersonSchema(locale: Locale): WithContext<Person> {
  const { name, title, bio, url, photo, social } = portfolioConfig;

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    jobTitle: title[locale],
    description: bio[locale],
    url,
    image: `${url}${photo}`,
    // Only include social profile URLs; skip email and empty strings
    sameAs: (Object.values(social) as string[]).filter((v) => v.startsWith("https://")),
  };
}
