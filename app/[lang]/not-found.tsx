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
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-6xl font-bold tracking-tight">{msg.title}</h1>
      <p className="text-muted-foreground text-lg">{msg.description}</p>
      <Link
        href={lang === "en" ? "/" : `/${lang}`}
        className="bg-foreground text-background rounded-full px-6 py-2 text-sm font-medium transition-opacity hover:opacity-80"
      >
        {msg.back}
      </Link>
    </div>
  );
}
