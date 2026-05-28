import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

const ROUTES = [
  { path: "/", priority: 1.0 },
  { path: "/insight", priority: 0.9 },
  { path: "/generate", priority: 0.9 },
  { path: "/publish", priority: 0.9 },
  { path: "/monitor", priority: 0.9 },
  { path: "/pricing", priority: 0.9 },
  { path: "/cases/lawyer", priority: 0.9 },
  { path: "/cases/sme", priority: 0.8 },
  { path: "/cases/b2b", priority: 0.8 },
  { path: "/cases/local", priority: 0.8 },
  { path: "/cases/education", priority: 0.9 },
  { path: "/cases/fmcg", priority: 0.8 },
  { path: "/cases/consumer-electronics", priority: 0.8 },
  { path: "/cases/adtech", priority: 0.8 },
  { path: "/cases/franchise", priority: 0.8 },
  { path: "/cases/finance", priority: 0.9 },
  { path: "/cases/ai-saas-overseas", priority: 0.8 },
  { path: "/cases/overseas", priority: 0.9 },
  { path: "/team", priority: 0.7 },
  { path: "/process", priority: 0.7 },
  { path: "/market-insights", priority: 0.8 },
  { path: "/tools/intent", priority: 0.8 },
  { path: "/faq", priority: 0.8 },
  { path: "/geo-vs-seo", priority: 0.8 },
  { path: "/about", priority: 0.7 },
  { path: "/why", priority: 0.7 },
  { path: "/contact", priority: 0.7 },
  { path: "/blog", priority: 0.8 },
  { path: "/blog/what-is-geo-2026", priority: 0.7 },
  { path: "/blog/llms-txt-guide", priority: 0.7 },
  { path: "/blog/lawyer-geo-handbook", priority: 0.7 },
  { path: "/tools/audit", priority: 0.9 },
  { path: "/tools/matrix", priority: 0.8 },
  { path: "/tools/compare", priority: 0.8 },
  { path: "/tools/generate", priority: 0.8 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ROUTES.map((r) => ({
    url: `${siteConfig.url}${r.path}`,
    lastModified,
    changeFrequency: "weekly",
    priority: r.priority,
  }));
}
