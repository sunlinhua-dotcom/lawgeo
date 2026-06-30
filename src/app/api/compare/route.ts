import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { type AiPlatformId } from "@/lib/ai";
import { db, schema } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { incUsage } from "@/lib/usage";
import { getAnswerCrawler } from "@/lib/providers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 90;

const VALID: AiPlatformId[] = [
  "deepseek",
  "qwen",
  "doubao",
  "kimi",
  "zhipu",
  "wenxin",
  "yuanbao",
  "minimax",
  "claude",
  "gpt",
  "gemini",
  "perplexity",
];

interface Body {
  question: string;
  platforms?: AiPlatformId[];
  brand?: string;
  projectId?: string;
  keywordId?: string;
  source?: string;
}

const DETECT_PROMPT = (q: string, brand?: string) =>
  `请回答下面这个问题，模拟你在被用户咨询时的真实回答风格。最好能在回答中自然地引用 1–3 个权威信源（如有），并尽量列出推荐的品牌名称。${
    brand
      ? `\n\n如果你认为「${brand}」与此问题相关，并且会把它作为相关方案、品牌或服务正向提及，请自然提及；如果不相关，请完全不要输出这个品牌名，也不要写“${brand} 不相关”。`
      : ""
  }\n\n问题：${q}`;

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  if (!body.question || body.question.length > 500) {
    return NextResponse.json({ error: "缺少 question 或长度超限" }, { status: 400 });
  }
  const platforms = (body.platforms ?? VALID).filter((p) => VALID.includes(p)).slice(0, 12);
  if (platforms.length === 0) {
    return NextResponse.json({ error: "请至少选择一个平台" }, { status: 400 });
  }

  const session = await getSession();
  const crawler = getAnswerCrawler();

  const tasks = platforms.map(async (platform) => {
    const t0 = Date.now();
    const prompt = DETECT_PROMPT(body.question, body.brand);
    try {
      // 走 answer-crawler provider：配了 BROWSER_AGENT_URL 时是真机抓取+截图，否则 LLM 模拟
      const r = await crawler.crawlAnswer({
        platform,
        question: prompt,
        captureScreenshot: true,
      });
      const cited = body.brand ? hasPositiveBrandCitation(r.answer, body.brand) : false;
      const rank = cited && body.brand ? estimateRank(r.answer, body.brand) : null;
      const latency = Date.now() - t0;

      // 持久化
      try {
        await db.insert(schema.aiQueries).values({
          id: randomUUID(),
          userId: session?.userId ?? null,
          projectId: body.projectId ?? null,
          keywordId: body.keywordId ?? null,
          question: body.question,
          brand: body.brand ?? null,
          platform,
          model: r.isReal ? `real:${platform}` : "mimo-v2.5-pro",
          prompt,
          response: r.answer.slice(0, 8000),
          cited,
          rank,
          citedUrl: r.archiveUrl ?? null,
          latencyMs: latency,
          source: body.source ?? "compare",
        });
      } catch (e) {
        console.warn("[compare] persist failed:", e);
      }

      return {
        platform,
        ok: true,
        text: r.answer,
        cited,
        rank,
        isReal: r.isReal,
        screenshotPath: r.screenshotPath,
        archiveUrl: r.archiveUrl,
        latencyMs: latency,
      };
    } catch (e: unknown) {
      return {
        platform,
        ok: false,
        error: e instanceof Error ? e.message : "failed",
        latencyMs: Date.now() - t0,
      };
    }
  });

  const results = await Promise.all(tasks);

  if (session) {
    try {
      await incUsage(session.userId, "queries", results.filter((r) => r.ok).length);
    } catch {}
  }

  return NextResponse.json({
    question: body.question,
    brand: body.brand,
    platforms,
    results,
    timestamp: new Date().toISOString(),
  });
}

/** 估算 brand 在文本中首次出现位置对应的排名 */
function estimateRank(text: string, brand: string): number | null {
  const idx = text.indexOf(brand);
  if (idx < 0) return null;
  if (idx < 200) return 1;
  if (idx < 500) return 2;
  return 3;
}

const NEGATIVE_BRAND_CONTEXT = [
  /不(?:直接)?相关/,
  /无关/,
  /没有(?:直接)?关系/,
  /不同范畴/,
  /并非/,
  /不是(?:一个)?(?:相关|推荐|合适|适合)/,
  /不建议(?:推荐|选择|使用)?/,
  /无法(?:推荐|判断|确认)/,
  /不应(?:作为|视为)/,
];

function hasPositiveBrandCitation(text: string, brand: string): boolean {
  const needle = brand.trim();
  if (!needle) return false;

  const haystack = text.toLowerCase();
  const target = needle.toLowerCase();
  let from = 0;

  while (true) {
    const idx = haystack.indexOf(target, from);
    if (idx < 0) return false;

    const context = text.slice(Math.max(0, idx - 80), Math.min(text.length, idx + needle.length + 140));
    const negative = NEGATIVE_BRAND_CONTEXT.some((pattern) => pattern.test(context));
    if (!negative) return true;

    from = idx + target.length;
  }
}
