import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ActivityList } from "@/components/portfolio/activity-list";
import { SiteShell } from "@/components/portfolio/site-shell";
import { getPortfolioData } from "@/lib/portfolio/data";
import { hasLocale, type Locale } from "@/lib/dictionaries";
import { portfolioConfig } from "@/portfolio.config";

export const metadata: Metadata = {
  title: "Activity",
  description: "Latest engineering activity generated from selected GitHub repositories.",
};

export default async function ActivityPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  if (!portfolioConfig.features.activity) notFound();

  const locale = lang as Locale;
  const data = await getPortfolioData();

  return (
    <SiteShell locale={locale}>
      <section className="max-w-3xl">
        <p className="text-muted-foreground font-mono text-xs uppercase">
          Latest Engineering Activity
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
          Engineering news feed
        </h1>
        <p className="text-muted-foreground mt-4 text-base leading-7">
          Raw GitHub commits and releases become readable updates. Configure an AI key to generate
          richer summaries during sync, or keep the deterministic fallback summarizer.
        </p>
      </section>

      <section className="mt-10">
        <ActivityList items={data.activity} locale={locale} />
      </section>
    </SiteShell>
  );
}
