import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectCard } from "@/components/portfolio/project-card";
import { SiteShell } from "@/components/portfolio/site-shell";
import { getPortfolioData } from "@/lib/portfolio/data";
import { getDictionary, hasLocale, type Locale } from "@/lib/dictionaries";
import { JsonLd } from "@/components/portfolio/json-ld";
import { buildPageMetadata } from "@/lib/i18n";
import { buildBreadcrumbSchema } from "@/lib/structured-data";
import { portfolioConfig } from "@/portfolio.config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  const title = dict.projects.title;
  const description = dict.projects.intro;
  return {
    title,
    description,
    ...buildPageMetadata(lang as Locale, "projects", { title, description }),
  };
}

export default async function ProjectsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  if (!portfolioConfig.features.projects) notFound();

  const locale = lang as Locale;
  const dict = await getDictionary(locale);
  const data = await getPortfolioData(locale);

  return (
    <SiteShell locale={locale}>
      <JsonLd
        schema={buildBreadcrumbSchema(locale, [
          { name: dict.nav.home, route: "" },
          { name: dict.nav.projects, route: "projects" },
        ])}
      />
      <section className="max-w-3xl">
        <p className="text-muted-foreground font-mono text-xs uppercase">
          @{portfolioConfig.github.username}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
          {dict.projects.title}
        </h1>
        <p className="text-muted-foreground mt-4 text-base leading-7">{dict.projects.intro}</p>
      </section>

      <section className="mt-10 columns-1 gap-x-4 md:columns-2">
        {data.projects.map((project) => (
          <div key={project.slug} className="mb-4 break-inside-avoid">
            <ProjectCard project={project} locale={locale} />
          </div>
        ))}
      </section>
    </SiteShell>
  );
}
