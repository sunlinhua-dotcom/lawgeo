import { and, eq, gte } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { yearMonth } from "@/lib/usage";
import { siteConfig } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function esc(s: string | null | undefined): string {
  if (!s) return "—";
  return s.replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]!));
}

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return new Response("unauthorized", { status: 401 });
  const url = new URL(req.url);
  const ym = url.searchParams.get("ym") ?? yearMonth();

  const [y, m] = ym.split("-").map(Number);
  const monthStart = new Date(y, m - 1, 1);
  const queries = await db
    .select()
    .from(schema.aiQueries)
    .where(
      and(
        eq(schema.aiQueries.userId, session.userId),
        gte(schema.aiQueries.queriedAt, monthStart),
      ),
    )
    .limit(5000);

  const drafts = await db
    .select()
    .from(schema.contentDrafts)
    .where(
      and(
        eq(schema.contentDrafts.userId, session.userId),
        gte(schema.contentDrafts.createdAt, monthStart),
      ),
    );

  const conversions = await db
    .select()
    .from(schema.conversionLinks)
    .where(eq(schema.conversionLinks.userId, session.userId));

  const total = queries.length;
  const cited = queries.filter((q) => q.cited).length;
  const top1 = queries.filter((q) => q.rank === 1).length;
  const top3 = queries.filter((q) => q.rank && q.rank <= 3).length;
  const citationRate = total > 0 ? Math.round((cited / total) * 1000) / 10 : 0;

  // 按平台聚合
  const byPlatform = new Map<string, { total: number; cited: number }>();
  for (const q of queries) {
    const cur = byPlatform.get(q.platform) ?? { total: 0, cited: 0 };
    cur.total++;
    if (q.cited) cur.cited++;
    byPlatform.set(q.platform, cur);
  }

  const totalClicks = conversions.reduce((s, c) => s + c.clicks, 0);
  const totalConv = conversions.reduce((s, c) => s + c.conversions, 0);
  const totalValue = conversions.reduce((s, c) => s + c.valueCents, 0) / 100;

  const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>${siteConfig.name} 月度全景报告 · ${ym}</title>
