import type { Metadata } from "next";
import Link from "next/link";
import { Search, Sparkles, Bot, Database, ArrowRight, TrendingUp } from "lucide-react";
import { desc, count } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "控制台 · 概览", robots: { index: false } };

async function getStats() {
  const [auditsCount, leadsCount, draftsCount, queriesCount] = await Promise.all([
    db.select({ n: count() }).from(schema.audits),
    db.select({ n: count() }).from(schema.leads),
    db.select({ n: count() }).from(schema.contentDrafts),
    db.select({ n: count() }).from(schema.aiQueries),
  ]);
  const recentAudits = await db.select().from(schema.audits).orderBy(desc(schema.audits.createdAt)).limit(5);
  const recentLeads = await db.select().from(schema.leads).orderBy(desc(schema.leads.createdAt)).limit(5);
  return {
    audits: auditsCount[0]?.n ?? 0,
    leads: leadsCount[0]?.n ?? 0,
    drafts: draftsCount[0]?.n ?? 0,
    queries: queriesCount[0]?.n ?? 0,
    recentAudits,
    recentLeads,
  };
}

export default async function DashboardPage() {
  const session = await getSession();
  const stats = await getStats();

  return (
    <div className="px-6 py-8 lg:px-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          欢迎回来，{session?.email.split("@")[0]}
        </h1>
        <p className="mt-1 text-sm text-slate-500">控制台显示你的项目当前状态。</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "已运行诊断", value: stats.audits, icon: Search, link: "/dashboard/audits" },
          { label: "AI 生成内容", value: stats.drafts, icon: Sparkles, link: "/dashboard/generate" },
          { label: "AI 引用查询", value: stats.queries, icon: Bot, link: "/dashboard/monitor" },
          { label: "已收集线索", value: stats.leads, icon: Database, link: "/dashboard/leads" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.label} href={s.link}>
              <Card className="lift">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <Icon className="h-5 w-5 text-indigo-600" />
                    <ArrowRight className="h-4 w-4 text-slate-300" />
                  </div>
                  <div className="num mt-3 text-3xl font-semibold">{s.value}</div>
                  <div className="mt-1 text-xs text-slate-500">{s.label}</div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* 快捷入口 */}
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          { href: "/tools/audit", title: "立即跑一次诊断", desc: "输入任意域名 30 秒拿到 GEO 报告", icon: Search },
          { href: "/tools/generate", title: "生成 AI 友好内容", desc: "FAQ / TL;DR / HowTo / 对比表", icon: Sparkles },
          { href: "/tools/compare", title: "12 平台 AI 对比", desc: "同一问题在 12 个 AI 平台同时跑", icon: Bot },
        ].map((q) => {
          const Icon = q.icon;
          return (
            <Card key={q.href} className="lift">
              <CardHeader>
                <Icon className="h-6 w-6 text-indigo-600" />
                <CardTitle className="text-base">{q.title}</CardTitle>
                <CardDescription>{q.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="primary" size="sm">
                  <Link href={q.href}>
                    打开工具 <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 最近诊断 + 最近线索 */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" /> 最近的诊断
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentAudits.length === 0 ? (
              <div className="text-sm text-slate-500">还没有诊断记录。 <Link href="/tools/audit" className="text-indigo-600">立即跑一个 →</Link></div>
            ) : (
              <ul className="space-y-2">
                {stats.recentAudits.map((a) => (
                  <li key={a.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm dark:border-slate-800">
                    <span className="truncate">{a.domain}</span>
                    <Badge variant={a.score >= 80 ? "success" : a.score >= 50 ? "warning" : "default"}>
                      <span className="num">{a.score}</span> 分
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">最近线索</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentLeads.length === 0 ? (
              <div className="text-sm text-slate-500">还没有线索记录。</div>
            ) : (
              <ul className="space-y-2">
                {stats.recentLeads.map((l) => (
                  <li key={l.id} className="rounded-lg border border-slate-100 px-3 py-2 text-sm dark:border-slate-800">
                    <div className="font-medium">{l.name}</div>
                    <div className="text-xs text-slate-500">{l.industry} · {l.contact}</div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
