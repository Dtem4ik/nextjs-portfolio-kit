# Portfolio Project

## Tech Stack

Next.js 16 (App Router) · React 19 · TypeScript 5 (strict) · Tailwind CSS v4 (CSS-first) · shadcn/ui (New York) · Radix UI · lucide-react · next-themes · pnpm · Vercel

## Structure

```
app/                    → Pages, layouts, global CSS (App Router)
  globals.css           → Tailwind v4 config + OKLCH design tokens
components/
  ui/                   → shadcn/ui primitives (CLI-managed)
  *.tsx                 → Shared components
lib/
  utils.ts              → cn() — clsx + tailwind-merge
public/                 → Static assets
```

## Commands

```bash
pnpm dev              # Dev server
pnpm build            # Production build
pnpm lint             # ESLint
pnpm format           # Prettier
pnpm typecheck        # TypeScript check
```

## Quick Reference

- Add shadcn/ui component: `pnpm dlx shadcn@latest add <name>`
- New page: create `app/[route]/page.tsx`, export `metadata` for SEO
- New token: add to `:root` + `.dark` in `globals.css` (OKLCH), map in `@theme inline`
- Config: `components.json` (shadcn), `eslint.config.mjs`, `.prettierrc.json`
