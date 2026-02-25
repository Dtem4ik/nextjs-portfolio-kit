import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { locales, defaultLocale } from "@/lib/i18n";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /en/... → redirect to /... (strip default locale prefix from URL)
  if (pathname === `/${defaultLocale}` || pathname.startsWith(`/${defaultLocale}/`)) {
    const newPath = pathname.slice(`/${defaultLocale}`.length) || "/";
    request.nextUrl.pathname = newPath;
    return NextResponse.redirect(request.nextUrl);
  }

  // Non-default locale already in path → pass through
  const hasNonDefaultLocale = locales
    .filter((l) => l !== defaultLocale)
    .some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));

  if (hasNonDefaultLocale) return;

  // No locale → rewrite internally to /en/... — URL stays clean
  request.nextUrl.pathname = `/${defaultLocale}${pathname}`;
  return NextResponse.rewrite(request.nextUrl);
}

export const config = {
  matcher: ["/((?!_next|_vercel|favicon.ico|.*\\..*).*)", "/"],
};
