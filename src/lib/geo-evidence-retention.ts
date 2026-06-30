import "server-only";
import { mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getBrowserCaptures, summarizeBrowserCaptures } from "@/lib/geo-browser-capture";
import { getCitationCaptures, summarizeCitationCaptures } from "@/lib/geo-citation-capture";
import { getSearchMonitorRuns, summarizeSearchMonitorRuns } from "@/lib/geo-search-monitor";

export interface GeoEvidenceRetentionManifest {
  schemaVersion: "geo-evidence-retention.v1";
  generatedAt: string;
  policy: {
    retentionDays: number;
    maxIndexRecordsPerStore: number;
    artifactReplay: "api-noindex";
    integrity: Array<"sha256-browser-artifacts" | "http-status-fetch-artifacts" | "serp-html-artifacts">;
    migrationTarget: "sqlite-drizzle-confirmation-required";
  };
  stores: Array<{
    id: string;
    kind: "fetch-capture" | "browser-capture" | "search-monitor";
    indexFile: string;
    artifactRoot?: string;
    records: number;
    artifacts: number;
    bytes: number;
    latestId?: string;
  }>;
  summary: {
    records: number;
    artifacts: number;
    bytes: number;
    hasFetchArtifacts: boolean;
    hasBrowserScreenshots: boolean;
    hasSearchResultEvidence: boolean;
    hasSerpHtmlArtifacts: boolean;
    replayApiNoindex: boolean;
  };
  limitations: string[];
}

const DATA_DIR = join(process.cwd(), "data");
const RETENTION_FILE = join(DATA_DIR, "geo-evidence-retention.json");

function fileSize(path: string) {
  try {
    return statSync(path).size;
  } catch {
    return 0;
  }
}

function readManifest(): GeoEvidenceRetentionManifest | undefined {
  try {
    return JSON.parse(readFileSync(RETENTION_FILE, "utf8")) as GeoEvidenceRetentionManifest;
  } catch {
    return undefined;
  }
}

export function buildGeoEvidenceRetentionManifest() {
  const citationCaptures = getCitationCaptures(100);
  const citationSummary = summarizeCitationCaptures(citationCaptures);
  const browserCaptures = getBrowserCaptures(100);
  const browserSummary = summarizeBrowserCaptures(browserCaptures);
  const searchRuns = getSearchMonitorRuns(100);
  const searchSummary = summarizeSearchMonitorRuns(searchRuns);
  const stores: GeoEvidenceRetentionManifest["stores"] = [
    {
      id: "citation-fetch-captures",
      kind: "fetch-capture",
      indexFile: "data/geo-citation-captures.json",
      artifactRoot: "data/geo-captures/",
      records: citationSummary.total,
      artifacts: citationSummary.capturedArtifacts,
      bytes: citationSummary.totalBytes,
      latestId: citationSummary.latestCaptureId,
    },
    {
      id: "browser-captures",
      kind: "browser-capture",
      indexFile: "data/geo-browser-captures.json",
      artifactRoot: "data/geo-browser-captures/",
      records: browserSummary.total,
      artifacts: browserSummary.screenshotArtifacts,
      bytes: browserSummary.totalBytes,
      latestId: browserSummary.latestCaptureId,
    },
    {
      id: "search-monitor-serp",
      kind: "search-monitor",
      indexFile: "data/geo-search-monitor-runs.json",
      artifactRoot: "data/geo-search-monitor/",
      records: searchSummary.total,
      artifacts: searchSummary.artifactCount,
      bytes: fileSize(join(DATA_DIR, "geo-search-monitor-runs.json")),
      latestId: searchSummary.latestRunId,
    },
  ];
  const summary = {
    records: stores.reduce((sum, store) => sum + store.records, 0),
    artifacts: stores.reduce((sum, store) => sum + store.artifacts, 0),
    bytes: stores.reduce((sum, store) => sum + store.bytes, 0),
    hasFetchArtifacts: citationSummary.capturedArtifacts > 0,
    hasBrowserScreenshots: browserSummary.screenshotArtifacts > 0,
    hasSearchResultEvidence: browserSummary.searchResultPages > 0,
    hasSerpHtmlArtifacts: searchSummary.artifactCount > 0,
    replayApiNoindex: true,
  };
  const manifest: GeoEvidenceRetentionManifest = {
    schemaVersion: "geo-evidence-retention.v1",
    generatedAt: new Date().toISOString(),
    policy: {
      retentionDays: 365,
      maxIndexRecordsPerStore: 100,
      artifactReplay: "api-noindex",
      integrity: ["sha256-browser-artifacts", "http-status-fetch-artifacts", "serp-html-artifacts"],
      migrationTarget: "sqlite-drizzle-confirmation-required",
    },
    stores,
    summary,
    limitations: [
      "当前 manifest 汇总 file-backed artifact 与 noindex 回放 API，保证本地验收可追溯。",
      "正式客户级长期查询、权限、清理任务和审计索引需要迁移到 SQLite/Drizzle schema。",
      "数据库 schema 迁移必须等待用户确认后执行。",
    ],
  };
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(RETENTION_FILE, JSON.stringify(manifest, null, 2));
  return manifest;
}

export function getGeoEvidenceRetentionManifest() {
  return readManifest() ?? buildGeoEvidenceRetentionManifest();
}

export function summarizeGeoEvidenceRetention() {
  const manifest = getGeoEvidenceRetentionManifest();
  return {
    records: manifest.summary.records,
    artifacts: manifest.summary.artifacts,
    bytes: manifest.summary.bytes,
    retentionDays: manifest.policy.retentionDays,
    hasPolicy: manifest.schemaVersion === "geo-evidence-retention.v1",
    hasFetchArtifacts: manifest.summary.hasFetchArtifacts,
    hasBrowserScreenshots: manifest.summary.hasBrowserScreenshots,
    hasSearchResultEvidence: manifest.summary.hasSearchResultEvidence,
    hasSerpHtmlArtifacts: manifest.summary.hasSerpHtmlArtifacts,
    replayApiNoindex: manifest.summary.replayApiNoindex,
    migrationTarget: manifest.policy.migrationTarget,
  };
}
