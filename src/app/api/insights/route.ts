import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getCurrentBrand } from "@/lib/brand";
import { runInsight } from "@/lib/insight";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const rows = await db
    .select()
    .from(schema.insights)
    .where(eq(schema.insights.userId, session.userId))
    .orderBy(desc(schema.insights.createdAt))
    .limit(30);
  return NextResponse.json({ insights: rows });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const brand = await getCurrentBrand(session.userId);
  const body = (await req.json()) as {
    brandName?: string;
    industry?: string;
    website?: string;
    keywords?: string[];
  };
  const brandName = body.brandName?.trim() || brand?.name;
  if (!brandName) return NextResponse.json({ error: "缺少品牌名" }, { status: 400 });

  const id = randomUUID();
  await db.insert(schema.insights).values({
    id,
    userId: session.userId,
    brandId: brand?.id ?? null,
    brandName,
    industry: body.industry ?? brand?.industry,
    website: body.website ?? brand?.website,
    keywords: JSON.stringify(body.keywords ?? []),
    status: "queued",
  });

  // fire-and-forget
  runInsight(id).catch((e) => console.error("[insight] failed:", e));

  return NextResponse.json({ id, ok: true });
}
