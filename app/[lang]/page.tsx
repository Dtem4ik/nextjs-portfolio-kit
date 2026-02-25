import Image from "next/image";
import { notFound } from "next/navigation";
import { Github, Mail, Linkedin, Send, Instagram, Facebook, Phone } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { LangToggle } from "@/components/lang-toggle";
import { getDictionary, hasLocale, type Locale } from "@/lib/dictionaries";
import { buildPersonSchema } from "@/lib/structured-data";
import { portfolioConfig } from "@/portfolio.config";

const LINK_CLASS =
  "border-border hover:bg-accent flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors";

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const locale = lang as Locale;
  const dict = await getDictionary(locale);
  const jsonLd = buildPersonSchema(locale);
  const { name, title, bio, social, photo } = portfolioConfig;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      {/* Skip to main content — WCAG 2.4.1 Level A */}
      <a
        href="#main"
        className="focus:bg-background focus:ring-ring sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:ring-2"
      >
        {dict.a11y.skipToMain}
      </a>
      <div className="bg-background flex min-h-screen flex-col items-center px-6 py-12 sm:px-12">
        <header className="flex w-full max-w-2xl items-center justify-between">
          <span className="text-muted-foreground text-sm font-medium">{name}</span>
          <div className="flex items-center gap-2">
            <LangToggle />
            <ModeToggle />
          </div>
        </header>

        <main
          id="main"
          className="flex w-full max-w-2xl flex-1 flex-col items-start justify-center gap-8 py-20"
        >
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <Image
              src={photo}
              alt={name}
              width={96}
              height={96}
              priority
              className="rounded-full object-cover"
            />
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-bold tracking-tight">{name}</h1>
              <p className="text-muted-foreground text-lg">{title[locale]}</p>
            </div>
          </div>

          <p className="text-foreground/80 max-w-lg text-base leading-relaxed">{bio[locale]}</p>

          <div className="flex flex-wrap gap-3">
            {social.github && (
              <a
                href={social.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className={LINK_CLASS}
              >
                <Github className="h-4 w-4" aria-hidden="true" />
                GitHub
              </a>
            )}
            {social.linkedin && (
              <a
                href={social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className={LINK_CLASS}
              >
                <Linkedin className="h-4 w-4" aria-hidden="true" />
                LinkedIn
              </a>
            )}
            {social.telegram && (
              <a
                href={social.telegram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
                className={LINK_CLASS}
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                Telegram
              </a>
            )}
            {social.instagram && (
              <a
                href={social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className={LINK_CLASS}
              >
                <Instagram className="h-4 w-4" aria-hidden="true" />
                Instagram
              </a>
            )}
            {social.facebook && (
              <a
                href={social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className={LINK_CLASS}
              >
                <Facebook className="h-4 w-4" aria-hidden="true" />
                Facebook
              </a>
            )}
            {social.whatsapp && (
              <a
                href={social.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className={LINK_CLASS}
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                WhatsApp
              </a>
            )}
            {social.email && (
              <a
                href={`mailto:${social.email}`}
                aria-label={dict.home.contactEmail}
                className={LINK_CLASS}
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                {dict.home.contactEmail}
              </a>
            )}
          </div>

          <span className="border-border text-muted-foreground rounded-full border px-4 py-1.5 text-xs font-medium">
            {dict.home.comingSoon}
          </span>
        </main>
      </div>
    </>
  );
}
