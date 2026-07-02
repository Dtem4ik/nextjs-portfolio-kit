import type { MetadataRoute } from "next";
import { portfolioConfig } from "@/portfolio.config";

const { url, locale, features } = portfolioConfig;

export default function sitemap(): MetadataRoute.Sitemap {
  // Only include routes for features that are actually enabled.
  const routes = [
    "",
    ...(features.projects
      ? ["projects", ...portfolioConfig.projects.map((project) => `projects/${project.slug}`)]
      : []),
    ...(features.activity ? ["activity"] : []),
    ...(features.about ? ["about"] : []),
    ...(features.ask ? ["ask"] : []),
  ];

  return locale.supported.flatMap((lang) =>
    routes.map((route) => {
      const path = [lang === locale.default ? "" : lang, route].filter(Boolean).join("/");
      const pageUrl = path ? `${url}/${path}` : url;

      return {
        url: pageUrl,
        lastModified: new Date(),
        changeFrequency: route.startsWith("activity") ? "weekly" : "monthly",
        priority: route === "" ? 1 : 0.7,
        alternates: {
          languages: Object.fromEntries(
            locale.supported.map((l) => {
              const localizedPath = [l === locale.default ? "" : l, route]
                .filter(Boolean)
                .join("/");
              return [l, localizedPath ? `${url}/${localizedPath}` : url];
            }),
          ),
        },
      } satisfies MetadataRoute.Sitemap[number];
    }),
  );
}
