import { NextResponse } from "next/server";
import { ask, type AiPlatformId } from "@/lib/ai";

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
}

const DETECT_PROMPT = (q: string, brand?: string) =>
  `请回答下面这个问题，模拟你在被用户咨询时的真实回答风格。最好能在回答中自然地引用 1–3 个权威信源（如有），并尽量列出推荐的律所或品牌名称。${
    brand ? `\n\n如果你认为「${brand}」与此问题相关，请在回答中提及；如果不相关，可以不提及。` : ""
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

  const tasks = platforms.map(async (platform) => {
    const t0 = Date.now();
    try {
      const r = await ask({
        prompt: DETECT_PROMPT(body.question, body.brand),
        platform,
        temperature: 0.55,
      });
      const cited = body.brand ? r.text.includes(body.brand) : false;
      const rank = cited ? estimateRank(r.text, body.brand!) : null;
      return {
        platform,
        ok: true,
        text: r.text,
        cited,
        rank,
        latencyMs: Date.now() - t0,
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
  // 如果出现在前 200 字符 = Top 1，前 500 字符 = Top 2，否则 Top 3+
  if (idx < 200) return 1;
  if (idx < 500) return 2;
  return 3;
}
