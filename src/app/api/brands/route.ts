import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { BRAND_COOKIE } from "@/lib/brand";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const rows = await db
    .select()
    .from(schema.brands)
    .where(eq(schema.brands.userId, session.userId))
    .orderBy(desc(schema.brands.createdAt));
  return NextResponse.json({ brands: rows });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = (await req.json()) as {
    name: string;
    website?: string;
    industry?: string;
    region?: string;
    description?: string;
  };
  if (!body.name?.trim()) return NextResponse.json({ error: "缺少品牌名" }, { status: 400 });
  const id = randomUUID();
  await db.insert(schema.brands).values({
    id,
    userId: session.userId,
    name: body.name.trim(),
    website: body.website?.trim(),
    industry: body.industry,
    region: body.region,
    description: body.description,
  });
  // 自动选中新建的品牌
  const res = NextResponse.json({ id, ok: true });
  res.cookies.set(BRAND_COOKIE, id, { path: "/", httpOnly: false, sameSite: "lax", maxAge: 31536000 });
  return res;
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = (await req.json()) as { id: string } & Partial<{
    name: string;
    website: string;
    industry: string;
    region: string;
    description: string;
  }>;
  const { id, ...patch } = body;
  await db
    .update(schema.brands)
    .set(patch)
    .where(and(eq(schema.brands.id, id), eq(schema.brands.userId, session.userId)));
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = (await req.json()) as { id: string };
  await db.delete(schema.brands).where(and(eq(schema.brands.id, id), eq(schema.brands.userId, session.userId)));
  return NextResponse.json({ ok: true });
}
