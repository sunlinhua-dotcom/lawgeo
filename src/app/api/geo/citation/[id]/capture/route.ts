import { captureCitationRun, getLatestCaptureForRun } from "@/lib/geo-citation-capture";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const url = new URL(request.url);
  const shouldCreate = url.searchParams.get("refresh") === "1";
  if (!shouldCreate) {
    const existing = getLatestCaptureForRun(id);
    if (existing) return Response.json({ status: "ok", capture: existing });
  }
  const capture = await captureCitationRun({
    runId: id,
    baseUrl: url.origin,
    originOverride: url.searchParams.get("originOverride") ?? url.origin,
    maxUrls: Number(url.searchParams.get("maxUrls") ?? "8"),
  });
  return Response.json({ status: "ok", capture });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const url = new URL(request.url);
  const capture = await captureCitationRun({
    runId: id,
    baseUrl: url.origin,
    originOverride: typeof body.originOverride === "string" ? body.originOverride : url.origin,
    maxUrls: Number(body.maxUrls ?? 8),
  });
  return Response.json({ status: "ok", capture });
}
