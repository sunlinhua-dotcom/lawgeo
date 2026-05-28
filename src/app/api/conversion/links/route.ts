import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function genCode() {
  return Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 4);
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const links = await db
    .select()
    .from(schema.conversionLinks)
    .where(eq(schema.conversionLinks.userId, session.userId))
    .orderBy(desc(schema.conversionLinks.createdAt));
  return NextResponse.json({ links });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = (await req.json()) as {
    targetUrl: string;
    label?: string;
    source?: string;
    campaign?: string;
    projectId?: string;
  };
  if (!body.targetUrl) return NextResponse.json({ error: "缺少 targetUrl" }, { status: 400 });
  const id = randomUUID();
  const shortCode = genCode();
  await db.insert(schema.conversionLinks).values({
    id,
    userId: session.userId,
    projectId: body.projectId ?? null,
    shortCode,
    targetUrl: body.targetUrl,
    label: body.label,
    source: body.source ?? "ai-recommend",
    campaign: body.campaign,
  });
  return NextResponse.json({ id, shortCode, ok: true });
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = (await req.json()) as { id: string };
  await db
    .delete(schema.conversionLinks)
    .where(eq(schema.conversionLinks.id, id));
  return NextResponse.json({ ok: true });
}