<style>
  @page { margin: 24mm 16mm; }
  body { font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif; color: #0f172a; line-height: 1.7; max-width: 900px; margin: 0 auto; padding: 24px; }
  h1 { font-size: 32px; margin: 0; background: linear-gradient(135deg, #6366f1, #8b5cf6, #d946ef); -webkit-background-clip: text; background-clip: text; color: transparent; }
  h2 { font-size: 22px; margin: 32px 0 12px; padding-bottom: 8px; border-bottom: 2px solid #6366f1; }
  h3 { font-size: 16px; margin: 16px 0 8px; }
  .header { display: flex; justify-content: space-between; align-items: end; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0; }
  .meta { color: #64748b; font-size: 13px; }
  .stats { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px; margin: 24px 0; }
  .stat { padding: 16px; background: linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%); border-radius: 12px; }
  .stat-value { font-size: 32px; font-weight: bold; color: #6366f1; }
  .stat-label { font-size: 12px; color: #64748b; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; }
  th { background: #f8fafc; padding: 8px 12px; text-align: left; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
  td { padding: 10px 12px; border-top: 1px solid #f1f5f9; font-size: 14px; }
  .badge-emerald { background: #d1fae5; color: #065f46; padding: 2px 8px; border-radius: 999px; font-size: 11px; }
  .badge-amber { background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 999px; font-size: 11px; }
  .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px; text-align: center; }
  .verified { background: linear-gradient(135deg, #d1fae5, #a7f3d0); padding: 16px 20px; border-radius: 12px; margin: 16px 0; }
  .print { position: fixed; top: 16px; right: 16px; padding: 8px 16px; background: #6366f1; color: white; border: none; border-radius: 8px; cursor: pointer; }
  @media print { .print { display: none; } }
</style>
</head>
<body>
<button class="print" onclick="window.print()">打印 / 另存为 PDF</button>

<div class="header">
  <div>
    <h1>${siteConfig.name} 月度全景报告</h1>
    <div class="meta">报告周期：${ym} · ${esc(session.email)}</div>
  </div>
  <div class="meta">生成时间：${new Date().toLocaleString("zh-CN")}</div>
</div>

<h2>1. 本月核心数据</h2>
<div class="stats">
  <div class="stat"><div class="stat-value">${total}</div><div class="stat-label">查询总数</div></div>
  <div class="stat"><div class="stat-value">${citationRate}%</div><div class="stat-label">引用率</div></div>
  <div class="stat"><div class="stat-value">${top1}</div><div class="stat-label">Top 1 推荐</div></div>
  <div class="stat"><div class="stat-value">${top3}</div><div class="stat-label">Top 3 推荐</div></div>
</div>

<h2>2. 各 AI 平台引用对比</h2>
<table>
  <thead><tr><th>平台</th><th>查询数</th><th>被引用</th><th>引用率</th></tr></thead>
  <tbody>
    ${Array.from(byPlatform.entries())
      .map(([p, v]) => {
        const rate = v.total > 0 ? Math.round((v.cited / v.total) * 100) : 0;
        return `<tr><td>${esc(p)}</td><td>${v.total}</td><td>${v.cited}</td><td><span class="${rate >= 50 ? "badge-emerald" : "badge-amber"}">${rate}%</span></td></tr>`;
      })
      .join("")}
  </tbody>
</table>

<h2>3. 内容生成</h2>
<p>本月共生成 <strong>${drafts.length}</strong> 篇 GEO 友好内容。</p>
${
  drafts.length > 0
    ? `<table><thead><tr><th>类型</th><th>标题</th><th>日期</th></tr></thead><tbody>${drafts
        .slice(0, 20)
        .map(
          (d) =>
            `<tr><td><span class="badge-emerald">${d.format.toUpperCase()}</span></td><td>${esc(d.title)}</td><td>${new Date(d.createdAt).toLocaleDateString("zh-CN")}</td></tr>`,
        )
        .join("")}</tbody></table>`
    : ""
}

<h2>4. 转化追踪</h2>
<div class="stats">
  <div class="stat"><div class="stat-value">${totalClicks}</div><div class="stat-label">总点击</div></div>
  <div class="stat"><div class="stat-value">${totalConv}</div><div class="stat-label">总转化</div></div>
  <div class="stat"><div class="stat-value">${totalClicks > 0 ? ((totalConv / totalClicks) * 100).toFixed(1) : 0}%</div><div class="stat-label">CVR</div></div>
  <div class="stat"><div class="stat-value">¥${totalValue.toLocaleString()}</div><div class="stat-label">归因价值</div></div>
</div>

<div class="verified">
  ✅ <strong>第三方数据核验</strong>：本报告所有数据来自 ${siteConfig.name} 监测系统完整日志，包含时间戳、平台、查询语句、返回内容、品牌位置全字段。支持 CSV / JSON 导出供第三方审计。
</div>

<h2>5. 下月建议</h2>
<ul>
  ${citationRate < 30 ? "<li>📌 引用率偏低，建议优先补 FAQ 与首段直答结构。</li>" : ""}
  ${top1 < 5 ? "<li>📌 Top 1 推荐次数较少，建议加强权威信源建设与多平台共现。</li>" : ""}
  ${drafts.length < 10 ? "<li>📌 本月生成内容偏少，建议每周至少生成 5 篇覆盖不同意图。</li>" : ""}
  <li>📌 持续监测竞品在 AI 平台的表现，动态调整内容策略。</li>
  <li>📌 把表现最好的 3–5 个意图簇深度运营，让 Top 1 占比稳定 80% 以上。</li>
</ul>

<div class="footer">
  ${siteConfig.name} · ${siteConfig.url} · ${siteConfig.contact.email}<br>
  本报告由 ${siteConfig.name} 自动生成，数据透明可审计。
</div>

</body>
</html>`;

  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
