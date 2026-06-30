import { createCitationRun, getRecordedCitationRuns } from "@/lib/geo-citation";
import { buildAiIndex, getGeoAssets } from "@/lib/geo-assets";
import { buildPromptTargets, summarizePromptTargets } from "@/lib/geo-prompts";
import { createRewriteExperiment } from "@/lib/geo-rewrite";
import { buildSourceMentions, summarizeSourceMentions } from "@/lib/geo-source-mentions";
import { siteConfig } from "@/lib/site";

export interface GeoMonthlyReport {
  id: string;
  brandId: string;
  brandName: string;
  period: string;
  dateRange: {
    from: string;
    to: string;
    source: "period" | "query";
  };
  pdfProfile: "zh-cjk-type0";
  generatedAt: string;
  executiveSummary: {
    selectionRate: number;
    absorptionRate: number;
    top3Rate: number;
    followupHitRate: number;
    sourceDiversity: number;
    rewriteDelta: number;
  };
  modules: {
    promptPerformance: Array<{
      tier: string;
      promptCount: number;
      fanoutCoverage: number;
    }>;
    contentAssetScore: Array<{
      assetId: string;
      title: string;
      crawl: number;
      understand: number;
      cite: number;
      absorb: number;
    }>;
    sourceInfluenceMap: Array<{
      type: string;
      count: number;
      cited: number;
    }>;
    rewriteExperiment: {
      id: string;
      winner: string;
      beforeScore: number;
      afterScore: number;
      delta: number;
    };
    actionPlan: string[];
  };
  markdown: string;
}

const REPORT_TIME = "2026-05-31T00:39:00.000Z";

function stableId(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) hash = (hash * 41 + input.charCodeAt(i)) >>> 0;
  return hash.toString(36);
}

function percent(numerator: number, denominator: number) {
  return denominator ? Math.round((numerator / denominator) * 100) : 0;
}

function isDateLike(value?: string) {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

function buildDateRange(period: string, dateFrom?: string, dateTo?: string): GeoMonthlyReport["dateRange"] {
  if (isDateLike(dateFrom) && isDateLike(dateTo)) {
    return { from: dateFrom!, to: dateTo!, source: "query" };
  }
  const [year, month] = period.split("-").map((item) => Number(item));
  if (Number.isFinite(year) && Number.isFinite(month) && month >= 1 && month <= 12) {
    const from = `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-01`;
    const toDate = new Date(Date.UTC(year, month, 0));
    const to = `${toDate.getUTCFullYear()}-${String(toDate.getUTCMonth() + 1).padStart(2, "0")}-${String(toDate.getUTCDate()).padStart(2, "0")}`;
    return { from, to, source: "period" };
  }
  return { from: "2026-05-01", to: "2026-05-31", source: "period" };
}

function buildMarkdown(report: Omit<GeoMonthlyReport, "markdown">) {
  const lines = [
    `# ${report.brandName} GEO 引用工程月报`,
    "",
    `- 周期: ${report.period}`,
    `- 日期范围: ${report.dateRange.from} 至 ${report.dateRange.to}`,
    `- 生成时间: ${report.generatedAt}`,
    `- 报告 ID: ${report.id}`,
    "",
    "## Executive Summary",
    "",
    `- Selection Rate: ${report.executiveSummary.selectionRate}%`,
    `- Absorption Rate: ${report.executiveSummary.absorptionRate}%`,
    `- Top3 Rate: ${report.executiveSummary.top3Rate}%`,
    `- Conversion Follow-up Hit: ${report.executiveSummary.followupHitRate}%`,
    `- Source Diversity: ${report.executiveSummary.sourceDiversity} 类`,
    `- Rewrite Delta: +${report.executiveSummary.rewriteDelta} pts`,
    "",
    "## Prompt Performance",
    "",
    "| Tier | Prompts | Fan-out Coverage |",
    "|---|---:|---:|",
    ...report.modules.promptPerformance.map((row) => `| ${row.tier} | ${row.promptCount} | ${row.fanoutCoverage}% |`),
    "",
    "## Content Asset Score",
    "",
    "| Asset | Crawl | Understand | Cite | Absorb |",
    "|---|---:|---:|---:|---:|",
    ...report.modules.contentAssetScore.map((row) => `| ${row.title} | ${row.crawl} | ${row.understand} | ${row.cite} | ${row.absorb} |`),
    "",
    "## Source Influence Map",
    "",
    "| Source Type | Count | AI Cited |",
    "|---|---:|---:|",
    ...report.modules.sourceInfluenceMap.map((row) => `| ${row.type} | ${row.count} | ${row.cited} |`),
    "",
    "## Rewrite Experiment",
    "",
    `- Experiment: ${report.modules.rewriteExperiment.id}`,
    `- Winner: ${report.modules.rewriteExperiment.winner}`,
    `- Before / After: ${report.modules.rewriteExperiment.beforeScore} -> ${report.modules.rewriteExperiment.afterScore}`,
    `- Delta: +${report.modules.rewriteExperiment.delta}`,
    "",
    "## Action Plan",
    "",
    ...report.modules.actionPlan.map((item) => `- ${item}`),
  ];
  return `${lines.join("\n").trim()}\n`;
}

function escapeHtml(value: string | number) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]!));
}

