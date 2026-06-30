import { buildAiIndex, renderLlmsFull, renderLlmsTxt } from "@/lib/geo-assets";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const baseUrl = new URL(request.url).origin;
  return Response.json({
    status: "ok",
    llms: renderLlmsTxt(baseUrl),
    llmsFull: renderLlmsFull(baseUrl),
    aiIndex: buildAiIndex(baseUrl),
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const baseUrl = typeof body.siteUrl === "string" && body.siteUrl ? body.siteUrl : new URL(request.url).origin;
  return Response.json({
    status: "ok",
    brandId: body.brandId ?? "lawgeo",
    siteUrl: baseUrl,
    llms: renderLlmsTxt(baseUrl),
    llmsFull: renderLlmsFull(baseUrl),
    aiIndex: buildAiIndex(baseUrl),
  });
}
