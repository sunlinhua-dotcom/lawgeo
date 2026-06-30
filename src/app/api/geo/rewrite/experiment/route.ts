import { createRewriteExperiment, getRewriteExperiment } from "@/lib/geo-rewrite";

export const dynamic = "force-dynamic";

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = asString(url.searchParams.get("id"));
  if (id) return Response.json({ status: "ok", experiment: getRewriteExperiment(id) });

  const experiment = createRewriteExperiment({
    brandId: asString(url.searchParams.get("brandId")) ?? "lawgeo",
    brandName: asString(url.searchParams.get("brandName")) ?? "BrandGEO",
    assetId: asString(url.searchParams.get("assetId")),
    assetPath: asString(url.searchParams.get("assetPath")) ?? "/cases/cosmetics",
    platform: asString(url.searchParams.get("platform")) ?? "gpt",
    prompt: asString(url.searchParams.get("prompt")),
    baseUrl: url.origin,
  });
  return Response.json({ status: "ok", experiment });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({} as Record<string, unknown>));
  const experiment = createRewriteExperiment({
    brandId: asString(body.brandId) ?? "lawgeo",
    brandName: asString(body.brandName) ?? "BrandGEO",
    assetId: asString(body.assetId),
    assetPath: asString(body.assetPath) ?? "/cases/cosmetics",
    platform: asString(body.platform) ?? "gpt",
    prompt: asString(body.prompt),
    baseUrl: new URL(request.url).origin,
  });
  return Response.json({ status: "ok", experiment });
}
