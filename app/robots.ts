import type { MetadataRoute } from "next";
import { portfolioConfig } from "@/portfolio.config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${portfolioConfig.url}/sitemap.xml`,
  };
}
