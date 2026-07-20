import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AskPanel } from "@/components/portfolio/ask-panel";
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
  const title = dict.nav.ask;
  const description = dict.ask.intro;
  return {
    title,
    description,
    ...buildPageMetadata(lang as Locale, "ask", { title, description }),
  };
}

export default async function AskPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  if (!portfolioConfig.features.ask) notFound();

  const locale = lang as Locale;
  const dict = await getDictionary(locale);
  const data = await getPortfolioData(locale);

  return (
    <SiteShell locale={locale}>
      <JsonLd
        schema={buildBreadcrumbSchema(locale, [
          { name: dict.nav.home, route: "" },
          { name: dict.nav.ask, route: "ask" },
        ])}
      />
      <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-muted-foreground font-mono text-xs uppercase">{dict.ask.eyebrow}</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            {dict.ask.title}
          </h1>
          <p className="text-muted-foreground mt-4 max-w-xl text-base leading-7">
            {dict.ask.intro}
          </p>

          <dl className="border-border/70 mt-8 grid grid-cols-2 overflow-hidden rounded-md border">
            <div className="border-border/70 border-r border-b p-4">
              <dt className="text-muted-foreground text-xs uppercase">{dict.ask.projects}</dt>
              <dd className="mt-2 font-mono text-2xl">{data.metrics.projects}</dd>
            </div>
            <div className="border-border/70 border-b p-4">
              <dt className="text-muted-foreground text-xs uppercase">{dict.ask.activityItems}</dt>
              <dd className="mt-2 font-mono text-2xl">{data.activity.length}</dd>
            </div>
            <div className="border-border/70 border-r p-4">
              <dt className="text-muted-foreground text-xs uppercase">{dict.ask.provider}</dt>
              <dd className="mt-2 text-sm">{portfolioConfig.ai.provider}</dd>
            </div>
            <div className="p-4">
              <dt className="text-muted-foreground text-xs uppercase">{dict.ask.model}</dt>
              <dd className="mt-2 text-sm">{portfolioConfig.ai.model}</dd>
            </div>
          </dl>
        </div>

        <AskPanel labels={dict.ask} />
      </section>
    </SiteShell>
  );
}
