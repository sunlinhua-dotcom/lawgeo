import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getCurrentBrand } from "@/lib/brand";
import { runRealtimeSearch } from "@/lib/realtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 180;

const VALID = ["doubao", "deepseek", "qwen", "yuanbao", "kimi", "zhipu", "claude", "gpt"];

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = (await req.json()) as {
    question: string;
    targetWord: string;
    platforms?: string[];
    followupTriggerWord?: string;
  };
  if (!body.question?.trim() || !body.targetWord?.trim()) {
    return NextResponse.json({ error: "缺少 question 或 targetWord" }, { status: 400 });
  }
  const platforms = (body.platforms ?? ["doubao", "deepseek", "qwen", "yuanbao"]).filter((p) => VALID.includes(p)).slice(0, 8);
  const brand = await getCurrentBrand(session.userId);

  const result = await runRealtimeSearch({
    userId: session.userId,
    brandId: brand?.id ?? null,
    question: body.question.trim(),
    targetWord: body.targetWord.trim(),
    platforms,
    followupTriggerWord: body.followupTriggerWord,
  });
  return NextResponse.json(result);
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const searches = await db
    .select()
    .from(schema.realtimeSearches)
    .where(eq(schema.realtimeSearches.userId, session.userId))
    .orderBy(desc(schema.realtimeSearches.createdAt))
    .limit(50);
  return NextResponse.json({ searches });
}
