import "server-only";
import { eq } from "drizzle-orm";
import { db, schema } from "./db";
import { ask } from "./ai";
import { getScraper } from "./providers";
import { consumeTokens } from "./tokens";

/** aiSearchHeat 阈值 */
function heatLevel(vol: number): string {
  if (vol >= 35000) return "高热度";
  if (vol >= 18000) return "中高热度";
  if (vol >= 8000) return "中等热度";
  return "长尾热度";
}

interface InsightReport {
  websiteProfile: string;
  competitors: Array<{ name: string; reason: string }>;
  sources: Array<{ type: string; note: string }>;
  heatKeywords: Array<{ keyword: string; volume: number; heatLevel: string; intent: string }>;
  brandIssues: Array<{ issue: string; suggestion: string }>;
}

/** 异步跑洞察任务：抓官网 → MIMO 分析 → 落报告 */
export async function runInsight(insightId: string) {
  const rows = await db.select().from(schema.insights).where(eq(schema.insights.id, insightId)).limit(1);
  const ins = rows[0];
  if (!ins || ins.status !== "queued") return;

  await db.update(schema.insights).set({ status: "running", progress: 10 }).where(eq(schema.insights.id, insightId));

  // 1. 抓官网画像
  let websiteText = "";
  if (ins.website) {
    try {
      const scraped = await getScraper().scrape(ins.website, { timeoutMs: 15000 });
      websiteText = scraped.markdown.slice(0, 4000);
    } catch {}
  }
  await db.update(schema.insights).set({ progress: 40 }).where(eq(schema.insights.id, insightId));

  const seeds = (() => {
    try {
      return JSON.parse(ins.keywords ?? "[]") as string[];
    } catch {
      return [];
    }
  })();

  // 2. MIMO 综合分析
  const SYSTEM = `你是 GEO 洞察分析师。基于品牌信息 + 官网内容，产出一份 AI 搜索可见性诊断报告。
严格输出 JSON：
{
 "websiteProfile": "120字内品牌画像（它是谁、卖什么、给谁）",
 "competitors": [{"name":"竞品名","reason":"为什么它在AI答案里常被提"}],   // 3-5个
 "sources": [{"type":"信源类型如知乎/百科/媒体","note":"为什么这类信源重要"}], // 3-4个
 "heatKeywords": [{"keyword":"意图词","volume":月搜索量整数,"intent":"商业/信息/交易"}], // 8-12个，覆盖品牌核心问题
 "brandIssues": [{"issue":"当前AI可见性问题","suggestion":"该补什么内容/页面"}]  // 4-6个
}
只输出 JSON。`;
  const prompt = `品牌：${ins.brandName}\n行业：${ins.industry ?? "—"}\n官网：${ins.website ?? "—"}\n种子词：${seeds.join(", ") || "—"}\n\n官网内容摘要：\n${websiteText || "（未抓到官网内容，按行业常识分析）"}`;

  let report: InsightReport = { websiteProfile: "", competitors: [], sources: [], heatKeywords: [], brandIssues: [] };
  try {
    const r = await ask({ system: SYSTEM, prompt, temperature: 0.5 });
    const m = r.text.match(/\{[\s\S]*\}/);
    if (m) {
      const parsed = JSON.parse(m[0]) as InsightReport & { heatKeywords?: Array<{ keyword: string; volume: number; intent: string }> };
      report = {
        websiteProfile: parsed.websiteProfile ?? "",
        competitors: parsed.competitors ?? [],
        sources: parsed.sources ?? [],
        heatKeywords: (parsed.heatKeywords ?? []).map((k) => ({
          keyword: k.keyword,
          volume: Math.max(0, Math.round(k.volume ?? 0)),
          heatLevel: heatLevel(k.volume ?? 0),
          intent: k.intent ?? "商业",
        })),
        brandIssues: parsed.brandIssues ?? [],
      };
    }
    await consumeTokens(ins.userId, Math.ceil(r.text.length / 2) + 800, "insight", `洞察诊断：${ins.brandName}`);
  } catch (e) {
    await db
      .update(schema.insights)
      .set({ status: "failed", error: e instanceof Error ? e.message : "分析失败" })
      .where(eq(schema.insights.id, insightId));
    return;
  }

  await db
    .update(schema.insights)
    .set({ status: "done", progress: 100, report: JSON.stringify(report), finishedAt: new Date() })
    .where(eq(schema.insights.id, insightId));
}
