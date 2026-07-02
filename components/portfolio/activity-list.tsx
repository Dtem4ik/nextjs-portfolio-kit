import Link from "next/link";
import { GitCommitHorizontal, Rocket, Sparkles, SquareArrowOutUpRight } from "lucide-react";
import { getDictionary, type Locale } from "@/lib/dictionaries";
import type { ActivityItem } from "@/lib/portfolio/types";
import { portfolioConfig } from "@/portfolio.config";

const iconByType = {
  release: Rocket,
  changelog: Sparkles,
  commit: GitCommitHorizontal,
  project: GitCommitHorizontal,
} as const;

function formatDate(date: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function projectHref(locale: Locale, slug: string) {
  const href = `/projects/${slug}`;
  return locale === portfolioConfig.locale.default ? href : `/${locale}${href}`;
}

export async function ActivityList({
  items,
  locale,
  limit,
}: {
  items: ActivityItem[];
  locale: Locale;
  limit?: number;
}) {
  const dict = await getDictionary(locale);
  const visibleItems = typeof limit === "number" ? items.slice(0, limit) : items;

  if (visibleItems.length === 0) {
    return (
      <div className="border-border/70 text-muted-foreground rounded-md border p-6 text-sm">
        {dict.activity.empty}
      </div>
    );
  }

  return (
    <ol className="border-border/70 divide-border/70 overflow-hidden rounded-md border">
      {visibleItems.map((item) => {
        const Icon = iconByType[item.type] ?? GitCommitHorizontal;

        return (
          <li key={item.id} className="bg-card/45 hover:bg-card p-5 transition-colors">
            <div className="grid gap-4 md:grid-cols-[10rem_1fr_auto] md:items-start">
              <time className="text-muted-foreground font-mono text-xs tabular-nums">
                {formatDate(item.date, locale)}
              </time>
              <div>
                <div className="flex items-center gap-2">
                  <Icon className="text-muted-foreground h-4 w-4" />
                  {portfolioConfig.features.projects && item.projectSlug ? (
                    <Link
                      href={projectHref(locale, item.projectSlug)}
                      className="text-muted-foreground hover:text-foreground text-sm font-medium"
                    >
                      {item.projectName}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground text-sm font-medium">
                      {item.projectName}
                    </span>
                  )}
                </div>
                <h3 className="mt-2 text-base font-semibold tracking-tight">{item.title}</h3>
                <p className="text-muted-foreground mt-2 max-w-3xl text-sm leading-6">
                  {item.summary}
                </p>
                {item.tags && item.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="border-border/70 bg-background/50 text-muted-foreground rounded-md border px-2 py-0.5 font-mono text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <a
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium"
              >
                {dict.activity.open}
                <SquareArrowOutUpRight className="h-4 w-4" />
              </a>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
