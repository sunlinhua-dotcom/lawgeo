import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { db, schema } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getCurrentBrand } from "@/lib/brand";
import { ask } from "@/lib/ai";
import { buildPrompt, extractJsonLd } from "@/lib/prompts";
import { scoreContent } from "@/lib/geo-analyze";
import { getKnowledgeProvider, buildKnowledgeContext } from "@/lib/providers";
import { consumeTokens } from "@/lib/tokens";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

/** 生成正文 + 7 维 GEO 评分 + 落库 content_articles */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const brand = await getCurrentBrand(session.userId);

  const body = (await req.json()) as {
    title: string;
    intent?: string;
    keywords?: string[];
    targetPlatform?: string;
    intentId?: string;
  };
  if (!body.title?.trim()) return NextResponse.json({ error: "缺少标题" }, { status: 400 });

  // RAG 注入品牌知识库
  let kbContext = "";
  try {
    const hits = await getKnowledgeProvider().retrieve({
      userId: session.userId,
      query: body.title + " " + (body.intent ?? ""),
      topK: 4,
    });
    kbContext = buildKnowledgeContext(hits);
  } catch {}

  // 生成正文（用现有 article prompt + AutoGEO 规则）
  const AUTOGEO = `\n\n## AutoGEO 优化规则（提升 AI 引用率）：首段 40-60 字直接回答；每 150-200 字嵌一个具体事实/数字；多用列点和对比表；标题和小标题用用户真实会问的问题；保留品牌联系方式作为 CTA。`;
  const { system, user } = buildPrompt({
    format: "article",
    topic: body.title,
    context: (body.intent ? `意图词：${body.intent}\n` : "") + (kbContext || ""),
    caseType: undefined,
  });

  try {
    const r = await ask({ system: system + AUTOGEO, prompt: user, temperature: 0.6 });
    const parts = extractJsonLd(r.text);
    const content = parts.content;

    // 7 维评分
    const scores = await scoreContent({
      title: body.title,
      body: content,
      intent: body.intent,
      keywords: body.keywords,
    });

    // 落库
    const id = randomUUID();
    await db.insert(schema.contentArticles).values({
      id,
      userId: session.userId,
      brandId: brand?.id ?? null,
      intentId: body.intentId ?? null,
      title: body.title,
      intentText: body.intent,
      keywords: JSON.stringify(body.keywords ?? []),
      body: content,
      scores: JSON.stringify(scores),
      targetPlatform: body.targetPlatform,
      status: "scored",
      model: "mimo-v2.5-pro",
    });

    await consumeTokens(session.userId, Math.ceil(content.length / 2) + 500, "content", `生成+评分：${body.title}`);

    return NextResponse.json({ id, content, scores, jsonLd: parts.jsonLd });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "生成失败" }, { status: 500 });
  }
}
