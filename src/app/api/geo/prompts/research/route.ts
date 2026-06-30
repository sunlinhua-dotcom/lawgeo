import { buildPromptTargets, summarizePromptTargets } from "@/lib/geo-prompts";

export const dynamic = "force-dynamic";

function parseSeeds(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
  if (typeof value === "string") return value.split(/[,\n]/).map((item) => item.trim()).filter(Boolean);
  return [];
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get("limit") ?? "100");
  const prompts = buildPromptTargets({
    brandId: url.searchParams.get("brandId") ?? "lawgeo",
    brandName: url.searchParams.get("brandName") ?? "BrandGEO",
    seedKeywords: parseSeeds(url.searchParams.get("seedKeywords")),
    limit: Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 200) : 100,
  });
  return Response.json({ status: "ok", summary: summarizePromptTargets(prompts), prompts });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({} as Record<string, unknown>));
  const limit = typeof body.limit === "number" ? body.limit : 100;
  const prompts = buildPromptTargets({
    brandId: typeof body.brandId === "string" ? body.brandId : "lawgeo",
    brandName: typeof body.brandName === "string" ? body.brandName : "BrandGEO",
    industry: typeof body.industry === "string" ? body.industry : undefined,
    seedKeywords: parseSeeds(body.seedKeywords),
    platforms: parseSeeds(body.platforms).length ? parseSeeds(body.platforms) : undefined,
    limit: Math.min(Math.max(limit, 1), 200),
  });
  return Response.json({ status: "ok", summary: summarizePromptTargets(prompts), prompts });
}
