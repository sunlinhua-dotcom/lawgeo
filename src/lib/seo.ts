import { siteConfig } from "./site";

type JsonLd = Record<string, unknown>;

export function organizationSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    foundingDate: "2026",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      email: siteConfig.contact.email,
      availableLanguage: ["Chinese"],
    },
    sameAs: [siteConfig.url],
  };
}

export function websiteSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    name: siteConfig.title,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: "zh-CN",
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteConfig.url}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function softwareApplicationSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${siteConfig.url}/#software`,
    name: `${siteConfig.name} — 律所 GEO 优化平台`,
    operatingSystem: "Web",
    applicationCategory: "BusinessApplication",
    description: siteConfig.description,
    url: siteConfig.url,
    featureList: [
      "GEO 洞察系统 — 关键词矩阵 + 案由词库 × 地域组合",
      "AI 内容生成 — FAQ/TL;DR/HowTo/对比表/直接答案，自带 schema.org",
      "多平台发布 — 官网 + 知乎/百家号/公众号/小红书/今日头条",
      "AI 引用监测 — DeepSeek/通义/豆包/Kimi/智谱/Claude/ChatGPT/Perplexity 12 平台",
      "一键域名诊断 — llms.txt / schema.org / robots / sitemap 全自动审计",
      "律所专属 — 内置案由 × 300+ 城市矩阵生成器",
    ],
    offers: {
      "@type": "Offer",
      price: "8000",
      priceCurrency: "CNY",
      priceValidUntil: "2027-12-31",
      description: "月费方案，含 30 个关键词以内",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "47",
      bestRating: "5",
    },
  };
}

export function faqSchema(
  pageId: string,
  faqs: Array<{ q: string; a: string }>,
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${siteConfig.url}${pageId}#faq`,
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function articleSchema(opts: {
  title: string;
  description: string;
  path: string;
  date?: string;
  author?: string;
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.title,
    description: opts.description,
    url: `${siteConfig.url}${opts.path}`,
    datePublished: opts.date ?? new Date().toISOString().slice(0, 10),
    dateModified: opts.date ?? new Date().toISOString().slice(0, 10),
    author: {
      "@type": "Organization",
      name: opts.author ?? siteConfig.name,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    inLanguage: "zh-CN",
  };
}

export function breadcrumbSchema(items: Array<{ name: string; path: string }>): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${siteConfig.url}${it.path}`,
    })),
  };
}

export function howToSchema(opts: {
  name: string;
  description: string;
  steps: Array<{ name: string; text: string }>;
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: opts.name,
    description: opts.description,
    step: opts.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

export function legalServiceSchema(opts: {
  name: string;
  area: string;
  description: string;
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "LegalService",
    name: opts.name,
    description: opts.description,
    areaServed: opts.area,
    serviceType: opts.name,
  };
}

/** 拼接多块 JSON-LD 成单个 <script> 字符串 */
export function jsonLd(...blocks: JsonLd[]): string {
  if (blocks.length === 1) return JSON.stringify(blocks[0]);
  return JSON.stringify({ "@context": "https://schema.org", "@graph": blocks });
}
