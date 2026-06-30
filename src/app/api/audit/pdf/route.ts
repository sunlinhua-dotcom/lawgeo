import { runAudit } from "@/lib/audit";
import { siteConfig } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const domain = url.searchParams.get("d") ?? url.searchParams.get("domain");
  if (!domain) return new Response("missing ?d=", { status: 400 });
  const r = await runAudit(domain);

  const colorFor = (s: string) => (s === "pass" ? "#10b981" : s === "warn" ? "#f59e0b" : "#ef4444");
  const iconFor = (s: string) => (s === "pass" ? "✓" : s === "warn" ? "!" : "×");

  const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>BrandGEO 诊断报告 · ${r.domain}</title>
<style>
  @page { margin: 24mm 16mm; }
  body { font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif; color: #0f172a; line-height: 1.7; max-width: 900px; margin: 0 auto; padding: 24px; }
  h1 { font-size: 28px; margin: 0 0 4px; }
  h2 { font-size: 20px; margin: 32px 0 12px; padding-bottom: 6px; border-bottom: 2px solid #6366f1; }
  .header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0; }
  .brand { font-weight: 700; color: #6366f1; font-size: 18px; }
  .score-card { display: flex; align-items: center; gap: 24px; margin: 24px 0; padding: 24px; background: linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%); border-radius: 16px; }
  .score-circle { width: 96px; height: 96px; border-radius: 50%; background: white; display: grid; place-items: center; font-size: 36px; font-weight: bold; color: ${r.score >= 80 ? "#10b981" : r.score >= 60 ? "#f59e0b" : r.score >= 40 ? "#f97316" : "#ef4444"}; border: 6px solid currentColor; }
  .verdict { font-size: 22px; font-weight: 600; }
  .summary { color: #475569; margin-top: 6px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 16px 0; }
  .check { display: flex; gap: 10px; padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 13px; }
  .check-icon { width: 20px; height: 20px; border-radius: 50%; display: grid; place-items: center; color: white; font-weight: bold; flex-shrink: 0; }
  .label { font-weight: 600; }
  .detail { color: #64748b; font-size: 12px; margin-top: 2px; word-break: break-all; }
  .suggestions { background: #eef2ff; border-left: 4px solid #6366f1; padding: 16px 20px; border-radius: 8px; margin: 16px 0; }
  .suggestions ol { padding-left: 20px; }
  .suggestions li { margin: 6px 0; color: #1e293b; }
  .meta { background: #f8fafc; padding: 12px 16px; border-radius: 8px; font-size: 13px; }
  .meta-row { display: flex; padding: 4px 0; border-bottom: 1px dashed #e2e8f0; }
  .meta-row:last-child { border: none; }
  .meta-label { color: #64748b; min-width: 120px; }
  .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px; text-align: center; }
  .badge { display: inline-block; padding: 2px 8px; background: #e0e7ff; color: #4338ca; border-radius: 999px; font-size: 11px; margin-right: 4px; }
  .print { position: fixed; top: 16px; right: 16px; padding: 8px 16px; background: #6366f1; color: white; border: none; border-radius: 8px; cursor: pointer; }
  @media print { .print { display: none; } }
</style>
</head>
<body>
<button class="print" onclick="window.print()">打印 / 另存为 PDF</button>

<div class="header">
  <div>
    <h1>GEO 诊断报告</h1>
    <div style="color:#64748b; margin-top:4px;">${r.url}</div>
  </div>
  <div class="brand">${siteConfig.name}</div>
</div>

<div class="score-card">
  <div class="score-circle">${r.score}</div>
  <div>
    <div class="verdict">${r.verdict}</div>
    <div class="summary">${r.summary}</div>
    <div style="margin-top:8px; font-size:12px; color:#64748b;">
      诊断时间：${r.scannedAt} · 耗时 ${r.elapsedMs}ms
    </div>
  </div>
</div>

<h2>🎯 优先优化建议</h2>
<div class="suggestions">
  <ol>
    ${r.suggestions.map((s) => `<li>${escape(s)}</li>`).join("")}
  </ol>
</div>

<h2>📋 详细检查 (${r.checks.length} 项)</h2>
<div class="grid">
  ${r.checks
    .map(
      (c) => `
    <div class="check">
      <div class="check-icon" style="background:${colorFor(c.status)};">${iconFor(c.status)}</div>
      <div>
        <div class="label">${escape(c.label)} <span class="badge">${c.weight}分</span></div>
        <div class="detail">${escape(c.detail)}</div>
      </div>
    </div>
  `,
    )
    .join("")}
</div>

<h2>📦 页面元数据</h2>
<div class="meta">
  <div class="meta-row"><div class="meta-label">Title</div><div>${escape(r.meta.title ?? "—")}</div></div>
  <div class="meta-row"><div class="meta-label">Description</div><div>${escape(r.meta.description ?? "—")}</div></div>
  <div class="meta-row"><div class="meta-label">语言</div><div>${escape(r.meta.lang ?? "—")}</div></div>
  <div class="meta-row"><div class="meta-label">canonical</div><div>${escape(r.meta.canonical ?? "—")}</div></div>
  <div class="meta-row"><div class="meta-label">H1 / OG / Twitter</div><div>${r.meta.h1Count} / ${r.meta.ogTags} / ${r.meta.twitterTags}</div></div>
  <div class="meta-row"><div class="meta-label">已发现 schema</div><div>${r.schemas.found.length === 0 ? "—" : r.schemas.found.map((t) => `<span class="badge">${t}</span>`).join("")}</div></div>
  <div class="meta-row"><div class="meta-label">建议补全 schema</div><div>${r.schemas.missing.map((t) => `<span class="badge" style="background:#fef3c7; color:#92400e;">${t}</span>`).join("")}</div></div>
</div>

<div class="footer">
  本报告由 ${siteConfig.name} 自动生成 · ${siteConfig.url}<br>
  GEO 诊断只是开始，预约 1v1 顾问获取定制方案：${siteConfig.contact.email}
</div>

</body>
</html>`;

  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function escape(s: string) {
  return s.replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]!));
}
