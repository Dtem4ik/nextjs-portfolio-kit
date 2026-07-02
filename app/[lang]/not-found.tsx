"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import type { Locale } from "@/lib/dictionaries";

const messages: Record<Locale, { title: string; description: string; back: string }> = {
  en: { title: "404", description: "Page not found", back: "Go home" },
  ru: { title: "404", description: "Страница не найдена", back: "На главную" },
};

export default function NotFound() {
  const params = useParams();
  const lang = (params?.lang as Locale) ?? "en";
  const msg = messages[lang] ?? messages.en;

  return (
    <div className="bg-background text-foreground flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">Error 404</p>
      <h1 className="text-5xl font-semibold tracking-tight md:text-6xl">{msg.title}</h1>
      <p className="text-muted-foreground max-w-sm">{msg.description}</p>
      <Link
        href={lang === "en" ? "/" : `/${lang}`}
        className="bg-foreground text-background mt-2 rounded-md px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90 active:translate-y-px"
      >
        {msg.back}
      </Link>
    </div>
  );
}
