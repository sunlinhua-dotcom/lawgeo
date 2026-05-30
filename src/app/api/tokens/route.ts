import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getWallet, listLedgers, rechargeTokens } from "@/lib/tokens";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const [wallet, ledgers] = await Promise.all([getWallet(session.userId), listLedgers(session.userId, 100)]);
  return NextResponse.json({ wallet, ledgers });
}

/** 演示充值（生产应接支付） */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { amount } = (await req.json()) as { amount: number };
  const amt = Math.max(0, Math.min(10_000_000, Math.round(amount || 0)));
  if (amt <= 0) return NextResponse.json({ error: "金额无效" }, { status: 400 });
  await rechargeTokens(session.userId, amt, "演示充值");
  return NextResponse.json({ ok: true });
}
