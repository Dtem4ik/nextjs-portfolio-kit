import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/portfolio/site-shell";
import { getDictionary, hasLocale, type Locale } from "@/lib/dictionaries";
import { portfolioConfig } from "@/portfolio.config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.nav.about, description: portfolioConfig.tagline[lang] };
}

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  if (!portfolioConfig.features.about) notFound();

  const locale = lang as Locale;
  const dict = await getDictionary(locale);

  return (
    <SiteShell locale={locale}>
      <section className="grid gap-8 lg:grid-cols-[18rem_1fr]">
        <aside>
          <Image
            src={portfolioConfig.avatar}
            alt={portfolioConfig.name}
            width={220}
            height={220}
            className="border-border aspect-square rounded-md border object-cover"
          />
          <div className="mt-5">
            <h1 className="text-3xl font-semibold tracking-tight">{portfolioConfig.name}</h1>
            <p className="text-muted-foreground mt-2">{portfolioConfig.role[locale]}</p>
            <p className="text-muted-foreground mt-1 text-sm">{portfolioConfig.location}</p>
          </div>
        </aside>

        <div className="space-y-10">
          <section>
            <p className="text-muted-foreground font-mono text-xs uppercase">
              {dict.about.profile}
            </p>
            <p className="mt-3 max-w-3xl text-base leading-7">{portfolioConfig.bio[locale]}</p>
          </section>

          <section>
            <p className="text-muted-foreground font-mono text-xs uppercase">{dict.about.skills}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {portfolioConfig.skills.map((skill) => (
                <span
                  key={skill}
                  className="border-border/70 bg-card/60 rounded-md border px-3 py-1.5 font-mono text-xs"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>

          <section>
            <p className="text-muted-foreground font-mono text-xs uppercase">
              {dict.about.experience}
            </p>
            <div className="border-border/70 mt-4 divide-y overflow-hidden rounded-md border">
              {portfolioConfig.experience.map((item) => (
                <article key={`${item.company}-${item.period}`} className="bg-card/45 p-5">
                  <div className="flex flex-col justify-between gap-2 sm:flex-row">
                    <div>
                      <h2 className="font-semibold tracking-tight">{item.role}</h2>
                      <p className="text-muted-foreground text-sm">{item.company}</p>
                    </div>
                    <p className="text-muted-foreground font-mono text-xs">{item.period}</p>
                  </div>
                  <p className="text-muted-foreground mt-3 max-w-3xl text-sm leading-6">
                    {item.summary}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </SiteShell>
  );
}
