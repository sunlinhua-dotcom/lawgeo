import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const rows = await db.select().from(schema.projects).where(eq(schema.projects.userId, session.userId));
  return NextResponse.json({ projects: rows });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = (await req.json()) as {
    name: string;
    domain: string;
    industry?: "lawyer" | "sme" | "b2b" | "local" | "education" | "other";
    region?: string;
    description?: string;
  };
  if (!body.name?.trim() || !body.domain?.trim()) {
    return NextResponse.json({ error: "缺少 name 或 domain" }, { status: 400 });
  }
  const id = randomUUID();
  await db.insert(schema.projects).values({
    id,
    userId: session.userId,
    name: body.name.trim(),
    domain: body.domain.trim().toLowerCase(),
    industry: body.industry ?? "lawyer",
    region: body.region,
    description: body.description,
  });
  return NextResponse.json({ id, ok: true });
}
