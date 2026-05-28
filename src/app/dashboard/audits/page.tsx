import { desc } from "drizzle-orm";
import Link from "next/link";
import { db, schema } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScoreTrendChart } from "@/components/dashboard/trend-chart";
import { Download, ArrowRight } from "lucide-react";

export const metadata = { title: "诊断历史", robots: { index: false } };

export default async function AuditsPage() {
  const audits = await db.select().from(schema.audits).orderBy(desc(schema.audits.createdAt)).limit(200);

  // 按天聚合最近 30 天平均分
  const byDay = new Map<string, { sum: number; n: number }>();
  for (const a of audits) {
    const d = new Date(a.createdAt).toISOString().slice(0, 10);
    const prev = byDay.get(d) ?? { sum: 0, n: 0 };
    byDay.set(d, { sum: prev.sum + a.score, n: prev.n + 1 });
  }
  const trend = Array.from(byDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-30)
    .map(([date, v]) => ({ date: date.slice(5), score: Math.round(v.sum / v.n) }));

  const avg = audits.length
    ? Math.round(audits.reduce((s, a) => s + a.score, 0) / audits.length)
    : 0;
  const best = audits.length ? Math.max(...audits.map((a) => a.score)) : 0;
  const uniqDomains = new Set(audits.map((a) => a.domain)).size;

  return (
    <div className="px-6 py-8 lg:px-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">诊断历史</h1>
          <p className="mt-1 text-sm text-slate-500">所有运行过的 GEO 域名诊断记录与趋势。</p>
        </div>
        <Button asChild variant="primary">
          <Link href="/tools/audit">
            新建诊断 <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <Card>
          <CardContent className="p-5">
            <div className="text-xs text-slate-500">总诊断数</div>
            <div className="num mt-1 text-3xl font-semibold">{audits.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-xs text-slate-500">不重复域名</div>
            <div className="num mt-1 text-3xl font-semibold">{uniqDomains}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-xs text-slate-500">平均分 / 最高分</div>
            <div className="num mt-1 text-3xl font-semibold">
              {avg}
              <span className="text-slate-400 mx-1">/</span>
              <span className="text-emerald-600">{best}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {trend.length >= 2 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">近 30 天平均分趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <ScoreTrendChart data={trend} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">最近 200 次诊断</CardTitle>
        </CardHeader>
        <CardContent>
          {audits.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">还没有诊断记录。</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2 text-left">域名</th>
                    <th className="px-3 py-2 text-right">得分</th>
                    <th className="px-3 py-2 text-left">结论</th>
                    <th className="px-3 py-2 text-right">时间</th>
                    <th className="px-3 py-2 text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {audits.map((a) => (
                    <tr key={a.id} className="border-t border-slate-100 dark:border-slate-800">
                      <td className="px-3 py-2 font-medium">{a.domain}</td>
                      <td className="px-3 py-2 text-right">
                        <Badge variant={a.score >= 80 ? "success" : a.score >= 50 ? "warning" : "default"}>
                          <span className="num">{a.score}</span>
                        </Badge>
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-500 max-w-md truncate">
                        {JSON.parse(a.suggestions).slice(0, 1).join("") || "—"}
                      </td>
                      <td className="px-3 py-2 text-right text-xs text-slate-500">
                        {new Date(a.createdAt).toLocaleString("zh-CN")}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <a
                          href={`/api/audit/pdf?d=${encodeURIComponent(a.domain)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline"
                        >
                          <Download className="h-3 w-3" /> PDF
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
