import "server-only";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { getCitationRun, type CitationRun } from "@/lib/geo-citation";
import { siteConfig } from "@/lib/site";

export interface CitationCaptureArtifact {
  id: string;
  captureId: string;
  runId: string;
  snapshotId: string;
  sourceUrl: string;
  requestedUrl: string;
  status: "captured" | "failed";
  httpStatus?: number;
  contentType?: string;
  bytes: number;
  archivePath?: string;
  archiveApiUrl?: string;
  title?: string;
  error?: string;
}

export interface CitationCapture {
  id: string;
  runId: string;
  createdAt: string;
  completedAt: string;
  mode: "fetch-archive";
  originOverride?: string;
  artifacts: CitationCaptureArtifact[];
  metrics: {
    requestedUrls: number;
    captured: number;
    failed: number;
    totalBytes: number;
  };
  limitations: string[];
}

const DATA_DIR = join(process.cwd(), "data");
const CAPTURE_ROOT = join(DATA_DIR, "geo-captures");
const CAPTURE_INDEX = join(DATA_DIR, "geo-citation-captures.json");

function stableId(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) hash = (hash * 37 + input.charCodeAt(i)) >>> 0;
  return hash.toString(36);
}

function readCaptures(): CitationCapture[] {
  try {
    const raw = readFileSync(CAPTURE_INDEX, "utf8");
    const parsed = JSON.parse(raw) as CitationCapture[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCaptures(captures: CitationCapture[]) {
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(CAPTURE_INDEX, JSON.stringify(captures.slice(0, 100), null, 2));
}

function upsertCapture(capture: CitationCapture) {
  const captures = readCaptures().filter((item) => item.id !== capture.id);
  writeCaptures([capture, ...captures].sort((a, b) => b.completedAt.localeCompare(a.completedAt)));
}

function rewriteOrigin(sourceUrl: string, originOverride?: string) {
  if (!originOverride) return sourceUrl;
  try {
    const url = new URL(sourceUrl);
    const override = new URL(originOverride);
    url.protocol = override.protocol;
    url.host = override.host;
    return url.toString();
  } catch {
    return sourceUrl;
  }
}

function titleFromText(text: string) {
  const htmlTitle = text.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  if (htmlTitle) return htmlTitle.replace(/\s+/g, " ").trim().slice(0, 140);
  const markdownTitle = text.match(/^#\s+(.+)$/m)?.[1];
  return markdownTitle?.trim().slice(0, 140);
}

function uniqueSnapshotUrls(run: CitationRun) {
  const seen = new Set<string>();
  const rows: Array<{ snapshotId: string; sourceUrl: string }> = [];
  for (const snapshot of run.snapshots) {
    for (const sourceUrl of snapshot.sourceUrls) {
      if (seen.has(sourceUrl)) continue;
      seen.add(sourceUrl);
      rows.push({ snapshotId: snapshot.id, sourceUrl });
    }
  }
  return rows;
}

export function getCitationCaptures(limit = 20) {
  return readCaptures().slice(0, limit);
}

export function getCitationCapture(id: string) {
  return readCaptures().find((capture) => capture.id === id);
}

export function getLatestCaptureForRun(runId: string) {
  return readCaptures().find((capture) => capture.runId === runId);
}

export function readCaptureArtifact(captureId: string, artifactId: string) {
  const capture = getCitationCapture(captureId);
  const artifact = capture?.artifacts.find((item) => item.id === artifactId);
  if (!capture || !artifact?.archivePath) return undefined;
  try {
    return {
      capture,
      artifact,
      content: readFileSync(artifact.archivePath, "utf8"),
    };
  } catch {
    return undefined;
  }
}

export async function captureCitationRun({
  runId,
  baseUrl = siteConfig.url,
  originOverride,
  maxUrls = 12,
}: {
  runId: string;
  baseUrl?: string;
  originOverride?: string;
  maxUrls?: number;
}) {
  const run = getCitationRun(runId, baseUrl);
  if (!run) throw new Error(`CitationRun not found: ${runId}`);
  const startedAt = new Date().toISOString();
  const captureId = `cap-${stableId(`${run.id}:${startedAt}`)}-${Date.now().toString(36)}`;
  const captureDir = join(CAPTURE_ROOT, captureId);
  mkdirSync(captureDir, { recursive: true });

  const urls = uniqueSnapshotUrls(run).slice(0, Math.max(1, Math.min(maxUrls, 50)));
  const artifacts: CitationCaptureArtifact[] = [];

  for (const [index, row] of urls.entries()) {
    const requestedUrl = rewriteOrigin(row.sourceUrl, originOverride);
    const artifactId = `ca-${String(index + 1).padStart(2, "0")}-${stableId(requestedUrl)}`;
    try {
      const response = await fetch(requestedUrl, {
        headers: {
          accept: "text/markdown,text/html,application/json;q=0.8,text/plain;q=0.7,*/*;q=0.3",
          "user-agent": "BrandGEO-citation-capture/1.0",
        },
      });
      const contentType = response.headers.get("content-type") ?? "text/plain";
      const text = await response.text();
      const archivePath = join(captureDir, `${artifactId}-${basename(new URL(requestedUrl).pathname || "index").replace(/[^a-zA-Z0-9._-]/g, "_")}.txt`);
      writeFileSync(archivePath, text);
      artifacts.push({
        id: artifactId,
        captureId,
        runId: run.id,
        snapshotId: row.snapshotId,
        sourceUrl: row.sourceUrl,
        requestedUrl,
        status: response.ok ? "captured" : "failed",
        httpStatus: response.status,
        contentType,
        bytes: Buffer.byteLength(text),
        archivePath,
        archiveApiUrl: `/api/geo/citation/captures/${captureId}/artifacts/${artifactId}`,
        title: titleFromText(text),
        error: response.ok ? undefined : `HTTP ${response.status}`,
      });
    } catch (error) {
      artifacts.push({
        id: artifactId,
        captureId,
        runId: run.id,
        snapshotId: row.snapshotId,
        sourceUrl: row.sourceUrl,
        requestedUrl,
        status: "failed",
        bytes: 0,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const completedAt = new Date().toISOString();
  const capture: CitationCapture = {
    id: captureId,
    runId: run.id,
    createdAt: startedAt,
    completedAt,
    mode: "fetch-archive",
    originOverride,
    artifacts,
    metrics: {
      requestedUrls: urls.length,
      captured: artifacts.filter((artifact) => artifact.status === "captured").length,
      failed: artifacts.filter((artifact) => artifact.status === "failed").length,
      totalBytes: artifacts.reduce((sum, artifact) => sum + artifact.bytes, 0),
    },
    limitations: [
      "当前 capture 使用服务端 fetch 保存 HTML / Markdown / JSON 文本证据。",
      "浏览器截图和第三方搜索结果页截图仍需后续真实 capture adapter。",
    ],
  };
  upsertCapture(capture);
  return capture;
}

export function summarizeCitationCaptures(captures = getCitationCaptures()) {
  return {
    total: captures.length,
    capturedArtifacts: captures.reduce((sum, capture) => sum + capture.metrics.captured, 0),
    failedArtifacts: captures.reduce((sum, capture) => sum + capture.metrics.failed, 0),
    totalBytes: captures.reduce((sum, capture) => sum + capture.metrics.totalBytes, 0),
    latestCaptureId: captures[0]?.id,
    latestRunId: captures[0]?.runId,
  };
}
