import { randomUUID } from "node:crypto";
import { eq, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Short link redirect handler.
 * URL: /r/<shortCode>
 * - 增加 clicks 计数
 * - 写入 click 事件，记录 source/ip/UA
 * - 302 跳转到 targetUrl，并附加 UTM 参数
 */
export async function GET(req: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const rows = await db.select().from(schema.conversionLinks).where(eq(schema.conversionLinks.shortCode, code)).limit(1);
  const link = rows[0];
  if (!link) {
    return new Response("Not Found", { status: 404 });
  }

  // 拼 UTM
  const target = new URL(link.targetUrl);
  if (!target.searchParams.has("utm_source")) target.searchParams.set("utm_source", link.source ?? "lawgeo");
  if (!target.searchParams.has("utm_medium")) target.searchParams.set("utm_medium", "ai-recommend");
  if (link.campaign && !target.searchParams.has("utm_campaign"))
    target.searchParams.set("utm_campaign", link.campaign);
  target.searchParams.set("lg_ref", link.shortCode);

  // 写入 click 事件 + 计数
  const headers = req.headers;
  const ip = headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  const ua = headers.get("user-agent") ?? "";
  try {
    await db.insert(schema.conversionEvents).values({
      id: randomUUID(),
      linkId: link.id,
      userId: link.userId,
      eventType: "click",
      source: link.source,
      metadata: JSON.stringify({ referer: headers.get("referer") }),
      ip,
      userAgent: ua.slice(0, 200),
    });
    await db
      .update(schema.conversionLinks)
      .set({ clicks: sql`${schema.conversionLinks.clicks} + 1` })
      .where(eq(schema.conversionLinks.id, link.id));
  } catch (e) {
    console.warn("[r] event log failed:", e);
  }

  return Response.redirect(target.toString(), 302);
}
