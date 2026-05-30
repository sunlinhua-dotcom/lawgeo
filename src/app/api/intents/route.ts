import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getCurrentBrand } from "@/lib/brand";
import { ask } from "@/lib/ai";
import { consumeTokens } from "@/lib/tokens";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 90;

/** aiSearchHeat 阈值（逆向自 AceFlow v1.3.5） */
function heatLevel(vol: number): string {
  if (vol >= 35000) return "高热度";
  if (vol >= 18000) return "中高热度";
  if (vol >= 8000) return "中等热度";
  return "长尾热度";
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const brand = await getCurrentBrand(session.userId);
  const rows = brand
    ? await db
        .select()
        .from(schema.intents)
        .where(and(eq(schema.intents.userId, session.userId), eq(schema.intents.brandId, brand.id)))
        .orderBy(desc(schema.intents.priority), desc(schema.intents.geoIndex))
    : [];
  return NextResponse.json({ intents: rows });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const brand = await getCurrentBrand(session.userId);
  if (!brand) return NextResponse.json({ error: "请先选择品牌" }, { status: 400 });

  const body = (await req.json()) as { texts: string[]; autoIndex?: boolean };
  const texts = (body.texts ?? []).map((t) => t.trim()).filter(Boolean).slice(0, 100);
  if (texts.length === 0) return NextResponse.json({ error: "缺少意图词" }, { status: 400 });

  const created: string[] = [];
  for (const text of texts) {
    const id = randomUUID();
    try {
      await db.insert(schema.intents).values({ id, userId: session.userId, brandId: brand.id, text });
      created.push(id);
    } catch {
      // 重复跳过
    }
  }
  return NextResponse.json({ ok: true, created: created.length });
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { ids } = (await req.json()) as { ids: string[] };
  for (const id of ids ?? []) {
    await db.delete(schema.intents).where(and(eq(schema.intents.id, id), eq(schema.intents.userId, session.userId)));
  }
  return NextResponse.json({ ok: true });
}

/** 刷新 GEO 指数：用 MIMO 估搜索量 + 触发概率 + 意图类型 */
export async function PATCH() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const brand = await getCurrentBrand(session.userId);
  if (!brand) return NextResponse.json({ error: "请先选择品牌" }, { status: 400 });

  const rows = await db
    .select()
    .from(schema.intents)
    .where(and(eq(schema.intents.userId, session.userId), eq(schema.intents.brandId, brand.id)));

  const SYSTEM = `你是 GEO 关键词分析师。对每个意图词估算：
- volume：月搜索量估算（整数，长尾词几百到几千，热门词几万）
- geo_index：该词在 AI 搜索里被触发并可能推荐品牌的概率 0-100
- type：informational(信息) / commercial(商业) / transactional(交易) / navigational(导航)
严格输出 JSON 数组，顺序与输入一致：[{"volume":12000,"geo_index":78,"type":"commercial"}]，只输出 JSON。`;
  const prompt = `行业：${brand.industry ?? "—"}\n意图词：\n${rows.map((r, i) => `${i + 1}. ${r.text}`).join("\n")}`;

  let analysis: Array<{ volume: number; geo_index: number; type: string }> = [];
  try {
    const r = await ask({ system: SYSTEM, prompt, temperature: 0.3 });
    const m = r.text.match(/\[[\s\S]*\]/);
    if (m) analysis = JSON.parse(m[0]);
    await consumeTokens(session.userId, Math.ceil(r.text.length / 2), "intent", "刷新 GEO 指数");
  } catch {}

  for (let i = 0; i < rows.length; i++) {
    const a = analysis[i];
    if (!a) continue;
    const vol = Math.max(0, Math.round(a.volume ?? 0));
    await db
      .update(schema.intents)
      .set({
        searchVolume: vol,
        heatLevel: heatLevel(vol),
        geoIndex: Math.max(0, Math.min(100, Math.round(a.geo_index ?? 0))),
        intentType: (["informational", "commercial", "transactional", "navigational"].includes(a.type)
          ? a.type
          : "commercial") as "informational" | "commercial" | "transactional" | "navigational",
        priority: Math.round((Math.min(100, a.geo_index ?? 0) + (vol >= 8000 ? 30 : 0)) / 15),
      })
      .where(eq(schema.intents.id, rows[i].id));
  }
  return NextResponse.json({ ok: true, updated: analysis.length });
}
