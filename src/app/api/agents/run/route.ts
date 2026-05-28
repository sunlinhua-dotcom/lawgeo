import { NextResponse } from "next/server";
import { runAgent, type AgentId } from "@/lib/agents";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(req: Request) {
  const session = await getSession();
  const body = (await req.json()) as { agentId: AgentId; inputs: Record<string, string> };
  if (!body.agentId) return NextResponse.json({ error: "缺少 agentId" }, { status: 400 });
  const r = await runAgent(body.agentId, body.inputs ?? {}, session?.userId);
  return NextResponse.json(r);
}
