import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { db, schema } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { runBulkJob } from "@/lib/blog-gen";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json()) as {
    industry: string;
    authorId?: string;
    keywords: string[];
    perKeyword?: number;
    autoPublish?: boolean;
  };

  if (!body.industry || !Array.isArray(body.keywords) || body.keywords.length === 0) {
    return NextResponse.json({ error: "缺少 industry 或 keywords" }, { status: 400 });
  }
  // 安全：限制单次最大数量
  if (body.keywords.length > 100) {
    return NextResponse.json({ error: "单批关键词上限 100" }, { status: 400 });
  }
  const perKw = Math.max(1, Math.min(3, body.perKeyword ?? 1));
  const total = body.keywords.length * perKw;
  if (total > 100) {
    return NextResponse.json({ error: "单批总数上限 100 篇" }, { status: 400 });
  }

  const jobId = randomUUID();
  await db.insert(schema.bulkJobs).values({
    id: jobId,
    userId: session.userId,
    industry: body.industry,
    authorId: body.authorId ?? null,
    keywords: JSON.stringify(body.keywords),
    perKeyword: perKw,
    totalCount: total,
    autoPublish: body.autoPublish !== false,
    status: "queued",
  });

  // fire-and-forget: 不阻塞响应
  runBulkJob(jobId).catch((e) => {
    console.error("[bulk] runBulkJob crashed:", e);
  });

  return NextResponse.json({ ok: true, jobId, totalCount: total });
}
