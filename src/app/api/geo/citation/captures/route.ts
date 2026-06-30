import { getCitationCaptures, summarizeCitationCaptures } from "@/lib/geo-citation-capture";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get("limit") ?? "20");
  const captures = getCitationCaptures(Number.isFinite(limit) ? limit : 20);
  return Response.json({
    summary: summarizeCitationCaptures(captures),
    captures,
  });
}
