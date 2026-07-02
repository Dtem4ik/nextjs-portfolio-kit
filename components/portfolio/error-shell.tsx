"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Github, Linkedin, Mail } from "lucide-react";
import { LangToggle } from "@/components/lang-toggle";
import { ModeToggle } from "@/components/mode-toggle";
import { MobileNav } from "@/components/portfolio/mobile-nav";
import { Button } from "@/components/ui/button";
import en from "@/dictionaries/en.json";
import ru from "@/dictionaries/ru.json";
import { portfolioConfig, type Locale } from "@/portfolio.config";

const dicts = { en, ru } as const;
const { features } = portfolioConfig;

type NavKey = "home" | "projects" | "activity" | "about" | "ask";
const navConfig: { href: string; key: NavKey }[] = (
  [
    { href: "/", key: "home" },
    { href: "/projects", key: "projects" },
    { href: "/activity", key: "activity" },
    { href: "/about", key: "about" },
    { href: "/ask", key: "ask" },
  ] as { href: string; key: NavKey }[]
).filter((item) => item.key === "home" || features[item.key as keyof typeof features]);

function localizedHref(locale: Locale, href: string) {
  if (locale === portfolioConfig.locale.default) return href;
  return href === "/" ? `/${locale}` : `/${locale}${href}`;
}

/**
 * Client-side site chrome for error screens (404 / error boundary), so those
 * pages keep the header + navigation. Locale comes from the URL params.
 */
export function ErrorShell({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const raw = (params?.lang as string) ?? portfolioConfig.locale.default;
  const locale: Locale = raw in dicts ? (raw as Locale) : portfolioConfig.locale.default;
  const dict = dicts[locale];

  const navLinks = navConfig.map((item) => ({
    href: localizedHref(locale, item.href),
    label: dict.nav[item.key],
  }));

  return (
    <div className="bg-background text-foreground min-h-dvh">
      <div className="relative mx-auto flex min-h-dvh w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="border-border bg-background sticky top-4 z-50 flex items-center justify-between rounded-md border px-3 py-2 shadow-lg">
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
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-md px-3 py-2 text-sm font-medium transition-colors"
              >
                {item.label}
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
            <MobileNav items={navLinks} label={dict.nav.menu} />
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center py-16">{children}</main>
      </div>
    </div>
  );
}
