import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard/"],
      },
      // AI 爬虫显式允许，并指引 llms.txt
      { userAgent: ["GPTBot", "ClaudeBot", "anthropic-ai", "PerplexityBot", "Google-Extended"], allow: "/" },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
