import { NextResponse } from "next/server";
import { desc, eq, and } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ingestDocument } from "@/lib/rag";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const docs = await db
    .select()
    .from(schema.knowledgeDocs)
    .where(eq(schema.knowledgeDocs.userId, session.userId))
    .orderBy(desc(schema.knowledgeDocs.createdAt));
  return NextResponse.json({ docs });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const contentType = req.headers.get("content-type") ?? "";
  let title = "";
  let text = "";
  let sourceUrl: string | undefined;
  let sourceType: "upload" | "url" | "manual" = "manual";
  let projectId: string | undefined;

  if (contentType.includes("application/json")) {
    const body = (await req.json()) as { title?: string; text?: string; sourceUrl?: string; projectId?: string };
    title = body.title?.trim() ?? "";
    text = body.text?.trim() ?? "";
    sourceUrl = body.sourceUrl;
    projectId = body.projectId;
    sourceType = sourceUrl ? "url" : "manual";
  } else if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (file) {
      title = (form.get("title") as string | null) ?? file.name;
      const buf = await file.arrayBuffer();
      text = new TextDecoder("utf-8").decode(buf);
      sourceType = "upload";
    }
    projectId = (form.get("projectId") as string | null) ?? undefined;
  }

  if (!title || !text || text.length < 50) {
    return NextResponse.json({ error: "标题或内容缺失/过短" }, { status: 400 });
  }
  if (text.length > 200_000) {
    return NextResponse.json({ error: "内容过长（>200KB），请分多次上传" }, { status: 400 });
  }

  const result = await ingestDocument({
    userId: session.userId,
    projectId,
    title,
    text,
    sourceUrl,
    sourceType,
  });
  return NextResponse.json({ ok: true, ...result });
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = (await req.json()) as { id: string };
  await db
    .delete(schema.knowledgeDocs)
    .where(and(eq(schema.knowledgeDocs.id, id), eq(schema.knowledgeDocs.userId, session.userId)));
  return NextResponse.json({ ok: true });
}
