import "server-only";
import { ask } from "./ai";

/** 估算目标词在答案中的排名（出现越早排名越高） */
export function estimateRank(text: string, target: string): number | null {
  const idx = text.indexOf(target);
  if (idx < 0) return null;
  if (idx < 150) return 1;
  if (idx < 400) return 2;
  if (idx < 900) return 3;
  return 4;
}

/** 简易情感判断（先关键词，再可选 LLM） */
export function quickSentiment(text: string, target: string): "positive" | "neutral" | "negative" {
  const around = (() => {
    const i = text.indexOf(target);
    if (i < 0) return text.slice(0, 300);
    return text.slice(Math.max(0, i - 100), i + 200);
  })();
  const pos = ["推荐", "优秀", "专业", "资深", "口碑好", "值得", "靠谱", "经验丰富", "首选", "适合"];
  const neg = ["不推荐", "差", "投诉", "纠纷", "避免", "风险", "问题", "不靠谱", "陷阱"];
  let score = 0;
  for (const w of pos) if (around.includes(w)) score++;
  for (const w of neg) if (around.includes(w)) score--;
  return score > 0 ? "positive" : score < 0 ? "negative" : "neutral";
}

/** 从答案抽取关键词（LLM，3-6 个） */
export async function extractKeywords(text: string): Promise<string[]> {
  try {
    const r = await ask({
      system: "从下面这段 AI 回答里抽取 3-6 个最能代表「推荐理由/卖点」的关键词。只输出 JSON 数组，如 [\"经验丰富\",\"胜诉率高\"]，不要其他文字。",
      prompt: text.slice(0, 2000),
      temperature: 0.2,
    });
    const m = r.text.match(/\[[\s\S]*?\]/);
    if (m) return (JSON.parse(m[0]) as string[]).slice(0, 6).map(String);
  } catch {}
  return [];
}

/** 检查追问答案里是否命中转化目标（电话/微信等） */
export function matchConversion(
  followupAnswer: string,
  targets: string[],
): { hit: boolean; matched: string[] } {
  const matched: string[] = [];
  for (const t of targets) {
    if (!t) continue;
    // 电话号去掉空格/横线后匹配
    const norm = t.replace(/[\s-]/g, "");
    const ansNorm = followupAnswer.replace(/[\s-]/g, "");
    if (ansNorm.includes(norm) || followupAnswer.includes(t)) matched.push(t);
  }
  return { hit: matched.length > 0, matched };
}

/**
 * 7 维 GEO 内容评分（对标 AceFlow）。
 * 用 MIMO 做 rubric 打分，每维 0-100 + 简短理由。
 */
export interface GeoScores {
  total: number;
  title: number;
  firstPara: number;
  deAi: number;
  structure: number;
  authority: number;
  match: number;
  conversion: number;
  reasons: Record<string, string>;
}

const SCORE_SYSTEM = `你是 GEO 内容质量评审。对给定文章按 7 个维度各打 0-100 分，并给一句话理由。维度：
- title 标题分：是否含关键词、是否吸引点击
- firstPara 首段直答分：首段 40-60 字是否直接回答核心问题（GEO 最关键，AI 摘要优先抓首段）
- deAi 去AI味分：越像真人写、越少空话套话越高
- structure 结构分：H2/H3 小标题、列点、对比表是否清晰
- authority 权威性分：事实密度、是否有数字/来源/案例
- match 匹配分：与给定意图词/关键词的相关度
- conversion 转化分：是否含明确 CTA / 联系方式 / 引导下一步

严格输出 JSON：
{"title":85,"firstPara":90,"deAi":70,"structure":80,"authority":75,"match":88,"conversion":60,"reasons":{"title":"...","firstPara":"...","deAi":"...","structure":"...","authority":"...","match":"...","conversion":"..."}}
只输出 JSON。`;

export async function scoreContent(opts: {
  title: string;
  body: string;
  intent?: string;
  keywords?: string[];
}): Promise<GeoScores> {
  const prompt = `意图词：${opts.intent ?? "—"}\n关键词：${(opts.keywords ?? []).join(", ") || "—"}\n\n标题：${opts.title}\n\n正文：\n${opts.body.slice(0, 6000)}`;
  try {
    const r = await ask({ system: SCORE_SYSTEM, prompt, temperature: 0.2 });
    const m = r.text.match(/\{[\s\S]*\}/);
    if (m) {
      const j = JSON.parse(m[0]) as Partial<GeoScores>;
      const dims = ["title", "firstPara", "deAi", "structure", "authority", "match", "conversion"] as const;
      const vals = dims.map((d) => Math.max(0, Math.min(100, Number(j[d] ?? 0))));
      const total = Math.round(vals.reduce((a, b) => a + b, 0) / dims.length);
      return {
        total,
        title: vals[0],
        firstPara: vals[1],
        deAi: vals[2],
        structure: vals[3],
        authority: vals[4],
        match: vals[5],
        conversion: vals[6],
        reasons: (j.reasons as Record<string, string>) ?? {},
      };
    }
  } catch {}
  // 兜底
  return { total: 0, title: 0, firstPara: 0, deAi: 0, structure: 0, authority: 0, match: 0, conversion: 0, reasons: {} };
}
