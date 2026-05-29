import "server-only";
import type { AuditCheck, AuditResult, CheckStatus } from "./audit-types";
import { getScraper } from "./providers/scraper";

const UA = "lawGEO-audit/1.0 (+https://lawgeo.cn/tools/audit)";
const TIMEOUT_MS = 8000;

async function fetchText(url: string): Promise<{ ok: boolean; status: number; text: string; finalUrl: string }> {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { "user-agent": UA, accept: "text/html,*/*" },
      redirect: "follow",
      signal: ctl.signal,
    });
    const text = await res.text();
    return { ok: res.ok, status: res.status, text, finalUrl: res.url };
  } catch {
    return { ok: false, status: 0, text: "", finalUrl: url };
  } finally {
    clearTimeout(t);
  }
}

function normalizeDomain(input: string): { domain: string; url: string } {
  let s = input.trim().toLowerCase();
  s = s.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "");
  return { domain: s, url: `https://${s}/` };
}

function extractMeta(html: string, name: string): string | undefined {
  const m =
    html.match(new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]*content=["']([^"']+)["']`, "i")) ||
    html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]*(?:name|property)=["']${name}["']`, "i"));
  return m?.[1];
}

function extractAllSchemas(html: string): unknown[] {
  const out: unknown[] = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    try {
      out.push(JSON.parse(m[1].trim()));
    } catch {
      // ignore parse errors
    }
  }
  return out;
}

function schemaTypes(blocks: unknown[]): string[] {
  const types = new Set<string>();
  const walk = (node: unknown) => {
    if (!node || typeof node !== "object") return;
    const obj = node as Record<string, unknown>;
    if (typeof obj["@type"] === "string") types.add(obj["@type"]);
    if (Array.isArray(obj["@type"])) for (const t of obj["@type"] as string[]) types.add(t);
    if (Array.isArray(obj["@graph"])) for (const child of obj["@graph"]) walk(child);
    for (const v of Object.values(obj)) {
      if (Array.isArray(v)) for (const c of v) walk(c);
      else if (typeof v === "object") walk(v);
    }
  };
  for (const b of blocks) walk(b);
  return Array.from(types);
}

function textBetween(html: string, start: RegExp, end: RegExp): string | undefined {
  const s = html.search(start);
  if (s < 0) return undefined;
  const after = html.slice(s);
  const e = after.search(end);
  if (e < 0) return undefined;
  return after.slice(0, e);
}

