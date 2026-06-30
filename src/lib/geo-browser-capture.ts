import "server-only";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export type BrowserCaptureKind =
  | "dashboard"
  | "citation-pack"
  | "audit-json"
  | "report"
  | "search-result-page"
  | "ai-answer-page"
  | "other";

export interface BrowserCaptureArtifact {
  id: string;
  captureId: string;
  fileName: string;
  mimeType: string;
  bytes: number;
  sha256: string;
  archivePath: string;
  archiveApiUrl: string;
  width?: number;
  height?: number;
}

export interface BrowserCapture {
  id: string;
  createdAt: string;
  capturedAt: string;
  sourceUrl: string;
  kind: BrowserCaptureKind;
  status: "captured";
  title?: string;
  evidenceFor?: string;
  notes?: string;
  sourceRefs: string[];
  capturedBy: "in-app-browser";
  artifact: BrowserCaptureArtifact;
  limitations: string[];
}

export interface CreateBrowserCaptureInput {
  sourceUrl: string;
  kind: BrowserCaptureKind;
  mimeType: string;
  base64: string;
  title?: string;
  evidenceFor?: string;
  notes?: string;
  sourceRefs?: string[];
  capturedAt?: string;
  width?: number;
  height?: number;
}

const DATA_DIR = join(process.cwd(), "data");
const BROWSER_CAPTURE_ROOT = join(DATA_DIR, "geo-browser-captures");
const BROWSER_CAPTURE_INDEX = join(DATA_DIR, "geo-browser-captures.json");
const MAX_CAPTURE_BYTES = 18 * 1024 * 1024;

const allowedKinds: BrowserCaptureKind[] = [
  "dashboard",
  "citation-pack",
  "audit-json",
  "report",
  "search-result-page",
  "ai-answer-page",
  "other",
];

const mimeExtensions: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "application/json": "json",
  "text/html": "html",
  "text/plain": "txt",
};

function stableId(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) hash = (hash * 41 + input.charCodeAt(i)) >>> 0;
  return hash.toString(36);
}

function readBrowserCaptureIndex(): BrowserCapture[] {
  try {
    const raw = readFileSync(BROWSER_CAPTURE_INDEX, "utf8");
    const parsed = JSON.parse(raw) as BrowserCapture[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeBrowserCaptureIndex(captures: BrowserCapture[]) {
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(BROWSER_CAPTURE_INDEX, JSON.stringify(captures.slice(0, 100), null, 2));
}

function upsertBrowserCapture(capture: BrowserCapture) {
  const captures = readBrowserCaptureIndex().filter((item) => item.id !== capture.id);
  writeBrowserCaptureIndex([capture, ...captures].sort((a, b) => b.capturedAt.localeCompare(a.capturedAt)));
}

function normalizeBase64(base64: string) {
  const [, dataUrlPayload] = base64.match(/^data:[^;]+;base64,(.+)$/) ?? [];
  return dataUrlPayload ?? base64;
}

function assertValidInput(input: CreateBrowserCaptureInput) {
  if (!input.sourceUrl?.trim()) throw new Error("sourceUrl is required");
  if (!allowedKinds.includes(input.kind)) throw new Error("Unsupported capture kind");
  if (!mimeExtensions[input.mimeType]) throw new Error("Unsupported mimeType");
  if (!input.base64?.trim()) throw new Error("base64 artifact is required");
}

function safeFileName(input: string) {
  return input.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-").slice(0, 96) || "capture";
}

function sourceHost(sourceUrl: string) {
  try {
    return new URL(sourceUrl).hostname;
  } catch {
    return "unknown-source";
  }
}

export function getBrowserCaptures(limit = 20) {
  return readBrowserCaptureIndex().slice(0, limit);
}

export function getBrowserCapture(id: string) {
  return readBrowserCaptureIndex().find((capture) => capture.id === id);
}

export function readBrowserCaptureArtifact(captureId: string) {
  const capture = getBrowserCapture(captureId);
  if (!capture) return undefined;
  try {
    return {
      capture,
      artifact: capture.artifact,
      content: readFileSync(capture.artifact.archivePath),
    };
  } catch {
    return undefined;
  }
}

export function createBrowserCapture(input: CreateBrowserCaptureInput) {
  assertValidInput(input);
  const capturedAt = input.capturedAt ?? new Date().toISOString();
  const raw = Buffer.from(normalizeBase64(input.base64), "base64");
  if (!raw.length) throw new Error("artifact is empty");
  if (raw.byteLength > MAX_CAPTURE_BYTES) throw new Error("artifact exceeds 18MB limit");

  const captureId = `bc-${stableId(`${input.kind}:${input.sourceUrl}:${capturedAt}`)}-${Date.now().toString(36)}`;
  const captureDir = join(BROWSER_CAPTURE_ROOT, captureId);
  mkdirSync(captureDir, { recursive: true });

  const extension = mimeExtensions[input.mimeType] ?? "bin";
  const artifactId = `bca-${stableId(`${captureId}:${input.mimeType}`)}`;
  const fileName = `${artifactId}-${safeFileName(sourceHost(input.sourceUrl))}.${extension}`;
  const archivePath = join(captureDir, fileName);
  writeFileSync(archivePath, raw);

  const artifact: BrowserCaptureArtifact = {
    id: artifactId,
    captureId,
    fileName,
    mimeType: input.mimeType,
    bytes: raw.byteLength,
    sha256: createHash("sha256").update(raw).digest("hex"),
    archivePath,
    archiveApiUrl: `/api/geo/browser-captures/${captureId}/artifact`,
    width: input.width,
    height: input.height,
  };

  const capture: BrowserCapture = {
    id: captureId,
    createdAt: new Date().toISOString(),
    capturedAt,
    sourceUrl: input.sourceUrl,
    kind: input.kind,
    status: "captured",
    title: input.title?.trim() || undefined,
    evidenceFor: input.evidenceFor?.trim() || undefined,
    notes: input.notes?.trim() || undefined,
    sourceRefs: input.sourceRefs?.length ? input.sourceRefs.slice(0, 12) : ["GH-5", "RES-4"],
    capturedBy: "in-app-browser",
    artifact,
    limitations: [
      "该证据由浏览器实际渲染后的截图或页面导出文件上传归档。",
      "第三方搜索页和 AI 平台页面仍受登录态、地域、个性化和反爬策略影响，报告中必须保留 sourceUrl、capturedAt 与截图原件。",
    ],
  };

  upsertBrowserCapture(capture);
  return capture;
}

export function summarizeBrowserCaptures(captures = getBrowserCaptures()) {
  const screenshotArtifacts = captures.filter((capture) => capture.artifact.mimeType.startsWith("image/")).length;
  const searchResultPages = captures.filter((capture) => capture.kind === "search-result-page").length;
  const aiAnswerPages = captures.filter((capture) => capture.kind === "ai-answer-page").length;
  const byKind = captures.reduce<Record<string, number>>((acc, capture) => {
    acc[capture.kind] = (acc[capture.kind] ?? 0) + 1;
    return acc;
  }, {});

  return {
    total: captures.length,
    screenshotArtifacts,
    searchResultPages,
    aiAnswerPages,
    totalBytes: captures.reduce((sum, capture) => sum + capture.artifact.bytes, 0),
    latestCaptureId: captures[0]?.id,
    latestSourceUrl: captures[0]?.sourceUrl,
    byKind,
  };
}
