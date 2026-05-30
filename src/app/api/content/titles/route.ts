import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { ask } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** 根据意图词生成候选标题 */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { intent, brandName } = (await req.json()) as { intent: string; brandName?: string };
  if (!intent?.trim()) return NextResponse.json({ error: "缺少意图词" }, { status: 400 });

  try {
    const r = await ask({
      system:
        "你是 GEO 标题专家。根据意图词生成 5 个最容易被 AI 引用、又吸引点击的中文标题。标题含关键词、30 字以内、围绕用户真实问题。严格输出 JSON 数组，如 [\"...\",\"...\"]，只输出 JSON。",
      prompt: `意图词：${intent}${brandName ? `\n品牌：${brandName}` : ""}`,
      temperature: 0.7,
    });
    const m = r.text.match(/\[[\s\S]*\]/);
    const titles = m ? (JSON.parse(m[0]) as string[]).slice(0, 5) : [];
    return NextResponse.json({ titles });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "失败" }, { status: 500 });
  }
}