function stripTags(s: string) {
  return s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function countMatches(html: string, re: RegExp) {
  return (html.match(re) ?? []).length;
}

export async function runAudit(rawDomain: string): Promise<AuditResult> {
  const t0 = Date.now();
  const { domain, url } = normalizeDomain(rawDomain);

  // 主页用 scraper provider 抓取（配了 Firecrawl 时能渲染 SPA + 拿截图）；
  // llms.txt / robots / sitemap 是静态文本，仍用轻量 fetch。
  const scraper = getScraper();
  const [homePage, llms, llmsFull, robots, sitemap] = await Promise.all([
    scraper.scrape(url, { screenshot: false, timeoutMs: TIMEOUT_MS }),
    fetchText(`${url}llms.txt`),
    fetchText(`${url}llms-full.txt`),
    fetchText(`${url}robots.txt`),
    fetchText(`${url}sitemap.xml`),
  ]);

  const html = homePage.html ?? "";
  const hasContent = homePage.ok && (html.length > 200 || homePage.markdown.length > 200);

  // ── Meta extraction ─────────────────────────────────────────────────
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim();
  const description = extractMeta(html, "description");
  const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1];
  const lang = html.match(/<html[^>]+lang=["']([^"']+)["']/i)?.[1];
  const favicon = /<link[^>]+rel=["'](?:shortcut )?icon["']/i.test(html);

  const h1Count = countMatches(html, /<h1[^>]*>/gi);
  const ogTags = countMatches(html, /<meta[^>]+property=["']og:/gi);
  const twitterTags = countMatches(html, /<meta[^>]+name=["']twitter:/gi);

  const bodyText = stripTags(html);
  const wordCount = bodyText.length;

  // ── JSON-LD ────────────────────────────────────────────────────────
  const blocks = extractAllSchemas(html);
  const types = schemaTypes(blocks);

  const hasOrg = types.includes("Organization");
  const hasWebSite = types.includes("WebSite");
  const hasFaq = types.includes("FAQPage");
  const hasArticle = types.includes("Article") || types.includes("BlogPosting");
  const hasBreadcrumb = types.includes("BreadcrumbList");
  const hasSoftware = types.includes("SoftwareApplication") || types.includes("Product");
  const hasHowTo = types.includes("HowTo");

  // ── GEO 信号 ───────────────────────────────────────────────────────
  const hasLlmsTxt = llms.ok && llms.text.includes("#");
  const hasLlmsFull = llmsFull.ok && llmsFull.text.length > 100;
  const hasRobots = robots.ok;
  const hasSitemap = sitemap.ok || robots.text.toLowerCase().includes("sitemap:");
  const hasFaqSection =
    hasFaq ||
    /<h[2-3][^>]*>[^<]*(?:FAQ|常见问题|Q&A|问答)[^<]*<\/h[2-3]>/i.test(html) ||
    /<details[\s>]/i.test(html);
  const firstParaIsAnswer =
    /<p[^>]*>\s*([^<\s]{15,})/i.test(html) || /^[一-龥]{15,}/.test(bodyText.slice(0, 200));
  const hasToc =
    /<(?:nav|aside)[^>]*>[\s\S]{0,200}(?:目录|TOC|table of contents)/i.test(html) ||
    /<ol[^>]*class=["'][^"']*toc/i.test(html);

  const llmsFriendlyMeta =
    /ai-friendly|geo-optimized/i.test(html) ||
    /<link[^>]+rel=["']llms-txt["']/i.test(html);

  // ── 评分 ────────────────────────────────────────────────────────────
  const checks: AuditCheck[] = [
    {
      id: "https",
      label: "HTTPS 可访问",
      status: homePage.ok ? "pass" : "fail",
      detail: homePage.ok
        ? `可正常访问（${homePage.provider === "firecrawl" ? "Firecrawl 渲染" : "直连"}）`
        : "无法访问，请检查域名",
      weight: 5,
    },
    {
      id: "title",
      label: "Title 标签",
      status: !title ? "fail" : title.length < 10 ? "warn" : title.length > 70 ? "warn" : "pass",
      detail: title ? `${title.length} 字符：${title.slice(0, 60)}` : "未发现 <title>",
      weight: 5,
    },
    {
      id: "description",
      label: "Meta description",
      status: !description ? "fail" : description.length < 50 ? "warn" : "pass",
      detail: description
        ? `${description.length} 字符`
        : "缺少 meta description，AI 摘要时容易抓到不相关文本",
      weight: 5,
    },
    {
      id: "lang",
      label: "html lang 标识",
      status: lang ? "pass" : "warn",
      detail: lang ? `lang="${lang}"` : "未设置 lang，AI 难以识别语言",
      weight: 2,
    },
    {
      id: "canonical",
      label: "Canonical URL",
      status: canonical ? "pass" : "warn",
      detail: canonical ? canonical : "未设置 canonical，可能造成 AI 引用源分散",
      weight: 3,
    },
    {
      id: "h1",
      label: "H1 标签",
      status: h1Count === 1 ? "pass" : h1Count === 0 ? "fail" : "warn",
      detail:
        h1Count === 1 ? "唯一 H1，结构清晰" : h1Count === 0 ? "缺少 H1" : `检测到 ${h1Count} 个 H1，应只保留 1 个`,
      weight: 4,
    },
    {
      id: "og",
      label: "Open Graph 标签",
      status: ogTags >= 4 ? "pass" : ogTags > 0 ? "warn" : "fail",
      detail: `发现 ${ogTags} 个 og: 标签（推荐 ≥ 4）`,
      weight: 3,
    },
    {
      id: "llms-txt",
      label: "llms.txt（关键 GEO 信号）",
      status: hasLlmsTxt ? "pass" : "fail",
      detail: hasLlmsTxt
        ? "✅ 已部署，AI 智能体可直接读取站点结构"
        : "❌ 未部署 llms.txt — 这是 2026 年最重要的 GEO 基建之一",
      weight: 12,
    },
    {
      id: "llms-full",
      label: "llms-full.txt（完整产品文档）",
      status: hasLlmsFull ? "pass" : hasLlmsTxt ? "warn" : "warn",
      detail: hasLlmsFull
        ? "✅ 长上下文模型友好的完整产品说明已就位"
        : "建议补充 llms-full.txt，给长上下文 Agent 提供完整事实源",
      weight: 6,
    },
    {
      id: "robots",
      label: "robots.txt",
      status: hasRobots ? "pass" : "warn",
      detail: hasRobots ? "存在 robots.txt" : "未发现 robots.txt",
      weight: 3,
    },
    {
      id: "sitemap",
      label: "sitemap.xml",
      status: hasSitemap ? "pass" : "warn",
      detail: hasSitemap ? "已发现 sitemap" : "未发现 sitemap，AI 爬虫抓取效率低",
      weight: 4,
    },
    {
      id: "schema-org",
      label: "Organization schema",
      status: hasOrg ? "pass" : "fail",
      detail: hasOrg ? "✅ 已声明组织实体" : "缺少 Organization JSON-LD，AI 难以识别品牌",
      weight: 8,
    },
    {
      id: "schema-website",
      label: "WebSite schema",
      status: hasWebSite ? "pass" : "warn",
      detail: hasWebSite ? "✅ 已声明" : "建议补充 WebSite schema",
      weight: 3,
    },
    {
      id: "schema-faq",
      label: "FAQ schema",
      status: hasFaq ? "pass" : hasFaqSection ? "warn" : "fail",
      detail: hasFaq
        ? "✅ FAQPage 结构化已就位，AI 引用率显著提升"
        : hasFaqSection
          ? "页面有 FAQ 区块，但缺少 FAQPage schema — 强烈建议补全"
          : "未发现 FAQ 内容，AI 难以直接引用问答式回答",
      weight: 10,
    },
    {
      id: "schema-article",
      label: "Article / BlogPosting schema",
      status: hasArticle ? "pass" : "warn",
      detail: hasArticle ? "✅ 文章结构化已就位" : "如有博客/文章应补 Article schema",
      weight: 4,
    },
    {
      id: "schema-howto",
      label: "HowTo schema（步骤型内容）",
      status: hasHowTo ? "pass" : "warn",
      detail: hasHowTo ? "✅ 有 HowTo schema" : "如有教程/流程内容建议补 HowTo schema",
      weight: 3,
    },
    {
      id: "schema-breadcrumb",
      label: "Breadcrumb schema",
      status: hasBreadcrumb ? "pass" : "warn",
      detail: hasBreadcrumb ? "✅ 已声明" : "建议为所有非首页补 BreadcrumbList schema",
      weight: 3,
    },
    {
      id: "first-para-answer",
      label: "首段直答（answer-first）",
      status: firstParaIsAnswer ? "pass" : "warn",
      detail: firstParaIsAnswer
        ? "✅ 首段包含可被 AI 直接引用的内容"
        : "首段缺乏完整答案，AI 摘要时容易跳过",
      weight: 7,
    },
    {
      id: "toc",
      label: "目录 / 锚链",
      status: hasToc ? "pass" : "warn",
      detail: hasToc ? "✅ 存在目录结构" : "建议补充目录或锚链，提升 AI 段落定位",
      weight: 2,
    },
    {
      id: "ai-meta",
      label: "AI 友好 meta 标签",
      status: llmsFriendlyMeta ? "pass" : "warn",
      detail: llmsFriendlyMeta
        ? "✅ 检测到 ai-friendly / llms-txt link"
        : "建议补充 ai-friendly meta 与 llms-txt link rel",
      weight: 2,
    },
  ];

  const maxScore = checks.reduce((s, c) => s + c.weight, 0);
  const scored = checks.reduce(
    (s, c) => s + c.weight * (c.status === "pass" ? 1 : c.status === "warn" ? 0.5 : 0),
    0,
  );
  const score = Math.round((scored / maxScore) * 100);

  // ── 优先建议 ────────────────────────────────────────────────────────
  const suggestions: string[] = [];
  if (!hasLlmsTxt) suggestions.push("立即部署 /llms.txt — 这是 2026 年 AI Agent 抓取的入口文件。");
  if (!hasFaq) suggestions.push("补充 FAQPage JSON-LD，把现有问答内容结构化（GEO 引用率 +40%）。");
  if (!hasOrg) suggestions.push("注入 Organization JSON-LD，明确品牌实体身份。");
  if (!firstParaIsAnswer) suggestions.push("把每页首段改写为「直接答案」结构，让 AI 摘要时优先抓取。");
  if (h1Count !== 1) suggestions.push("保证每页只有唯一一个 <h1>，与页面主题严格对应。");
  if (!hasLlmsFull) suggestions.push("部署 /llms-full.txt，为长上下文 Agent 提供完整产品事实源。");
  if (!hasSitemap) suggestions.push("补全 sitemap.xml 并在 robots.txt 中声明位置。");
  if (!description) suggestions.push("为每页补充 meta description（80–160 字符）。");
  if (!hasArticle) suggestions.push("博客/文章页补 Article 或 BlogPosting schema。");
  if (!hasBreadcrumb) suggestions.push("非首页页面补 BreadcrumbList，让 AI 理解站点层级。");

  let verdict: string;
  let summary: string;
  if (score >= 85) {
    verdict = "GEO 准备充分 🚀";
    summary = "你的站点在 AI 引用层已有显著优势，重点是持续做内容矩阵扩张。";
  } else if (score >= 65) {
    verdict = "基础不错，但有可观提升空间";
    summary = "已具备 GEO 基础，但缺关键结构化数据。按下面建议补齐可让 AI 引用率快速提升。";
  } else if (score >= 40) {
    verdict = "亟需 GEO 改造";
    summary = "你的站点 AI 友好度仅勉强及格，目前的内容很难被 AI 优先引用。";
  } else {
    verdict = "AI 几乎看不见你 ⚠️";
    summary = "缺失大量关键的 AI 抓取信号和结构化数据。GEO 改造将立即带来明显效果。";
  }

  return {
    domain,
    url,
    score,
    verdict,
    summary: hasContent ? summary : `无法获取 ${domain} 的内容，请检查域名或稍后重试。`,
    checks,
    suggestions,
    scannedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
    elapsedMs: Date.now() - t0,
    meta: {
      title,
      description,
      titleLength: title?.length,
      descLength: description?.length,
      hasH1: h1Count > 0,
      h1Count,
      wordCount,
      lang,
      favicon,
      canonical,
      ogTags,
      twitterTags,
    },
    schemas: {
      found: types,
      missing: [
        ...(!hasOrg ? ["Organization"] : []),
        ...(!hasWebSite ? ["WebSite"] : []),
        ...(!hasFaq ? ["FAQPage"] : []),
        ...(!hasArticle ? ["Article"] : []),
        ...(!hasBreadcrumb ? ["BreadcrumbList"] : []),
        ...(!hasSoftware ? ["SoftwareApplication"] : []),
      ],
    },
    geoSignals: {
      llmsTxt: hasLlmsTxt,
      llmsFullTxt: hasLlmsFull,
      robotsTxt: hasRobots,
      sitemap: hasSitemap,
      faqSchema: hasFaq,
      articleSchema: hasArticle,
      organizationSchema: hasOrg,
      firstParaIsAnswer,
      hasFaqSection,
      hasTableOfContents: hasToc,
    },
  };
}
