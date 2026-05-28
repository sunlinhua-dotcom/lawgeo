import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { ask } from "@/lib/ai";
import { buildPrompt, extractJsonLd, type ContentFormat } from "@/lib/prompts";
import { db, schema } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { incUsage, checkQuota } from "@/lib/usage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface Body {
  format: ContentFormat;
  topic: string;
  context?: string;
  region?: string;
  caseType?: string;
  projectId?: string;
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

  const session = await getSession();
  if (session) {
    try {
      await checkQuota(session.userId, "generations");
    } catch (e: unknown) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "quota exceeded" },
        { status: 402 },
      );
    }
  }

  const { system, user } = buildPrompt(body);
  try {
    const t0 = Date.now();
    const r = await ask({ prompt: user, system, temperature: 0.6 });
    const parts = extractJsonLd(r.text);
    const elapsed = Date.now() - t0;

    if (session) {
      try {
        await db.insert(schema.contentDrafts).values({
          id: randomUUID(),
          userId: session.userId,
          projectId: body.projectId ?? null,
          title: body.topic,
          format: body.format,
          body: parts.content,
          schemaJson: parts.jsonLd,
          model: "mimo-v2.5-pro",
        });
        await incUsage(session.userId, "generations", 1);
      } catch (e) {
        console.warn("[generate] persist failed:", e);
      }
    }

    return NextResponse.json({
      content: parts.content,
      jsonLd: parts.jsonLd,
      raw: r.text,
      usage: r.usage,
      latencyMs: elapsed,
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "generation failed" },
      { status: 500 },
    );
  }
}
