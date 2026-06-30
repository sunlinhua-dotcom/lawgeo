import { readBrowserCaptureArtifact } from "@/lib/geo-browser-capture";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ captureId: string }> },
) {
  const { captureId } = await params;
  const result = readBrowserCaptureArtifact(captureId);
  if (!result) {
    return Response.json({ error: "Browser capture artifact not found" }, { status: 404 });
  }

  return new Response(new Uint8Array(result.content), {
    headers: {
      "Content-Type": result.artifact.mimeType,
      "Content-Length": String(result.artifact.bytes),
      "Content-Disposition": `inline; filename="${result.artifact.fileName}"`,
      "Cache-Control": "no-store",
      "X-BrandGEO-Browser-Capture": result.capture.id,
      "X-BrandGEO-Source-URL": result.capture.sourceUrl,
    },
  });
}
