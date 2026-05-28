import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function slugify(s: string) {
  const cleaned = s.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w一-鿿-]/g, "").slice(0, 40);
  return `${cleaned}-${Math.random().toString(36).slice(2, 6)}`;
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const rows = await db
    .select()
    .from(schema.authors)
    .where(eq(schema.authors.userId, session.userId))
    .orderBy(desc(schema.authors.createdAt));
  return NextResponse.json({ authors: rows });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = (await req.json()) as {
    name: string;
    title?: string;
    bio?: string;
    expertise?: string[];
    industry?: string;
    avatarUrl?: string;
  };
  if (!body.name?.trim()) return NextResponse.json({ error: "缺少 name" }, { status: 400 });
  const id = randomUUID();
  await db.insert(schema.authors).values({
    id,
    userId: session.userId,
    name: body.name.trim(),
    slug: slugify(body.name),
    title: body.title,
    bio: body.bio,
    expertise: body.expertise ? JSON.stringify(body.expertise) : null,
    industry: body.industry,
    avatarUrl: body.avatarUrl,
  });
  return NextResponse.json({ id, ok: true });
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = (await req.json()) as { id: string };
  await db
    .delete(schema.authors)
    .where(and(eq(schema.authors.id, id), eq(schema.authors.userId, session.userId)));
  return NextResponse.json({ ok: true });
}
