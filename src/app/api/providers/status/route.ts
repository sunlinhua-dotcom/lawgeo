import { NextResponse } from "next/server";
import { providersOverview } from "@/lib/providers";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** 返回当前各能力使用的 provider（OSS 集成健康度） */
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json(providersOverview());
}
