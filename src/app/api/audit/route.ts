import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { runAudit } from "@/lib/audit";
import { db, schema } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function persistAudit(r: Awaited<ReturnType<typeof runAudit>>) {
  try {
    await db.insert(schema.audits).values({
      id: randomUUID(),
      domain: r.domain,
      score: r.score,
      breakdown: JSON.stringify({ checks: r.checks, geoSignals: r.geoSignals, schemas: r.schemas, meta: r.meta }),
      suggestions: JSON.stringify(r.suggestions),
    });
  } catch (e) {
    console.warn("[audit] persist failed:", e);
  }
}

export async function POST(req: Request) {
  let body: { domain?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const domain = (body.domain ?? "").trim();
  if (!domain) {
    return NextResponse.json({ error: "缺少 domain 参数" }, { status: 400 });
  }
  if (!/^[a-z0-9.\-]+\.[a-z]{2,}/i.test(domain.replace(/^https?:\/\//, ""))) {
    return NextResponse.json({ error: "域名格式无效" }, { status: 400 });
  }
  try {
    const result = await runAudit(domain);
    void persistAudit(result);
    return NextResponse.json(result, {
      headers: { "cache-control": "public, max-age=300" },
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "audit failed" },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const d = url.searchParams.get("d") ?? url.searchParams.get("domain");
  if (!d) return NextResponse.json({ error: "missing ?d=" }, { status: 400 });
  const result = await runAudit(d);
  void persistAudit(result);
  return NextResponse.json(result);
}
