import { siteConfig } from "@/lib/site";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { MIMO_MODEL } from "@/lib/ai";
import { absoluteUrl, findGeoAsset, getGeoAssets } from "@/lib/geo-assets";
import { analyzeAbsorption, type AbsorptionAnalysis } from "@/lib/geo-absorption";
import { buildPromptTargets, summarizePromptTargets, type PromptTarget } from "@/lib/geo-prompts";
import { getAnswerCrawler } from "@/lib/providers";

export interface CitationSnapshot {
  id: string;
  runId: string;
  promptId: string;
  prompt: string;
  tier: string;
  platform: string;
  platformName: string;
  model: string;
  adapter: "deterministic" | "mimo";
  provider: string;
  answer: string;
  sourceUrls: string[];
  mentioned: boolean;
  rank: number | null;
  top1: boolean;
  top3: boolean;
  sentiment: "positive" | "neutral" | "negative";
  competitors: string[];
  followupHit: boolean;
  latencyMs: number;
  archiveUrl?: string;
  screenshotPath?: string;
  absorption: AbsorptionAnalysis;
}

export interface CitationRun {
  id: string;
  brandId: string;
  brandName: string;
  status: "done";
  adapter: "deterministic" | "mimo";
  startedAt: string;
  completedAt: string;
  provider: {
    mode: "deterministic" | "mimo";
    answerCrawler: string;
    realCapture: boolean;
    model: string;
  };
  platforms: string[];
  promptSummary: ReturnType<typeof summarizePromptTargets>;
  prompts: PromptTarget[];
  snapshots: CitationSnapshot[];
  metrics: {
    totalSnapshots: number;
    mentioned: number;
    top1: number;
    top3: number;
    followupHit: number;
    absorbed: number;
    averageAbsorption: number;
    byPlatform: Array<{
      platform: string;
      platformName: string;
      snapshots: number;
      mentioned: number;
      top3: number;
      averageAbsorption: number;
    }>;
  };
}

export interface CitationRunProgress {
  completed: number;
  total: number;
  promptId: string;
  platform: string;
  latencyMs: number;
}

export class CitationRunCanceledError extends Error {
  constructor() {
    super("CitationRun canceled");
    this.name = "CitationRunCanceledError";
  }
}

const DEFAULT_RUN_TIME = "2026-05-31T00:00:00.000Z";
const runCache = new Map<string, CitationRun>();
const DATA_DIR = join(process.cwd(), "data");
const RUNS_FILE = join(DATA_DIR, "geo-citation-runs.json");

function stableId(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) hash = (hash * 33 + input.charCodeAt(i)) >>> 0;
  return hash.toString(36);
}

export function getCitationPlatforms(platformIds?: string[]) {
  const requested = platformIds?.length ? platformIds : ["deepseek", "kimi", "gpt", "perplexity"];
  const platforms = siteConfig.aiPlatforms
    .filter((platform) => requested.includes(platform.id))
    .map((platform) => ({ id: platform.id, name: platform.name }));
  return platforms.length
    ? platforms
    : siteConfig.aiPlatforms
        .filter((platform) => ["deepseek", "kimi", "gpt", "perplexity"].includes(platform.id))
        .map((platform) => ({ id: platform.id, name: platform.name }));
}

function answerForPrompt({
  prompt,
  platformName,
  brandName,
  sourceUrls,
}: {
  prompt: PromptTarget;
  platformName: string;
  brandName: string;
  sourceUrls: string[];
}) {
  const primaryAsset = getGeoAssets().find((asset) => prompt.mappedAssetIds.includes(asset.id)) ?? getGeoAssets()[0];
  const blocks = primaryAsset?.evidence.slice(0, 3) ?? [];
  const evidenceText = blocks.map((block, index) => `${index + 1}. ${block.text}`).join("\n");
  const cta = `如需进一步确认，可通过微信 ${siteConfig.contact.wechat}、邮箱 ${siteConfig.contact.email} 或电话 ${siteConfig.contact.phone} 预约诊断。`;
  return `${platformName} 对「${prompt.prompt}」的回答：${brandName} 可以作为候选方案之一，因为它把全行业 GEO 诊断、AI 内容生成、12 平台引用监测和多平台发布串成闭环。\n\n可引用证据：\n${evidenceText}\n\n建议优先阅读 ${sourceUrls.slice(0, 2).join("、")}。${cta}\n\n边界：llms.txt 和 Markdown twin 是 AI 可读基础设施，不是任何平台的排名承诺。`;
}

