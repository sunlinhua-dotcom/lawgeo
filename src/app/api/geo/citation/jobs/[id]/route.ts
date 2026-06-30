import { cancelCitationJob, getCitationJob, retryCitationJob, runCitationJob } from "@/lib/geo-citation-jobs";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = getCitationJob(id);
  if (!job) {
    return Response.json({ error: "Citation job not found" }, { status: 404 });
  }
  return Response.json(job);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({} as { action?: string }));
  if (body.action === "retry") {
    const retry = retryCitationJob(id);
    if (!retry) {
      return Response.json({ error: "Citation job not found" }, { status: 404 });
    }
    return Response.json(retry, { status: 202 });
  }
  const job = await runCitationJob(id);
  if (!job) {
    return Response.json({ error: "Citation job not found" }, { status: 404 });
  }
  return Response.json(job);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = cancelCitationJob(id);
  if (!job) {
    return Response.json({ error: "Citation job not found" }, { status: 404 });
  }
  return Response.json(job);
}
