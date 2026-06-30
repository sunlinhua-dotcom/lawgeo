import {
  drainQueuedCitationJobs,
  getCitationJobs,
  getCitationJobWorkerSummary,
  recoverStaleCitationJobs,
  summarizeCitationJobs,
} from "@/lib/geo-citation-jobs";

export const runtime = "nodejs";

export async function GET() {
  const jobs = getCitationJobs(100);
  return Response.json({
    status: "ok",
    worker: getCitationJobWorkerSummary(jobs),
    summary: summarizeCitationJobs(jobs),
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({} as { action?: string; limit?: number }));
  if (body.action === "drain") {
    const drained = drainQueuedCitationJobs(Number(body.limit ?? 1));
    return Response.json({
      status: "ok",
      action: "drain",
      drained,
      worker: getCitationJobWorkerSummary(),
    });
  }
  const recovered = recoverStaleCitationJobs();
  return Response.json({
    status: "ok",
    action: "recover",
    recovered,
    worker: getCitationJobWorkerSummary(),
  });
}