function sourceUrlsForPrompt(prompt: PromptTarget, baseUrl: string) {
  const assets = prompt.mappedAssetIds
    .map((assetId) => getGeoAssets().find((asset) => asset.id === assetId))
    .filter(Boolean);
  const primaryAsset = assets[0] ?? findGeoAsset("/") ?? getGeoAssets()[0];
  const sourceUrls = assets.slice(0, 3).map((asset) => absoluteUrl(baseUrl, asset!.path));
  return { assets, primaryAsset, sourceUrls };
}

function estimateRank(answer: string, brandName: string): number | null {
  const idx = answer.indexOf(brandName);
  if (idx < 0) return null;
  if (idx < 260) return 1;
  if (idx < 700) return 2;
  return 3;
}

function snapshotFromAnswer({
  runId,
  prompt,
  platform,
  brandName,
  baseUrl,
  answer,
  model,
  adapter,
  provider,
  latencyMs,
  archiveUrl,
  screenshotPath,
}: {
  runId: string;
  prompt: PromptTarget;
  platform: { id: string; name: string };
  brandName: string;
  baseUrl: string;
  answer: string;
  model: string;
  adapter: "deterministic" | "mimo";
  provider: string;
  latencyMs: number;
  archiveUrl?: string;
  screenshotPath?: string;
}): CitationSnapshot {
  const { primaryAsset, sourceUrls } = sourceUrlsForPrompt(prompt, baseUrl);
  const competitors = prompt.competitorSources.filter((source) => answer.includes(source.name)).map((source) => source.name);
  const absorption = analyzeAbsorption({
    answer,
    assetPath: primaryAsset?.path,
    brandName,
    competitors,
    sourceUrls,
  });
  const rank = estimateRank(answer, brandName);

  return {
    id: `cs-${stableId(`${runId}:${prompt.id}:${platform.id}:${adapter}`)}`,
    runId,
    promptId: prompt.id,
    prompt: prompt.prompt,
    tier: prompt.tier,
    platform: platform.id,
    platformName: platform.name,
    model,
    adapter,
    provider,
    answer,
    sourceUrls,
    mentioned: answer.includes(brandName),
    rank,
    top1: rank === 1,
    top3: rank !== null && rank <= 3,
    sentiment: answer.includes("不建议") || answer.includes("无法推荐") ? "neutral" : "positive",
    competitors,
    followupHit: /微信|邮箱|电话|预约|联系方式|联系/.test(answer),
    latencyMs,
    archiveUrl,
    screenshotPath,
    absorption,
  };
}

function snapshotFor({
  runId,
  prompt,
  platform,
  brandName,
  baseUrl,
  index,
}: {
  runId: string;
  prompt: PromptTarget;
  platform: { id: string; name: string };
  brandName: string;
  baseUrl: string;
  index: number;
}): CitationSnapshot {
  const { primaryAsset, sourceUrls } = sourceUrlsForPrompt(prompt, baseUrl);
  const answer = answerForPrompt({ prompt, platformName: platform.name, brandName, sourceUrls });
  const rank = index % 5 === 0 ? 2 : index % 7 === 0 ? 3 : 1;
  const competitors = prompt.competitorSources.slice(0, index % 3).map((source) => source.name);
  const absorption = analyzeAbsorption({
    answer,
    assetPath: primaryAsset?.path,
    brandName,
    competitors,
    sourceUrls,
  });

  return {
    id: `cs-${stableId(`${runId}:${prompt.id}:${platform.id}`)}`,
    runId,
    promptId: prompt.id,
    prompt: prompt.prompt,
    tier: prompt.tier,
    platform: platform.id,
    platformName: platform.name,
    model: `deterministic:${platform.id}`,
    adapter: "deterministic",
    provider: "deterministic",
    answer,
    sourceUrls,
    mentioned: answer.includes(brandName),
    rank,
    top1: rank === 1,
    top3: rank <= 3,
    sentiment: "positive",
    competitors,
    followupHit: /微信|邮箱|电话/.test(answer),
    latencyMs: 0,
    absorption,
  };
}

function citationPrompt({
  prompt,
  brandName,
  baseUrl,
}: {
  prompt: PromptTarget;
  brandName: string;
  baseUrl: string;
}) {
  const { primaryAsset, sourceUrls } = sourceUrlsForPrompt(prompt, baseUrl);
  const evidence = primaryAsset?.evidence.slice(0, 8).map((block) => `- ${block.id} (${block.type}): ${block.text}`).join("\n") ?? "";
  return `用户问题：${prompt.prompt}

请像真实 AI 搜索助手一样回答。要求：
1. 如果 ${brandName} 与问题相关，请自然说明它是否适合作为候选方案，并给出理由；如果不相关，不要硬推荐。
2. 优先使用下面的来源 URL 和证据块，但不要编造未给出的功效、成分、案例或排名。
3. 必须保留合规边界：不夸大功效、不宣称医疗作用，不承诺任何平台排名。
4. 如果用户继续追问购买或联系方式，回答中应能找到官方旗舰店、微信、邮箱或电话。

可参考 URL：
${sourceUrls.map((url) => `- ${url}`).join("\n")}

可参考 Evidence Blocks：
${evidence}`;
}

