import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bot, Camera, FileText, Network, Radar, Route, Search, ShieldCheck, Target, type LucideIcon } from "lucide-react";
import { buildCitationTrend, createCitationRun, getRecordedCitationRuns } from "@/lib/geo-citation";
import { getBrowserCaptures, summarizeBrowserCaptures } from "@/lib/geo-browser-capture";
import { getCitationCaptures, summarizeCitationCaptures } from "@/lib/geo-citation-capture";
import { getCitationJobs, getCitationJobWorkerSummary, summarizeCitationJobs } from "@/lib/geo-citation-jobs";
import { getCitationPacks, summarizeCitationPacks } from "@/lib/geo-citation-pack";
import { buildGeoCompletionAudit, type CompletionAuditStatus } from "@/lib/geo-completion-audit";
import { buildAiIndex, getGeoAssets, getGeoEvidenceBlocks } from "@/lib/geo-assets";
import { buildPromptTargets, summarizePromptTargets } from "@/lib/geo-prompts";
import { createRewriteExperiment } from "@/lib/geo-rewrite";
import { buildGeoMonthlyReport } from "@/lib/geo-report";
import { buildSourceMentions, summarizeSourceMentions } from "@/lib/geo-source-mentions";
import { getGeoMvpFunnelRuns, summarizeGeoMvpFunnelRuns } from "@/lib/geo-mvp-funnel";
import { getSearchMonitorRuns, summarizeSearchMonitorRuns } from "@/lib/geo-search-monitor";
import { summarizeGeoEvidenceRetention } from "@/lib/geo-evidence-retention";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashHeader, DashSection } from "@/components/ui/section";
import { CitationPackBuilder } from "@/components/dashboard/citation-pack-builder";
import { GeoLiveAuditPanel } from "@/components/dashboard/geo-live-audit-panel";
import { GeoMvpFunnelWizard } from "@/components/dashboard/geo-mvp-funnel-wizard";
import { GeoSearchMonitorPanel } from "@/components/dashboard/geo-search-monitor-panel";

export const metadata: Metadata = { title: "GEO 引用工程", robots: { index: false } };
const defaultAuditSiteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:4648";

const phases = [
  { name: "M1 AI 可读层", status: "已落地", desc: "Markdown twin、llms、llms-full、ai-index、AI discovery JSON" },
  { name: "M2 审计 v2", status: "基础版", desc: "四层分数、来源编号、失败原因与修复建议" },
  { name: "M3 引用监测", status: "基础版", desc: "Prompt 库、fan-out、4 平台 deterministic adapter、答案快照和 Top3 指标" },
  { name: "M4 Citation Absorption", status: "基础版", desc: "Evidence Blocks、sub-score、drift、missing blocks 与 repair hints" },
  { name: "M5 AutoGEO Rewrite", status: "基础版", desc: "Rule set、baseline / structure / preference / conservative 改写、GEO / GEU / Absorption 对比" },
  { name: "M6 外部信源与报告", status: "基础版", desc: "Source Mention Tracker、source diversity、AI cited 标注和月报 Markdown / JSON 输出" },
];

