import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const jobs = await db
    .select()
    .from(schema.bulkJobs)
    .where(and(eq(schema.bulkJobs.id, id), eq(schema.bulkJobs.userId, session.userId)))
    .limit(1);
  if (jobs.length === 0) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ job: jobs[0] });
}
