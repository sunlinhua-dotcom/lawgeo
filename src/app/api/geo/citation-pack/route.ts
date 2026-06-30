import { ZodError } from "zod";
import {
  citationPackPath,
  createCitationPack,
  getCitationPacks,
  summarizeCitationPacks,
} from "@/lib/geo-citation-pack";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function packLinks(request: Request, id: string) {
  const origin = new URL(request.url).origin;
  return {
    publicUrl: new URL(citationPackPath({ id }), origin).toString(),
    markdownUrl: new URL(`${citationPackPath({ id })}.md`, origin).toString(),
    jsonUrl: new URL(`/api/geo/citation-pack/${id}`, origin).toString(),
    jsonLdUrl: new URL(`/api/geo/citation-pack/${id}?format=jsonld`, origin).toString(),
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get("limit") ?? "20");
  const packs = getCitationPacks(Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 100) : 20);
  return Response.json({
    status: "ok",
    summary: summarizeCitationPacks(packs),
    packs: packs.map((pack) => ({ ...pack, links: packLinks(request, pack.id) })),
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => undefined);
  try {
    const pack = createCitationPack(body);
    return Response.json(
      {
        status: "ok",
        pack,
        links: packLinks(request, pack.id),
        summary: summarizeCitationPacks(getCitationPacks(20)),
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        {
          error: "invalid citation pack input",
          issues: error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
        },
        { status: 400 },
      );
    }
    return Response.json({ error: error instanceof Error ? error.message : "citation pack failed" }, { status: 500 });
  }
}
