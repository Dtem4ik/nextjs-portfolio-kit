import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AskPanel } from "@/components/portfolio/ask-panel";
import { SiteShell } from "@/components/portfolio/site-shell";
import { getPortfolioData } from "@/lib/portfolio/data";
import { hasLocale, type Locale } from "@/lib/dictionaries";
import { portfolioConfig } from "@/portfolio.config";

export const metadata: Metadata = {
  title: "Ask",
  description: "Ask questions against indexed portfolio data.",
};

export default async function AskPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  if (!portfolioConfig.features.ask) notFound();

  const locale = lang as Locale;
  const data = await getPortfolioData();

  return (
    <SiteShell locale={locale}>
      <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-muted-foreground font-mono text-xs uppercase">Portfolio AI</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            Ask about this developer
          </h1>
          <p className="text-muted-foreground mt-4 max-w-xl text-base leading-7">
            The ask layer is grounded in indexed portfolio content: config, selected repositories,
            commits, releases, skills, and experience. When no AI key is configured, it returns a
            transparent local fallback.
          </p>

          <dl className="border-border/70 mt-8 grid grid-cols-2 overflow-hidden rounded-md border">
            <div className="border-border/70 border-r border-b p-4">
              <dt className="text-muted-foreground text-xs uppercase">Projects</dt>
              <dd className="mt-2 font-mono text-2xl">{data.metrics.projects}</dd>
            </div>
            <div className="border-border/70 border-b p-4">
              <dt className="text-muted-foreground text-xs uppercase">Activity items</dt>
              <dd className="mt-2 font-mono text-2xl">{data.activity.length}</dd>
            </div>
            <div className="border-border/70 border-r p-4">
              <dt className="text-muted-foreground text-xs uppercase">Provider</dt>
              <dd className="mt-2 text-sm">{portfolioConfig.ai.provider}</dd>
            </div>
            <div className="p-4">
              <dt className="text-muted-foreground text-xs uppercase">Model</dt>
              <dd className="mt-2 text-sm">{portfolioConfig.ai.model}</dd>
            </div>
          </dl>
        </div>

        <AskPanel />
      </section>
    </SiteShell>
  );
}
