import Link from "next/link";
import { Github, Linkedin, Mail } from "lucide-react";
import { LangToggle } from "@/components/lang-toggle";
import { ModeToggle } from "@/components/mode-toggle";
import { PageTransition } from "@/components/portfolio/page-transition";
import { Button } from "@/components/ui/button";
import { getDictionary, type Locale } from "@/lib/dictionaries";
import { portfolioConfig } from "@/portfolio.config";

const { features } = portfolioConfig;

// Home is always present; every other entry is gated by its feature flag so the
// nav never links to a page that is turned off (and returns 404). `key` maps to
// the localized label in dict.nav.
const navConfig: { href: string; key: "home" | "projects" | "activity" | "about" | "ask" }[] = [
  { href: "/", key: "home" },
  { href: "/projects", key: "projects" },
  { href: "/activity", key: "activity" },
  { href: "/about", key: "about" },
  { href: "/ask", key: "ask" },
].filter((item) => (item.key === "home" ? true : features[item.key as keyof typeof features])) as {
  href: string;
  key: "home" | "projects" | "activity" | "about" | "ask";
}[];

function localizedHref(locale: Locale, href: string) {
  if (locale === portfolioConfig.locale.default) return href;
  return href === "/" ? `/${locale}` : `/${locale}${href}`;
}

export async function SiteShell({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const dict = await getDictionary(locale);

  return (
    <div className="bg-background text-foreground min-h-[100dvh]">
      <a
        href="#main"
        className="focus:bg-background focus:ring-ring sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:rounded-md focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:ring-2"
      >
        {dict.a11y.skipToMain}
      </a>
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(45,212,191,0.08),transparent_24rem),linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:auto,48px_48px,48px_48px] dark:bg-[radial-gradient(circle_at_80%_10%,rgba(45,212,191,0.08),transparent_24rem),linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)]" />
      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="border-border/70 bg-background/75 shadow-background/40 sticky top-4 flex items-center justify-between rounded-md border px-3 py-2 shadow-2xl backdrop-blur-xl">
          <Link
            href={localizedHref(locale, "/")}
            className="hover:bg-accent flex items-center gap-3 rounded-md px-2 py-1 transition-colors"
          >
            <span className="bg-primary text-primary-foreground grid h-8 w-8 place-items-center rounded-md font-mono text-xs font-semibold">
              {portfolioConfig.name
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)}
            </span>
            <span className="hidden text-sm font-semibold tracking-tight sm:inline">
              {portfolioConfig.name}
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navConfig.map((item) => (
              <Link
                key={item.href}
                href={localizedHref(locale, item.href)}
                className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-md px-3 py-2 text-sm font-medium transition-colors"
              >
                {dict.nav[item.key]}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {portfolioConfig.social.github && (
              <Button asChild variant="ghost" size="icon" className="rounded-md">
                <a href={portfolioConfig.social.github} target="_blank" rel="noreferrer">
                  <Github className="h-4 w-4" />
                  <span className="sr-only">GitHub</span>
                </a>
              </Button>
            )}
            {portfolioConfig.social.linkedin && (
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="hidden rounded-md sm:inline-flex"
              >
                <a href={portfolioConfig.social.linkedin} target="_blank" rel="noreferrer">
                  <Linkedin className="h-4 w-4" />
                  <span className="sr-only">LinkedIn</span>
                </a>
              </Button>
            )}
            {portfolioConfig.social.email && (
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="hidden rounded-md sm:inline-flex"
              >
                <a href={`mailto:${portfolioConfig.social.email}`}>
                  <Mail className="h-4 w-4" />
                  <span className="sr-only">Email</span>
                </a>
              </Button>
            )}
            <LangToggle />
            <ModeToggle />
          </div>
        </header>

        <main id="main" className="flex-1 py-10 sm:py-14">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
