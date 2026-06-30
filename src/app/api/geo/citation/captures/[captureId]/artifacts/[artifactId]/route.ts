import { readCaptureArtifact } from "@/lib/geo-citation-capture";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ captureId: string; artifactId: string }> },
) {
  const { captureId, artifactId } = await params;
  const result = readCaptureArtifact(captureId, artifactId);
  if (!result) {
    return Response.json({ error: "Capture artifact not found" }, { status: 404 });
  }
  return new Response(result.content, {
    headers: {
      "Content-Type": result.artifact.contentType?.includes("charset")
        ? result.artifact.contentType
        : `${result.artifact.contentType || "text/plain"}; charset=utf-8`,
      "Cache-Control": "no-store",
      "X-BrandGEO-Capture": result.capture.id,
      "X-BrandGEO-Source-URL": result.artifact.sourceUrl,
    },
  });
}
