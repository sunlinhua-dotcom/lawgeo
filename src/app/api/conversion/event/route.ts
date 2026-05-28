import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { eq, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Pixel endpoint to record conversion events.
 * Public API — anyone can call (with shortCode for attribution).
 * 用法（在落地页贴入）:
 *   fetch('/api/conversion/event', { method: 'POST', body: JSON.stringify({ code, type:'lead', value:1000 }) })
 */
export async function POST(req: Request) {
  let body: {
    code?: string;
    type?: "view" | "lead" | "signup" | "purchase";
    value?: number;
    metadata?: Record<string, unknown>;
  } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  if (!body.type) return NextResponse.json({ error: "缺少 type" }, { status: 400 });

  let linkId: string | null = null;
  let userId: string | null = null;
  let source: string | null = null;

  if (body.code) {
    const rows = await db
      .select()
      .from(schema.conversionLinks)
      .where(eq(schema.conversionLinks.shortCode, body.code))
      .limit(1);
    if (rows[0]) {
      linkId = rows[0].id;
      userId = rows[0].userId;
      source = rows[0].source;
    }
  }

  const valueCents = Math.round((body.value ?? 0) * 100);

  await db.insert(schema.conversionEvents).values({
    id: randomUUID(),
    linkId,
    userId,
    eventType: body.type,
    source,
    metadata: body.metadata ? JSON.stringify(body.metadata) : null,
    valueCents,
    ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "",
    userAgent: req.headers.get("user-agent")?.slice(0, 200) ?? "",
  });

  if (linkId) {
    await db
      .update(schema.conversionLinks)
      .set({
        conversions: sql`${schema.conversionLinks.conversions} + 1`,
        valueCents: sql`${schema.conversionLinks.valueCents} + ${valueCents}`,
      })
      .where(eq(schema.conversionLinks.id, linkId));
  }

  return NextResponse.json({ ok: true });
}
