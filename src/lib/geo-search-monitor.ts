import "server-only";
import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { siteConfig } from "@/lib/site";

export type SearchMonitorProvider = "duckduckgo-html";

export interface SearchMonitorResult {
  title: string;
  url: string;
  snippet: string;
  rank: number;
  mentionsBrand: boolean;
}

export interface SearchMonitorArtifact {
  id: string;
  query: string;
  provider: SearchMonitorProvider;
  status: "captured" | "failed";
  statusCode?: number;
  byteLength: number;
  artifactUrl?: string;
  error?: string;
}

export interface SearchMonitorRun {
  id: string;
  createdAt: string;
  brandName: string;
  brandId: string;
  provider: SearchMonitorProvider;
  cadence: "manual" | "daily" | "weekly";
  nextRunAt?: string;
  queries: string[];
  status: "done" | "partial" | "failed";
  results: SearchMonitorResult[];
  artifacts: SearchMonitorArtifact[];
  metrics: {
    queryCount: number;
    resultCount: number;
    brandResultCount: number;
    artifactCount: number;
    averageRank: number | null;
  };
  limitations: string[];
}

export interface SearchMonitorSummary {
  total: number;
  done: number;
  providerCount: number;
  artifactCount: number;
  resultCount: number;
  brandResultCount: number;
  latestRunId?: string;
  latestProvider?: SearchMonitorProvider;
  latestCadence?: SearchMonitorRun["cadence"];
  latestNextRunAt?: string;
}

const DATA_DIR = join(process.cwd(), "data");
const SEARCH_ROOT = join(DATA_DIR, "geo-search-monitor");
const SEARCH_INDEX = join(DATA_DIR, "geo-search-monitor-runs.json");

const inputSchema = z.object({
  brandId: z.string().optional(),
  brandName: z.string().optional(),
  provider: z.literal("duckduckgo-html").optional(),
  cadence: z.enum(["manual", "daily", "weekly"]).optional(),
  queries: z.union([z.string(), z.array(z.string())]).optional(),
});

