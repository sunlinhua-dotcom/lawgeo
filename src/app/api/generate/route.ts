import { NextResponse } from "next/server";
import { ask } from "@/lib/ai";
import { buildPrompt, extractJsonLd, type ContentFormat } from "@/lib/prompts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface Body {
  format: ContentFormat;
  topic: string;
  context?: string;
  region?: string;
  caseType?: string;
}

const VALID_FORMATS: ContentFormat[] = ["faq", "tldr", "howto", "compare", "article", "answer"];

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  if (!body.topic || !body.format) {
    return NextResponse.json({ error: "缺少 topic 或 format" }, { status: 400 });
  }
  if (!VALID_FORMATS.includes(body.format)) {
    return NextResponse.json({ error: "format 不支持" }, { status: 400 });
  }
  if (body.topic.length > 200) {
    return NextResponse.json({ error: "topic 过长" }, { status: 400 });
  }

  const { system, user } = buildPrompt(body);
  try {
    const t0 = Date.now();
    const r = await ask({ prompt: user, system, temperature: 0.6 });
    const parts = extractJsonLd(r.text);
    return NextResponse.json({
      content: parts.content,
      jsonLd: parts.jsonLd,
      raw: r.text,
      usage: r.usage,
      latencyMs: Date.now() - t0,
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "generation failed" },
      { status: 500 },
    );
  }
}
