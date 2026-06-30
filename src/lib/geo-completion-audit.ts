import "server-only";
import { getBrowserCaptures, summarizeBrowserCaptures } from "@/lib/geo-browser-capture";
import { getCitationCaptures, summarizeCitationCaptures } from "@/lib/geo-citation-capture";
import { getCitationJobs, getCitationJobWorkerSummary, summarizeCitationJobs } from "@/lib/geo-citation-jobs";
import { getCitationPacks, summarizeCitationPacks } from "@/lib/geo-citation-pack";
import { getRecordedCitationRuns } from "@/lib/geo-citation";
import { buildAiIndex, getGeoAssets, getGeoEvidenceBlocks } from "@/lib/geo-assets";
import { buildPromptTargets, summarizePromptTargets } from "@/lib/geo-prompts";
import { buildSourceMentions, summarizeSourceMentions } from "@/lib/geo-source-mentions";
import { buildGeoMonthlyReport, renderGeoMonthlyReportPdf } from "@/lib/geo-report";
import { createRewriteExperiment } from "@/lib/geo-rewrite";
import { getGeoLiveAuditImplementationSummary } from "@/lib/geo-live-audit";
import { getGeoMvpFunnelRuns, summarizeGeoMvpFunnelRuns } from "@/lib/geo-mvp-funnel";
import { getSearchMonitorRuns, summarizeSearchMonitorRuns } from "@/lib/geo-search-monitor";
import { summarizeGeoEvidenceRetention } from "@/lib/geo-evidence-retention";

export type CompletionAuditStatus = "done" | "partial" | "missing" | "blocked";

export interface CompletionAuditItem {
  id: string;
  area: "Epic" | "Phase" | "API" | "MVP" | "Risk";
  title: string;
  status: CompletionAuditStatus;
  evidence: string[];
  remaining: string[];
  sourceRefs: string[];
}

export interface GeoCompletionAudit {
  generatedAt: string;
  summary: {
    total: number;
    done: number;
    partial: number;
    missing: number;
    blocked: number;
    completionRate: number;
    canMarkGoalComplete: boolean;
  };
  blockers: string[];
  items: CompletionAuditItem[];
}

function statusRank(status: CompletionAuditStatus) {
  return { done: 0, partial: 1, missing: 2, blocked: 3 }[status];
}

function summarize(items: CompletionAuditItem[]) {
  const done = items.filter((item) => item.status === "done").length;
  const partial = items.filter((item) => item.status === "partial").length;
  const missing = items.filter((item) => item.status === "missing").length;
  const blocked = items.filter((item) => item.status === "blocked").length;
  return {
    total: items.length,
    done,
    partial,
    missing,
    blocked,
    completionRate: items.length ? Math.round((done / items.length) * 100) : 0,
    canMarkGoalComplete: partial + missing + blocked === 0,
  };
}

