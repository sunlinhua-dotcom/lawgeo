import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const rows = await db
    .select()
    .from(schema.insights)
    .where(and(eq(schema.insights.id, id), eq(schema.insights.userId, session.userId)))
    .limit(1);
  if (!rows[0]) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ insight: rows[0] });
}

/** 把洞察报告里的热词一键导入意图库 */
export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const rows = await db
    .select()
    .from(schema.insights)
    .where(and(eq(schema.insights.id, id), eq(schema.insights.userId, session.userId)))
    .limit(1);
  const ins = rows[0];
  if (!ins?.report || !ins.brandId) return NextResponse.json({ error: "无报告或未绑品牌" }, { status: 400 });

  let imported = 0;
  try {
    const report = JSON.parse(ins.report) as { heatKeywords?: Array<{ keyword: string; volume: number; heatLevel: string }> };
    for (const k of report.heatKeywords ?? []) {
      try {
        await db.insert(schema.intents).values({
          id: randomUUID(),
          userId: session.userId,
          brandId: ins.brandId,
          text: k.keyword,
          searchVolume: k.volume,
          heatLevel: k.heatLevel,
        });
        imported++;
      } catch {
        // 重复跳过
      }
    }
  } catch {}
  return NextResponse.json({ ok: true, imported });
}
