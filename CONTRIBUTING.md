# Contributing

## Using this template

1. Fork the repository
2. Edit `portfolio.config.ts` with your personal data
3. Run `pnpm dev` and verify everything looks correct
4. Deploy to Vercel

## Contributing to the template itself

1. Fork and clone the repository
2. Install dependencies: `pnpm install`
3. Create a feature branch: `git checkout -b feat/your-feature`
4. Make your changes
5. Run checks: `pnpm typecheck && pnpm lint && pnpm build`
6. Commit and open a pull request

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
