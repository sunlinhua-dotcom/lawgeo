import { renderLlmsTxt } from "@/lib/geo-assets";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const baseUrl = new URL(request.url).origin;
  return new Response(renderLlmsTxt(baseUrl), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
