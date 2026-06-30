import "server-only";
import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { buildGeoLiveAudit } from "@/lib/geo-live-audit";
import { citationPackPath, createCitationPack, type CitationPack } from "@/lib/geo-citation-pack";
import { createCitationRun, recordCitationRun, type CitationRun } from "@/lib/geo-citation";
import { buildGeoMonthlyReport, type GeoMonthlyReport } from "@/lib/geo-report";
import { siteConfig } from "@/lib/site";

export type GeoMvpFunnelStepId = "intake" | "crawl" | "monitor" | "absorption" | "report";
export type GeoMvpFunnelStepStatus = "done" | "warning" | "failed";

export interface GeoMvpFunnelStep {
  id: GeoMvpFunnelStepId;
  label: string;
  status: GeoMvpFunnelStepStatus;
  evidence: string;
  link?: string;
}

export interface GeoMvpFunnelRun {
  id: string;
  createdAt: string;
  brandName: string;
  siteUrl: string;
  serviceName: string;
  packId: string;
  citationRunId: string;
  reportId: string;
  status: "done" | "warning" | "failed";
  steps: GeoMvpFunnelStep[];
  metrics: {
    auditScore: number;
    promptCount: number;
    snapshotCount: number;
    mentionRate: number;
    top3Rate: number;
    averageAbsorption: number;
    missingBlocks: number;
    actionItems: number;
  };
  links: {
    citationPack: string;
    markdown: string;
    jsonLd: string;
    citationRun: string;
    reportJson: string;
    reportHtml: string;
    reportPdf: string;
  };
  limitations: string[];
}

export interface GeoMvpFunnelSummary {
  total: number;
  done: number;
  warning: number;
  latestRunId?: string;
  latestBrandName?: string;
  latestPackId?: string;
  latestCitationRunId?: string;
  latestAuditScore?: number;
  latestAverageAbsorption?: number;
}

const DATA_DIR = join(process.cwd(), "data");
const FUNNEL_FILE = join(DATA_DIR, "geo-mvp-funnel-runs.json");

const inputSchema = z.object({
  brandName: z.string().min(2).default("悦肌护肤"),
  siteUrl: z.string().optional(),
  city: z.string().optional(),
  primaryService: z.string().optional(),
  lawyerName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  wechat: z.string().optional(),
  lawPracticeAreas: z.union([z.string(), z.array(z.string())]).optional(),
  audience: z.union([z.string(), z.array(z.string())]).optional(),
  process: z.union([z.string(), z.array(z.string())]).optional(),
  feeFactors: z.union([z.string(), z.array(z.string())]).optional(),
  materials: z.union([z.string(), z.array(z.string())]).optional(),
  riskBoundaries: z.union([z.string(), z.array(z.string())]).optional(),
});

