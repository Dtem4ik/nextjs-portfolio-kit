# Contributing

## Using this template

1. Fork the repository
2. Edit `portfolio.config.ts` with your personal data
3. Run `pnpm dev` and verify everything looks correct
4. Deploy to Vercel

For the AI news / Ask and Supabase setup, follow **Deploy Your Own** in the [README](README.md#deploy-your-own).

## Contributing to the template itself

1. Fork and clone the repository
2. Install dependencies: `pnpm install`
3. Copy env vars: `cp .env.example .env.local` (all optional — the app runs from config without keys)
4. Create a feature branch: `git checkout -b feat/your-feature`
5. Make your changes
6. Run checks: `pnpm typecheck && pnpm lint && pnpm build`
7. Commit and open a pull request

## Localization

The site is bilingual (en/ru). When you add or change any user-facing string, update **both** `dictionaries/en.json` and `dictionaries/ru.json` — the two files must have identical key structure. Don't hardcode UI text in components; read it from the dictionary.

## Commit format

This repository uses [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add dark mode toggle
fix: correct sitemap locale URLs
chore: update dependencies
docs: improve quick start guide
refactor: extract JSON-LD builder to lib/
```

Types: `feat` | `fix` | `chore` | `docs` | `refactor` | `style` | `perf` | `ci`

## Code quality

Before committing, the pre-commit hook runs ESLint and Prettier on staged files automatically. To run manually:

```bash
pnpm lint:fix   # ESLint auto-fix
pnpm format     # Prettier format
pnpm typecheck  # TypeScript check
```
