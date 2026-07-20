import type { BreadcrumbList, Person, SoftwareSourceCode, WithContext } from "schema-dts";
import type { PortfolioProject } from "@/lib/portfolio/types";
import { localizedUrl } from "@/lib/i18n";
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

/**
 * BreadcrumbList for a subpage. `crumbs` are ordered from the site root to the
 * current page; each `route` is resolved to an absolute, locale-aware URL.
 * Emits breadcrumb rich results in Google search.
 */
export function buildBreadcrumbSchema(
  locale: Locale,
  crumbs: { name: string; route: string }[],
): WithContext<BreadcrumbList> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: localizedUrl(locale, crumb.route),
    })),
  };
}

/** SoftwareSourceCode schema for a project detail page. */
export function buildProjectSchema(
  locale: Locale,
  project: PortfolioProject,
): WithContext<SoftwareSourceCode> {
  const { name } = portfolioConfig;
  const languages = project.languages.length ? project.languages : project.stack;

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: project.name,
    description: project.aiSummary || project.description,
    url: localizedUrl(locale, `projects/${project.slug}`),
    codeRepository: project.sourceUrl,
    ...(languages.length ? { programmingLanguage: languages } : {}),
    author: { "@type": "Person", name, url: portfolioConfig.url },
    ...(project.updatedAt ? { dateModified: project.updatedAt } : {}),
  };
}
