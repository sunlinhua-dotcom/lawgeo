import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { ingestDocument } from "@/lib/rag";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * QA 批量导入：粘贴 Excel/CSV（每行「问题<tab/逗号>答案」）→ 转成知识库文档。
 */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { title, raw } = (await req.json()) as { title?: string; raw: string };
  if (!raw?.trim()) return NextResponse.json({ error: "缺少内容" }, { status: 400 });

  // 解析每行：tab 或逗号或「｜」分隔
  const pairs: Array<{ q: string; a: string }> = [];
  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim();
    if (!t) continue;
    const m = t.split(/\t|，,|｜|\|/).map((s) => s.trim()).filter(Boolean);
    if (m.length >= 2) pairs.push({ q: m[0], a: m.slice(1).join(" ") });
    else if (m.length === 1 && pairs.length > 0) pairs[pairs.length - 1].a += " " + m[0];
  }
  if (pairs.length === 0) return NextResponse.json({ error: "未解析到问答对（用 Tab 或逗号分隔问/答）" }, { status: 400 });

  // 拼成 markdown 文档入库
  const md = pairs.map((p) => `## ${p.q}\n${p.a}`).join("\n\n");
  const result = await ingestDocument({
    userId: session.userId,
    title: title?.trim() || `问答导入 ${pairs.length} 条`,
    text: md,
    sourceType: "manual",
  });

  return NextResponse.json({ ok: true, pairs: pairs.length, ...result });
}