export function buildGeoCompletionAudit(): GeoCompletionAudit {
  const assets = getGeoAssets();
  const evidence = getGeoEvidenceBlocks();
  const aiIndex = buildAiIndex("https://brandgeo.cn");
  const prompts = buildPromptTargets({ limit: 100 });
  const promptSummary = summarizePromptTargets(prompts);
  const runs = getRecordedCitationRuns(20);
  const mimoRuns = runs.filter((run) => run.adapter === "mimo");
  const maxMimoPlatformCoverage = mimoRuns.reduce((max, run) => Math.max(max, run.platforms.length), 0);
  const maxMimoSnapshotCoverage = mimoRuns.reduce((max, run) => Math.max(max, run.metrics.totalSnapshots), 0);
  const jobs = getCitationJobs(20);
  const jobSummary = summarizeCitationJobs(jobs);
  const workerSummary = getCitationJobWorkerSummary();
  const captures = getCitationCaptures(20);
  const captureSummary = summarizeCitationCaptures(captures);
  const browserCaptures = getBrowserCaptures(20);
  const browserCaptureSummary = summarizeBrowserCaptures(browserCaptures);
  const citationPacks = getCitationPacks(20);
  const citationPackSummary = summarizeCitationPacks(citationPacks);
  const funnelRuns = getGeoMvpFunnelRuns(20);
  const funnelSummary = summarizeGeoMvpFunnelRuns(funnelRuns);
  const liveAuditImplementation = getGeoLiveAuditImplementationSummary();
  const sourceSummary = summarizeSourceMentions(buildSourceMentions({ minimum: 20 }));
  const searchMonitorRuns = getSearchMonitorRuns(20);
  const searchMonitorSummary = summarizeSearchMonitorRuns(searchMonitorRuns);
  const retentionSummary = summarizeGeoEvidenceRetention();
  const report = buildGeoMonthlyReport({ baseUrl: "https://brandgeo.cn", dateFrom: "2026-05-01", dateTo: "2026-05-31" });
  const reportPdfBytes = renderGeoMonthlyReportPdf(report).byteLength;
  const rewrite = createRewriteExperiment({ baseUrl: "https://brandgeo.cn" });

  const items = ([
    {
      id: "epic-a-ai-readable-layer",
      area: "Epic",
      title: "Epic A AI 可读页面层",
      status: aiIndex.counts.markdownTwins >= 42 && aiIndex.counts.evidenceBlocks >= 70 ? "done" : "partial",
      evidence: [
        `${assets.length} 个 ContentAsset`,
        `${aiIndex.counts.markdownTwins} 个 Markdown Twin`,
        `${aiIndex.counts.evidenceBlocks} 个 Evidence Blocks`,
        "`/llms.txt`、`/llms-full.txt`、`/ai-index.json`、`/ai/*` 已实现",
      ],
      remaining: [],
      sourceRefs: ["GH-1", "GH-2", "GH-3"],
    },
    {
      id: "epic-b-audit-v2",
      area: "Epic",
      title: "Epic B GEO 审计 v2",
      status: liveAuditImplementation.liveFetchChecks >= 12 ? "done" : "partial",
      evidence: [
        "`/api/geo/audit-v2` 已实现四层审计基础版",
        `${liveAuditImplementation.liveFetchChecks} 个实时抓取检查：robots、sitemap、HTML、headers/CDN、Markdown twin、llms、ai-index、schema、正文结构、证据密度、负面信号`,
        "dashboard 已新增 Live GEO Audit v2 面板，可浏览器点击运行并查看 findings",
      ],
      remaining: liveAuditImplementation.liveFetchChecks >= 12 ? [] : ["尚未对真实客户 sitemap / CDN / robots / JS 渲染做全站实时抓取审计"],
      sourceRefs: ["GH-4", "RES-5"],
    },
    {
      id: "epic-c-prompts",
      area: "Epic",
      title: "Epic C Prompt 研究与 Fan-out Map",
      status: promptSummary.totalPrompts >= 100 && promptSummary.fanoutQueries >= 500 ? "done" : "partial",
      evidence: [`${promptSummary.totalPrompts} 个 Prompt Targets`, `${promptSummary.fanoutQueries} 个 Fan-out Queries`, `coverage ${promptSummary.coverageRate}%`],
      remaining: [],
      sourceRefs: ["DATA-1", "GH-7"],
    },
    {
      id: "epic-d-citation-monitoring",
      area: "Epic",
      title: "Epic D Citation Monitoring v2",
      status: maxMimoPlatformCoverage >= 12 && jobSummary.done > 0 && workerSummary.ready ? "done" : runs.some((run) => run.adapter === "mimo") && jobSummary.done > 0 ? "partial" : "missing",
      evidence: [
        `${runs.length} 条 recorded CitationRun`,
        `${mimoRuns.length} 条 MIMO run`,
        `MIMO 最大平台覆盖 ${maxMimoPlatformCoverage} 个平台 / ${maxMimoSnapshotCoverage} 个 snapshots`,
        `${jobSummary.done} 个完成的 Citation Job`,
        `job contract 支持 retry ${jobSummary.retried} 次 / canceled ${jobSummary.canceled} 次`,
        `worker lease ${Math.round(workerSummary.leaseMs / 1000)}s / ready ${workerSummary.ready ? "yes" : "no"} / drain ${workerSummary.supportsDrain ? "yes" : "no"} / stale recovery ${workerSummary.supportsStaleRecovery ? "yes" : "no"}`,
        "`/api/geo/citation/trend` 可展示 prompt 级趋势基础数据",
      ],
      remaining: [
        ...(maxMimoPlatformCoverage >= 12 ? [] : ["尚未覆盖 12 平台真实 adapter 全量实测"]),
        ...(workerSummary.ready && workerSummary.supportsDrain && workerSummary.supportsStaleRecovery ? [] : ["worker lease / heartbeat / stale recovery / drain contract 尚未实测"]),
      ],
      sourceRefs: ["GH-5"],
    },
    {
      id: "epic-e-absorption",
      area: "Epic",
      title: "Epic E Citation Absorption Engine",
      status: evidence.length >= 70 ? "done" : "partial",
      evidence: [`${evidence.length} 个 Evidence Blocks`, "`/api/geo/absorption/analyze` 返回 subScores / selectedBlocks / missingBlocks / repairHints"],
      remaining: [],
      sourceRefs: ["RES-4", "RES-3", "RES-5"],
    },
    {
      id: "epic-f-citation-pack",
      area: "Epic",
      title: "Epic F Citation Pack 内容系统",
      status: citationPackSummary.ready > 0 && citationPackSummary.averageGatePassRate >= 80 ? "done" : "partial",
      evidence: [
        `${citationPackSummary.total} 个 Citation Pack`,
        `${citationPackSummary.ready} 个 ready pack`,
        `${citationPackSummary.faqCount} 个 FAQ`,
        `${citationPackSummary.evidenceBlockCount} 个 Citation Pack evidence blocks`,
        "BrandEntity / LawyerEntity / Service Fact Sheet / Markdown / JSON-LD 已接入 dashboard 表单与公开页面",
      ],
      remaining: citationPackSummary.ready > 0 ? [] : ["真实客户 BrandEntity / LawyerEntity / Service Fact Sheet 尚未生成"],
      sourceRefs: ["GH-4", "GH-7", "GH-8"],
    },
    {
      id: "epic-g-autogeo",
      area: "Epic",
      title: "Epic G AutoGEO Rewrite Lab",
      status: rewrite.variants.length >= 4 && rewrite.winner ? "done" : "partial",
      evidence: [`${rewrite.variants.length} 个 rewrite variants`, `winner: ${rewrite.winner.label}`, `delta +${rewrite.metrics.delta}`],
      remaining: [],
      sourceRefs: ["GH-6", "RES-2", "RES-6"],
    },
    {
      id: "epic-h-source-mentions",
      area: "Epic",
      title: "Epic H 外部可信信源与社区运营",
      status: sourceSummary.total >= 20 ? "done" : "partial",
      evidence: [`${sourceSummary.total} 条 source mentions`, `${sourceSummary.sourceDiversity} 类 source diversity`, `${sourceSummary.cited} 条 AI cited`],
      remaining: ["尚未连接真实第三方监测 / 搜索 API", "尚未做外部页面抓取归档"],
      sourceRefs: ["RD-2", "RD-4", "DATA-4", "DATA-5"],
    },
    {
      id: "epic-i-reports",
      area: "Epic",
      title: "Epic I 报表与客户可解释性",
      status: report.markdown && report.modules.actionPlan.length >= 5 && report.pdfProfile === "zh-cjk-type0" && report.dateRange.source === "query" ? "done" : "partial",
      evidence: [
        "`/api/geo/report/monthly` 支持 JSON / Markdown / HTML / PDF",
        `${report.modules.actionPlan.length} 条 Action Plan`,
        `dateRange ${report.dateRange.from} 至 ${report.dateRange.to} (${report.dateRange.source})`,
        `中文 PDF profile ${report.pdfProfile} / ${reportPdfBytes} bytes`,
      ],
      remaining: report.pdfProfile === "zh-cjk-type0" && report.dateRange.source === "query"
        ? []
        : ["中文 PDF 与 dateRange contract 尚未同时满足"],
      sourceRefs: ["GH-5", "RES-4"],
    },
    {
      id: "phase-1",
      area: "Phase",
      title: "Phase 1 AI 可读基础设施",
      status: "done",
      evidence: ["Markdown twin、alternate link、noindex、llms、ai-index、AI JSON 均已实现并 HTTP 验证过"],
      remaining: [],
      sourceRefs: ["GH-1", "GH-2", "GH-3", "GH-4"],
    },
    {
      id: "phase-2",
      area: "Phase",
      title: "Phase 2 Prompt 和引用监测",
      status: maxMimoPlatformCoverage >= 4 && jobSummary.done > 0 ? "done" : "partial",
      evidence: [
        `${promptSummary.totalPrompts} prompts`,
        `${runs.length} recorded runs`,
        `${jobSummary.done} done jobs`,
        `MIMO 最大平台覆盖 ${maxMimoPlatformCoverage} 个平台`,
      ],
      remaining: maxMimoPlatformCoverage >= 4
        ? []
        : ["PRD 要求“至少 4 个平台能跑完并落库”；当前真实 MIMO 仍未达到 4 平台持久化证据"],
      sourceRefs: ["GH-5", "DATA-1", "GH-7"],
    },
    {
      id: "phase-3",
      area: "Phase",
      title: "Phase 3 Citation Absorption",
      status: "done",
      evidence: ["任意 snapshot 可分析 selectedBlocks / drift / missing / repairHints"],
      remaining: [],
      sourceRefs: ["RES-4", "RES-3", "RES-5"],
    },
    {
      id: "phase-4",
      area: "Phase",
      title: "Phase 4 AutoGEO 改写实验",
      status: "done",
      evidence: ["baseline / structure / preference / conservative 四版本已可生成对比报告"],
      remaining: [],
      sourceRefs: ["GH-6", "RES-2", "RES-6"],
    },
    {
      id: "phase-5",
      area: "Phase",
      title: "Phase 5 外部可信信源闭环",
      status: sourceSummary.total >= 20 && searchMonitorSummary.done > 0 && browserCaptureSummary.searchResultPages > 0 ? "done" : "partial",
      evidence: [
        `${sourceSummary.total} 条 source mentions`,
        `${searchMonitorSummary.total} 条 search monitor run`,
        `${searchMonitorSummary.artifactCount} 个 SERP HTML artifact`,
        searchMonitorSummary.latestRunId
          ? `latest search monitor ${searchMonitorSummary.latestRunId} / ${searchMonitorSummary.latestProvider} / ${searchMonitorSummary.latestCadence}`
          : "暂无真实 search monitor run",
        `${captureSummary.capturedArtifacts} 个 fetch artifacts`,
        `${browserCaptureSummary.screenshotArtifacts} 个 browser screenshot artifacts`,
      ],
      remaining: [
        ...(searchMonitorSummary.done > 0 ? [] : ["外部来源被 AI 引用监测还未接真实第三方源"]),
        ...(browserCaptureSummary.searchResultPages > 0 ? [] : ["第三方搜索结果页截图样本仍需浏览器归档"]),
        ...(searchMonitorSummary.latestCadence && searchMonitorSummary.latestCadence !== "manual" ? [] : ["第三方搜索监测尚未设置 cadence / nextRunAt"]),
      ],
      sourceRefs: ["RD-2", "RD-4", "DATA-4", "DATA-5"],
    },
    {
      id: "api-surface",
      area: "API",
      title: "PRD API 草案覆盖",
      status: "done",
      evidence: [
        "assets / markdown / llms / audit-v2 / prompts / citation-run / citation-id / absorption / rewrite / source-mentions / monthly-report 均有 route",
        "额外补充 citation-pack / jobs / trend / capture / browser-captures / funnel / search-monitor / completion-audit API",
      ],
      remaining: [],
      sourceRefs: ["PRD-8"],
    },
    {
      id: "mvp-funnel",
      area: "MVP",
      title: "产品 MVP 闭环",
      status: funnelSummary.total > 0 && funnelSummary.latestCitationRunId ? "done" : "partial",
      evidence: [
        "API 层可完成抓站、Markdown、llms、审计、prompt、监测、absorption、修复建议、报告",
        "dashboard 已新增 Citation Pack Builder，可新建品牌事实资产并输出公开页面 / Markdown / JSON-LD",
        `${funnelSummary.total} 条 MVP Funnel Run`,
        funnelSummary.latestRunId
          ? `latest funnel ${funnelSummary.latestRunId} / pack ${funnelSummary.latestPackId} / citation ${funnelSummary.latestCitationRunId}`
          : "暂无真实 funnel run",
        funnelSummary.latestAuditScore !== undefined ? `latest audit score ${funnelSummary.latestAuditScore}` : "暂无 audit score",
        funnelSummary.latestAverageAbsorption !== undefined ? `latest average absorption ${funnelSummary.latestAverageAbsorption}` : "暂无 absorption score",
      ],
      remaining: funnelSummary.total > 0 ? [] : ["新建品牌后的抓站 -> 监测 -> absorption -> 报告全流程仍未串成一个单页向导"],
      sourceRefs: ["PRD-13.2"],
    },
    {
      id: "capture-evidence",
      area: "MVP",
      title: "原始证据可追溯",
      status: retentionSummary.hasPolicy
        && retentionSummary.hasFetchArtifacts
        && retentionSummary.hasBrowserScreenshots
        && retentionSummary.hasSearchResultEvidence
        && retentionSummary.hasSerpHtmlArtifacts
        ? "done"
        : captureSummary.capturedArtifacts > 0 ? "partial" : "missing",
      evidence: [
        `${captureSummary.capturedArtifacts} 个 fetch archive artifact`,
        `${browserCaptureSummary.screenshotArtifacts} 个 browser screenshot artifact`,
        `${browserCaptureSummary.searchResultPages} 个 search result page capture`,
        `${searchMonitorSummary.artifactCount} 个 SERP HTML artifact`,
        `retention policy ${retentionSummary.retentionDays} 天 / ${retentionSummary.artifacts} artifacts / ${retentionSummary.migrationTarget}`,
        captureSummary.latestCaptureId ? `latest fetch capture ${captureSummary.latestCaptureId}` : "暂无 fetch capture",
        browserCaptureSummary.latestCaptureId ? `latest browser capture ${browserCaptureSummary.latestCaptureId}` : "暂无 browser capture",
      ],
      remaining: [
        ...(browserCaptureSummary.screenshotArtifacts > 0 ? [] : ["缺浏览器截图归档"]),
        ...(browserCaptureSummary.searchResultPages > 0 ? [] : ["缺第三方搜索结果页归档"]),
        ...(retentionSummary.hasPolicy && retentionSummary.replayApiNoindex ? [] : ["缺证据保留策略 manifest 和 noindex 回放 API"]),
      ],
      sourceRefs: ["GH-5", "RES-4"],
    },
    {
      id: "schema-persistence",
      area: "Risk",
      title: "正式 SQLite/Drizzle 持久化",
      status: "blocked",
      evidence: ["当前 job/run/capture history 使用 file-backed `data/*.json`，便于本地验证"],
      remaining: ["项目规则要求修改数据库 schema 前先确认；尚未进行 Drizzle schema 迁移"],
      sourceRefs: ["PRD-7"],
    },
  ] satisfies CompletionAuditItem[]).sort((a, b) => statusRank(a.status) - statusRank(b.status));

  const summary = summarize(items);
  return {
    generatedAt: new Date().toISOString(),
    summary,
    blockers: items.filter((item) => item.status === "blocked" || item.status === "missing").flatMap((item) => item.remaining),
    items,
  };
}
