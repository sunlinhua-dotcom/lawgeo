import { desc, eq, and, gte } from "drizzle-orm";
import Link from "next/link";
import { db, schema } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CitationTrendChart, PlatformBarChart } from "@/components/dashboard/trend-chart";
import { BrandRadarChart, SentimentPie, ConversionFunnel } from "@/components/dashboard/brand-radar";
import { ProvidersStatus } from "@/components/dashboard/providers-status";
import { Bot, ArrowRight, Play } from "lucide-react";
import { siteConfig } from "@/lib/site";
import { platformStatus, type AiPlatformId } from "@/lib/ai";

export const metadata = { title: "AI 引用监测", robots: { index: false } };

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

export default async function MonitorDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  // 最近 30 天的查询
  const since = daysAgo(30);
  const queries = await db
    .select()
    .from(schema.aiQueries)
    .where(and(eq(schema.aiQueries.userId, session.userId), gte(schema.aiQueries.queriedAt, since)))
    .orderBy(desc(schema.aiQueries.queriedAt))
    .limit(500);

  // 按天聚合
  const byDay = new Map<string, { cited: number; total: number }>();
  for (const q of queries) {
    const d = new Date(q.queriedAt).toISOString().slice(0, 10);
    const prev = byDay.get(d) ?? { cited: 0, total: 0 };
    byDay.set(d, { cited: prev.cited + (q.cited ? 1 : 0), total: prev.total + 1 });
  }
  const trend = Array.from(byDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({
      date: date.slice(5),
      cited: v.cited,
      total: v.total,
      rate: v.total > 0 ? Math.round((v.cited / v.total) * 100) : 0,
    }));

  // 按平台聚合
  const byPlatform = new Map<string, { cited: number; total: number }>();
  for (const q of queries) {
    const prev = byPlatform.get(q.platform) ?? { cited: 0, total: 0 };
    byPlatform.set(q.platform, { cited: prev.cited + (q.cited ? 1 : 0), total: prev.total + 1 });
  }
  const platformData = Array.from(byPlatform.entries()).map(([platform, v]) => ({
    platform: siteConfig.aiPlatforms.find((p) => p.id === platform)?.name ?? platform,
    ...v,
  }));

  const total = queries.length;
  const cited = queries.filter((q) => q.cited).length;
  const top1 = queries.filter((q) => q.rank === 1).length;

  // ── 品牌雷达 + 情绪 + 转化漏斗（来自 realtime_results） ──────────
  const rtResults = await db
    .select()
    .from(schema.realtimeResults)
    .leftJoin(schema.realtimeSearches, eq(schema.realtimeResults.searchId, schema.realtimeSearches.id))
    .where(eq(schema.realtimeSearches.userId, session.userId))
    .limit(2000);
  const rr = rtResults.map((row) => row.realtime_results);
  const rtTotal = rr.length;
  const rtMentioned = rr.filter((r) => r.isMentioned).length;
  const rtTop3 = rr.filter((r) => r.isTop3).length;
  const rtFollowup = rr.filter((r) => r.followupTriggered).length;
  const rtConverted = rr.filter((r) => r.isConverted).length;
  const sentiment = {
    positive: rr.filter((r) => r.sentiment === "positive").length,
    neutral: rr.filter((r) => r.sentiment === "neutral").length,
    negative: rr.filter((r) => r.sentiment === "negative").length,
  };
  const radarData = [
    { dim: "可见度", value: rtTotal ? Math.round((rtMentioned / rtTotal) * 100) : 0 },
    { dim: "推荐度", value: rtTotal ? Math.round((rtTop3 / rtTotal) * 100) : 0 },
    { dim: "Top1", value: rtTotal ? Math.round((rr.filter((r) => r.isTop1).length / rtTotal) * 100) : 0 },
    { dim: "正面情绪", value: rtMentioned ? Math.round((sentiment.positive / rtMentioned) * 100) : 0 },
    { dim: "转化力", value: rtFollowup ? Math.round((rtConverted / rtFollowup) * 100) : 0 },
  ];
  const funnelData = [
    { stage: "曝光", value: rtTotal },
    { stage: "提及", value: rtMentioned },
    { stage: "Top3", value: rtTop3 },
    { stage: "追问", value: rtFollowup },
    { stage: "转化命中", value: rtConverted },
  ];
  const hasRealtimeData = rtTotal > 0;

  return (
    <div className="px-6 py-8 lg:px-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">AI 引用监测</h1>
          <p className="mt-1 text-sm text-slate-500">近 30 天你的品牌在 12 个 AI 平台的引用情况。</p>
        </div>
        <Button asChild variant="primary">
          <Link href="/tools/compare">
            <Play className="mr-1 h-4 w-4" /> 立即跑一次对比 <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* 品牌雷达 + 情绪 + 转化漏斗 */}
      {hasRealtimeData && (
        <div className="mb-6 grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">📡 品牌雷达</CardTitle></CardHeader>
            <CardContent><BrandRadarChart data={radarData} /></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">😊 情绪分布</CardTitle></CardHeader>
            <CardContent><SentimentPie data={sentiment} /></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">🎯 转化漏斗</CardTitle></CardHeader>
            <CardContent><ConversionFunnel data={funnelData} /></CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-4 mb-6">
        <Card>
          <CardContent className="p-5">
            <div className="text-xs text-slate-500">总查询数</div>
            <div className="num mt-1 text-3xl font-semibold">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-xs text-slate-500">被引用次数</div>
            <div className="num mt-1 text-3xl font-semibold text-emerald-600">{cited}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-xs text-slate-500">引用率</div>
            <div className="num mt-1 text-3xl font-semibold">
              {total > 0 ? Math.round((cited / total) * 100) : 0}
              <span className="text-base text-slate-400">%</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-xs text-slate-500">Top 1 推荐</div>
            <div className="num mt-1 text-3xl font-semibold text-indigo-600">{top1}</div>
          </CardContent>
        </Card>
      </div>

      {trend.length >= 2 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">引用趋势（近 30 天）</CardTitle>
          </CardHeader>
          <CardContent>
            <CitationTrendChart data={trend} />
          </CardContent>
        </Card>
      )}

      {platformData.length >= 1 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">各平台引用对比</CardTitle>
          </CardHeader>
          <CardContent>
            <PlatformBarChart data={platformData} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">12 平台接入状态</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {siteConfig.aiPlatforms.map((p) => {
              const st = platformStatus(p.id as AiPlatformId);
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800"
                >
                  <div className="flex items-center gap-2">
                    <Bot className="h-3.5 w-3.5 text-indigo-500" />
                    <span className="text-sm">{p.name}</span>
                  </div>
                  <Badge
                    variant={st.mode === "real" ? "success" : st.mode === "gateway" ? "primary" : "primary"}
                    className="text-[10px]"
                  >
                    {st.mode === "real" ? "真实接入" : st.mode === "gateway" ? "网关接入" : "MIMO 统一"}
                  </Badge>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-xs text-slate-500">
            当前全部平台统一走 <strong>小米 MIMO</strong> API（带 persona 区分风格）。如需切到各平台官方，设 <code className="text-indigo-600">ALLOW_EXTERNAL_PROVIDERS=true</code> 并配对应 key。
          </p>
        </CardContent>
      </Card>

      <div className="mt-6">
        <ProvidersStatus />
      </div>
    </div>
  );
}
