import { findGeoAsset, renderAssetMarkdown } from "@/lib/geo-assets";
import { routePathFromMarkdownSegments } from "@/lib/geo-paths";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const routePath = routePathFromMarkdownSegments(path);
  const asset = findGeoAsset(routePath);

  if (!asset) {
    return new Response(`# 未找到 Markdown Twin\n\n${routePath} 没有登记为 BrandGEO 公开内容资产。\n`, {
      status: 404,
      headers: {
        "content-type": "text/markdown; charset=utf-8",
        "x-robots-tag": "noindex",
      },
    });
  }

  return new Response(renderAssetMarkdown(asset, new URL(request.url).origin), {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "x-robots-tag": "noindex",
      "cache-control": "public, max-age=3600",
    },
  });
}
