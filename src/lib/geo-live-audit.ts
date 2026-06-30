import "server-only";
import { markdownPathForRoute, normalizeRoutePath } from "@/lib/geo-paths";
import { buildAiIndex } from "@/lib/geo-assets";

export type LiveAuditSeverity = "info" | "warning" | "critical";
export type LiveAuditStatus = "pass" | "warning" | "fail";

export interface GeoLiveAuditFinding {
  id: string;
  layer: "crawled" | "understood" | "cited" | "absorbed";
  severity: LiveAuditSeverity;
  reason: string;
  sourceIds: string[];
  fixPlan: string;
}

export interface GeoLiveAuditCheck {
  id: string;
  label: string;
  status: LiveAuditStatus;
  evidence: string;
  sourceIds: string[];
  fixPlan: string;
  score: number;
  maxScore: number;
}

export interface GeoLiveAuditLayer {
  id: "crawled" | "understood" | "cited" | "absorbed";
  label: string;
  score: number;
  checks: string[];
  status: "healthy" | "partial" | "critical";
}

export interface GeoLiveAuditResponse {
  status: "ok";
  mode: "live";
  siteUrl: string;
  canonicalUrl: string;
  score: number;
  layers: GeoLiveAuditLayer[];
  findings: GeoLiveAuditFinding[];
  liveChecks: GeoLiveAuditCheck[];
  crawled: {
    homepageStatus?: number;
    robotsStatus?: number;
    sitemapStatus?: number;
    sitemapUrlCount: number;
    markdownStatus?: number;
    llmsStatus?: number;
    aiIndexStatus?: number;
    latencyMs: number;
  };
  understood: {
    title?: string;
    description?: string;
    canonical?: string;
    alternateMarkdown?: string;
    schemaTypes: string[];
    h1Count: number;
    h2Count: number;
    bodyTextLength: number;
    scriptCount: number;
  };
  coverage: ReturnType<typeof buildAiIndex>["counts"];
  headers: Record<string, string>;
  limitations: string[];
  updatedAt: string;
}

interface FetchResult {
  url: string;
  finalUrl: string;
  ok: boolean;
  status?: number;
  text: string;
  headers: Record<string, string>;
  latencyMs: number;
  error?: string;
}

const MAX_TEXT_BYTES = 900_000;
const FETCH_TIMEOUT_MS = 7000;

const implementedChecks = [
  "robots-fetch",
  "robots-ai-bot-policy",
  "sitemap-fetch",
  "homepage-fetch",
  "headers-cdn-cache",
  "markdown-twin",
  "llms-directory",
  "ai-index",
  "structured-data",
  "content-structure",
  "evidence-density",
  "entity-consistency",
  "freshness",
  "negative-signals",
];

export function getGeoLiveAuditImplementationSummary() {
  return {
    liveFetchChecks: implementedChecks.length,
    checks: implementedChecks,
    sourceRefs: ["GOOG-1", "GH-2", "GH-3", "GH-4", "RES-3", "RES-4", "RD-2"],
  };
}

function normalizeSiteUrl(input: string) {
  const url = new URL(input);
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("siteUrl must use http or https");
  url.hash = "";
  return url;
}

function sameOriginUrl(base: URL, path: string) {
  return new URL(path, base).toString();
}

async function fetchText(url: string, accept = "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.8"): Promise<FetchResult> {
  const controller = new AbortController();
  const started = Date.now();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        accept,
        "user-agent": "BrandGEO-GEO-Audit/2.0 (+https://brandgeo.cn/llms.txt)",
      },
      redirect: "follow",
      signal: controller.signal,
    });
    const headers = Object.fromEntries(response.headers.entries());
    const raw = await response.text();
    return {
      url,
      finalUrl: response.url,
      ok: response.ok,
      status: response.status,
      text: raw.slice(0, MAX_TEXT_BYTES),
      headers,
      latencyMs: Date.now() - started,
    };
  } catch (error) {
    return {
      url,
      finalUrl: url,
      ok: false,
      text: "",
      headers: {},
      latencyMs: Date.now() - started,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    clearTimeout(timeout);
  }
}

function headerSubset(headers: Record<string, string>) {
  const keys = [
    "content-type",
    "cache-control",
    "server",
    "x-vercel-cache",
    "x-nextjs-cache",
    "cf-cache-status",
    "cf-ray",
    "age",
    "vary",
    "x-robots-tag",
    "link",
  ];
  return Object.fromEntries(keys.flatMap((key) => (headers[key] ? [[key, headers[key]]] : [])));
}

