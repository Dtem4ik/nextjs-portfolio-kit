"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { locales, localeLabels, defaultLocale, type Locale } from "@/lib/i18n";

export function LangToggle() {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();

  const currentLang = params.lang as Locale;

  const switchLocale = (newLang: Locale) => {
    if (newLang === currentLang) return;

    let newPath: string;

    if (currentLang === defaultLocale) {
      // Current URL has no lang prefix: / or /about
      newPath = `/${newLang}${pathname === "/" ? "" : pathname}`;
    } else if (newLang === defaultLocale) {
      // Switching back to default: /ru/about → /about
      newPath = pathname.slice(`/${currentLang}`.length) || "/";
    } else {
      // Switching between non-default locales: /ru/about → /fr/about
      newPath = `/${newLang}${pathname.slice(`/${currentLang}`.length)}`;
    }

    router.push(newPath);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Globe className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => switchLocale(locale)}
            aria-current={currentLang === locale ? "true" : undefined}
            className={currentLang === locale ? "font-semibold" : ""}
          >
            {localeLabels[locale]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
