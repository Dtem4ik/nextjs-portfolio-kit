import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { locales, defaultLocale } from "@/lib/i18n";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) return;

  // Metadata routes live at the app root (no locale prefix, no file extension),
  // so skip the locale rewrite or /icon would become /en/icon → 404.
  if (pathname === "/icon" || pathname === "/apple-icon") return;

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
  // Exclude API, Next internals, and metadata routes (icon/apple-icon have no
  // file extension, so they must be listed explicitly or the locale rewrite
  // turns /icon into /en/icon → 404).
  matcher: ["/((?!api|_next|_vercel|icon|apple-icon|favicon.ico|.*\\..*).*)", "/"],
};
