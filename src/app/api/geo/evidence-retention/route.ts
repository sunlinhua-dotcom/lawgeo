import { NextResponse } from "next/server";
import { buildGeoEvidenceRetentionManifest, getGeoEvidenceRetentionManifest, summarizeGeoEvidenceRetention } from "@/lib/geo-evidence-retention";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const manifest = url.searchParams.get("refresh") === "1"
    ? buildGeoEvidenceRetentionManifest()
    : getGeoEvidenceRetentionManifest();
  return NextResponse.json({
    status: "ok",
    summary: summarizeGeoEvidenceRetention(),
    manifest,
  });
}
