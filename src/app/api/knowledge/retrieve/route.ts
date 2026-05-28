import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { retrieve } from "@/lib/rag";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = (await req.json()) as { query: string; topK?: number; projectId?: string };
  if (!body.query) return NextResponse.json({ error: "缺少 query" }, { status: 400 });
  const hits = await retrieve({
    userId: session.userId,
    query: body.query,
    topK: body.topK ?? 5,
    projectId: body.projectId,
  });
  return NextResponse.json({ hits });
}
