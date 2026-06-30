import { findGeoAsset, renderAssetMarkdown } from "@/lib/geo-assets";

export const dynamic = "force-dynamic";

function readPath(url: URL, body?: Record<string, unknown>) {
  return (
    (typeof body?.assetPath === "string" && body.assetPath) ||
    (typeof body?.url === "string" && new URL(body.url, url.origin).pathname) ||
    url.searchParams.get("path") ||
    "/"
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const asset = findGeoAsset(readPath(url));
  if (!asset) return Response.json({ error: "asset not found" }, { status: 404 });
  return Response.json({
    status: "ok",
    assetId: asset.id,
    markdown: renderAssetMarkdown(asset, url.origin),
  });
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const body = await request.json().catch(() => ({} as Record<string, unknown>));
  const asset = findGeoAsset(readPath(url, body));
  if (!asset) return Response.json({ error: "asset not found" }, { status: 404 });
  return Response.json({
    status: "ok",
    assetId: asset.id,
    markdown: renderAssetMarkdown(asset, url.origin),
  });
}