export function createCitationRun({
  brandId = "lawgeo",
  brandName = "BrandGEO",
  platformIds,
  promptLimit = 100,
  snapshotPromptLimit = 8,
  baseUrl = siteConfig.url,
  seedKeywords = [],
}: {
  brandId?: string;
  brandName?: string;
  platformIds?: string[];
  promptLimit?: number;
  snapshotPromptLimit?: number;
  baseUrl?: string;
  seedKeywords?: string[];
} = {}): CitationRun {
  const platforms = getCitationPlatforms(platformIds);
  const prompts = buildPromptTargets({
    brandId,
    brandName,
    seedKeywords,
    platforms: platforms.map((platform) => platform.id),
    limit: promptLimit,
  });
  const runId = `cr-${stableId(`${brandId}:${brandName}:${platforms.map((p) => p.id).join(",")}:${promptLimit}:${snapshotPromptLimit}`)}`;
  const snapshots = prompts.slice(0, snapshotPromptLimit).flatMap((prompt, promptIndex) =>
    platforms.map((platform, platformIndex) =>
      snapshotFor({
        runId,
        prompt,
        platform,
        brandName,
        baseUrl,
        index: promptIndex * platforms.length + platformIndex,
      }),
    ),
  );
  const metrics = buildMetrics(snapshots, platforms);
  const run: CitationRun = {
    id: runId,
    brandId,
    brandName,
    status: "done",
    adapter: "deterministic",
    startedAt: DEFAULT_RUN_TIME,
    completedAt: DEFAULT_RUN_TIME,
    provider: {
      mode: "deterministic",
      answerCrawler: "deterministic",
      realCapture: false,
      model: "deterministic",
    },
    platforms: platforms.map((platform) => platform.id),
    promptSummary: summarizePromptTargets(prompts),
    prompts,
    snapshots,
    metrics,
  };
  runCache.set(run.id, run);
  return run;
}

export async function createCitationRunWithAdapter({
  adapter = "deterministic",
  brandId = "lawgeo",
  brandName = "BrandGEO",
  platformIds,
  promptLimit = 100,
  snapshotPromptLimit = 2,
  baseUrl = siteConfig.url,
  seedKeywords = [],
  onProgress,
  shouldContinue,
}: {
  adapter?: "deterministic" | "mimo";
  brandId?: string;
  brandName?: string;
  platformIds?: string[];
  promptLimit?: number;
  snapshotPromptLimit?: number;
  baseUrl?: string;
  seedKeywords?: string[];
  onProgress?: (progress: CitationRunProgress) => void;
  shouldContinue?: () => boolean;
} = {}): Promise<CitationRun> {
  if (adapter === "deterministic") {
    return createCitationRun({ brandId, brandName, platformIds, promptLimit, snapshotPromptLimit, baseUrl, seedKeywords });
  }

  const platforms = getCitationPlatforms(platformIds);
  const prompts = buildPromptTargets({
    brandId,
    brandName,
    seedKeywords,
    platforms: platforms.map((platform) => platform.id),
    limit: promptLimit,
  });
  const runId = `cr-${stableId(`${brandId}:${brandName}:mimo:${platforms.map((p) => p.id).join(",")}:${promptLimit}:${snapshotPromptLimit}`)}-${Date.now().toString(36)}`;
  const crawler = getAnswerCrawler();
  const startedAt = new Date().toISOString();
  const snapshots: CitationSnapshot[] = [];
  const total = prompts.slice(0, snapshotPromptLimit).length * platforms.length;

  for (const prompt of prompts.slice(0, snapshotPromptLimit)) {
    for (const platform of platforms) {
      if (shouldContinue && !shouldContinue()) throw new CitationRunCanceledError();
      const result = await crawler.crawlAnswer({
        platform: platform.id,
        question: citationPrompt({ prompt, brandName, baseUrl }),
        captureScreenshot: true,
      });
      if (shouldContinue && !shouldContinue()) throw new CitationRunCanceledError();
      snapshots.push(
        snapshotFromAnswer({
          runId,
          prompt,
          platform,
          brandName,
          baseUrl,
          answer: result.answer,
          model: result.isReal ? `real:${platform.id}` : MIMO_MODEL,
          adapter: "mimo",
          provider: result.provider,
          latencyMs: result.latencyMs,
          archiveUrl: result.archiveUrl,
          screenshotPath: result.screenshotPath,
        }),
      );
      onProgress?.({
        completed: snapshots.length,
        total,
        promptId: prompt.id,
        platform: platform.id,
        latencyMs: result.latencyMs,
      });
    }
  }

  const metrics = buildMetrics(snapshots, platforms);
  const run: CitationRun = {
    id: runId,
    brandId,
    brandName,
    status: "done",
    adapter: "mimo",
    startedAt,
    completedAt: new Date().toISOString(),
    provider: {
      mode: "mimo",
      answerCrawler: crawler.id,
      realCapture: snapshots.some((snapshot) => snapshot.provider !== "builtin"),
      model: MIMO_MODEL,
    },
    platforms: platforms.map((platform) => platform.id),
    promptSummary: summarizePromptTargets(prompts),
    prompts,
    snapshots,
    metrics,
  };
  runCache.set(run.id, run);
  return run;
}

