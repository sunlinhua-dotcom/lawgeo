import {
  createCitationJob,
  getCitationJobs,
  getCitationJobWorkerSummary,
  normalizeCitationJobRequest,
  summarizeCitationJobs,
} from "@/lib/geo-citation-jobs";

export const runtime = "nodejs";

function platformIdsFrom(value: FormDataEntryValue | string | null) {
  if (!value) return undefined;
  return String(value).split(",").map((item) => item.trim()).filter(Boolean);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get("limit") ?? "20");
  const jobs = getCitationJobs(Number.isFinite(limit) ? limit : 20);
  return Response.json({
    summary: summarizeCitationJobs(jobs),
    worker: getCitationJobWorkerSummary(jobs),
    jobs,
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const job = createCitationJob(
    normalizeCitationJobRequest({
      adapter: body.adapter,
      brandId: body.brandId,
      brandName: body.brandName,
      baseUrl: body.baseUrl,
      platformIds: Array.isArray(body.platforms) ? body.platforms : platformIdsFrom(body.platforms),
      promptLimit: Number(body.promptLimit),
      snapshotPromptLimit: Number(body.snapshotPromptLimit),
      seedKeywords: Array.isArray(body.seedKeywords) ? body.seedKeywords : [],
    }),
  );
  return Response.json(job, { status: 202 });
}