export function renderGeoMonthlyReportHtml(report: GeoMonthlyReport) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(report.brandName)} GEO 引用工程月报 · ${escapeHtml(report.period)}</title>
<style>
  @page { margin: 18mm 14mm; }
  body { margin: 0 auto; max-width: 980px; padding: 32px 24px; color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif; line-height: 1.65; background: #fff; }
  h1 { margin: 0; font-size: 30px; letter-spacing: 0; }
  h2 { margin: 34px 0 12px; font-size: 19px; border-bottom: 1px solid #dbe3ef; padding-bottom: 8px; }
  .muted { color: #64748b; font-size: 13px; }
  .print { position: fixed; top: 18px; right: 18px; border: 1px solid #dbe3ef; background: #fff; border-radius: 8px; padding: 8px 12px; cursor: pointer; }
  .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 22px; }
  .card { border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; background: #f8fafc; }
  .label { color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: .04em; }
  .value { font-size: 28px; font-weight: 700; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; margin: 10px 0 18px; font-size: 13px; }
  th { color: #64748b; text-align: left; text-transform: uppercase; font-size: 11px; letter-spacing: .04em; background: #f8fafc; }
  th, td { padding: 9px 10px; border-top: 1px solid #e2e8f0; vertical-align: top; }
  .num { text-align: right; font-variant-numeric: tabular-nums; }
  .actions li { margin: 8px 0; }
  @media print { .print { display: none; } body { max-width: none; padding: 0; } }
</style>
</head>
<body>
<button class="print" onclick="window.print()">打印 / 另存为 PDF</button>
<header>
  <h1>${escapeHtml(report.brandName)} GEO 引用工程月报</h1>
  <div class="muted">周期：${escapeHtml(report.period)} · 日期范围：${escapeHtml(report.dateRange.from)} 至 ${escapeHtml(report.dateRange.to)} · 生成时间：${escapeHtml(report.generatedAt)} · 报告 ID：${escapeHtml(report.id)}</div>
</header>
<section class="summary">
  <div class="card"><div class="label">Selection</div><div class="value">${report.executiveSummary.selectionRate}%</div></div>
  <div class="card"><div class="label">Absorption</div><div class="value">${report.executiveSummary.absorptionRate}%</div></div>
  <div class="card"><div class="label">Top3</div><div class="value">${report.executiveSummary.top3Rate}%</div></div>
  <div class="card"><div class="label">Follow-up</div><div class="value">${report.executiveSummary.followupHitRate}%</div></div>
  <div class="card"><div class="label">Source Diversity</div><div class="value">${report.executiveSummary.sourceDiversity} 类</div></div>
  <div class="card"><div class="label">Rewrite Delta</div><div class="value">+${report.executiveSummary.rewriteDelta}</div></div>
</section>
<h2>Prompt Performance</h2>
<table><thead><tr><th>Tier</th><th class="num">Prompts</th><th class="num">Fan-out Coverage</th></tr></thead><tbody>
${report.modules.promptPerformance.map((row) => `<tr><td>${escapeHtml(row.tier)}</td><td class="num">${row.promptCount}</td><td class="num">${row.fanoutCoverage}%</td></tr>`).join("")}
</tbody></table>
<h2>Content Asset Score</h2>
<table><thead><tr><th>Asset</th><th class="num">Crawl</th><th class="num">Understand</th><th class="num">Cite</th><th class="num">Absorb</th></tr></thead><tbody>
${report.modules.contentAssetScore.map((row) => `<tr><td>${escapeHtml(row.title)}</td><td class="num">${row.crawl}</td><td class="num">${row.understand}</td><td class="num">${row.cite}</td><td class="num">${row.absorb}</td></tr>`).join("")}
</tbody></table>
<h2>Source Influence Map</h2>
<table><thead><tr><th>Source Type</th><th class="num">Count</th><th class="num">AI Cited</th></tr></thead><tbody>
${report.modules.sourceInfluenceMap.map((row) => `<tr><td>${escapeHtml(row.type)}</td><td class="num">${row.count}</td><td class="num">${row.cited}</td></tr>`).join("")}
</tbody></table>
<h2>Rewrite Experiment</h2>
<div class="card">
  <div><strong>${escapeHtml(report.modules.rewriteExperiment.winner)}</strong></div>
  <div class="muted">${escapeHtml(report.modules.rewriteExperiment.id)} · ${report.modules.rewriteExperiment.beforeScore} -> ${report.modules.rewriteExperiment.afterScore} · +${report.modules.rewriteExperiment.delta}</div>
</div>
<h2>Action Plan</h2>
<ul class="actions">
${report.modules.actionPlan.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
</ul>
</body>
</html>`;
}

function pdfHex(value: string | number) {
  const hex = Array.from(String(value)).map((char) => {
    const code = char.codePointAt(0) ?? 32;
    const safeCode = code > 0xffff ? 0x003f : code;
    return safeCode.toString(16).padStart(4, "0");
  }).join("");
  return `<${hex}>`;
}

function pdfLine(label: string, value: string | number) {
  return `${label}：${value}`;
}

function wrapPdfLine(line: string, width = 32) {
  const chars = Array.from(line.replace(/\s+/g, " ").trim());
  if (chars.length <= width) return [chars.join("")];
  const rows: string[] = [];
  for (let i = 0; i < chars.length; i += width) rows.push(chars.slice(i, i + width).join(""));
  return rows;
}

export function renderGeoMonthlyReportPdf(report: GeoMonthlyReport) {
  const contentLines = [
    `${report.brandName} GEO 引用工程月报`,
    pdfLine("周期", report.period),
    pdfLine("日期范围", `${report.dateRange.from} 至 ${report.dateRange.to}`),
    pdfLine("生成时间", report.generatedAt),
    pdfLine("报告 ID", report.id),
    "",
    "执行摘要",
    pdfLine("Selection Rate", `${report.executiveSummary.selectionRate}%`),
    pdfLine("Absorption Rate", `${report.executiveSummary.absorptionRate}%`),
    pdfLine("Top3 Rate", `${report.executiveSummary.top3Rate}%`),
    pdfLine("Conversion Follow-up Hit", `${report.executiveSummary.followupHitRate}%`),
    pdfLine("Source Diversity", `${report.executiveSummary.sourceDiversity} 类`),
    pdfLine("Rewrite Delta", `+${report.executiveSummary.rewriteDelta} pts`),
    "",
    "Prompt Performance",
    ...report.modules.promptPerformance.slice(0, 8).map((row) => `${row.tier}：${row.promptCount} 个 prompt，fan-out 覆盖 ${row.fanoutCoverage}%`),
    "",
    "Source Influence Map",
    ...report.modules.sourceInfluenceMap.slice(0, 8).map((row, index) => `信源 ${index + 1}：${row.type}，${row.count} 条记录，${row.cited} 条被 AI 引用`),
    "",
    "Action Plan",
    ...report.modules.actionPlan.map((item, index) => `${index + 1}. ${item}`),
  ].flatMap((line) => wrapPdfLine(line)).slice(0, 46);

  const stream = [
    "BT",
    "/F1 16 Tf",
    "72 770 Td",
    `${pdfHex(contentLines[0] ?? "GEO 引用工程月报")} Tj`,
    "/F1 10 Tf",
    ...contentLines.slice(1).map((line) => `0 -16 Td ${pdfHex(line)} Tj`),
    "ET",
  ].join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 7 0 R >>",
    "<< /Type /Font /Subtype /Type0 /BaseFont /STSong-Light /Encoding /UniGB-UCS2-H /DescendantFonts [5 0 R] >>",
    "<< /Type /Font /Subtype /CIDFontType0 /BaseFont /STSong-Light /CIDSystemInfo << /Registry (Adobe) /Ordering (GB1) /Supplement 2 >> /FontDescriptor 6 0 R /DW 1000 >>",
    "<< /Type /FontDescriptor /FontName /STSong-Light /Flags 4 /FontBBox [-260 -200 1000 900] /ItalicAngle 0 /Ascent 880 /Descent -120 /CapHeight 700 /StemV 80 >>",
    `<< /Length ${Buffer.byteLength(stream, "utf8")} >>\nstream\n${stream}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (const [index, object] of objects.entries()) {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  }
  const xref = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets.slice(1)) {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf, "utf8");
}

export function buildGeoMonthlyReport({
  brandId = "lawgeo",
  brandName = siteConfig.name,
  period = "2026-05",
  baseUrl = siteConfig.url,
  dateFrom,
  dateTo,
}: {
  brandId?: string;
  brandName?: string;
  period?: string;
  baseUrl?: string;
  dateFrom?: string;
  dateTo?: string;
} = {}): GeoMonthlyReport {
  const assets = getGeoAssets();
  const aiIndex = buildAiIndex(baseUrl);
  const prompts = buildPromptTargets({ brandId, brandName, limit: 100 });
  const promptSummary = summarizePromptTargets(prompts);
  const citationRun = getRecordedCitationRuns(1)[0] ?? createCitationRun({ brandId, brandName, baseUrl, promptLimit: 100, snapshotPromptLimit: 8 });
  const sourceMentions = buildSourceMentions({ brandId, minimum: 20 });
  const sourceSummary = summarizeSourceMentions(sourceMentions);
  const rewrite = createRewriteExperiment({ brandId, brandName, baseUrl, assetPath: "/cases/cosmetics", platform: "gpt" });
  const byTier = Object.entries(promptSummary.byTier).map(([tier, promptCount]) => ({
    tier,
    promptCount,
    fanoutCoverage: promptSummary.coverageRate,
  }));
  const sourceInfluenceMap = Object.entries(sourceSummary.byType).map(([type, count]) => ({
    type,
    count,
    cited: sourceMentions.filter((mention) => mention.type === type && mention.aiCited).length,
  }));
  const reportWithoutMarkdown: Omit<GeoMonthlyReport, "markdown"> = {
    id: `gr-${stableId(`${brandId}:${period}:${citationRun.id}:${rewrite.id}`)}`,
    brandId,
    brandName,
    period,
    dateRange: buildDateRange(period, dateFrom, dateTo),
    pdfProfile: "zh-cjk-type0",
    generatedAt: REPORT_TIME,
    executiveSummary: {
      selectionRate: percent(citationRun.metrics.mentioned, citationRun.metrics.totalSnapshots),
      absorptionRate: percent(citationRun.metrics.absorbed, citationRun.metrics.totalSnapshots),
      top3Rate: percent(citationRun.metrics.top3, citationRun.metrics.totalSnapshots),
      followupHitRate: percent(citationRun.metrics.followupHit, citationRun.metrics.totalSnapshots),
      sourceDiversity: sourceSummary.sourceDiversity,
      rewriteDelta: rewrite.metrics.delta,
    },
    modules: {
      promptPerformance: byTier,
      contentAssetScore: assets.slice(0, 8).map((asset) => ({
        assetId: asset.id,
        title: asset.title,
        crawl: 92,
        understand: asset.evidence.length >= 3 ? 90 : 82,
        cite: asset.priority >= 0.9 ? 78 : 68,
        absorb: Math.min(95, 60 + asset.evidence.length * 8),
      })),
      sourceInfluenceMap,
      rewriteExperiment: {
        id: rewrite.id,
        winner: rewrite.winner.label,
        beforeScore: rewrite.metrics.beforeScore,
        afterScore: rewrite.metrics.afterScore,
        delta: rewrite.metrics.delta,
      },
      actionPlan: [
        `把 ${aiIndex.counts.assets} 个内容资产继续扩展到动态客户页面和用户生成行业博客。`,
        citationRun.adapter === "mimo"
          ? "继续扩大 MIMO CitationRun 的 prompt 和平台覆盖，并把低吸收回答进入修复队列。"
          : "把 deterministic CitationRun 接入 MIMO / 多平台真实查询链路，并保存历史快照。",
        "对低 GEU 或低 Absorption 的改写候选先进入人工复核，不直接发布。",
        `补齐至少 ${Math.max(0, 20 - sourceSummary.total)} 个外部可信信源记录，并优先处理 Reddit、知乎、LinkedIn、目录站和行业媒体。`,
        "生成下月 before/after 对比，追踪 selection、absorption、Top3、followupHit 和 source diversity。",
      ],
    },
  };
  return { ...reportWithoutMarkdown, markdown: buildMarkdown(reportWithoutMarkdown) };
}
