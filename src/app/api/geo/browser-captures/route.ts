import { createBrowserCapture, getBrowserCaptures, summarizeBrowserCaptures, type BrowserCaptureKind } from "@/lib/geo-browser-capture";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface BrowserCaptureBody {
  sourceUrl?: string;
  kind?: BrowserCaptureKind;
  mimeType?: string;
  base64?: string;
  title?: string;
  evidenceFor?: string;
  notes?: string;
  sourceRefs?: string[];
  capturedAt?: string;
  width?: number;
  height?: number;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get("limit") ?? "20");
  const captures = getBrowserCaptures(Number.isFinite(limit) ? limit : 20);
  return Response.json({
    summary: summarizeBrowserCaptures(captures),
    captures,
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as BrowserCaptureBody;
    const capture = createBrowserCapture({
      sourceUrl: body.sourceUrl ?? "",
      kind: body.kind ?? "other",
      mimeType: body.mimeType ?? "image/png",
      base64: body.base64 ?? "",
      title: body.title,
      evidenceFor: body.evidenceFor,
      notes: body.notes,
      sourceRefs: body.sourceRefs,
      capturedAt: body.capturedAt,
      width: body.width,
      height: body.height,
    });
    const captures = getBrowserCaptures(20);
    return Response.json({
      status: "ok",
      capture,
      summary: summarizeBrowserCaptures(captures),
    });
  } catch (error) {
    return Response.json(
      { status: "error", error: error instanceof Error ? error.message : "Browser capture failed" },
      { status: 400 },
    );
  }
}
