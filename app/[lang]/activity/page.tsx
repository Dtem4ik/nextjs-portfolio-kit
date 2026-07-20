import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ActivityList } from "@/components/portfolio/activity-list";
import { SiteShell } from "@/components/portfolio/site-shell";
import { getPortfolioData } from "@/lib/portfolio/data";
import { getDictionary, hasLocale, type Locale } from "@/lib/dictionaries";
import { buildAlternates } from "@/lib/i18n";
import { portfolioConfig } from "@/portfolio.config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.activity.title,
    description: dict.activity.intro,
    alternates: buildAlternates(lang as Locale, "activity"),
  };
}

export default async function ActivityPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  if (!portfolioConfig.features.activity) notFound();

  const locale = lang as Locale;
  const dict = await getDictionary(locale);
  const data = await getPortfolioData(locale);

  return (
    <SiteShell locale={locale}>
      <section className="max-w-3xl">
        <p className="text-muted-foreground font-mono text-xs uppercase">{dict.activity.eyebrow}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
          {dict.activity.title}
        </h1>
        <p className="text-muted-foreground mt-4 text-base leading-7">{dict.activity.intro}</p>
      </section>

      <section className="mt-10">
        <ActivityList items={data.activity} locale={locale} />
      </section>
    </SiteShell>
  );
}
