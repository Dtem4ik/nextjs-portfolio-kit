import Link from "next/link";
import { ArrowUpRight, GitFork, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDictionary, type Locale } from "@/lib/dictionaries";
import type { PortfolioProject } from "@/lib/portfolio/types";
import { portfolioConfig } from "@/portfolio.config";

function localizedProjectHref(locale: Locale, slug: string) {
  const href = `/projects/${slug}`;
  return locale === portfolioConfig.locale.default ? href : `/${locale}${href}`;
}

export async function ProjectCard({
  project,
  locale,
}: {
  project: PortfolioProject;
  locale: Locale;
}) {
  const dict = await getDictionary(locale);

  return (
    <article className="border-border/70 bg-card/55 hover:bg-card rounded-md border p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-colors">
      <div className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link
              href={localizedProjectHref(locale, project.slug)}
              className="text-xl font-semibold tracking-tight hover:underline"
            >
              {project.name}
            </Link>
            <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-6">
              {project.description}
            </p>
          </div>
          <div className="text-muted-foreground hidden shrink-0 items-center gap-4 font-mono text-xs tabular-nums sm:flex">
            <span className="flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5" />
              {project.stats.stars}
            </span>
            <span className="flex items-center gap-1.5">
              <GitFork className="h-3.5 w-3.5" />
              {project.stats.forks}
            </span>
          </div>
        </div>

        <p className="text-foreground/80 text-sm leading-6">{project.aiSummary}</p>

        <div className="flex flex-wrap gap-2">
          {project.stack.map((item) => (
            <span
              key={item}
              className="border-border/70 bg-background/60 text-muted-foreground rounded-md border px-2.5 py-1 font-mono text-xs"
            >
              {item}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" className="rounded-md">
            <Link href={localizedProjectHref(locale, project.slug)}>
              {dict.project.viewProject}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-md">
            <a href={project.sourceUrl} target="_blank" rel="noreferrer">
              {dict.project.source}
            </a>
          </Button>
          {project.liveDemoUrl && (
            <Button asChild size="sm" variant="outline" className="rounded-md">
              <a href={project.liveDemoUrl} target="_blank" rel="noreferrer">
                {dict.project.liveDemo}
              </a>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
