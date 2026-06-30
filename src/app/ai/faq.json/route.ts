import { buildAiFaq } from "@/lib/geo-assets";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return Response.json(buildAiFaq(new URL(request.url).origin), {
    headers: { "cache-control": "public, max-age=3600" },
  });
}
