import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const body = (await req.json()) as Partial<{
    status: "draft" | "ready" | "published" | "failed";
    publishedUrl: string;
    title: string;
    bodyContent: string;
  }>;
  const update: Record<string, unknown> = {};
  if (body.status) update.status = body.status;
  if (body.publishedUrl !== undefined) {
    update.publishedUrl = body.publishedUrl;
    update.publishedAt = new Date();
  }
  if (body.title) update.title = body.title;
  if (body.bodyContent) update.body = body.bodyContent;
  await db.update(schema.publishTargets).set(update).where(eq(schema.publishTargets.id, id));
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  await db.delete(schema.publishTargets).where(eq(schema.publishTargets.id, id));
  return NextResponse.json({ ok: true });
}
