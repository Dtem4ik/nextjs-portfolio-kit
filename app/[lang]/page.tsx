import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Download, MapPin } from "lucide-react";
import { ActivityList } from "@/components/portfolio/activity-list";
import { MetricStrip } from "@/components/portfolio/metric-strip";
import { ProjectCard } from "@/components/portfolio/project-card";
import { SiteShell } from "@/components/portfolio/site-shell";
import { Button } from "@/components/ui/button";
import { getPortfolioData } from "@/lib/portfolio/data";
import { getDictionary, hasLocale, type Locale } from "@/lib/dictionaries";
import { buildPersonSchema } from "@/lib/structured-data";
import { portfolioConfig } from "@/portfolio.config";

const { features } = portfolioConfig;

function localizedHref(locale: Locale, href: string) {
  return locale === portfolioConfig.locale.default ? href : `/${locale}${href}`;
}

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const locale = lang as Locale;
  const dict = await getDictionary(locale);
  const jsonLd = buildPersonSchema(locale);

  // Only load portfolio data for the sections that are actually shown.
  const showFeed = features.projects || features.activity;
  const data = showFeed ? await getPortfolioData(locale) : null;
  const featuredProjects = data?.projects.slice(0, 2) ?? [];

  const contactLinks = portfolioConfig.contact.filter((item) => item.href);

  return (
    <SiteShell locale={locale}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div className="max-w-3xl">
          <div className="flex items-center gap-4">
            <Image
              src={portfolioConfig.avatar}
              alt={portfolioConfig.name}
              width={88}
              height={88}
              priority
              className="border-border rounded-md border object-cover"
            />
            <div>
              <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
                <MapPin className="h-4 w-4" />
                {portfolioConfig.location}
              </p>
              <h1 className="mt-2 text-4xl leading-tight font-semibold tracking-tight md:text-6xl">
                {portfolioConfig.name}
              </h1>
            </div>
          </div>

          <p className="text-primary mt-6 font-mono text-sm font-medium uppercase">
            {portfolioConfig.role[locale]}
          </p>
          <p className="text-muted-foreground mt-4 max-w-2xl text-base leading-7">
            {portfolioConfig.bio[locale]}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {features.projects && (
              <Button asChild className="rounded-md">
                <Link href={localizedHref(locale, "/projects")}>
                  {dict.home.viewProjects}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
            {features.about && (
              <Button
                asChild
                variant={features.projects ? "outline" : "default"}
                className="rounded-md"
              >
                <Link href={localizedHref(locale, "/about")}>{dict.home.aboutMe}</Link>
              </Button>
            )}
            {features.ask && (
              <Button asChild variant="outline" className="rounded-md">
                <Link href={localizedHref(locale, "/ask")}>{dict.home.askCta}</Link>
              </Button>
            )}
            {portfolioConfig.resumeUrl && (
              <Button asChild variant="outline" className="rounded-md">
                <a href={portfolioConfig.resumeUrl} download>
                  {dict.home.downloadCv}
                  <Download className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </div>

        <div className="border-border/70 bg-card/50 rounded-md border p-5">
          <p className="text-muted-foreground font-mono text-xs uppercase">
            {dict.home.getInTouch}
          </p>
          <div className="mt-4 space-y-2">
            {contactLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                className="border-border/70 bg-background/40 hover:bg-accent group flex items-center justify-between rounded-md border px-3 py-2.5 text-sm transition-colors"
              >
                <span className="font-medium">{item.label}</span>
                <ArrowUpRight className="text-muted-foreground group-hover:text-foreground h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {showFeed && data && (
        <section className="mt-10">
          <MetricStrip metrics={data.metrics} locale={locale} />
        </section>
      )}

      {showFeed && data && (
        <section
          className={`mt-12 grid gap-8 ${
            features.projects && features.activity ? "lg:grid-cols-[0.95fr_1.05fr]" : ""
          }`}
        >
          {features.projects && (
            <div>
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-muted-foreground font-mono text-xs uppercase">
                    {dict.home.featuredWork}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                    {dict.home.selectedRepositories}
                  </h2>
                </div>
                <Link
                  href={localizedHref(locale, "/projects")}
                  className="text-muted-foreground hover:text-foreground text-sm font-medium"
                >
                  {dict.home.allProjects}
                </Link>
              </div>
              <div className="space-y-4">
                {featuredProjects.map((project) => (
                  <ProjectCard key={project.slug} project={project} locale={locale} />
                ))}
              </div>
            </div>
          )}

          {features.activity && (
            <div>
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-muted-foreground font-mono text-xs uppercase">
                    {dict.home.latestActivity}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                    {dict.home.readableUpdates}
                  </h2>
                </div>
                <Link
                  href={localizedHref(locale, "/activity")}
                  className="text-muted-foreground hover:text-foreground text-sm font-medium"
                >
                  {dict.home.fullFeed}
                </Link>
              </div>
              <ActivityList items={data.activity} locale={locale} limit={5} />
            </div>
          )}
        </section>
      )}
    </SiteShell>
  );
}
