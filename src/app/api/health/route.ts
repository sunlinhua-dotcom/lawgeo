import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Health probe for Zeabur / Kubernetes / uptime monitors.
 * Returns 200 only when SQLite responds.
 */
export async function GET() {
  try {
    await db.run(sql`SELECT 1`);
    return NextResponse.json({
      ok: true,
      service: "lawgeo",
      time: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "db not reachable" },
      { status: 503 },
    );
  }
}
