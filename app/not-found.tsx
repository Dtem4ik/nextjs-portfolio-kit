import "./globals.css";
import Link from "next/link";
import en from "@/dictionaries/en.json";
import { portfolioConfig } from "@/portfolio.config";

// Root not-found: the app's root is the dynamic [lang] segment (no root layout),
// so this self-contained page (its own <html>/<body>) is what catches all 404s
// app-wide. It uses the default locale.
const { features, locale } = portfolioConfig;
const dict = en;

const navLinks = [
  { href: "/", label: dict.nav.home },
  ...(features.projects ? [{ href: "/projects", label: dict.nav.projects }] : []),
  ...(features.activity ? [{ href: "/activity", label: dict.nav.activity }] : []),
  ...(features.about ? [{ href: "/about", label: dict.nav.about }] : []),
  ...(features.ask ? [{ href: "/ask", label: dict.nav.ask }] : []),
];

export default function NotFound() {
  return (
    <html lang={locale.default} suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
        <main className="flex min-h-dvh flex-col items-center justify-center gap-8 px-6 text-center">
          <div>
            <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
              {dict.notFound.eyebrow}
            </p>
            <h1 className="mt-3 text-6xl font-semibold tracking-tight md:text-7xl">404</h1>
            <p className="mt-4 text-lg font-medium">{dict.notFound.title}</p>
            <p className="text-muted-foreground mx-auto mt-2 max-w-sm">
              {dict.notFound.description}
            </p>
          </div>

          <nav className="flex flex-wrap justify-center gap-2">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="border-border text-muted-foreground hover:text-foreground hover:bg-accent rounded-md border px-3 py-1.5 text-sm font-medium transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/"
            className="bg-foreground text-background rounded-md px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90 active:translate-y-px"
          >
            {dict.notFound.back}
          </Link>
        </main>
      </body>
    </html>
  );
}