function readStoredRuns(): SearchMonitorRun[] {
  try {
    const raw = readFileSync(SEARCH_INDEX, "utf8");
    const parsed = JSON.parse(raw) as SearchMonitorRun[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredRuns(runs: SearchMonitorRun[]) {
  mkdirSync(SEARCH_ROOT, { recursive: true });
  writeFileSync(SEARCH_INDEX, JSON.stringify(runs.slice(0, 100), null, 2));
}

function splitQueries(value: unknown, brandName: string) {
  const defaults = [`${brandName} 全行业 GEO`, `${brandName} AI 搜索优化`, `美妆品牌 GEO 优化 ${brandName}`];
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean).slice(0, 8);
  if (typeof value === "string") {
    const rows = value.split(/[\n,，;；]/).map((item) => item.trim()).filter(Boolean).slice(0, 8);
    return rows.length ? rows : defaults;
  }
  return defaults;
}

function nextRunAt(cadence: SearchMonitorRun["cadence"], from = new Date()) {
  if (cadence === "manual") return undefined;
  const next = new Date(from);
  next.setDate(next.getDate() + (cadence === "weekly" ? 7 : 1));
  return next.toISOString();
}

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeDuckUrl(value: string) {
  const decoded = decodeHtml(value);
  try {
    const url = new URL(decoded, "https://duckduckgo.com");
    const uddg = url.searchParams.get("uddg");
    return uddg ? decodeURIComponent(uddg) : url.toString();
  } catch {
    return decoded;
  }
}

function normalizeForMatch(value: string) {
  return value.toLowerCase().replace(/\s+/g, "");
}

function parseDuckDuckGoResults(html: string, brandName: string): SearchMonitorResult[] {
  const brand = normalizeForMatch(brandName);
  const results: SearchMonitorResult[] = [];
  const blockRegex = /<div[^>]+class="[^"]*result[^"]*"[\s\S]*?(?=<div[^>]+class="[^"]*result[^"]*"|<\/body>)/gi;
  const blocks = html.match(blockRegex) ?? [];
  for (const block of blocks) {
    const titleMatch = block.match(/<a[^>]+class="[^"]*result__a[^"]*"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
    if (!titleMatch) continue;
    const snippetMatch = block.match(/<a[^>]+class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\/a>/i)
      || block.match(/<div[^>]+class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    const title = decodeHtml(titleMatch[2] ?? "");
    const url = decodeDuckUrl(titleMatch[1] ?? "");
    const snippet = decodeHtml(snippetMatch?.[1] ?? "");
    const haystack = normalizeForMatch(`${title} ${url} ${snippet}`);
    results.push({
      title,
      url,
      snippet,
      rank: results.length + 1,
      mentionsBrand: Boolean(brand && haystack.includes(brand)),
    });
    if (results.length >= 10) break;
  }
  return results;
}

async function fetchDuckDuckGo(query: string) {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const response = await fetch(url, {
    headers: {
      accept: "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.8",
      "user-agent": "Mozilla/5.0 BrandGEO Search Monitor",
    },
  });
  return {
    statusCode: response.status,
    html: await response.text(),
  };
}

function saveArtifact(runId: string, queryIndex: number, html: string) {
  mkdirSync(SEARCH_ROOT, { recursive: true });
  const artifactId = `serp-${queryIndex + 1}`;
  const path = join(SEARCH_ROOT, `${runId}-${artifactId}.html`);
  writeFileSync(path, html);
  return {
    artifactId,
    byteLength: Buffer.byteLength(html),
    artifactUrl: `/api/geo/search-monitor/${runId}/artifacts/${artifactId}`,
  };
}

export async function createSearchMonitorRun(input: unknown = {}) {
  const normalized = inputSchema.parse(input);
  const brandName = normalized.brandName?.trim() || siteConfig.name;
  const brandId = normalized.brandId?.trim() || "lawgeo";
  const provider: SearchMonitorProvider = normalized.provider ?? "duckduckgo-html";
  const cadence = normalized.cadence ?? "daily";
  const queries = splitQueries(normalized.queries, brandName);
  const id = `smr-${randomUUID().slice(0, 8)}`;
  const results: SearchMonitorResult[] = [];
  const artifacts: SearchMonitorArtifact[] = [];

  for (const [index, query] of queries.entries()) {
    try {
      const response = await fetchDuckDuckGo(query);
      const saved = saveArtifact(id, index, response.html);
      const parsed = parseDuckDuckGoResults(response.html, brandName);
      results.push(...parsed);
      artifacts.push({
        id: saved.artifactId,
        query,
        provider,
        status: parsed.length ? "captured" : "failed",
        statusCode: response.statusCode,
        byteLength: saved.byteLength,
        artifactUrl: saved.artifactUrl,
        error: parsed.length ? undefined : "SERP returned no parseable organic results",
      });
    } catch (error) {
      artifacts.push({
        id: `serp-${index + 1}`,
        query,
        provider,
        status: "failed",
        byteLength: 0,
        error: error instanceof Error ? error.message : "search fetch failed",
      });
    }
  }

  const brandRanks = results.filter((result) => result.mentionsBrand).map((result) => result.rank);
  const status = artifacts.every((artifact) => artifact.status === "captured")
    ? "done"
    : artifacts.some((artifact) => artifact.status === "captured")
      ? "partial"
      : "failed";
  const run: SearchMonitorRun = {
    id,
    createdAt: new Date().toISOString(),
    brandName,
    brandId,
    provider,
    cadence,
    nextRunAt: nextRunAt(cadence),
    queries,
    status,
    results,
    artifacts,
    metrics: {
      queryCount: queries.length,
      resultCount: results.length,
      brandResultCount: brandRanks.length,
      artifactCount: artifacts.filter((artifact) => artifact.status === "captured").length,
      averageRank: brandRanks.length ? Math.round(brandRanks.reduce((sum, rank) => sum + rank, 0) / brandRanks.length) : null,
    },
    limitations: [
      "DuckDuckGo HTML SERP 是无 key 真实第三方搜索结果页，结构可能随搜索引擎更新而变化。",
      "本地 API 已记录 cadence / nextRunAt；真正后台定时触发需要后续接入生产调度器。",
      "如果客户需要商业 SLA，应接 SerpAPI / Bing Web Search / Brave Search 等正式搜索 API。",
    ],
  };
  writeStoredRuns([run, ...readStoredRuns()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  return run;
}

export function getSearchMonitorRuns(limit = 20) {
  return readStoredRuns().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
}

export function getSearchMonitorRun(id: string) {
  return getSearchMonitorRuns(100).find((run) => run.id === id);
}

export function getSearchMonitorArtifact(runId: string, artifactId: string) {
  const run = getSearchMonitorRun(runId);
  if (!run?.artifacts.some((artifact) => artifact.id === artifactId && artifact.status === "captured")) return undefined;
  const path = join(SEARCH_ROOT, `${runId}-${artifactId}.html`);
  try {
    return {
      run,
      artifact: run.artifacts.find((item) => item.id === artifactId),
      html: readFileSync(path, "utf8"),
    };
  } catch {
    return undefined;
  }
}

export function summarizeSearchMonitorRuns(runs = getSearchMonitorRuns()): SearchMonitorSummary {
  const latest = runs[0];
  return {
    total: runs.length,
    done: runs.filter((run) => run.status === "done").length,
    providerCount: new Set(runs.map((run) => run.provider)).size,
    artifactCount: runs.reduce((sum, run) => sum + run.metrics.artifactCount, 0),
    resultCount: runs.reduce((sum, run) => sum + run.metrics.resultCount, 0),
    brandResultCount: runs.reduce((sum, run) => sum + run.metrics.brandResultCount, 0),
    latestRunId: latest?.id,
    latestProvider: latest?.provider,
    latestCadence: latest?.cadence,
    latestNextRunAt: latest?.nextRunAt,
  };
}
