"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ErrorShell } from "@/components/portfolio/error-shell";
import { Button } from "@/components/ui/button";
import en from "@/dictionaries/en.json";
import ru from "@/dictionaries/ru.json";
import { portfolioConfig, type Locale } from "@/portfolio.config";

const dicts = { en, ru } as const;

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const params = useParams();
  const raw = (params?.lang as string) ?? portfolioConfig.locale.default;
  const locale: Locale = raw in dicts ? (raw as Locale) : portfolioConfig.locale.default;
  const dict = dicts[locale].error;
  const home = locale === portfolioConfig.locale.default ? "/" : `/${locale}`;

  return (
    <ErrorShell>
      <div className="text-center">
        <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
          {dict.eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">{dict.title}</h1>
        <p className="text-muted-foreground mx-auto mt-3 max-w-sm">{dict.description}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button onClick={reset} className="rounded-md active:translate-y-px">
            {dict.retry}
          </Button>
          <Button asChild variant="outline" className="rounded-md">
            <Link href={home}>{dict.back}</Link>
          </Button>
        </div>
      </div>
    </ErrorShell>
  );
}
