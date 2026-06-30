import {
  getCitationPack,
  renderCitationPackJsonLd,
  renderCitationPackMarkdown,
} from "@/lib/geo-citation-pack";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pack = getCitationPack(id);
  if (!pack) return Response.json({ error: "citation pack not found" }, { status: 404 });

  const url = new URL(request.url);
  const format = url.searchParams.get("format");
  if (format === "markdown") {
    return new Response(renderCitationPackMarkdown(pack, url.origin), {
      headers: {
        "content-type": "text/markdown; charset=utf-8",
        "x-robots-tag": "noindex",
      },
    });
  }
  if (format === "jsonld") {
    return Response.json(renderCitationPackJsonLd(pack, url.origin));
  }

  return Response.json({
    status: "ok",
    pack,
    links: {
      markdownUrl: new URL(`/citation-packs/${pack.id}.md`, url.origin).toString(),
      jsonLdUrl: new URL(`/api/geo/citation-pack/${pack.id}?format=jsonld`, url.origin).toString(),
      publicUrl: new URL(`/citation-packs/${pack.id}`, url.origin).toString(),
    },
  });
}
