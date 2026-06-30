import "server-only";
import type { Scraper } from "./types";

/**
 * 网页抓取 provider。
 *   - firecrawl：自托管 Firecrawl（github.com/firecrawl/firecrawl），JS 渲染 + 干净 markdown + 截图
 *   - builtin：原生 fetch + 极简正文提取（兜底，无截图）
 *
 * 用于：域名诊断 (/tools/audit)、网站画像 (/insight website-debug)、竞品页抓取。
 */

const FC_URL = process.env.FIRECRAWL_API_URL?.trim().replace(/\/+$/, "");
const FC_KEY = process.env.FIRECRAWL_API_KEY?.trim();

// ── Firecrawl provider ──────────────────────────────────────────
const firecrawlScraper: Scraper = {
  id: "firecrawl",
  async scrape(url, opts) {
    const formats: string[] = ["markdown", "html"];
    if (opts?.screenshot) formats.push("screenshot");
    try {
      const res = await fetch(`${FC_URL}/v1/scrape`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(FC_KEY ? { authorization: `Bearer ${FC_KEY}` } : {}),
        },
        body: JSON.stringify({ url, formats, timeout: opts?.timeoutMs ?? 30000 }),
        signal: AbortSignal.timeout((opts?.timeoutMs ?? 30000) + 5000),
      });
      if (!res.ok) throw new Error(`firecrawl HTTP ${res.status}`);
      const json = (await res.json()) as {
        data?: {
          markdown?: string;
          html?: string;
          screenshot?: string;
          metadata?: { title?: string; description?: string };
        };
      };
      const d = json.data ?? {};
      return {
        url,
        markdown: d.markdown ?? "",
        html: d.html,
        title: d.metadata?.title,
        description: d.metadata?.description,
        screenshot: d.screenshot,
        provider: "firecrawl",
        ok: true,
      };
    } catch (e) {
      // Firecrawl 失败 → 降级 builtin
      console.warn("[scraper] firecrawl failed, fallback to builtin:", e);
      return builtinScraper.scrape(url, opts);
    }
  },
};

// ── builtin provider（原生 fetch） ──────────────────────────────
function stripHtml(html: string): { text: string; title?: string; description?: string } {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim();
  const description = html
    .match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1]
    ?.trim();
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return { text, title, description };
}

const builtinScraper: Scraper = {
  id: "builtin",
  async scrape(url, opts) {
    const target = url.startsWith("http") ? url : `https://${url}`;
    try {
      const res = await fetch(target, {
        headers: { "user-agent": "Mozilla/5.0 (compatible; BrandGEO-bot/1.0)" },
        signal: AbortSignal.timeout(opts?.timeoutMs ?? 20000),
        redirect: "follow",
      });
      const html = await res.text();
      const { text, title, description } = stripHtml(html);
      return {
        url: target,
        markdown: text.slice(0, 20000),
        html,
        title,
        description,
        provider: "builtin",
        ok: res.ok,
      };
    } catch (e) {
      return {
        url: target,
        markdown: "",
        provider: "builtin",
        ok: false,
        error: e instanceof Error ? e.message : "fetch failed",
      };
    }
  },
};

export function getScraper(): Scraper {
  return FC_URL ? firecrawlScraper : builtinScraper;
}

export function scraperStatus() {
  return {
    provider: FC_URL ? "firecrawl" : "builtin",
    firecrawlEnabled: !!FC_URL,
    screenshotCapable: !!FC_URL,
  };
}
