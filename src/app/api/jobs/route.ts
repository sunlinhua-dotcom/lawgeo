import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { eq, inArray } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { runMonitorJob } from "@/lib/cron";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const projs = await db.select().from(schema.projects).where(eq(schema.projects.userId, session.userId));
  const ids = projs.map((p) => p.id);
  if (ids.length === 0) return NextResponse.json({ jobs: [] });
  const jobs = await db.select().from(schema.monitorJobs).where(inArray(schema.monitorJobs.projectId, ids));
  return NextResponse.json({ jobs });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = (await req.json()) as {
    projectId: string;
    platforms: string[];
    schedule?: "daily" | "hourly" | "weekly";
  };
  // 验证 projectId 属于该用户
  const projs = await db
    .select()
    .from(schema.projects)
    .where(eq(schema.projects.id, body.projectId))
    .limit(1);
  if (!projs[0] || projs[0].userId !== session.userId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const id = randomUUID();
  await db.insert(schema.monitorJobs).values({
    id,
    projectId: body.projectId,
    platforms: JSON.stringify(body.platforms),
    schedule: body.schedule ?? "daily",
    nextRunAt: new Date(),
  });
  return NextResponse.json({ id, ok: true });
}

/** 手动触发一次 job */
export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { jobId } = (await req.json()) as { jobId: string };
  const jobs = await db.select().from(schema.monitorJobs).where(eq(schema.monitorJobs.id, jobId)).limit(1);
  if (!jobs[0]) return NextResponse.json({ error: "not found" }, { status: 404 });
  const result = await runMonitorJob(jobId);
  return NextResponse.json(result);
}
