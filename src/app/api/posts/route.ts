import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const industry = url.searchParams.get("industry");
  const status = url.searchParams.get("status");
  const conditions = [eq(schema.blogPosts.userId, session.userId)];
  if (industry) conditions.push(eq(schema.blogPosts.industry, industry));
  if (status) conditions.push(eq(schema.blogPosts.status, status as "draft" | "scheduled" | "published" | "archived"));
  const posts = await db
    .select()
    .from(schema.blogPosts)
    .where(and(...conditions))
    .orderBy(desc(schema.blogPosts.createdAt))
    .limit(200);
  return NextResponse.json({ posts });
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = (await req.json()) as { id: string };
  await db
    .delete(schema.blogPosts)
    .where(and(eq(schema.blogPosts.id, id), eq(schema.blogPosts.userId, session.userId)));
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = (await req.json()) as { id: string; status?: "draft" | "published" | "archived" };
  await db
    .update(schema.blogPosts)
    .set({
      status: body.status,
      publishedAt: body.status === "published" ? new Date() : undefined,
    })
    .where(and(eq(schema.blogPosts.id, body.id), eq(schema.blogPosts.userId, session.userId)));
  return NextResponse.json({ ok: true });
}