function robotsBlocksAll(robotsText: string) {
  const normalized = robotsText.toLowerCase();
  return /user-agent:\s*\*\s*(?:\n|\r\n?)(?:.*\n)*?disallow:\s*\/(?:\s|$)/i.test(normalized);
}

function robotsMentionsAiBot(robotsText: string) {
  return /gptbot|chatgpt-user|claudebot|perplexitybot|google-extended|bytespider|applebot|ccbot/i.test(robotsText);
}

function sitemapUrlsFromRobots(robotsText: string) {
  return Array.from(robotsText.matchAll(/^sitemap:\s*(.+)$/gim)).map((match) => match[1]?.trim()).filter(Boolean) as string[];
}

function sitemapLocs(xml: string) {
  return Array.from(xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gim)).map((match) => match[1]?.trim()).filter(Boolean) as string[];
}

function firstMatch(text: string, regex: RegExp) {
  return text.match(regex)?.[1]?.trim();
}

function metaContent(html: string, name: string) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return firstMatch(html, new RegExp(`<meta[^>]+(?:name|property)=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i"));
}

function linkHref(html: string, rel: string, type?: string) {
  const links = html.match(/<link\b[^>]*>/gi) ?? [];
  return links
    .map((tag) => ({
      tag,
      rel: firstMatch(tag, /\brel=["']([^"']+)["']/i) ?? "",
      type: firstMatch(tag, /\btype=["']([^"']+)["']/i) ?? "",
      href: firstMatch(tag, /\bhref=["']([^"']+)["']/i),
    }))
    .find((item) => item.rel.toLowerCase().split(/\s+/).includes(rel.toLowerCase()) && (!type || item.type.toLowerCase() === type.toLowerCase()))
    ?.href;
}

function visibleTextLength(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim().length;
}

function schemaTypes(html: string) {
  const jsonLdTypes = Array.from(html.matchAll(/"@type"\s*:\s*"?([A-Za-z]+)"?/g)).map((match) => match[1]).filter(Boolean) as string[];
  const microdataTypes = Array.from(html.matchAll(/itemtype=["'][^"']*schema\.org\/([^"']+)["']/g)).map((match) => match[1]).filter(Boolean) as string[];
  return Array.from(new Set([...jsonLdTypes, ...microdataTypes]));
}

function statusFromScore(score: number, maxScore: number): LiveAuditStatus {
  const ratio = maxScore ? score / maxScore : 0;
  if (ratio >= 0.8) return "pass";
  if (ratio >= 0.45) return "warning";
  return "fail";
}

function severityFromStatus(status: LiveAuditStatus): LiveAuditSeverity {
  return status === "fail" ? "critical" : status === "warning" ? "warning" : "info";
}

function check(input: Omit<GeoLiveAuditCheck, "status">): GeoLiveAuditCheck {
  return { ...input, status: statusFromScore(input.score, input.maxScore) };
}

function layerFromChecks(id: GeoLiveAuditLayer["id"], label: string, checks: GeoLiveAuditCheck[]): GeoLiveAuditLayer {
  const score = Math.round((checks.reduce((sum, item) => sum + item.score, 0) / checks.reduce((sum, item) => sum + item.maxScore, 0)) * 100);
  return {
    id,
    label,
    score,
    checks: checks.map((item) => item.label),
    status: score >= 80 ? "healthy" : score >= 45 ? "partial" : "critical",
  };
}

function findingsFromChecks(checks: GeoLiveAuditCheck[]): GeoLiveAuditFinding[] {
  return checks.map((item) => ({
    id: item.id,
    layer: item.id.startsWith("structured") || item.id.startsWith("content") || item.id.startsWith("markdown") || item.id.startsWith("llms") || item.id.startsWith("ai-index")
      ? "understood"
      : item.id.startsWith("evidence") || item.id.startsWith("negative")
        ? "absorbed"
        : item.id.startsWith("freshness") || item.id.startsWith("entity")
          ? "cited"
          : "crawled",
    severity: severityFromStatus(item.status),
    reason: item.evidence,
    sourceIds: item.sourceIds,
    fixPlan: item.fixPlan,
  }));
}

export async function buildGeoLiveAudit(siteUrl: string): Promise<GeoLiveAuditResponse> {
  const base = normalizeSiteUrl(siteUrl);
  const canonicalPath = normalizeRoutePath(base.pathname || "/");
  const canonicalUrl = new URL(canonicalPath, base).toString();
  const robotsUrl = sameOriginUrl(base, "/robots.txt");
  const defaultSitemapUrl = sameOriginUrl(base, "/sitemap.xml");
  const markdownUrl = sameOriginUrl(base, markdownPathForRoute(canonicalPath));
  const llmsUrl = sameOriginUrl(base, "/llms.txt");
  const llmsFullUrl = sameOriginUrl(base, "/llms-full.txt");
  const aiIndexUrl = sameOriginUrl(base, "/ai-index.json");

  const [home, robots, markdown, llms, llmsFull, aiIndex] = await Promise.all([
    fetchText(canonicalUrl),
    fetchText(robotsUrl, "text/plain,*/*;q=0.8"),
    fetchText(markdownUrl, "text/markdown,text/plain,*/*;q=0.8"),
    fetchText(llmsUrl, "text/plain,*/*;q=0.8"),
    fetchText(llmsFullUrl, "text/plain,*/*;q=0.8"),
    fetchText(aiIndexUrl, "application/json,text/plain,*/*;q=0.8"),
  ]);

  const sitemapCandidates = Array.from(new Set([defaultSitemapUrl, ...sitemapUrlsFromRobots(robots.text)]));
  const sitemap = await fetchText(sitemapCandidates[0] ?? defaultSitemapUrl, "application/xml,text/xml,text/plain,*/*;q=0.8");
  const sitemapLocCount = sitemapLocs(sitemap.text).length;
  const schema = schemaTypes(home.text);
  const title = firstMatch(home.text, /<title[^>]*>([^<]+)<\/title>/i);
  const description = metaContent(home.text, "description");
  const canonical = linkHref(home.text, "canonical");
  const alternateMarkdown = linkHref(home.text, "alternate", "text/markdown") || home.headers.link?.match(/<([^>]+)>;\s*rel="alternate";\s*type="text\/markdown"/i)?.[1];
  const h1Count = (home.text.match(/<h1\b/gi) ?? []).length;
  const h2Count = (home.text.match(/<h2\b/gi) ?? []).length;
  const bodyTextLength = visibleTextLength(home.text);
  const scriptCount = (home.text.match(/<script\b/gi) ?? []).length;
  const jsonLdCount = (home.text.match(/application\/ld\+json/gi) ?? []).length;
  const hasFreshness = /20\d{2}|updated|更新时间|更新日期|lastModified|dateModified/i.test(home.text);
  const hasPromptInjection = /ignore previous instructions|忽略以上|system prompt|developer message|越狱|jailbreak/i.test(home.text);
  const serverHeader = home.headers.server || home.headers["x-vercel-cache"] || home.headers["cf-cache-status"] || home.headers["x-nextjs-cache"];

  const crawledChecks = [
    check({
      id: "homepage-fetch",
      label: "首页 / 目标 URL 可抓取",
      score: home.ok ? 10 : home.status ? 4 : 0,
      maxScore: 10,
      evidence: home.ok ? `目标 URL 返回 ${home.status}，${bodyTextLength} 字符可见文本。` : `目标 URL 抓取失败：${home.status ?? home.error ?? "unknown"}`,
      sourceIds: ["GOOG-1", "GH-4"],
      fixPlan: "修复状态码、重定向、CDN 防护或 SSR 文本 fallback。",
    }),
    check({
      id: "robots-fetch",
      label: "robots.txt 可读且未全站禁止",
      score: robots.ok && !robotsBlocksAll(robots.text) ? 10 : robots.ok ? 4 : 0,
      maxScore: 10,
      evidence: robots.ok ? `robots.txt 返回 ${robots.status}，${robotsMentionsAiBot(robots.text) ? "包含 AI bot 规则" : "未显式列出 AI bot 规则"}。` : `robots.txt 不可读：${robots.status ?? robots.error ?? "unknown"}`,
      sourceIds: ["GOOG-1", "GH-4"],
      fixPlan: "确认 robots 未阻断搜索和 AI 抓取；若有 AI bot 策略，写清 allow/disallow 与 sitemap。",
    }),
    check({
      id: "robots-ai-bot-policy",
      label: "AI bot 策略可解释",
      score: robots.ok && robotsMentionsAiBot(robots.text) ? 6 : robots.ok ? 3 : 0,
      maxScore: 6,
      evidence: robots.ok
        ? robotsMentionsAiBot(robots.text)
          ? "robots.txt 已显式提及 GPTBot / ClaudeBot / PerplexityBot / Google-Extended 等 AI bot。"
          : "robots.txt 可读，但未显式提及主流 AI bot；这不是错误，但客户策略不可解释。"
        : "robots.txt 不可读，无法判断 AI bot 策略。",
      sourceIds: ["GOOG-1", "GH-4"],
      fixPlan: "根据客户策略显式声明 AI bot allow/disallow，并避免误伤常规搜索抓取。",
    }),
    check({
      id: "sitemap-fetch",
      label: "sitemap.xml 可读",
      score: sitemap.ok && sitemapLocCount > 0 ? 10 : sitemap.ok ? 5 : 0,
      maxScore: 10,
      evidence: sitemap.ok ? `sitemap 返回 ${sitemap.status}，发现 ${sitemapLocCount} 个 URL。` : `sitemap 抓取失败：${sitemap.status ?? sitemap.error ?? "unknown"}`,
      sourceIds: ["GOOG-1", "GH-4"],
      fixPlan: "生成 sitemap.xml，并在 robots.txt 中声明 Sitemap。",
    }),
    check({
      id: "headers-cdn-cache",
      label: "Headers / CDN 信号",
      score: home.ok && serverHeader ? 7 : home.ok ? 4 : 0,
      maxScore: 7,
      evidence: serverHeader ? `检测到 server/cache header：${serverHeader}。` : "缺少明显 server/cache/CDN header，无法判断边缘缓存和防护策略。",
      sourceIds: ["GOOG-1", "GH-4"],
      fixPlan: "公开页保持稳定 200、合理 cache-control，并避免 bot-only 403/JS challenge。",
    }),
  ];

  const understoodChecks = [
    check({
      id: "markdown-twin",
      label: "Markdown Twin / alternate",
      score: markdown.ok && (alternateMarkdown || markdown.headers["x-robots-tag"]?.includes("noindex")) ? 10 : markdown.ok ? 7 : 0,
      maxScore: 10,
      evidence: markdown.ok ? `Markdown URL ${markdownUrl} 返回 ${markdown.status}，alternate=${alternateMarkdown ? "yes" : "no"}，x-robots-tag=${markdown.headers["x-robots-tag"] ?? "none"}。` : `Markdown URL 不可读：${markdown.status ?? markdown.error ?? "unknown"}`,
      sourceIds: ["GH-2", "GH-3"],
      fixPlan: "为核心页面输出 .md，并在 HTML header 或 Link header 暴露 text/markdown alternate。",
    }),
    check({
      id: "llms-directory",
      label: "llms / llms-full 目录",
      score: llms.ok && llmsFull.ok ? 8 : llms.ok ? 5 : 0,
      maxScore: 8,
      evidence: `llms.txt=${llms.status ?? "fail"}，llms-full.txt=${llmsFull.status ?? "fail"}，llms 链接数 ${(llms.text.match(/https?:\/\//g) ?? []).length}。`,
      sourceIds: ["GH-1", "GH-3", "SPEC-1"],
      fixPlan: "保证 llms.txt 指向有效 Markdown URL，llms-full 汇总长上下文。",
    }),
    check({
      id: "ai-index",
      label: "ai-index.json",
      score: aiIndex.ok && aiIndex.text.includes("schemaVersion") ? 6 : aiIndex.ok ? 3 : 0,
      maxScore: 6,
      evidence: aiIndex.ok ? `ai-index.json 返回 ${aiIndex.status}，大小 ${aiIndex.text.length} 字符。` : `ai-index.json 不可读：${aiIndex.status ?? aiIndex.error ?? "unknown"}`,
      sourceIds: ["GH-3"],
      fixPlan: "输出机器可读 URL、Markdown URL、实体、主题和 evidence block 数量。",
    }),
    check({
      id: "structured-data",
      label: "结构化数据",
      score: schema.length >= 3 ? 10 : schema.length ? 6 : 0,
      maxScore: 10,
      evidence: `检测到 ${schema.length} 类 schema：${schema.slice(0, 8).join(", ") || "none"}；JSON-LD script ${jsonLdCount} 个。`,
      sourceIds: ["GOOG-1", "GH-4"],
      fixPlan: "补 Organization / Product / Brand / Person / FAQPage / Article / Breadcrumb（美妆个护可用 Product + Brand 标注成分与适用肤质，法律等附属行业可用 LegalService），并保持与可见文本一致。",
    }),
    check({
      id: "content-structure",
      label: "可解析内容结构",
      score: h1Count >= 1 && h2Count >= 2 && bodyTextLength > 1200 ? 12 : bodyTextLength > 600 ? 7 : 3,
      maxScore: 12,
      evidence: `H1=${h1Count}，H2=${h2Count}，可见文本 ${bodyTextLength} 字符，script ${scriptCount} 个。`,
      sourceIds: ["RES-3", "RES-4", "GOOG-1"],
      fixPlan: "补首段直答、标题层级、列表/表格/流程，并避免核心内容只靠客户端渲染。",
    }),
  ];

  const citedChecks = [
    check({
      id: "entity-consistency",
      label: "实体一致性",
      score: schema.includes("Organization") || schema.includes("Brand") || schema.includes("Product") || schema.includes("LegalService") || home.text.includes("BrandGEO") ? 9 : 3,
      maxScore: 10,
      evidence: `title=${title ?? "none"}；description=${description ? "present" : "missing"}；canonical=${canonical ?? "none"}。`,
      sourceIds: ["GH-4", "RD-2"],
      fixPlan: "统一品牌、产品 / 主理人、城市、品类领域、sameAs 与 canonical。",
    }),
    check({
      id: "freshness",
      label: "Freshness / 更新时间",
      score: hasFreshness ? 6 : 2,
      maxScore: 6,
      evidence: hasFreshness ? "页面包含年份或更新时间信号。" : "页面没有明显更新时间、lastModified 或日期信号。",
      sourceIds: ["DATA-2", "GH-4"],
      fixPlan: "给产品 / 成分、价格因素、测评和 FAQ 增加更新时间与失效边界。",
    }),
  ];

  const absorbedChecks = [
    check({
      id: "evidence-density",
      label: "Evidence Density",
      score: /案例|流程|费用|材料|风险|边界|证据|FAQ|常见问题/i.test(home.text) ? 12 : 5,
      maxScore: 12,
      evidence: "检查定义、流程、费用因素、材料、风险边界、案例和 FAQ 等可抽取事实。",
      sourceIds: ["RES-4", "GH-7"],
      fixPlan: "用 Citation Pack 补定义、事实表、流程、对比、案例类型和 CTA。",
    }),
    check({
      id: "negative-signals",
      label: "Negative Signals",
      score: hasPromptInjection ? 0 : 7,
      maxScore: 7,
      evidence: hasPromptInjection ? "检测到疑似 prompt injection / 隐藏指令文本。" : "未检测到明显 prompt injection 或隐藏指令关键词。",
      sourceIds: ["GH-4", "GOOG-1"],
      fixPlan: "移除隐藏指令、夸大承诺、关键词堆砌和过载弹窗。",
    }),
  ];

  const liveChecks = [...crawledChecks, ...understoodChecks, ...citedChecks, ...absorbedChecks];
  const layers = [
    layerFromChecks("crawled", "Crawled", crawledChecks),
    layerFromChecks("understood", "Understood", understoodChecks),
    layerFromChecks("cited", "Cited", citedChecks),
    layerFromChecks("absorbed", "Absorbed", absorbedChecks),
  ];

  return {
    status: "ok",
    mode: "live",
    siteUrl: base.origin,
    canonicalUrl,
    score: Math.round(layers.reduce((sum, layer) => sum + layer.score, 0) / layers.length),
    layers,
    findings: findingsFromChecks(liveChecks),
    liveChecks,
    crawled: {
      homepageStatus: home.status,
      robotsStatus: robots.status,
      sitemapStatus: sitemap.status,
      sitemapUrlCount: sitemapLocCount,
      markdownStatus: markdown.status,
      llmsStatus: llms.status,
      aiIndexStatus: aiIndex.status,
      latencyMs: home.latencyMs + robots.latencyMs + sitemap.latencyMs + markdown.latencyMs + llms.latencyMs + llmsFull.latencyMs + aiIndex.latencyMs,
    },
    understood: {
      title,
      description,
      canonical,
      alternateMarkdown,
      schemaTypes: schema,
      h1Count,
      h2Count,
      bodyTextLength,
      scriptCount,
    },
    coverage: buildAiIndex(base.origin).counts,
    headers: headerSubset(home.headers),
    limitations: [
      "该审计使用服务端 fetch，不执行完整浏览器渲染；JS-only 内容仍需要浏览器截图 adapter 复核。",
      "外部站点可能因 CORS、CDN、WAF 或地区策略对服务器请求返回不同内容。",
      "AuditFinding 当前随 API 返回；正式 Drizzle 落库仍归入 schema-persistence blocked 项。",
    ],
    updatedAt: new Date().toISOString(),
  };
}
