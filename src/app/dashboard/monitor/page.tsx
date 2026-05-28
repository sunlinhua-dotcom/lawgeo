import { desc, eq, sql, and, gte } from "drizzle-orm";
import Link from "next/link";
import { db, schema } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CitationTrendChart, PlatformBarChart } from "@/components/dashboard/trend-chart";
import { Bot, ArrowRight, Play } from "lucide-react";
import { siteConfig } from "@/lib/site";
import { platformStatus, type AiPlatformId } from "@/lib/ai";

export const metadata = { title: "AI 引用监测", robots: { index: false } };

export default async function MonitorDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  // 最近 30 天的查询
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
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
                  <Badge variant={st.mode === "real" ? "success" : "outline"} className="text-[10px]">
                    {st.mode === "real" ? "真实接入" : "MIMO 模拟"}
                  </Badge>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-xs text-slate-500">
            在 <code className="text-indigo-600">.env.local</code> 配置对应 API key 即自动切换到真实接入。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
