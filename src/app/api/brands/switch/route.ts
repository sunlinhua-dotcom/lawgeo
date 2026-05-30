import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { BRAND_COOKIE } from "@/lib/brand";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { brandId } = (await req.json()) as { brandId: string };
  const res = NextResponse.json({ ok: true });
  res.cookies.set(BRAND_COOKIE, brandId, { path: "/", httpOnly: false, sameSite: "lax", maxAge: 31536000 });
  return res;
}
