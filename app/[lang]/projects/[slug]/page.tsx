import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, GitFork, Star } from "lucide-react";
import { ActivityList } from "@/components/portfolio/activity-list";
import { SiteShell } from "@/components/portfolio/site-shell";
import { Button } from "@/components/ui/button";
import { getPortfolioData, getProjectSlugs } from "@/lib/portfolio/data";
import { getDictionary, hasLocale, type Locale } from "@/lib/dictionaries";
import { portfolioConfig } from "@/portfolio.config";

function localizedHref(locale: Locale, href: string) {
  return locale === portfolioConfig.locale.default ? href : `/${locale}${href}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPortfolioData();
  const project = data.projects.find((item) => item.slug === slug);

  return {
    title: project ? project.name : "Project",
    description: project?.description,
  };
}

export function generateStaticParams() {
  if (!portfolioConfig.features.projects) return [];
  return portfolioConfig.locale.supported.flatMap((lang) =>
    getProjectSlugs().map(({ slug }) => ({ lang, slug })),
  );
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  if (!portfolioConfig.features.projects) notFound();

  const locale = lang as Locale;
  const dict = await getDictionary(locale);
  const data = await getPortfolioData(locale);
  const project = data.projects.find((item) => item.slug === slug);
  if (!project) notFound();

  const activity = data.activity.filter((item) => item.projectSlug === project.slug);

  return (
    <SiteShell locale={locale}>
      <div className="mb-8">
        <Link
          href={localizedHref(locale, "/projects")}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          {dict.project.back}
        </Link>
      </div>

      <section className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div>
          <p className="text-muted-foreground font-mono text-xs uppercase">{project.repo}</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">{project.name}</h1>
          <p className="text-muted-foreground mt-4 max-w-3xl text-base leading-7">
            {project.description}
          </p>
          <p className="mt-6 max-w-3xl text-sm leading-7">{project.aiSummary}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {project.stack.map((item) => (
              <span
                key={item}
                className="border-border/70 bg-card/60 text-muted-foreground rounded-md border px-2.5 py-1 font-mono text-xs"
              >
                {item}
              </span>
            ))}
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild className="rounded-md">
              <a href={project.sourceUrl} target="_blank" rel="noreferrer">
                {dict.project.source}
              </a>
            </Button>
            {project.liveDemoUrl && (
              <Button asChild variant="outline" className="rounded-md">
                <a href={project.liveDemoUrl} target="_blank" rel="noreferrer">
                  {dict.project.liveDemo}
                </a>
              </Button>
            )}
          </div>
        </div>

        <aside className="border-border/70 bg-card/50 h-fit rounded-md border p-5">
          <p className="text-muted-foreground font-mono text-xs uppercase">
            {dict.project.repoMetrics}
          </p>
          <dl className="mt-5 space-y-4">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground flex items-center gap-2 text-sm">
                <Star className="h-4 w-4" />
                {dict.project.stars}
              </dt>
              <dd className="font-mono text-lg tabular-nums">{project.stats.stars}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground flex items-center gap-2 text-sm">
                <GitFork className="h-4 w-4" />
                {dict.project.forks}
              </dt>
              <dd className="font-mono text-lg tabular-nums">{project.stats.forks}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground text-sm">{dict.project.openIssues}</dt>
              <dd className="font-mono text-lg tabular-nums">{project.stats.openIssues}</dd>
            </div>
          </dl>
        </aside>
      </section>

      <section className="mt-12">
        <div className="mb-4">
          <p className="text-muted-foreground font-mono text-xs uppercase">
            {dict.project.latestActivity}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            {dict.project.commitsAndReleases}
          </h2>
        </div>
        <ActivityList items={activity} locale={locale} />
      </section>
    </SiteShell>
  );
}
