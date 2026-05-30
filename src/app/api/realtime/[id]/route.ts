import { NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const search = (
    await db
      .select()
      .from(schema.realtimeSearches)
      .where(and(eq(schema.realtimeSearches.id, id), eq(schema.realtimeSearches.userId, session.userId)))
      .limit(1)
  )[0];
  if (!search) return NextResponse.json({ error: "not found" }, { status: 404 });
  const results = await db
    .select()
    .from(schema.realtimeResults)
    .where(eq(schema.realtimeResults.searchId, id))
    .orderBy(asc(schema.realtimeResults.createdAt));
  return NextResponse.json({ search, results });
}
