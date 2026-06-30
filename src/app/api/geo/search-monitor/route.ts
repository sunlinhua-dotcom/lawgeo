import { NextResponse } from "next/server";
import { createSearchMonitorRun, getSearchMonitorRuns, summarizeSearchMonitorRuns } from "@/lib/geo-search-monitor";

export const dynamic = "force-dynamic";

export async function GET() {
  const runs = getSearchMonitorRuns(20);
  return NextResponse.json({
    status: "ok",
    summary: summarizeSearchMonitorRuns(runs),
    runs,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const run = await createSearchMonitorRun(body);
    return NextResponse.json({
      status: "ok",
      run,
      summary: summarizeSearchMonitorRuns(),
    });
  } catch (error) {
    return NextResponse.json(
      { status: "error", error: error instanceof Error ? error.message : "failed to create search monitor run" },
      { status: 400 },
    );
  }
}
