import { NextResponse } from "next/server";
import { runAllDue } from "@/lib/cron";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Vercel Cron 入口。在 vercel.json 里配 schedule。
 * 本地可用 curl 触发。
 * 鉴权：Authorization: Bearer $CRON_SECRET
 */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const results = await runAllDue();
  return NextResponse.json({ ok: true, ran: results.length, results });
}

export async function POST(req: Request) {
  return GET(req);
}