export default function GeoCitationPage() {
  const assets = getGeoAssets();
  const evidence = getGeoEvidenceBlocks();
  const index = buildAiIndex("https://brandgeo.cn");
  const prompts = buildPromptTargets({ limit: 100 });
  const promptSummary = summarizePromptTargets(prompts);
  const citationRun = createCitationRun({ baseUrl: "https://brandgeo.cn", promptLimit: 100, snapshotPromptLimit: 8 });
  const recordedRuns = getRecordedCitationRuns(8);
  const citationTrend = buildCitationTrend(recordedRuns);
  const citationJobs = getCitationJobs(8);
  const citationJobSummary = summarizeCitationJobs(citationJobs);
  const citationWorkerSummary = getCitationJobWorkerSummary();
  const citationCaptures = getCitationCaptures(8);
  const captureSummary = summarizeCitationCaptures(citationCaptures);
  const browserCaptures = getBrowserCaptures(8);
  const browserCaptureSummary = summarizeBrowserCaptures(browserCaptures);
  const citationPacks = getCitationPacks(8);
  const citationPackSummary = summarizeCitationPacks(citationPacks);
  const funnelRuns = getGeoMvpFunnelRuns(8);
  const funnelSummary = summarizeGeoMvpFunnelRuns(funnelRuns);
  const completionAudit = buildGeoCompletionAudit();
  const latestRunId = recordedRuns[0]?.id ?? citationRun.id;
  const rewriteExperiment = createRewriteExperiment({
    baseUrl: "https://brandgeo.cn",
    assetPath: "/cases/cosmetics",
    platform: "gpt",
    prompt: topPromptForRewrite(prompts),
  });
  const sourceMentions = buildSourceMentions({ minimum: 20 });
  const sourceSummary = summarizeSourceMentions(sourceMentions);
  const searchMonitorRuns = getSearchMonitorRuns(8);
  const searchMonitorSummary = summarizeSearchMonitorRuns(searchMonitorRuns);
  const retentionSummary = summarizeGeoEvidenceRetention();
  const monthlyReport = buildGeoMonthlyReport({ baseUrl: "https://brandgeo.cn" });
  const typeCounts = assets.reduce<Record<string, number>>((acc, asset) => {
    acc[asset.type] = (acc[asset.type] ?? 0) + 1;
    return acc;
  }, {});
  const topAssets = assets.slice(0, 10);
  const topPrompts = prompts.slice(0, 8);
  const topSnapshots = citationRun.snapshots.slice(0, 8);
  const topMissing = Array.from(new Set(citationRun.snapshots.flatMap((snapshot) => snapshot.absorption.missingBlocks))).slice(0, 8);

  return (
    <div className="px-6 py-8 lg:px-10">
      <DashHeader
        title="GEO 引用工程闭环"
        description="把 PRD 中的 AI 可读层、引用诊断、证据块和后续监测能力拆成可验证工程状态。"
        action={
          <Button asChild variant="outline" size="sm">
            <Link href="/ai-index.json" target="_blank">
              打开 ai-index <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="公开内容资产" value={assets.length} icon={FileText} />
        <MetricCard label="Markdown Twin" value={index.counts.markdownTwins} icon={Bot} />
        <MetricCard label="Evidence Blocks" value={evidence.length} icon={Network} />
        <MetricCard label="Prompt Targets" value={promptSummary.totalPrompts} icon={Target} />
        <MetricCard label="Fan-out Queries" value={promptSummary.fanoutQueries} icon={Search} />
        <MetricCard label="Citation Snapshots" value={citationRun.metrics.totalSnapshots} icon={Radar} />
        <MetricCard label="Avg Absorption" value={citationRun.metrics.averageAbsorption} suffix="/100" icon={ShieldCheck} />
        <MetricCard label="Top3 命中" value={citationRun.metrics.top3} suffix="条" icon={Bot} />
        <MetricCard label="Rewrite Δ" value={rewriteExperiment.metrics.delta} suffix="pts" icon={ShieldCheck} />
        <MetricCard label="Source Mentions" value={sourceSummary.total} icon={Network} />
        <MetricCard label="Search SERP Artifacts" value={searchMonitorSummary.artifactCount} icon={Search} />
        <MetricCard label="Source Diversity" value={sourceSummary.sourceDiversity} suffix="类" icon={Search} />
        <MetricCard label="Recorded Runs" value={recordedRuns.length} icon={Radar} />
        <MetricCard label="Citation Jobs" value={citationJobSummary.total} icon={Bot} />
        <MetricCard label="Capture Artifacts" value={captureSummary.capturedArtifacts} icon={FileText} />
        <MetricCard label="Browser Screenshots" value={browserCaptureSummary.screenshotArtifacts} icon={Camera} />
        <MetricCard label="Retention Artifacts" value={retentionSummary.artifacts} icon={ShieldCheck} />
        <MetricCard label="Citation Packs" value={citationPackSummary.total} icon={FileText} />
        <MetricCard label="MVP Funnel Runs" value={funnelSummary.total} icon={Route} />
        <MetricCard label="PRD Completion" value={completionAudit.summary.completionRate} suffix="%" icon={ShieldCheck} />
      </div>

      <DashSection
        className="mt-6"
        title="Citation Pack Builder"
        description="新建 BrandEntity、主理人 / 专家实体、Service Fact Sheet、FAQ Matrix、Evidence Blocks 和质量门禁，输出可公开页面、Markdown Twin 与 JSON-LD。"
      >
        <CitationPackBuilder initialSummary={citationPackSummary} />
      </DashSection>

      <DashSection
        className="mt-6"
        title="MVP End-to-End Funnel"
        description="在同一页串起新品牌事实资产、实时抓站、Prompt 监测、Absorption 评分和客户报告链接。"
      >
        <GeoMvpFunnelWizard initialSummary={funnelSummary} />
      </DashSection>

      <DashSection
        className="mt-6"
        title="Third-party Search Monitor"
        description="抓取 DuckDuckGo HTML SERP，保存原始搜索结果页 artifact，并统计品牌出现在第三方搜索结果中的证据。"
      >
        <GeoSearchMonitorPanel initialSummary={searchMonitorSummary} />
      </DashSection>

      <DashSection
        className="mt-6"
        title="Live GEO Audit v2"
        description="实时抓取目标站点的 robots、sitemap、HTML、headers、Markdown twin、llms、ai-index、schema、正文结构、证据密度和负面信号。"
      >
        <GeoLiveAuditPanel defaultSiteUrl={defaultAuditSiteUrl} />
      </DashSection>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <DashSection title="阶段状态" description="按 PRD M1-M4 展示当前可验收状态。">
          <div className="grid gap-3 md:grid-cols-2">
            {phases.map((phase) => (
              <div key={phase.name} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium">{phase.name}</div>
                  <Badge variant={phase.status === "已落地" ? "success" : phase.status === "待接入" ? "default" : "warning"}>
                    {phase.status}
                  </Badge>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">{phase.desc}</p>
              </div>
            ))}
          </div>
        </DashSection>

        <DashSection title="资产类型" description="AI 资产索引中的内容分布。">
          <div className="space-y-2">
            {Object.entries(typeCounts).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-950">
                <span className="font-medium">{type}</span>
                <span className="num text-slate-500">{count}</span>
              </div>
            ))}
          </div>
        </DashSection>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <DashSection
          title="Prompt Target Library"
          description="默认生成 100 个全行业 GEO prompt，每个 prompt 至少 5 个 fan-out，并映射到内容资产和证据块。"
        >
          <div className="mb-4 grid gap-2 sm:grid-cols-4">
            {Object.entries(promptSummary.byTier).map(([tier, count]) => (
              <div key={tier} className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-950">
                <div className="text-[10px] uppercase tracking-wide text-slate-400">{tier}</div>
                <div className="num mt-1 text-xl font-semibold">{count}</div>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {topPrompts.map((prompt) => (
              <div key={prompt.id} className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 truncate text-sm font-medium">{prompt.prompt}</div>
                  <Badge variant="primary">{prompt.tier}</Badge>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {prompt.fanoutQueries.slice(0, 5).map((fanout) => (
                    <Badge key={fanout.id} variant={fanout.gapStatus === "covered" ? "success" : "warning"} size="sm">
                      {fanout.gapStatus}
                    </Badge>
                  ))}
                  <span className="text-xs text-slate-500">{prompt.fanoutQueries.length} fan-out / {prompt.mappedAssetIds.length} assets</span>
                </div>
              </div>
            ))}
          </div>
        </DashSection>

        <DashSection
          title="跨平台 Citation Run"
          description="当前为 deterministic adapter，接口形状与后续真实平台 adapter 保持一致，可回放 prompt、平台、答案、来源、Top3 和吸收评分。"
        >
          <div className="mb-4 grid gap-2 sm:grid-cols-4">
            {citationRun.metrics.byPlatform.map((platform) => (
              <div key={platform.platform} className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-950">
                <div className="truncate text-[10px] uppercase tracking-wide text-slate-400">{platform.platformName}</div>
                <div className="mt-1 text-sm">
                  <span className="num font-semibold">{platform.top3}</span>
                  <span className="text-slate-500"> / {platform.snapshots} Top3</span>
                </div>
                <div className="num mt-0.5 text-xs text-slate-500">Abs {platform.averageAbsorption}</div>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {topSnapshots.map((snapshot) => (
              <div key={snapshot.id} className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 truncate text-sm font-medium">{snapshot.platformName} · {snapshot.prompt}</div>
                  <Badge variant={snapshot.absorption.selection === "absorbed" ? "success" : "warning"}>
                    Abs {snapshot.absorption.score}
                  </Badge>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                  <span>rank: {snapshot.rank ?? "—"}</span>
                  <span>top3: {snapshot.top3 ? "yes" : "no"}</span>
                  <span>blocks: {snapshot.absorption.selectedBlocks.length}</span>
                  <span>followup: {snapshot.followupHit ? "hit" : "none"}</span>
                </div>
              </div>
            ))}
          </div>
        </DashSection>
      </div>

      <DashSection
        className="mt-6"
        title="Absorption Report"
        description="把“有没有提到”继续拆成 selection、evidence usage、drift、missing blocks 和 repair hints。"
      >
        <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2 text-left">平台 / Prompt</th>
                  <th className="px-3 py-2 text-right">Score</th>
                  <th className="px-3 py-2 text-left">Selection</th>
                  <th className="px-3 py-2 text-left">Drift</th>
                  <th className="px-3 py-2 text-right">Blocks</th>
                </tr>
              </thead>
              <tbody>
                {citationRun.snapshots.slice(0, 12).map((snapshot) => (
                  <tr key={snapshot.id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="px-3 py-2">
                      <div className="font-medium">{snapshot.platformName}</div>
                      <div className="mt-0.5 max-w-xl truncate text-xs text-slate-500">{snapshot.prompt}</div>
                    </td>
                    <td className="num px-3 py-2 text-right">{snapshot.absorption.score}</td>
                    <td className="px-3 py-2">
                      <Badge variant={snapshot.absorption.selection === "absorbed" ? "success" : "warning"}>
                        {snapshot.absorption.selection}
                      </Badge>
                    </td>
                    <td className="px-3 py-2">
                      <Badge variant={snapshot.absorption.drift === "low" ? "success" : snapshot.absorption.drift === "medium" ? "warning" : "danger"}>
                        {snapshot.absorption.drift}
                      </Badge>
                    </td>
                    <td className="num px-3 py-2 text-right">{snapshot.absorption.selectedBlocks.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <div className="text-sm font-medium">Missing Blocks Top 8</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {topMissing.map((id) => (
                  <Badge key={id} variant="outline">{id}</Badge>
                ))}
              </div>
            </div>
            <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="text-sm font-medium">Repair Hints</div>
              <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                {citationRun.snapshots[0]?.absorption.repairHints.map((hint) => (
                  <li key={hint}>• {hint}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </DashSection>

      <DashSection
        className="mt-6"
        title="MIMO Adapter & Trend Replay"
        description="CitationRun 现在支持 adapter=mimo，走项目统一 MIMO / answer-crawler provider；运行结果会记录到本地 run history，用于趋势回放。"
      >
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <div className="text-sm font-medium">Adapter Test Endpoint</div>
            <div className="mt-2 font-mono text-xs text-slate-500">/api/geo/citation/run?adapter=mimo&amp;platforms=gpt&amp;snapshotPromptLimit=1</div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              默认仍使用 deterministic 快速验收；显式传入 adapter=mimo 时会调用现有 MIMO provider，并在 run.provider 中返回 answerCrawler、realCapture 和 model。
            </p>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <a href="/api/geo/citation/run?adapter=mimo&platforms=gpt&snapshotPromptLimit=1" target="_blank" rel="noreferrer">
                运行 MIMO 单平台快照
              </a>
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2 text-left">Run</th>
                  <th className="px-3 py-2 text-left">Adapter</th>
                  <th className="px-3 py-2 text-right">Snapshots</th>
                  <th className="px-3 py-2 text-right">Mention</th>
                  <th className="px-3 py-2 text-right">Top3</th>
                  <th className="px-3 py-2 text-right">Abs</th>
                </tr>
              </thead>
              <tbody>
                {citationTrend.length ? citationTrend.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="px-3 py-2">
                      <div className="font-mono text-xs">{row.id}</div>
                      <div className="mt-0.5 text-xs text-slate-500">{row.date}</div>
                    </td>
                    <td className="px-3 py-2">
                      <Badge variant={row.adapter === "mimo" ? "success" : "outline"}>{row.adapter}</Badge>
                    </td>
                    <td className="num px-3 py-2 text-right">{row.snapshots}</td>
                    <td className="num px-3 py-2 text-right">{row.mentionRate}%</td>
                    <td className="num px-3 py-2 text-right">{row.top3Rate}%</td>
                    <td className="num px-3 py-2 text-right">{row.averageAbsorption}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-center text-sm text-slate-500">
                      暂无已记录 run。先打开 MIMO 单平台快照端点，或调用 `/api/geo/citation/run`。
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </DashSection>

      <DashSection
        className="mt-6"
        title="Async Citation Jobs"
        description="长耗时 MIMO 监测现在可以先创建后台 job，再用状态接口轮询，避免用户停留在不确定 loading。"
      >
        <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <div className="text-sm font-medium">Job API</div>
            <div className="mt-2 space-y-1 font-mono text-xs text-slate-500">
              <div>POST /api/geo/citation/jobs</div>
              <div>{`{"adapter":"mimo","platforms":["gpt"],"snapshotPromptLimit":1}`}</div>
              <div>GET /api/geo/citation/jobs/{`{id}`}</div>
              <div>POST /api/geo/citation/jobs/{`{id}`} {`{"action":"retry"}`}</div>
              <div>DELETE /api/geo/citation/jobs/{`{id}`}</div>
              <div>GET /api/geo/citation/jobs/worker</div>
            </div>
            <div className="mt-4 grid grid-cols-5 gap-2 text-center text-xs">
              <div className="rounded-lg bg-white p-2 dark:bg-slate-900"><div className="num text-lg font-semibold">{citationJobSummary.queued}</div><div className="text-slate-500">queued</div></div>
              <div className="rounded-lg bg-white p-2 dark:bg-slate-900"><div className="num text-lg font-semibold">{citationJobSummary.running}</div><div className="text-slate-500">running</div></div>
              <div className="rounded-lg bg-white p-2 dark:bg-slate-900"><div className="num text-lg font-semibold">{citationJobSummary.done}</div><div className="text-slate-500">done</div></div>
              <div className="rounded-lg bg-white p-2 dark:bg-slate-900"><div className="num text-lg font-semibold">{citationJobSummary.failed}</div><div className="text-slate-500">failed</div></div>
              <div className="rounded-lg bg-white p-2 dark:bg-slate-900"><div className="num text-lg font-semibold">{citationJobSummary.canceled}</div><div className="text-slate-500">canceled</div></div>
            </div>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <a href="/api/geo/citation/jobs" target="_blank" rel="noreferrer">查看 job 列表</a>
            </Button>
            <div className="mt-4 rounded-lg bg-white p-3 text-xs text-slate-500 dark:bg-slate-900">
              <div className="font-medium text-slate-700 dark:text-slate-200">Worker Contract</div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <span>lease {Math.round(citationWorkerSummary.leaseMs / 1000)}s</span>
                <span>active {citationWorkerSummary.active}</span>
                <span>queued {citationWorkerSummary.queueDepth}</span>
                <span>ready {citationWorkerSummary.ready ? "yes" : "no"}</span>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2 text-left">Job</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Adapter</th>
                  <th className="px-3 py-2 text-right">Progress</th>
                  <th className="px-3 py-2 text-right">Attempts</th>
                  <th className="px-3 py-2 text-left">Run</th>
                </tr>
              </thead>
              <tbody>
                {citationJobs.length ? citationJobs.map((job) => (
                  <tr key={job.id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="px-3 py-2">
                      <a href={`/api/geo/citation/jobs/${job.id}`} target="_blank" rel="noreferrer" className="font-mono text-xs text-indigo-600 hover:underline">
                        {job.id}
                      </a>
                      <div className="mt-0.5 text-xs text-slate-500">{job.createdAt.slice(0, 16).replace("T", " ")}</div>
                    </td>
                    <td className="px-3 py-2">
                      <Badge variant={job.status === "done" ? "success" : job.status === "failed" || job.status === "canceled" ? "danger" : "warning"}>
                        {job.status}
                      </Badge>
                    </td>
                    <td className="px-3 py-2">
                      <Badge variant={job.request.adapter === "mimo" ? "success" : "outline"}>{job.request.adapter}</Badge>
                    </td>
                    <td className="num px-3 py-2 text-right">{job.progress.completed}/{job.progress.total}</td>
                    <td className="num px-3 py-2 text-right">{job.attempts ?? 1}{job.retryOf ? " retry" : ""}</td>
                    <td className="px-3 py-2 font-mono text-xs text-slate-500">{job.result?.runId ?? "—"}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-center text-sm text-slate-500">
                      暂无异步 job。可用 POST /api/geo/citation/jobs 创建 deterministic 或 MIMO 任务。
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </DashSection>

      <DashSection
        className="mt-6"
        title="Evidence Capture Archive"
        description="把 CitationRun 中的 sourceUrls 抓取为可回看的 HTML / Markdown / JSON 证据归档，并与浏览器截图证据共同构成原始材料链。"
      >
        <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <div className="text-sm font-medium">Capture API</div>
            <div className="mt-2 space-y-1 font-mono text-xs text-slate-500">
              <div>GET /api/geo/citation/{`{runId}`}/capture?refresh=1</div>
              <div>GET /api/geo/citation/captures</div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-lg bg-white p-2 dark:bg-slate-900"><div className="num text-lg font-semibold">{captureSummary.total}</div><div className="text-slate-500">captures</div></div>
              <div className="rounded-lg bg-white p-2 dark:bg-slate-900"><div className="num text-lg font-semibold">{captureSummary.capturedArtifacts}</div><div className="text-slate-500">captured</div></div>
              <div className="rounded-lg bg-white p-2 dark:bg-slate-900"><div className="num text-lg font-semibold">{captureSummary.failedArtifacts}</div><div className="text-slate-500">failed</div></div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <a href={`/api/geo/citation/${latestRunId}/capture?refresh=1&maxUrls=4`} target="_blank" rel="noreferrer">归档最新 run</a>
              </Button>
              <Button asChild variant="outline" size="sm">
                <a href="/api/geo/citation/captures" target="_blank" rel="noreferrer">查看 captures</a>
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2 text-left">Capture</th>
                  <th className="px-3 py-2 text-left">Run</th>
                  <th className="px-3 py-2 text-right">Artifacts</th>
                  <th className="px-3 py-2 text-right">Bytes</th>
                  <th className="px-3 py-2 text-left">Limitations</th>
                </tr>
              </thead>
              <tbody>
                {citationCaptures.length ? citationCaptures.map((capture) => (
                  <tr key={capture.id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="px-3 py-2">
                      <div className="font-mono text-xs">{capture.id}</div>
                      <div className="mt-0.5 text-xs text-slate-500">{capture.completedAt.slice(0, 16).replace("T", " ")}</div>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">{capture.runId}</td>
                    <td className="num px-3 py-2 text-right">{capture.metrics.captured}/{capture.metrics.requestedUrls}</td>
                    <td className="num px-3 py-2 text-right">{Math.round(capture.metrics.totalBytes / 1024)} KB</td>
                    <td className="px-3 py-2 text-xs text-slate-500">{capture.limitations[1]}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-sm text-slate-500">
                      暂无 capture。先点击“归档最新 run”，或调用 capture API。
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </DashSection>

      <DashSection
        className="mt-6"
        title="Browser Screenshot Evidence"
        description="归档 in-app Browser 实际渲染后的截图，包括 dashboard、公开 Citation Pack、API JSON 页面和第三方搜索结果页。"
      >
        <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]" data-testid="browser-capture-archive">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <div className="text-sm font-medium">Browser Capture API</div>
            <div className="mt-2 space-y-1 font-mono text-xs text-slate-500">
              <div>POST /api/geo/browser-captures</div>
              <div>GET /api/geo/browser-captures</div>
              <div>GET /api/geo/browser-captures/{`{captureId}`}/artifact</div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-lg bg-white p-2 dark:bg-slate-900"><div className="num text-lg font-semibold">{browserCaptureSummary.total}</div><div className="text-slate-500">captures</div></div>
              <div className="rounded-lg bg-white p-2 dark:bg-slate-900"><div className="num text-lg font-semibold">{browserCaptureSummary.screenshotArtifacts}</div><div className="text-slate-500">screens</div></div>
              <div className="rounded-lg bg-white p-2 dark:bg-slate-900"><div className="num text-lg font-semibold">{browserCaptureSummary.searchResultPages}</div><div className="text-slate-500">search</div></div>
            </div>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <a href="/api/geo/browser-captures" target="_blank" rel="noreferrer">查看浏览器截图证据</a>
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2 text-left">Capture</th>
                  <th className="px-3 py-2 text-left">Kind</th>
                  <th className="px-3 py-2 text-left">Source</th>
                  <th className="px-3 py-2 text-right">Bytes</th>
                  <th className="px-3 py-2 text-left">Artifact</th>
                </tr>
              </thead>
              <tbody>
                {browserCaptures.length ? browserCaptures.map((capture) => (
                  <tr key={capture.id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="px-3 py-2">
                      <div className="font-mono text-xs">{capture.id}</div>
                      <div className="mt-0.5 text-xs text-slate-500">{capture.capturedAt.slice(0, 16).replace("T", " ")}</div>
                    </td>
                    <td className="px-3 py-2">
                      <Badge variant={capture.kind === "search-result-page" ? "primary" : "success"}>{capture.kind}</Badge>
                    </td>
                    <td className="px-3 py-2">
                      <div className="max-w-xs truncate text-xs text-slate-500">{capture.sourceUrl}</div>
                      {capture.title && <div className="mt-0.5 max-w-xs truncate text-xs font-medium">{capture.title}</div>}
                    </td>
                    <td className="num px-3 py-2 text-right">{Math.round(capture.artifact.bytes / 1024)} KB</td>
                    <td className="px-3 py-2">
                      <a href={capture.artifact.archiveApiUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline">
                        打开截图
                      </a>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-sm text-slate-500">
                      暂无浏览器截图证据。浏览器验收时会把关键页面截图 POST 到 Browser Capture API。
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </DashSection>

      <DashSection
        className="mt-6"
        title="AutoGEO Rewrite Lab"
        description="对单页面跑 baseline / structure / preference / conservative 四个版本，比较 GEO、GEU、Absorption 和 Citation 分数，并给出 winner / rejected 理由。"
      >
        <div className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
          <div>
            <div className="mb-4 grid gap-2 sm:grid-cols-4">
              <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-950">
                <div className="text-[10px] uppercase tracking-wide text-slate-400">Before</div>
                <div className="num mt-1 text-xl font-semibold">{rewriteExperiment.metrics.beforeScore}</div>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-950">
                <div className="text-[10px] uppercase tracking-wide text-slate-400">After</div>
                <div className="num mt-1 text-xl font-semibold">{rewriteExperiment.metrics.afterScore}</div>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-950">
                <div className="text-[10px] uppercase tracking-wide text-slate-400">Delta</div>
                <div className="num mt-1 text-xl font-semibold">+{rewriteExperiment.metrics.delta}</div>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-950">
                <div className="text-[10px] uppercase tracking-wide text-slate-400">Winner</div>
                <div className="mt-1 truncate text-sm font-semibold">{rewriteExperiment.winner.label}</div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2 text-left">Variant</th>
                    <th className="px-3 py-2 text-right">GEO</th>
                    <th className="px-3 py-2 text-right">GEU</th>
                    <th className="px-3 py-2 text-right">Abs</th>
                    <th className="px-3 py-2 text-right">Total</th>
                    <th className="px-3 py-2 text-left">Decision</th>
                  </tr>
                </thead>
                <tbody>
                  {rewriteExperiment.variants.map((variant) => (
                    <tr key={variant.id} className="border-t border-slate-100 dark:border-slate-800">
                      <td className="px-3 py-2">
                        <div className="font-medium">{variant.label}</div>
                        <div className="mt-0.5 text-xs text-slate-500">{variant.appliedRuleIds.length} rules / {variant.wordCount} chars</div>
                      </td>
                      <td className="num px-3 py-2 text-right">{variant.geoScore}</td>
                      <td className="num px-3 py-2 text-right">{variant.geuScore}</td>
                      <td className="num px-3 py-2 text-right">{variant.absorptionScore}</td>
                      <td className="num px-3 py-2 text-right">{variant.totalScore}</td>
                      <td className="px-3 py-2">
                        <Badge variant={variant.id === rewriteExperiment.winner.id ? "success" : "outline"}>
                          {variant.id === rewriteExperiment.winner.id ? "winner" : "rejected"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="space-y-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <div className="text-sm font-medium">Rule Set</div>
              <div className="mt-2 font-mono text-xs text-slate-500">{rewriteExperiment.ruleSet.id}</div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{rewriteExperiment.ruleSet.adaptationNote}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {rewriteExperiment.ruleSet.sourceIds.map((source) => (
                  <Badge key={source} variant="outline">{source}</Badge>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="text-sm font-medium">Rejected Reasons</div>
              <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                {rewriteExperiment.rejected.map((variant) => (
                  <li key={variant.id}>
                    <span className="font-medium">{variant.label}：</span>
                    {variant.rejectedReasons.join("；") || "分数低于 winner，暂不推荐发布。"}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </DashSection>

      <DashSection
        className="mt-6"
        title="核心 Markdown Twin"
        description="这些链接会返回 text/markdown，并带 X-Robots-Tag: noindex，供 AI agent / RAG / 审计工具读取。"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2 text-left">页面</th>
                <th className="px-3 py-2 text-left">类型</th>
                <th className="px-3 py-2 text-right">证据块</th>
                <th className="px-3 py-2 text-right">Markdown</th>
              </tr>
            </thead>
            <tbody>
              {topAssets.map((asset) => (
                <tr key={asset.id} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-3 py-2">
                    <div className="font-medium">{asset.title}</div>
                    <div className="mt-0.5 max-w-2xl truncate text-xs text-slate-500">{asset.description}</div>
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant="default">{asset.type}</Badge>
                  </td>
                  <td className="num px-3 py-2 text-right">{asset.evidence.length}</td>
                  <td className="px-3 py-2 text-right">
                    <Link className="text-xs text-indigo-600 hover:underline" href={`${asset.path === "/" ? "/index" : asset.path}.md`} target="_blank">
                      打开
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashSection>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <DashSection
          title="外部可信信源"
          description="记录 Reddit / 知乎 / LinkedIn / 目录站 / 媒体 / 视频等外部提及，并标注实体一致性、AI 是否引用和下一步动作。"
        >
          <div className="mb-4 grid gap-2 sm:grid-cols-4">
            <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-950">
              <div className="text-[10px] uppercase tracking-wide text-slate-400">Total</div>
              <div className="num mt-1 text-xl font-semibold">{sourceSummary.total}</div>
            </div>
            <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-950">
              <div className="text-[10px] uppercase tracking-wide text-slate-400">Verified</div>
              <div className="num mt-1 text-xl font-semibold">{sourceSummary.verified}</div>
            </div>
            <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-950">
              <div className="text-[10px] uppercase tracking-wide text-slate-400">AI Cited</div>
              <div className="num mt-1 text-xl font-semibold">{sourceSummary.cited}</div>
            </div>
            <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-950">
              <div className="text-[10px] uppercase tracking-wide text-slate-400">Consistency</div>
              <div className="num mt-1 text-xl font-semibold">{sourceSummary.averageEntityConsistency}</div>
            </div>
          </div>
          <div className="space-y-2">
            {sourceMentions.slice(0, 6).map((mention) => (
              <div key={mention.id} className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 truncate text-sm font-medium">{mention.platform} · {mention.title}</div>
                  <Badge variant={mention.aiCited ? "success" : mention.status === "verified" ? "primary" : "warning"}>
                    {mention.status}
                  </Badge>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                  <span>{mention.type}</span>
                  <span>entity {mention.entityConsistency}</span>
                  <span>risk {mention.risk}</span>
                  <span>{mention.aiCitedBy.length ? mention.aiCitedBy.join(", ") : "not cited"}</span>
                </div>
              </div>
            ))}
          </div>
        </DashSection>

        <DashSection
          title="Monthly GEO Report"
          description="客户可解释月报：Executive Summary、Prompt Performance、Content Asset Score、Source Influence Map、Rewrite Experiment 和 Action Plan。"
        >
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-950">
              <div className="text-[10px] uppercase tracking-wide text-slate-400">Selection</div>
              <div className="num mt-1 text-xl font-semibold">{monthlyReport.executiveSummary.selectionRate}%</div>
            </div>
            <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-950">
              <div className="text-[10px] uppercase tracking-wide text-slate-400">Absorption</div>
              <div className="num mt-1 text-xl font-semibold">{monthlyReport.executiveSummary.absorptionRate}%</div>
            </div>
            <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-950">
              <div className="text-[10px] uppercase tracking-wide text-slate-400">Follow-up</div>
              <div className="num mt-1 text-xl font-semibold">{monthlyReport.executiveSummary.followupHitRate}%</div>
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <div className="text-sm font-medium">Action Plan</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              {monthlyReport.modules.actionPlan.slice(0, 5).map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <a href="/api/geo/report/monthly" target="_blank" rel="noreferrer">打开 JSON 报告</a>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href="/api/geo/report/monthly?format=markdown" target="_blank" rel="noreferrer">打开 Markdown 报告</a>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href="/api/geo/report/monthly?format=html" target="_blank" rel="noreferrer">打开打印报告</a>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href="/api/geo/report/monthly?format=pdf" target="_blank" rel="noreferrer">打开 PDF 报告</a>
            </Button>
          </div>
        </DashSection>
      </div>

      <DashSection
        className="mt-6"
        title="PRD Completion Audit"
        description="逐条对照 docs/geo-citation-engine-prd.md 的 Epic、Phase、API 和 MVP 验收。只有全部 done 才能标记 goal complete。"
      >
        <div className="mb-4 grid gap-2 sm:grid-cols-5">
          <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-950"><div className="text-[10px] uppercase tracking-wide text-slate-400">Done</div><div className="num mt-1 text-xl font-semibold">{completionAudit.summary.done}</div></div>
          <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-950"><div className="text-[10px] uppercase tracking-wide text-slate-400">Partial</div><div className="num mt-1 text-xl font-semibold">{completionAudit.summary.partial}</div></div>
          <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-950"><div className="text-[10px] uppercase tracking-wide text-slate-400">Missing</div><div className="num mt-1 text-xl font-semibold">{completionAudit.summary.missing}</div></div>
          <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-950"><div className="text-[10px] uppercase tracking-wide text-slate-400">Blocked</div><div className="num mt-1 text-xl font-semibold">{completionAudit.summary.blocked}</div></div>
          <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-950"><div className="text-[10px] uppercase tracking-wide text-slate-400">Complete</div><div className="num mt-1 text-xl font-semibold">{completionAudit.summary.completionRate}%</div></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2 text-left">Item</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Evidence</th>
                <th className="px-3 py-2 text-left">Remaining</th>
              </tr>
            </thead>
            <tbody>
              {completionAudit.items.slice(0, 12).map((item) => (
                <tr key={item.id} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-3 py-2">
                    <div className="font-medium">{item.title}</div>
                    <div className="mt-0.5 text-xs text-slate-500">{item.area} · {item.sourceRefs.join(", ")}</div>
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant={auditVariant(item.status)}>{item.status}</Badge>
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-600 dark:text-slate-300">{item.evidence.slice(0, 2).join("；")}</td>
                  <td className="px-3 py-2 text-xs text-slate-500">{item.remaining[0] ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4">
          <Button asChild variant="outline" size="sm">
            <a href="/api/geo/completion-audit" target="_blank" rel="noreferrer">打开完整审计 JSON</a>
          </Button>
        </div>
      </DashSection>

      <DashSection className="mt-6" title="可测试端点" description="本页用于浏览器逐步验收这些公开接口是否返回正确内容。">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["/llms.txt", "AI 目录"],
            ["/llms-full.txt", "完整上下文"],
            ["/ai-index.json", "资产索引"],
            ["/ai/summary.json", "AI 摘要"],
            ["/ai/faq.json", "FAQ JSON"],
            ["/ai/service.json", "服务 JSON"],
            ["/ai/evidence.json", "证据块"],
            ["/api/geo/audit-v2", "审计 v2"],
            ["/api/geo/prompts/research", "Prompt 研究"],
            ["/api/geo/citation/run", "Citation Run"],
            ["/api/geo/citation/run?adapter=mimo&platforms=gpt&snapshotPromptLimit=1", "MIMO Citation Run"],
            ["/api/geo/citation/trend", "Citation Trend"],
            ["/api/geo/citation/jobs", "Citation Jobs"],
            ["/api/geo/citation/jobs/worker", "Citation Worker"],
            ["/api/geo/citation/captures", "Citation Captures"],
            ["/api/geo/browser-captures", "Browser Captures"],
            ["/api/geo/evidence-retention", "Evidence Retention"],
            [`/api/geo/citation/${latestRunId}/capture?refresh=1&maxUrls=4`, "Capture Latest Run"],
            [`/api/geo/citation/${citationRun.id}`, "Citation Replay"],
            ["/api/geo/rewrite/experiment", "Rewrite Experiment"],
            ["/api/geo/source-mentions/import", "Source Mentions"],
            ["/api/geo/search-monitor", "Search Monitor"],
            ["/api/geo/report/monthly", "Monthly Report"],
            ["/api/geo/report/monthly?format=html", "Printable Report"],
            ["/api/geo/report/monthly?format=pdf", "PDF Report"],
            ["/api/geo/completion-audit", "Completion Audit"],
          ].map(([href, label]) => (
            <a key={href} href={href} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 bg-white p-4 text-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800">
              <div className="font-medium">{label}</div>
              <div className="mt-1 font-mono text-xs text-slate-500">{href}</div>
            </a>
          ))}
        </div>
      </DashSection>
    </div>
  );
}

function auditVariant(status: CompletionAuditStatus) {
  if (status === "done") return "success";
  if (status === "partial") return "warning";
  if (status === "blocked") return "danger";
  return "outline";
}

function topPromptForRewrite(prompts: ReturnType<typeof buildPromptTargets>) {
  return prompts.find((prompt) => prompt.tier === "Compare")?.prompt ?? prompts[0]?.prompt;
}

function MetricCard({
  label,
  value,
  icon: Icon,
  suffix,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  suffix?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardDescription>{label}</CardDescription>
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <CardTitle className="num text-3xl">
          {value}
          {suffix && <span className="ml-1 text-sm font-normal text-slate-500">{suffix}</span>}
        </CardTitle>
      </CardContent>
    </Card>
  );
}
