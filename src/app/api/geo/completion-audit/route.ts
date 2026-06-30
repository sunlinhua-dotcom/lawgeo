import { buildGeoCompletionAudit } from "@/lib/geo-completion-audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    status: "ok",
    audit: buildGeoCompletionAudit(),
  });
}
