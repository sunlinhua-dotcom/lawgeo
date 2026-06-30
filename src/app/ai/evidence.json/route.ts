import { buildAiEvidence } from "@/lib/geo-assets";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return Response.json(buildAiEvidence(new URL(request.url).origin), {
    headers: { "cache-control": "public, max-age=3600" },
  });
}
