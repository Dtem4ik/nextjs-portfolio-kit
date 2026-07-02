import type { Person, WithContext } from "schema-dts";
import { portfolioConfig, type Locale } from "@/portfolio.config";

export function buildPersonSchema(locale: Locale): WithContext<Person> {
  const { name, role, bio, url, avatar, social, skills, location, experience } = portfolioConfig;
  const currentJob = experience[0];

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    jobTitle: role[locale],
    description: bio[locale],
    url,
    image: `${url}${avatar}`,
    ...(social.email ? { email: social.email } : {}),
    ...(location ? { homeLocation: { "@type": "Place", name: location } } : {}),
    knowsAbout: [...skills],
    ...(currentJob ? { worksFor: { "@type": "Organization", name: currentJob.company } } : {}),
    // Only include social profile URLs; skip email and empty strings
    sameAs: (Object.values(social) as string[]).filter((v) => v.startsWith("https://")),
  };
}
