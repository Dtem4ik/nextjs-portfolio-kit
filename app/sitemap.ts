import type { MetadataRoute } from "next";
import { portfolioConfig } from "@/portfolio.config";

const { url, locale } = portfolioConfig;

export default function sitemap(): MetadataRoute.Sitemap {
  return locale.supported.map((lang) => ({
    url: lang === locale.default ? url : `${url}/${lang}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: lang === locale.default ? 1 : 0.8,
    alternates: {
      languages: Object.fromEntries(
        locale.supported.map((l) => [l, l === locale.default ? url : `${url}/${l}`]),
      ),
    },
  }));
}
