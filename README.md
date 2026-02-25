# 🚀 Next.js Portfolio Kit

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React_19-blue?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

_A production-ready starter kit for building a professional portfolio_

[Demo](https://nextjs-portfolio-kit.vercel.app)

</div>

---

## 📋 Overview

**Next.js Portfolio Kit** is a minimal, SEO-first portfolio template. Edit one file — `portfolio.config.ts` — and the entire site updates: metadata, Open Graph, JSON-LD, sitemap, OG image, and page content.

### ✨ Features

- ⚡️ **Next.js 16** App Router with static generation (`generateStaticParams`)
- ⚛️ **React 19** Server Components by default
- 🎨 **Tailwind CSS v4** with OKLCH design tokens and dark mode
- 🌍 **i18n** — native Next.js 16 routing, "as-needed" URL prefixing (`/` for EN, `/ru` for RU)
- 🔍 **SEO** — `generateMetadata`, canonical URLs, hreflang + `x-default`, Open Graph, Twitter Card, `robots.txt`, `sitemap.xml`
- 📊 **JSON-LD** structured data (Person schema via `schema-dts`)
- 🖼️ **Dynamic OG image** — auto-generated via `next/og`
- ♿ **Accessibility** — WCAG 2.4.1 skip link, semantic HTML, `aria-*` attributes
- 🌙 **Dark / light mode** via `next-themes`
- 📝 **TypeScript** strict mode
- 🔧 **shadcn/ui** + Radix UI component primitives

---

## 🛠 Tech Stack

### Core

- **Framework:** [Next.js 16](https://nextjs.org/)
- **React:** [React 19](https://react.dev/)
- **Language:** [TypeScript 5](https://www.typescriptlang.org/)

### Styling

- **CSS Framework:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Components:** [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- **Icons:** [Lucide React](https://lucide.dev/)

### SEO & Analytics

- **Structured Data:** [schema-dts](https://github.com/google/schema-dts)
- **Analytics:** [Vercel Speed Insights](https://vercel.com/docs/speed-insights)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 22 or higher
- pnpm (recommended)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/Dtem4ik/nextjs-portfolio-kit.git
cd nextjs-portfolio-kit
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Add your photo**

Place a `400×400px` WebP or JPEG at `public/photo.jpg`.

4. **Edit your personal data**

```bash
# This is the only file you need to edit
open portfolio.config.ts
```

Fill in your name, title, bio, domain, and social links. Everything else derives from this config automatically.

5. **Start the development server**

```bash
pnpm dev
```

Navigate to [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Configuration

All personal data lives in a single file:

```ts
// portfolio.config.ts
export const portfolioConfig = {
  name: "Your Name",
  title: { en: "Frontend Engineer", ru: "..." },
  bio:   { en: "...", ru: "..." },
  photo: "/photo.jpg",
  url:   "https://yourdomain.com",
  social: {
    github:    "https://github.com/username",
    linkedin:  "https://linkedin.com/in/username",
    email:     "",
    telegram:  "",
    instagram: "",
    facebook:  "",
    whatsapp:  "",
  },
  keywords: { en: [...], ru: [...] },
  locale: { default: "en", supported: ["en", "ru"] },
};
```

---

## 📁 Project Structure

```
nextjs-portfolio-kit/
├── app/
│   ├── [lang]/                    # Locale-based routing
│   │   ├── layout.tsx             # Root layout, metadata, generateStaticParams
│   │   ├── page.tsx               # Home page
│   │   ├── not-found.tsx          # Locale-aware 404
│   │   └── opengraph-image.tsx    # Dynamic OG image (1200×630)
│   ├── robots.ts                  # /robots.txt generator
│   ├── sitemap.ts                 # /sitemap.xml generator
│   └── globals.css                # Tailwind v4 config + OKLCH tokens
├── components/
│   ├── ui/                        # shadcn/ui primitives (CLI-managed, do not edit)
│   ├── lang-toggle.tsx            # Language switcher
│   ├── mode-toggle.tsx            # Dark/light theme toggle
│   └── theme-provider.tsx         # next-themes provider
├── dictionaries/
│   ├── en.json                    # English UI strings
│   └── ru.json                    # Russian UI strings
├── lib/
│   ├── dictionaries.ts            # getDictionary() — server-only
│   ├── i18n.ts                    # Locale config, labels, OG locale map
│   ├── structured-data.ts         # JSON-LD Person schema builder
│   └── utils.ts                   # cn() — clsx + tailwind-merge
├── public/                        # Static assets (place photo.jpg here)
├── portfolio.config.ts            # ⭐ Single source of truth — edit this
├── proxy.ts                       # Next.js 16 Proxy — i18n routing
├── components.json                # shadcn/ui config
├── next.config.ts                 # Next.js config
└── package.json                   # Dependencies and scripts
```

---

## 📜 Available Commands

```bash
# Development
pnpm dev              # Start dev server

# Build
pnpm build            # Create production build
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run linter
pnpm lint:fix         # Auto-fix linting issues
pnpm format           # Format code
pnpm format:check     # Check code formatting
pnpm typecheck        # Run TypeScript type checking
```

---

## 🌍 Adding a Language

1. Add the locale to `portfolio.config.ts`:
   ```ts
   locale: { default: "en", supported: ["en", "ru", "de"] }
   ```
2. Add `dictionaries/de.json` (copy from `en.json` and translate)
3. Register it in `lib/dictionaries.ts` dictionaries map
4. Add the OG locale mapping to `lib/i18n.ts` → `ogLocale`

---

## 🚢 Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Dtem4ik/nextjs-portfolio-kit)

After deploying, submit your sitemap to [Google Search Console](https://search.google.com/search-console):

```
https://yourdomain.com/sitemap.xml
```

---

## 📞 Contact

- GitHub: [@Dtem4ik](https://github.com/Dtem4ik)
- Project: [nextjs-portfolio-kit](https://github.com/Dtem4ik/nextjs-portfolio-kit)

---

## 🤝 Contributing

Contributions are welcome! If you'd like to improve the project:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for commit conventions and code quality rules.

---

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) — for the amazing framework
- [Vercel](https://vercel.com/) — for hosting and tools
- [Tailwind CSS](https://tailwindcss.com/) — for the awesome CSS framework
- [shadcn/ui](https://ui.shadcn.com/) — for the component system

---

<div align="center">

**[⬆ Back to top](#-nextjs-portfolio-kit)**

Made with ❤️ by [Dtem4ik](https://github.com/Dtem4ik)

</div>
