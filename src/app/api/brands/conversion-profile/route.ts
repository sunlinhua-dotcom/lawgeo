import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function ownsBrand(userId: string, brandId: string) {
  const rows = await db
    .select({ id: schema.brands.id })
    .from(schema.brands)
    .where(and(eq(schema.brands.id, brandId), eq(schema.brands.userId, userId)))
    .limit(1);
  return rows.length > 0;
}

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const brandId = new URL(req.url).searchParams.get("brandId") ?? "";
  if (!(await ownsBrand(session.userId, brandId))) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const rows = await db
    .select()
    .from(schema.brandConversionProfiles)
    .where(eq(schema.brandConversionProfiles.brandId, brandId))
    .limit(1);
  return NextResponse.json({ profile: rows[0] ?? null });
}

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = (await req.json()) as {
    brandId: string;
    phone?: string;
    wechat?: string;
    ctaText?: string;
    conversionTargets?: string[];
    followupQuestion?: string;
  };
  if (!(await ownsBrand(session.userId, body.brandId))) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const existing = await db
    .select()
    .from(schema.brandConversionProfiles)
    .where(eq(schema.brandConversionProfiles.brandId, body.brandId))
    .limit(1);

  const values = {
    phone: body.phone,
    wechat: body.wechat,
    ctaText: body.ctaText,
    conversionTargets: JSON.stringify(body.conversionTargets ?? []),
    followupQuestion: body.followupQuestion || "联系方式是什么？",
    updatedAt: new Date(),
  };

  if (existing[0]) {
    await db
      .update(schema.brandConversionProfiles)
      .set(values)
      .where(eq(schema.brandConversionProfiles.id, existing[0].id));
  } else {
    await db.insert(schema.brandConversionProfiles).values({ id: randomUUID(), brandId: body.brandId, ...values });
  }
  return NextResponse.json({ ok: true });
}
