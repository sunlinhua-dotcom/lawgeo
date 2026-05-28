import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { eq, and } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sendAlert, type AlertType } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const rows = await db
    .select()
    .from(schema.alertSubscriptions)
    .where(eq(schema.alertSubscriptions.userId, session.userId));
  return NextResponse.json({ subscriptions: rows });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = (await req.json()) as {
    type: AlertType;
    email: string;
    projectId?: string | null;
    enabled?: boolean;
  };
  const id = randomUUID();
  await db.insert(schema.alertSubscriptions).values({
    id,
    userId: session.userId,
    projectId: body.projectId ?? null,
    type: body.type,
    email: body.email,
    enabled: body.enabled ?? true,
  });
  return NextResponse.json({ id, ok: true });
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = (await req.json()) as { id: string };
  await db
    .delete(schema.alertSubscriptions)
    .where(
      and(eq(schema.alertSubscriptions.id, id), eq(schema.alertSubscriptions.userId, session.userId)),
    );
  return NextResponse.json({ ok: true });
}

/** 测试发送 */
export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = (await req.json()) as { id: string };
  const subs = await db
    .select()
    .from(schema.alertSubscriptions)
    .where(eq(schema.alertSubscriptions.id, id))
    .limit(1);
  const sub = subs[0];
  if (!sub || sub.userId !== session.userId)
    return NextResponse.json({ error: "not found" }, { status: 404 });
  const result = await sendAlert({
    to: sub.email,
    type: sub.type,
    data: { project: "测试项目", before: 80, after: 35, competitor: "竞品 A", citationRate: 42, cited: 15, top1: 3 },
  });
  return NextResponse.json(result);
}
