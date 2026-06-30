import { buildSourceMentions, importSourceMentionUrls, summarizeSourceMentions } from "@/lib/geo-source-mentions";

export const dynamic = "force-dynamic";

function parseUrls(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  if (typeof value === "string") return value.split(/[,\n]/).map((item) => item.trim()).filter(Boolean);
  return [];
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const brandId = url.searchParams.get("brandId") ?? "lawgeo";
  const minimum = Number(url.searchParams.get("minimum") ?? "20");
  const mentions = buildSourceMentions({
    brandId,
    minimum: Number.isFinite(minimum) ? Math.min(Math.max(minimum, 1), 200) : 20,
  });
  return Response.json({ status: "ok", summary: summarizeSourceMentions(mentions), mentions });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({} as Record<string, unknown>));
  const brandId = typeof body.brandId === "string" ? body.brandId : "lawgeo";
  const mentions = importSourceMentionUrls({
    brandId,
    urls: parseUrls(body.urls ?? body.csv),
  });
  return Response.json({ status: "ok", summary: summarizeSourceMentions(mentions), mentions });
}
