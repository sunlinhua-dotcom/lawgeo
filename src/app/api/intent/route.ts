import { NextResponse } from "next/server";
import { ask } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SYSTEM = `你是 GEO 关键词意图定位专家。

任务：把用户输入的关键词列表聚类为「意图簇」(intent clusters)。每个簇代表一个完整的用户意图语义，包含意图描述、所属意图簇下的关键词、优先级与建议内容形态。

输出严格 JSON 格式：

\`\`\`json
{
  "clusters": [
    {
      "name": "意图簇名称（4–10 字精简描述）",
      "intent_type": "informational | commercial | transactional | navigational",
      "description": "1 句话解释这类用户在问什么、为什么问、决策阶段",
      "keywords": ["原列表中归属该簇的关键词1", "关键词2"],
      "ai_difficulty": "easy | medium | hard",
      "priority": 1-10,
      "recommended_format": "FAQ | HowTo | 对比表 | TL;DR | 长文 | 直接答案",
      "competitive_landscape": "AI 推荐中常见的竞品类型（如：本地律所、连锁律所、自由律师）",
      "key_facts_to_include": ["事实点 1", "事实点 2", "事实点 3"]
    }
  ],
  "ungrouped": ["无法归簇的关键词"],
  "summary": {
    "total_keywords": 数字,
    "cluster_count": 数字,
    "top_intent_type": "出现最多的意图类型",
    "recommendation": "整体内容矩阵建设建议（2-3 句）"
  }
}
\`\`\`

聚类规则：
- 同一簇内的关键词必须语义相关（如「上海离婚律师推荐」「上海离婚律师哪家好」属同簇）
- 不同意图阶段应分簇（「什么是离婚冷静期」是 informational，「离婚律师推荐」是 transactional）
- 簇数控制在 3–8 个之间
- 优先级综合考虑：搜索量、商业价值、AI 推荐难度、转化潜力

只输出 JSON，不要其他文字。`;

interface IntentCluster {
  name: string;
  intent_type: "informational" | "commercial" | "transactional" | "navigational";
  description: string;
  keywords: string[];
  ai_difficulty: "easy" | "medium" | "hard";
  priority: number;
  recommended_format: string;
  competitive_landscape: string;
  key_facts_to_include: string[];
}

interface IntentResult {
  clusters: IntentCluster[];
  ungrouped: string[];
  summary: {
    total_keywords: number;
    cluster_count: number;
    top_intent_type: string;
    recommendation: string;
  };
}

export async function POST(req: Request) {
  let body: { keywords: string[]; industry?: string } = { keywords: [] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  if (!Array.isArray(body.keywords) || body.keywords.length === 0) {
    return NextResponse.json({ error: "缺少 keywords 数组" }, { status: 400 });
  }
  if (body.keywords.length > 100) {
    return NextResponse.json({ error: "关键词数量过多（≤100）" }, { status: 400 });
  }

  const prompt = `${body.industry ? `行业：${body.industry}\n\n` : ""}请把下面这批关键词做意图聚类：\n\n${body.keywords.map((k, i) => `${i + 1}. ${k}`).join("\n")}`;

  try {
    const r = await ask({ system: SYSTEM, prompt, temperature: 0.3 });
    // 提取 JSON
    const m = r.text.match(/```json\s*([\s\S]+?)```/);
    const jsonStr = m?.[1] ?? r.text;
    try {
      const parsed = JSON.parse(jsonStr) as IntentResult;
      return NextResponse.json({
        ...parsed,
        latencyMs: r.latencyMs,
      });
    } catch {
      return NextResponse.json({
        error: "模型输出 JSON 解析失败",
        rawText: r.text.slice(0, 2000),
      }, { status: 500 });
    }
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "intent failed" },
      { status: 500 },
    );
  }
}
