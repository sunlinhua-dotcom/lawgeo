import "server-only";
import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  CitationRunCanceledError,
  createCitationRunWithAdapter,
  getCitationRun,
  getRecordedCitationRuns,
  recordCitationRun,
  type CitationRun,
} from "@/lib/geo-citation";
import { siteConfig } from "@/lib/site";

export interface CitationJobRequest {
  adapter: "deterministic" | "mimo";
  brandId: string;
  brandName: string;
  platformIds?: string[];
  promptLimit: number;
  snapshotPromptLimit: number;
  baseUrl: string;
  seedKeywords: string[];
}

export interface CitationJob {
  id: string;
  type: "citation-run";
  status: "queued" | "running" | "done" | "failed" | "canceled";
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  retryOf?: string;
  attempts: number;
  request: CitationJobRequest;
  progress: {
    completed: number;
    total: number;
    message: string;
    currentPromptId?: string;
    currentPlatform?: string;
    lastLatencyMs?: number;
  };
  worker?: {
    id: string;
    leaseAcquiredAt: string;
    leaseExpiresAt: string;
    heartbeatAt: string;
    staleRecoveredAt?: string;
  };
  result?: {
    runId: string;
    adapter: CitationRun["adapter"];
    provider: CitationRun["provider"];
    metrics: CitationRun["metrics"];
    platforms: string[];
  };
  error?: string;
}

const DATA_DIR = join(process.cwd(), "data");
const JOBS_FILE = join(DATA_DIR, "geo-citation-jobs.json");
const activeJobs = new Set<string>();
const WORKER_LEASE_MS = 15 * 60 * 1000;
const WORKER_ID = `lawgeo-citation-worker-${process.pid}`;

