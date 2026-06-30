import { buildCitationTrend, getRecordedCitationRuns } from "@/lib/geo-citation";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get("limit") ?? "20");
  const runs = getRecordedCitationRuns(Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 50) : 20);
  return Response.json({
    status: "ok",
    summary: {
      runCount: runs.length,
      mimoRuns: runs.filter((run) => run.adapter === "mimo").length,
      deterministicRuns: runs.filter((run) => run.adapter === "deterministic").length,
    },
    trend: buildCitationTrend(runs),
    runs: runs.map((run) => ({
      id: run.id,
      adapter: run.adapter,
      completedAt: run.completedAt,
      provider: run.provider,
      platforms: run.platforms,
      metrics: run.metrics,
    })),
  });
}
