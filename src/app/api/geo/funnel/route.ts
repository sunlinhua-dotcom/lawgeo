import { NextResponse } from "next/server";
import { createGeoMvpFunnelRun, getGeoMvpFunnelRuns, summarizeGeoMvpFunnelRuns } from "@/lib/geo-mvp-funnel";

export async function GET() {
  const runs = getGeoMvpFunnelRuns(20);
  return NextResponse.json({
    status: "ok",
    summary: summarizeGeoMvpFunnelRuns(runs),
    runs,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const result = await createGeoMvpFunnelRun(body);
    return NextResponse.json({
      status: "ok",
      run: result.run,
      pack: {
        id: result.pack.id,
        status: result.pack.status,
        brandName: result.pack.brandEntity.name,
        serviceName: result.pack.serviceFactSheet.serviceName,
        metrics: result.pack.metrics,
      },
      citationRun: {
        id: result.citationRun.id,
        adapter: result.citationRun.adapter,
        metrics: result.citationRun.metrics,
      },
      liveAudit: {
        score: result.liveAudit.score,
        layers: result.liveAudit.layers,
        findings: result.liveAudit.findings.slice(0, 6),
      },
      report: {
        id: result.report.id,
        period: result.report.period,
        executiveSummary: result.report.executiveSummary,
        actionPlan: result.report.modules.actionPlan,
      },
      summary: summarizeGeoMvpFunnelRuns(),
    });
  } catch (error) {
    return NextResponse.json(
      { status: "error", error: error instanceof Error ? error.message : "failed to create GEO funnel run" },
      { status: 400 },
    );
  }
}