function readJobs(): CitationJob[] {
  try {
    const raw = readFileSync(JOBS_FILE, "utf8");
    const parsed = JSON.parse(raw) as CitationJob[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeJobs(jobs: CitationJob[]) {
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(JOBS_FILE, JSON.stringify(jobs.slice(0, 100), null, 2));
}

function upsertJob(job: CitationJob) {
  const jobs = readJobs().filter((item) => item.id !== job.id);
  writeJobs([job, ...jobs].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}

function updateJob(id: string, patch: Partial<CitationJob> | ((job: CitationJob) => CitationJob)) {
  const jobs = readJobs();
  const current = jobs.find((job) => job.id === id);
  if (!current) return undefined;
  const next = typeof patch === "function" ? patch(current) : { ...current, ...patch, updatedAt: new Date().toISOString() };
  writeJobs(jobs.map((job) => (job.id === id ? next : job)));
  return next;
}

function workerLease(now = new Date()) {
  return {
    id: WORKER_ID,
    leaseAcquiredAt: now.toISOString(),
    leaseExpiresAt: new Date(now.getTime() + WORKER_LEASE_MS).toISOString(),
    heartbeatAt: now.toISOString(),
  };
}

function heartbeatPatch(job: CitationJob) {
  const now = new Date();
  return {
    ...job.worker,
    id: job.worker?.id ?? WORKER_ID,
    leaseAcquiredAt: job.worker?.leaseAcquiredAt ?? now.toISOString(),
    leaseExpiresAt: new Date(now.getTime() + WORKER_LEASE_MS).toISOString(),
    heartbeatAt: now.toISOString(),
  };
}

export function recoverStaleCitationJobs(now = new Date()) {
  const jobs = readJobs();
  let recovered = 0;
  const next = jobs.map((job) => {
    if (job.status !== "running") return job;
    if (activeJobs.has(job.id)) return job;
    const leaseExpiresAt = job.worker?.leaseExpiresAt ? new Date(job.worker.leaseExpiresAt) : undefined;
    const startedAt = job.startedAt ? new Date(job.startedAt) : undefined;
    const stale = leaseExpiresAt ? leaseExpiresAt.getTime() < now.getTime() : startedAt ? now.getTime() - startedAt.getTime() > WORKER_LEASE_MS : true;
    if (!stale) return job;
    recovered += 1;
    return {
      ...job,
      status: "failed" as const,
      updatedAt: now.toISOString(),
      completedAt: now.toISOString(),
      error: "Worker lease expired before completion",
      progress: { ...job.progress, message: "worker lease expired; job marked failed for retry" },
      worker: {
        ...(job.worker ?? workerLease(now)),
        staleRecoveredAt: now.toISOString(),
      },
    };
  });
  if (recovered) writeJobs(next);
  return { recovered, checked: jobs.length };
}

export function normalizeCitationJobRequest(input: Partial<CitationJobRequest> = {}): CitationJobRequest {
  const adapter = input.adapter === "mimo" ? "mimo" : "deterministic";
  const snapshotPromptLimit = Number.isFinite(input.snapshotPromptLimit)
    ? Math.max(1, Math.min(Number(input.snapshotPromptLimit), adapter === "mimo" ? 6 : 20))
    : adapter === "mimo"
      ? 1
      : 8;
  const promptLimit = Number.isFinite(input.promptLimit)
    ? Math.max(snapshotPromptLimit, Math.min(Number(input.promptLimit), 500))
    : 100;

  return {
    adapter,
    brandId: input.brandId || "lawgeo",
    brandName: input.brandName || "BrandGEO",
    platformIds: input.platformIds?.length ? input.platformIds : undefined,
    promptLimit,
    snapshotPromptLimit,
    baseUrl: input.baseUrl || siteConfig.url,
    seedKeywords: input.seedKeywords ?? [],
  };
}

export function createCitationJob(input: Partial<CitationJobRequest> = {}) {
  const request = normalizeCitationJobRequest(input);
  const now = new Date().toISOString();
  const platformCount = request.platformIds?.length || 4;
  const job: CitationJob = {
    id: `cj-${randomUUID().slice(0, 8)}`,
    type: "citation-run",
    status: "queued",
    createdAt: now,
    updatedAt: now,
    attempts: 1,
    request,
    progress: {
      completed: 0,
      total: request.snapshotPromptLimit * platformCount,
      message: "任务已进入队列",
    },
  };
  upsertJob(job);
  void runCitationJob(job.id);
  return job;
}

export function cancelCitationJob(id: string) {
  const current = getCitationJob(id);
  if (!current) return undefined;
  if (!["queued", "running"].includes(current.status)) return current;
  return updateJob(id, (job) => ({
    ...job,
    status: "canceled",
    updatedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    progress: { ...job.progress, message: "任务已取消" },
  }));
}

export function retryCitationJob(id: string) {
  const current = getCitationJob(id);
  if (!current) return undefined;
  const now = new Date().toISOString();
  const job: CitationJob = {
    id: `cj-${randomUUID().slice(0, 8)}`,
    type: "citation-run",
    status: "queued",
    createdAt: now,
    updatedAt: now,
    retryOf: current.id,
    attempts: (current.attempts ?? 1) + 1,
    request: current.request,
    progress: {
      completed: 0,
      total: current.progress.total,
      message: `重试任务已进入队列，来源 ${current.id}`,
    },
  };
  upsertJob(job);
  void runCitationJob(job.id);
  return job;
}

export function getCitationJobs(limit = 20) {
  recoverStaleCitationJobs();
  return readJobs()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

export function getCitationJob(id: string) {
  recoverStaleCitationJobs();
  const job = readJobs().find((item) => item.id === id);
  if (!job) return undefined;
  const run = job.result?.runId ? getCitationRun(job.result.runId, job.request.baseUrl) : undefined;
  return { ...job, run };
}

export async function runCitationJob(id: string) {
  if (activeJobs.has(id)) return getCitationJob(id);
  activeJobs.add(id);
  try {
    const initial = getCitationJob(id);
    if (!initial || !["queued", "running"].includes(initial.status)) return initial;
    updateJob(id, (job) => ({
      ...job,
      status: "running",
      startedAt: job.startedAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progress: { ...job.progress, message: "CitationRun 正在执行" },
      worker: workerLease(),
      error: undefined,
    }));

    const run = await createCitationRunWithAdapter({
      ...initial.request,
      shouldContinue: () => getCitationJob(id)?.status !== "canceled",
      onProgress: (progress) => {
        updateJob(id, (job) => ({
          ...job,
          updatedAt: new Date().toISOString(),
          worker: heartbeatPatch(job),
          progress: {
            completed: progress.completed,
            total: progress.total,
            currentPromptId: progress.promptId,
            currentPlatform: progress.platform,
            lastLatencyMs: progress.latencyMs,
            message: `${progress.completed}/${progress.total} snapshots 完成`,
          },
        }));
      },
    });
    recordCitationRun(run);
    const completedAt = new Date().toISOString();
    return updateJob(id, (job) => ({
      ...job,
      status: "done",
      updatedAt: completedAt,
      completedAt,
      worker: heartbeatPatch(job),
      progress: {
        ...job.progress,
        completed: run.metrics.totalSnapshots,
        total: run.metrics.totalSnapshots,
        message: "任务完成",
      },
      result: {
        runId: run.id,
        adapter: run.adapter,
        provider: run.provider,
        metrics: run.metrics,
        platforms: run.platforms,
      },
    }));
  } catch (error) {
    if (error instanceof CitationRunCanceledError) {
      return updateJob(id, (job) => ({
        ...job,
        status: "canceled",
        updatedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        progress: { ...job.progress, message: "任务已取消" },
      }));
    }
    return updateJob(id, (job) => ({
      ...job,
      status: "failed",
      updatedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      progress: { ...job.progress, message: "任务失败" },
      error: error instanceof Error ? error.message : String(error),
    }));
  } finally {
    activeJobs.delete(id);
  }
}

export function summarizeCitationJobs(jobs = getCitationJobs()) {
  const recordedRuns = getRecordedCitationRuns(20);
  return {
    total: jobs.length,
    queued: jobs.filter((job) => job.status === "queued").length,
    running: jobs.filter((job) => job.status === "running").length,
    done: jobs.filter((job) => job.status === "done").length,
    failed: jobs.filter((job) => job.status === "failed").length,
    canceled: jobs.filter((job) => job.status === "canceled").length,
    retried: jobs.filter((job) => job.retryOf).length,
    latestRunId: recordedRuns[0]?.id,
  };
}

export function drainQueuedCitationJobs(limit = 1) {
  const queued = getCitationJobs(100)
    .filter((job) => job.status === "queued")
    .slice(0, Math.max(1, Math.min(limit, 5)));
  for (const job of queued) void runCitationJob(job.id);
  return { started: queued.length, jobIds: queued.map((job) => job.id) };
}

export function getCitationJobWorkerSummary(jobs = getCitationJobs(100)) {
  const recovered = recoverStaleCitationJobs();
  const withWorker = jobs.filter((job) => job.worker);
  const latestWorkerJob = withWorker.sort((a, b) => (b.worker?.heartbeatAt ?? "").localeCompare(a.worker?.heartbeatAt ?? ""))[0];
  return {
    workerId: WORKER_ID,
    active: activeJobs.size,
    leaseMs: WORKER_LEASE_MS,
    queueDepth: jobs.filter((job) => job.status === "queued").length,
    running: jobs.filter((job) => job.status === "running").length,
    recoverChecked: recovered.checked,
    recoveredStaleJobs: recovered.recovered,
    supportsLease: true,
    supportsHeartbeat: true,
    supportsStaleRecovery: true,
    supportsRetry: true,
    supportsCancel: true,
    supportsDrain: true,
    latestHeartbeatAt: latestWorkerJob?.worker?.heartbeatAt,
    latestLeaseExpiresAt: latestWorkerJob?.worker?.leaseExpiresAt,
    ready: Boolean(latestWorkerJob?.worker?.heartbeatAt),
  };
}
