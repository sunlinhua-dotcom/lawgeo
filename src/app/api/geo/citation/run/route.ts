import { createCitationRunWithAdapter, recordCitationRun } from "@/lib/geo-citation";

export const dynamic = "force-dynamic";

function parseStringArray(value: unknown): string[] | undefined {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
  if (typeof value === "string") return value.split(/[,\n]/).map((item) => item.trim()).filter(Boolean);
  return undefined;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const adapter = url.searchParams.get("adapter") === "mimo" ? "mimo" : "deterministic";
  const run = await createCitationRunWithAdapter({
    adapter,
    brandId: url.searchParams.get("brandId") ?? "lawgeo",
    brandName: url.searchParams.get("brandName") ?? "BrandGEO",
    platformIds: parseStringArray(url.searchParams.get("platforms")),
    promptLimit: Number(url.searchParams.get("promptLimit") ?? "100"),
    snapshotPromptLimit: Number(url.searchParams.get("snapshotPromptLimit") ?? (adapter === "mimo" ? "1" : "8")),
    baseUrl: url.origin,
  });
  recordCitationRun(run);
  return Response.json({ status: "ok", run });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({} as Record<string, unknown>));
  const adapter = body.adapter === "mimo" ? "mimo" : "deterministic";
  const run = await createCitationRunWithAdapter({
    adapter,
    brandId: typeof body.brandId === "string" ? body.brandId : "lawgeo",
    brandName: typeof body.brandName === "string" ? body.brandName : "BrandGEO",
    platformIds: parseStringArray(body.platforms),
    promptLimit: typeof body.promptLimit === "number" ? body.promptLimit : 100,
    snapshotPromptLimit: typeof body.snapshotPromptLimit === "number" ? body.snapshotPromptLimit : adapter === "mimo" ? 1 : 8,
    seedKeywords: parseStringArray(body.seedKeywords) ?? [],
    baseUrl: new URL(request.url).origin,
  });
  recordCitationRun(run);
  return Response.json({ status: "ok", run });
}
