import Link from "next/link";
import { redirect } from "next/navigation";
import { and, desc, eq, gte } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { yearMonth } from "@/lib/usage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileBarChart, Download, ShieldCheck, TrendingUp, Bot, Sparkles } from "lucide-react";

export const metadata = { title: "月度全景报告", robots: { index: false } };

export default async function ReportsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  // 拉本月数据
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [queries, audits, drafts] = await Promise.all([
    db
      .select()
      .from(schema.aiQueries)
      .where(and(eq(schema.aiQueries.userId, session.userId), gte(schema.aiQueries.queriedAt, monthStart)))
      .limit(2000),
    db
      .select()
      .from(schema.audits)
      .where(gte(schema.audits.createdAt, monthStart))
      .orderBy(desc(schema.audits.createdAt))
      .limit(200),
    db
      .select()
      .from(schema.contentDrafts)
      .where(and(eq(schema.contentDrafts.userId, session.userId), gte(schema.contentDrafts.createdAt, monthStart)))
      .limit(500),
  ]);

  const total = queries.length;
  const cited = queries.filter((q) => q.cited).length;
  const top1 = queries.filter((q) => q.rank === 1).length;
  const citationRate = total > 0 ? Math.round((cited / total) * 100) : 0;
  const ym = yearMonth();

  return (
    <div className="px-6 py-8 lg:px-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">月度全景报告 · {ym}</h1>
          <p className="mt-1 text-sm text-slate-500">整合诊断、引用率、生成、转化的月度复盘。可下载 PDF 与客户分享。</p>
        </div>
        <Button asChild variant="primary">
          <a href={`/api/reports/monthly?ym=${ym}`} target="_blank" rel="noreferrer">
            <Download className="mr-1 h-4 w-4" /> 下载 PDF 报告
          </a>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-4 mb-6">
        <Card>
          <CardContent className="p-5">
            <div className="text-xs text-slate-500">本月查询总数</div>
            <div className="num mt-1 text-3xl font-semibold">{total.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-xs text-slate-500">引用率</div>
            <div className="num mt-1 text-3xl font-semibold text-emerald-600">
              {citationRate}<span className="text-base">%</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-xs text-slate-500">Top 1 推荐次数</div>
            <div className="num mt-1 text-3xl font-semibold text-indigo-600">{top1}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-xs text-slate-500">本月生成内容</div>
            <div className="num mt-1 text-3xl font-semibold text-violet-600">{drafts.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">
            <FileBarChart className="mr-1 inline h-4 w-4" /> 本月活动摘要
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <Section title="📊 监测查询">
            <div>共在 12 个 AI 平台跑了 <span className="num font-semibold">{total}</span> 次品牌查询，引用率 <span className="num font-semibold text-emerald-600">{citationRate}%</span>，进入 Top 1 <span className="num font-semibold text-indigo-600">{top1}</span> 次。</div>
          </Section>
          <Section title="🔬 GEO 诊断">
            <div>本月运行 <span className="num font-semibold">{audits.length}</span> 次域名诊断，平均得分 <span className="num font-semibold">{audits.length > 0 ? Math.round(audits.reduce((s, a) => s + a.score, 0) / audits.length) : 0}</span>。</div>
          </Section>
          <Section title="✍️ 内容生成">
            <div>使用 AI 生成 <span className="num font-semibold">{drafts.length}</span> 篇 GEO 友好内容（FAQ / TL;DR / HowTo / 对比表）。</div>
          </Section>
        </CardContent>
      </Card>

      {/* 第三方核验 */}
      <Card className="mb-6 border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <ShieldCheck className="h-8 w-8 flex-shrink-0 text-emerald-600" />
            <div>
              <h3 className="text-base font-semibold text-emerald-900 dark:text-emerald-100">
                ✅ 数据透明可核验
              </h3>
              <p className="mt-1 text-sm text-emerald-900/80 dark:text-emerald-200/80">
                所有 AI 查询日志（时间戳、平台、查询语句、返回内容、品牌位置）已完整存储。
                支持<strong>第三方数据核验</strong>。
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="success">🛡️ 完整日志</Badge>
                <Badge variant="success">🔐 不可篡改</Badge>
                <Badge variant="success">📤 可导出 CSV</Badge>
                <Badge variant="success">🔍 支持审计</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Link href="/dashboard/monitor">
          <Card className="lift h-full">
            <CardHeader>
              <Bot className="h-6 w-6 text-indigo-600" />
              <CardTitle className="text-base">详细监测数据</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500">查看 12 平台每日趋势图</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/conversion">
          <Card className="lift h-full">
            <CardHeader>
              <TrendingUp className="h-6 w-6 text-indigo-600" />
              <CardTitle className="text-base">转化漏斗</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500">AI → 短链 → 留资 → 签约</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/generate">
          <Card className="lift h-full">
            <CardHeader>
              <Sparkles className="h-6 w-6 text-indigo-600" />
              <CardTitle className="text-base">本月生成的内容</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500">完整生成历史</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-medium text-slate-500">{title}</div>
      <div className="mt-1 text-slate-700 dark:text-slate-300">{children}</div>
    </div>
  );
}