function readStoredRuns(): GeoMvpFunnelRun[] {
  try {
    const raw = readFileSync(FUNNEL_FILE, "utf8");
    const parsed = JSON.parse(raw) as GeoMvpFunnelRun[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredRuns(runs: GeoMvpFunnelRun[]) {
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(FUNNEL_FILE, JSON.stringify(runs.slice(0, 100), null, 2));
}

function safeSiteUrl(input?: string) {
  const fallback = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:4648";
  try {
    return new URL(input || fallback).toString();
  } catch {
    return fallback;
  }
}

function percent(numerator: number, denominator: number) {
  return denominator ? Math.round((numerator / denominator) * 100) : 0;
}

function buildLinks(pack: CitationPack, citationRun: CitationRun, report: GeoMonthlyReport) {
  const packPath = citationPackPath(pack);
  const reportQuery = `brandId=${encodeURIComponent(report.brandId)}&brandName=${encodeURIComponent(report.brandName)}&period=${encodeURIComponent(report.period)}`;
  return {
    citationPack: packPath,
    markdown: `${packPath}.md`,
    jsonLd: `/api/geo/citation-pack/${pack.id}?format=jsonld`,
    citationRun: `/api/geo/citation/${citationRun.id}`,
    reportJson: `/api/geo/report/monthly?${reportQuery}`,
    reportHtml: `/api/geo/report/monthly?format=html&${reportQuery}`,
    reportPdf: `/api/geo/report/monthly?format=pdf&${reportQuery}`,
  };
}

export async function createGeoMvpFunnelRun(input: unknown = {}) {
  const normalized = inputSchema.parse(input);
  const siteUrl = safeSiteUrl(normalized.siteUrl);
  const serviceName = normalized.primaryService || "敏感肌精华液选购咨询";
  const pack = createCitationPack({
    ...normalized,
    website: siteUrl,
    primaryService: serviceName,
    sameAs: [siteUrl, new URL("/llms.txt", siteUrl).toString(), new URL("/ai-index.json", siteUrl).toString()],
  });
  const liveAudit = await buildGeoLiveAudit(siteUrl);
  const citationRun = createCitationRun({
    brandId: pack.id,
    brandName: pack.brandEntity.name,
    baseUrl: siteUrl,
    promptLimit: 20,
    snapshotPromptLimit: 8,
  });
  recordCitationRun(citationRun);
  const report = buildGeoMonthlyReport({
    brandId: pack.id,
    brandName: pack.brandEntity.name,
    period: "2026-05",
    baseUrl: siteUrl,
  });
  const missingBlocks = Array.from(new Set(citationRun.snapshots.flatMap((snapshot) => snapshot.absorption.missingBlocks))).length;
  const links = buildLinks(pack, citationRun, report);
  const steps: GeoMvpFunnelStep[] = [
    {
      id: "intake",
      label: "品牌事实资产",
      status: pack.status === "ready" ? "done" : "warning",
      evidence: `${pack.brandEntity.name} 已生成 Citation Pack，FAQ ${pack.metrics.faqCount} 条，Evidence Blocks ${pack.metrics.evidenceBlockCount} 个。`,
      link: links.citationPack,
    },
    {
      id: "crawl",
      label: "抓站与 GEO Audit",
      status: liveAudit.score >= 80 ? "done" : "warning",
      evidence: `Live GEO Audit 得分 ${liveAudit.score}/100，检查项 ${liveAudit.liveChecks.length} 个。`,
      link: `/api/geo/audit-v2?siteUrl=${encodeURIComponent(siteUrl)}`,
    },
    {
      id: "monitor",
      label: "Prompt 监测",
      status: citationRun.metrics.totalSnapshots > 0 ? "done" : "failed",
      evidence: `生成 CitationRun ${citationRun.id}，快照 ${citationRun.metrics.totalSnapshots} 条，Top3 ${citationRun.metrics.top3} 条。`,
      link: links.citationRun,
    },
    {
      id: "absorption",
      label: "Absorption 评分",
      status: citationRun.metrics.averageAbsorption >= 70 ? "done" : "warning",
      evidence: `平均 Absorption ${citationRun.metrics.averageAbsorption}/100，缺口块 ${missingBlocks} 个。`,
      link: "/api/geo/absorption/analyze",
    },
    {
      id: "report",
      label: "客户报告",
      status: report.modules.actionPlan.length >= 5 ? "done" : "warning",
      evidence: `生成报告 ${report.id}，Action Plan ${report.modules.actionPlan.length} 条。`,
      link: links.reportHtml,
    },
  ];
  const status = steps.some((step) => step.status === "failed") ? "failed" : steps.some((step) => step.status === "warning") ? "warning" : "done";
  const run: GeoMvpFunnelRun = {
    id: `gf-${randomUUID().slice(0, 8)}`,
    createdAt: new Date().toISOString(),
    brandName: pack.brandEntity.name,
    siteUrl,
    serviceName,
    packId: pack.id,
    citationRunId: citationRun.id,
    reportId: report.id,
    status,
    steps,
    metrics: {
      auditScore: liveAudit.score,
      promptCount: citationRun.promptSummary.totalPrompts,
      snapshotCount: citationRun.metrics.totalSnapshots,
      mentionRate: percent(citationRun.metrics.mentioned, citationRun.metrics.totalSnapshots),
      top3Rate: percent(citationRun.metrics.top3, citationRun.metrics.totalSnapshots),
      averageAbsorption: citationRun.metrics.averageAbsorption,
      missingBlocks,
      actionItems: report.modules.actionPlan.length,
    },
    links,
    limitations: [
      "本 MVP 向导使用 file-backed history；正式客户数据仍需 SQLite/Drizzle schema 确认后落库。",
      "向导监测走 deterministic 快速链路；真实 12 平台 MIMO 长任务已通过独立 Citation Job 验收。",
      "报告链接复用月报 API；中文 PDF 与 dateRange 数据库查询仍在 Epic I 后续项。",
    ],
  };
  const runs = readStoredRuns().filter((item) => item.id !== run.id);
  writeStoredRuns([run, ...runs].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  return { run, pack, citationRun, report, liveAudit };
}

export function getGeoMvpFunnelRuns(limit = 20) {
  return readStoredRuns().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
}

export function summarizeGeoMvpFunnelRuns(runs = getGeoMvpFunnelRuns()): GeoMvpFunnelSummary {
  const total = runs.length;
  const latest = runs[0];
  return {
    total,
    done: runs.filter((run) => run.status === "done").length,
    warning: runs.filter((run) => run.status === "warning").length,
    latestRunId: latest?.id,
    latestBrandName: latest?.brandName,
    latestPackId: latest?.packId,
    latestCitationRunId: latest?.citationRunId,
    latestAuditScore: latest?.metrics.auditScore,
    latestAverageAbsorption: latest?.metrics.averageAbsorption,
  };
}

export const defaultGeoMvpFunnelInput = {
  brandName: "悦肌护肤",
  siteUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:4648",
  city: "上海",
  primaryService: "敏感肌精华液选购咨询",
  lawyerName: "悦肌成分专家",
  lawPracticeAreas: "敏感肌修护, 美白淡斑, 抗老紧致",
  audience: "不清楚自己肤质适合哪类精华的人, 屏障受损容易泛红刺痛的敏感肌, 想先做成分与功效评估的用户",
  process: "初步肤质与需求访谈, 成分与功效适配梳理, 使用方案与耐受评估, 搭配建议或下单路径",
  feeFactors: "产品规格, 成分浓度与配方, 是否套装组合, 是否含定制服务",
  materials: "当前护肤清单, 肤质与过敏史, 近期使用反馈, 肤况照片（如有）",
  riskBoundaries: "不宣称医疗功效, 不承诺速效或绝对效果, 价格和方案以正式订单为准",
  phone: siteConfig.contact.phone,
  email: siteConfig.contact.email,
  wechat: siteConfig.contact.wechat,
};