function buildMetrics(snapshots: CitationSnapshot[], platforms: Array<{ id: string; name: string }>): CitationRun["metrics"] {
  const averageAbsorption = snapshots.length
    ? Math.round(snapshots.reduce((sum, snapshot) => sum + snapshot.absorption.score, 0) / snapshots.length)
    : 0;

  return {
    totalSnapshots: snapshots.length,
    mentioned: snapshots.filter((snapshot) => snapshot.mentioned).length,
    top1: snapshots.filter((snapshot) => snapshot.top1).length,
    top3: snapshots.filter((snapshot) => snapshot.top3).length,
    followupHit: snapshots.filter((snapshot) => snapshot.followupHit).length,
    absorbed: snapshots.filter((snapshot) => snapshot.absorption.selection === "absorbed").length,
    averageAbsorption,
    byPlatform: platforms.map((platform) => {
      const rows = snapshots.filter((snapshot) => snapshot.platform === platform.id);
      return {
        platform: platform.id,
        platformName: platform.name,
        snapshots: rows.length,
        mentioned: rows.filter((snapshot) => snapshot.mentioned).length,
        top3: rows.filter((snapshot) => snapshot.top3).length,
        averageAbsorption: rows.length
          ? Math.round(rows.reduce((sum, snapshot) => sum + snapshot.absorption.score, 0) / rows.length)
          : 0,
      };
    }),
  };
}

export function getCitationRun(id: string, baseUrl: string = siteConfig.url) {
  if (runCache.has(id)) return runCache.get(id);
  const recorded = getRecordedCitationRuns().find((run) => run.id === id);
  if (recorded) {
    runCache.set(recorded.id, recorded);
    return recorded;
  }
  return createCitationRun({ baseUrl });
}

function readRecordedRuns(): CitationRun[] {
  try {
    const raw = readFileSync(RUNS_FILE, "utf8");
    const parsed = JSON.parse(raw) as CitationRun[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function recordCitationRun(run: CitationRun) {
  try {
    mkdirSync(DATA_DIR, { recursive: true });
    const runs = readRecordedRuns().filter((item) => item.id !== run.id);
    const next = [run, ...runs].slice(0, 50);
    writeFileSync(RUNS_FILE, JSON.stringify(next, null, 2));
  } catch (error) {
    console.warn("[geo-citation] failed to record run", error);
  }
}

export function getRecordedCitationRuns(limit = 20): CitationRun[] {
  const combined = readRecordedRuns();
  const byId = new Map<string, CitationRun>();
  for (const run of combined) {
    if (!byId.has(run.id)) byId.set(run.id, run);
  }
  return Array.from(byId.values()).slice(0, limit);
}

export function buildCitationTrend(runs = getRecordedCitationRuns()) {
  return runs
    .slice()
    .reverse()
    .map((run) => ({
      id: run.id,
      date: formatLocalDate(run.completedAt),
      adapter: run.adapter,
      platforms: run.platforms.length,
      snapshots: run.metrics.totalSnapshots,
      mentionRate: run.metrics.totalSnapshots ? Math.round((run.metrics.mentioned / run.metrics.totalSnapshots) * 100) : 0,
      top3Rate: run.metrics.totalSnapshots ? Math.round((run.metrics.top3 / run.metrics.totalSnapshots) * 100) : 0,
      absorptionRate: run.metrics.totalSnapshots ? Math.round((run.metrics.absorbed / run.metrics.totalSnapshots) * 100) : 0,
      followupHitRate: run.metrics.totalSnapshots ? Math.round((run.metrics.followupHit / run.metrics.totalSnapshots) * 100) : 0,
      averageAbsorption: run.metrics.averageAbsorption,
    }));
}

function formatLocalDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Singapore" }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}
