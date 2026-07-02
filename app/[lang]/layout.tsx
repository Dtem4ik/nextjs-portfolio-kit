import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "@/components/theme-provider";
import { hasLocale, type Locale } from "@/lib/dictionaries";
import { ogLocale } from "@/lib/i18n";
import { portfolioConfig } from "@/portfolio.config";
import "@/app/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};

  const locale = lang as Locale;
  const { name, role, tagline, url, keywords, locale: localeConfig } = portfolioConfig;

  const canonicalUrl = locale === localeConfig.default ? url : `${url}/${locale}`;
  const pageTitle = `${name} — ${role[locale]}`;

  // x-default points to the root (default locale, no prefix)
  const hreflangLanguages = Object.fromEntries([
    ...localeConfig.supported.map((l) => [l, l === localeConfig.default ? url : `${url}/${l}`]),
    ["x-default", url],
  ]);

  return {
    metadataBase: new URL(url),
    title: {
      default: pageTitle,
      template: `%s — ${name}`,
    },
    description: tagline[locale],
    keywords: [...keywords[locale]],
    authors: [{ name, url }],
    creator: name,
    publisher: name,
    alternates: {
      canonical: canonicalUrl,
      languages: hreflangLanguages,
    },
    openGraph: {
      type: "website",
      url: canonicalUrl,
      siteName: name,
      title: pageTitle,
      description: tagline[locale],
      locale: ogLocale[locale],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: tagline[locale],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
    },
  };
}

export function generateStaticParams() {
  return portfolioConfig.locale.supported.map((lang) => ({ lang }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  return (
    <html lang={lang} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
        {process.env.VERCEL && <SpeedInsights />}
      </body>
    </html>
  );
}
