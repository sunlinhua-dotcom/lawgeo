import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { db, schema } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Body {
  name: string;
  contact: string;
  industry?: string;
  message?: string;
  source?: string;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  if (!body.name?.trim() || !body.contact?.trim()) {
    return NextResponse.json({ error: "缺少 name 或 contact" }, { status: 400 });
  }
  if (body.name.length > 50 || body.contact.length > 100 || (body.message ?? "").length > 1000) {
    return NextResponse.json({ error: "字段长度超限" }, { status: 400 });
  }
  try {
    await db.insert(schema.leads).values({
      id: randomUUID(),
      name: body.name.trim(),
      contact: body.contact.trim(),
      industry: body.industry,
      message: body.message,
      source: body.source ?? "/contact",
    });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "save failed" },
      { status: 500 },
    );
  }
}
