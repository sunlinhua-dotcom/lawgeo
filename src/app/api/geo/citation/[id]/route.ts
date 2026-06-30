import { getCitationRun } from "@/lib/geo-citation";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const run = getCitationRun(id, new URL(request.url).origin);
  return Response.json({ status: "ok", run });
}
