import { buildGeoMonthlyReport, renderGeoMonthlyReportHtml, renderGeoMonthlyReportPdf } from "@/lib/geo-report";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function wantsMarkdown(request: Request, url: URL) {
  return url.searchParams.get("format") === "markdown" || request.headers.get("accept")?.includes("text/markdown");
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const report = buildGeoMonthlyReport({
    brandId: asString(url.searchParams.get("brandId")) ?? "lawgeo",
    brandName: asString(url.searchParams.get("brandName")) ?? "BrandGEO",
    period: asString(url.searchParams.get("period")) ?? "2026-05",
    dateFrom: asString(url.searchParams.get("dateFrom")) ?? asString(url.searchParams.get("from")),
    dateTo: asString(url.searchParams.get("dateTo")) ?? asString(url.searchParams.get("to")),
    baseUrl: url.origin,
  });
  if (wantsMarkdown(request, url)) {
    return new Response(report.markdown, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }
  if (url.searchParams.get("format") === "html") {
    return new Response(renderGeoMonthlyReportHtml(report), {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }
  if (url.searchParams.get("format") === "pdf") {
    return new Response(renderGeoMonthlyReportPdf(report), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="lawgeo-geo-report-${report.period}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  }
  return Response.json({ status: "ok", report });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({} as Record<string, unknown>));
  const report = buildGeoMonthlyReport({
    brandId: asString(body.brandId) ?? "lawgeo",
    brandName: asString(body.brandName) ?? "BrandGEO",
    period: asString(body.period) ?? "2026-05",
    dateFrom: asString(body.dateFrom) ?? asString(body.from),
    dateTo: asString(body.dateTo) ?? asString(body.to),
    baseUrl: new URL(request.url).origin,
  });
  return Response.json({ status: "ok", report });
}
