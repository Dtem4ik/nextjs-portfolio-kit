import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectCard } from "@/components/portfolio/project-card";
import { SiteShell } from "@/components/portfolio/site-shell";
import { getPortfolioData } from "@/lib/portfolio/data";
import { hasLocale, type Locale } from "@/lib/dictionaries";
import { portfolioConfig } from "@/portfolio.config";

export const metadata: Metadata = {
  title: "Projects",
  description: "GitHub-powered projects with repository stats, commits, releases, and summaries.",
};

export default async function ProjectsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  if (!portfolioConfig.features.projects) notFound();

  const locale = lang as Locale;
  const data = await getPortfolioData();

  return (
    <SiteShell locale={locale}>
      <section className="max-w-3xl">
        <p className="text-muted-foreground font-mono text-xs uppercase">
          @{portfolioConfig.github.username}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Projects</h1>
        <p className="text-muted-foreground mt-4 text-base leading-7">
          Featured repositories are selected in portfolio.config.ts, enriched with GitHub metadata,
          and summarized from indexed project data.
        </p>
      </section>

      <section className="mt-10 grid gap-4 lg:grid-cols-2">
        {data.projects.map((project) => (
          <ProjectCard key={project.slug} project={project} locale={locale} />
        ))}
      </section>
    </SiteShell>
  );
}
