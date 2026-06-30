import { NextResponse } from "next/server";
import { getSearchMonitorArtifact } from "@/lib/geo-search-monitor";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ runId: string; artifactId: string }> },
) {
  const { runId, artifactId } = await context.params;
  const result = getSearchMonitorArtifact(runId, artifactId);
  if (!result) return NextResponse.json({ status: "error", error: "artifact not found" }, { status: 404 });
  return new NextResponse(result.html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "x-robots-tag": "noindex, nofollow",
      "x-geo-search-run": result.run.id,
      "x-geo-search-artifact": artifactId,
    },
  });
}
