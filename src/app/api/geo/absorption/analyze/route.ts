import { analyzeAbsorption } from "@/lib/geo-absorption";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({} as Record<string, unknown>));
  const answer = typeof body.answer === "string" ? body.answer : "";
  if (!answer.trim()) {
    return Response.json({ error: "缺少 answer" }, { status: 400 });
  }

  return Response.json({
    status: "ok",
    assetPath: typeof body.assetPath === "string" ? body.assetPath : null,
    ...analyzeAbsorption({
      answer,
      assetPath: typeof body.assetPath === "string" ? body.assetPath : undefined,
      brandName: typeof body.brandName === "string" ? body.brandName : "BrandGEO",
      competitors: Array.isArray(body.competitors)
        ? body.competitors.filter((item: unknown): item is string => typeof item === "string")
        : [],
      sourceUrls: Array.isArray(body.sourceUrls)
        ? body.sourceUrls.filter((item: unknown): item is string => typeof item === "string")
        : [],
    }),
  });
}
