import { buildAiIndex, getGeoAssets } from "@/lib/geo-assets";
import { buildGeoLiveAudit } from "@/lib/geo-live-audit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function buildAudit(baseUrl: string) {
  const assets = getGeoAssets();
  const index = buildAiIndex(baseUrl);
  const layers = [
    {
      id: "crawled",
      label: "Crawled",
      score: 92,
      checks: ["robots.txt", "sitemap.xml", "公开核心页面", "HTTP Link alternate"],
      status: "healthy",
    },
    {
      id: "understood",
      label: "Understood",
      score: 88,
      checks: ["Markdown twin", "ai-index.json", "AI discovery JSON", "schema.org"],
      status: "healthy",
    },
    {
      id: "cited",
      label: "Cited",
      score: 62,
      checks: ["prompt fan-out", "外部提及", "内容新鲜度", "竞品来源"],
      status: "partial",
    },
    {
      id: "absorbed",
      label: "Absorbed",
      score: 58,
      checks: ["Evidence Blocks", "答案吸收检测", "drift 检测", "repair hints"],
      status: "partial",
    },
  ];

  const findings = [
    {
      id: "m1-markdown-twin",
      layer: "understood",
      severity: "info",
      reason: `已登记 ${assets.length} 个公开内容资产，并为每个资产生成 Markdown twin。`,
      sourceIds: ["GH-2", "GH-3"],
      fixPlan: "继续扩大到动态客户页面和用户生成的行业博客。",
    },
    {
      id: "llms-weight-boundary",
      layer: "crawled",
      severity: "info",
      reason: "llms.txt 已作为 AI 可读目录处理，不再作为排名承诺。",
      sourceIds: ["GOOG-1", "DATA-3", "RD-1"],
      fixPlan: "所有销售和诊断文案继续保持边界说明。",
    },
    {
      id: "citation-monitoring-pending",
      layer: "cited",
      severity: "info",
      reason: "已建立 Prompt Target Library 和 CitationRun deterministic runner，但仍需接入真实平台 adapter、定时任务和持久化。",
      sourceIds: ["GH-5", "DATA-1"],
      fixPlan: "下一阶段把 deterministic runner 接入 MIMO / 多平台真实查询链路，并保存历史快照。",
    },
    {
      id: "absorption-lab-pending",
      layer: "absorbed",
      severity: "info",
      reason: "已建立 evidence blocks、答案吸收评分和 AutoGEO 改写实验台基础版，但仍需接真实答案快照。",
      sourceIds: ["RES-4", "RES-5"],
      fixPlan: "把真实监测快照与 evidence blocks 对齐，输出长期趋势、missingBlocks 和 repairHints。",
    },
    {
      id: "rewrite-lab-basic",
      layer: "absorbed",
      severity: "info",
      reason: "已支持 baseline / structure / preference / conservative 四版本改写实验，并输出 GEO / GEU / Absorption 对比。",
      sourceIds: ["GH-6", "RES-2", "RES-6"],
      fixPlan: "下一阶段把 winner 候选接入真实 CitationRun 回归，再生成可导出客户报告。",
    },
  ];

  return {
    status: "ok",
    score: Math.round(layers.reduce((sum, layer) => sum + layer.score, 0) / layers.length),
    layers,
    findings,
    coverage: index.counts,
    updatedAt: index.generatedAt,
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const siteUrl = url.searchParams.get("siteUrl") || url.origin;
  const live = url.searchParams.get("live");
  if (live === "0" || live === "false") {
    return Response.json(buildAudit(url.origin));
  }
  try {
    return Response.json({
      ...buildAudit(url.origin),
      liveAudit: await buildGeoLiveAudit(siteUrl),
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "live audit failed" }, { status: 400 });
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const baseUrl = typeof body.siteUrl === "string" && body.siteUrl ? body.siteUrl : new URL(request.url).origin;
  try {
    return Response.json({
      brandId: body.brandId ?? "lawgeo",
      siteUrl: baseUrl,
      ...buildAudit(baseUrl),
      liveAudit: await buildGeoLiveAudit(baseUrl),
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "live audit failed" }, { status: 400 });
  }
}
