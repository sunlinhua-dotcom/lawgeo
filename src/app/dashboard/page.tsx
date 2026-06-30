import type { Metadata } from "next";
import Link from "next/link";
import {
  Search,
  Sparkles,
  Bot,
  ArrowRight,
  FileText,
  Rocket,
  Plug,
  Wand2,
} from "lucide-react";
import { desc, count, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashHeader, DashSection } from "@/components/ui/section";
import { EmptyState } from "@/components/ui/empty-state";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "控制台 · 概览", robots: { index: false } };

async function getStats(userId: string) {
  const [audits, drafts, queries, posts] = await Promise.all([
    db.select({ n: count() }).from(schema.audits),
    db
      .select({ n: count() })
      .from(schema.contentDrafts)
      .where(eq(schema.contentDrafts.userId, userId)),
    db
      .select({ n: count() })
      .from(schema.aiQueries)
      .where(eq(schema.aiQueries.userId, userId)),
    db
      .select({ n: count() })
      .from(schema.blogPosts)
      .where(eq(schema.blogPosts.userId, userId)),
  ]);
  const recentAudits = await db
    .select()
    .from(schema.audits)
    .orderBy(desc(schema.audits.createdAt))
    .limit(5);
  const recentPosts = await db
    .select()
    .from(schema.blogPosts)
    .where(eq(schema.blogPosts.userId, userId))
    .orderBy(desc(schema.blogPosts.createdAt))
    .limit(5);
  return {
    audits: audits[0]?.n ?? 0,
    drafts: drafts[0]?.n ?? 0,
    queries: queries[0]?.n ?? 0,
    posts: posts[0]?.n ?? 0,
    recentAudits,
    recentPosts,
  };
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;
  const stats = await getStats(session.userId);

  const STATS_CARDS = [
    {
      label: "GEO 诊断",
      value: stats.audits,
      icon: Search,
      link: "/dashboard/audits",
      color: "from-indigo-500/15 to-indigo-500/5",
      iconColor: "text-indigo-600",
    },
    {
      label: "已生成草稿",
      value: stats.drafts,
      icon: Sparkles,
      link: "/dashboard/generate",
      color: "from-violet-500/15 to-violet-500/5",
      iconColor: "text-violet-600",
    },
    {
      label: "AI 平台查询",
      value: stats.queries,
      icon: Bot,
      link: "/dashboard/monitor",
      color: "from-cyan-500/15 to-cyan-500/5",
      iconColor: "text-cyan-600",
    },
    {
      label: "已发布博客",
      value: stats.posts,
      icon: FileText,
      link: "/dashboard/blog",
      color: "from-emerald-500/15 to-emerald-500/5",
      iconColor: "text-emerald-600",
    },
  ];

  const QUICK_ACTIONS = [
    {
      href: "/dashboard/blog",
      title: "批量发布行业博客",
      desc: "填作者 + 关键词，自动生成 GEO 友好文章并发到行业博客",
      icon: Wand2,
      featured: true,
    },
    {
      href: "/tools/audit",
      title: "免费 GEO 诊断",
      desc: "输入任意域名，30 秒拿到 20 项 GEO 评分",
      icon: Search,
    },
    {
      href: "/tools/compare",
      title: "12 平台 AI 对比",
      desc: "同一问题在 12 个 AI 平台同时跑",
      icon: Bot,
    },
    {
      href: "/dashboard/integrations",
      title: "对接海外平台",
      desc: "Dev.to / Hashnode / Medium 真实 API 自动发布",
      icon: Plug,
    },
  ];

  return (
    <div className="px-6 py-8 lg:px-10">
      <DashHeader
        title={
          <>
            欢迎回来，
            <span className="gradient-text">{session.email.split("@")[0]}</span>
          </>
        }
        description="一图看清你的 GEO 项目进度。下面是建议的下一步行动。"
      />

      {/* Stat cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STATS_CARDS.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.label} href={s.link} className="group">
              <Card variant="default" className="lift overflow-hidden">
                <div className={`relative bg-gradient-to-br ${s.color} p-5`}>
                  <div className="flex items-start justify-between">
                    <div className="grid h-8 w-8 place-items-center rounded-lg bg-white/80 backdrop-blur shadow-sm">
                      <Icon className={`h-4 w-4 ${s.iconColor}`} />
                    </div>
                    <ArrowRight className="h-3 w-3 text-slate-400 transition-transform group-hover:translate-x-0.5" />
                  </div>
                  <div className="num mt-4 text-3xl font-semibold tracking-tight">
                    {s.value.toLocaleString()}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500">{s.label}</div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Featured CTA — wide */}
      <Link href={QUICK_ACTIONS[0].href} className="mt-6 block">
        <Card
          variant="gradient"
          className="lift group relative overflow-hidden"
        >
          <div className="dotgrid absolute inset-0 opacity-30" />
          <div className="relative flex items-center gap-5 p-6">
            <div className="grid h-14 w-14 flex-shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
              <Wand2 className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <Badge variant="gradient" size="sm" className="mb-1.5">
                <Rocket className="h-2.5 w-2.5" /> 推荐第一步
              </Badge>
              <h2 className="text-lg font-semibold tracking-tight">
                {QUICK_ACTIONS[0].title}
              </h2>
              <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
                {QUICK_ACTIONS[0].desc}
              </p>
            </div>
            <ArrowRight className="h-5 w-5 flex-shrink-0 text-indigo-600 transition-transform group-hover:translate-x-1" />
          </div>
        </Card>
      </Link>

      {/* 3-column quick actions */}
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        {QUICK_ACTIONS.slice(1).map((q) => {
          const Icon = q.icon;
          return (
            <Link key={q.href} href={q.href} className="group">
              <Card className="lift h-full">
                <CardHeader>
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-600 transition-colors group-hover:bg-indigo-100 group-hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-indigo-950 dark:group-hover:text-indigo-300">
                    <Icon className="h-4 w-4" />
                  </div>
                  <CardTitle className="mt-3 text-base">{q.title}</CardTitle>
                  <CardDescription className="text-xs">{q.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 transition-transform group-hover:translate-x-0.5 dark:text-indigo-400">
                    打开 <ArrowRight className="h-3 w-3" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Recent activity */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <DashSection
          title="🔬 最近的诊断"
          description="点击查看完整报告"
          action={
            <Link
              href="/dashboard/audits"
              className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
            >
              查看全部
            </Link>
          }
        >
          {stats.recentAudits.length === 0 ? (
            <EmptyState
              icon={Search}
              title="还没有诊断记录"
              description={<>从一个免费诊断开始。输入域名 30 秒看清差距。</>}
              action={
                <Button asChild variant="primary" size="sm">
                  <Link href="/tools/audit">立即跑诊断</Link>
                </Button>
              }
            />
          ) : (
            <ul className="space-y-1.5">
              {stats.recentAudits.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-3 py-2.5 text-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        a.score >= 80
                          ? "bg-emerald-500"
                          : a.score >= 50
                            ? "bg-amber-500"
                            : "bg-rose-500"
                      }`}
                    />
                    <span className="truncate font-medium">{a.domain}</span>
                  </div>
                  <Badge
                    variant={
                      a.score >= 80 ? "success" : a.score >= 50 ? "warning" : "danger"
                    }
                  >
                    <span className="num">{a.score}</span> 分
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </DashSection>

        <DashSection
          title="📝 最近博客文章"
          description="行业博客发布历史"
          action={
            <Link
              href="/dashboard/blog"
              className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
            >
              查看全部
            </Link>
          }
        >
          {stats.recentPosts.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="还没有博客文章"
              description={<>批量生成 GEO 友好文章，一键发到对应行业博客。</>}
              action={
                <Button asChild variant="primary" size="sm">
                  <Link href="/dashboard/blog">开始批量发布</Link>
                </Button>
              }
            />
          ) : (
            <ul className="space-y-1.5">
              {stats.recentPosts.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 bg-white px-3 py-2.5 text-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{p.title}</div>
                    <div className="mt-0.5 text-[10px] text-slate-500">
                      {p.industry} · <span className="num">{p.wordCount ?? 0}</span> 字
                    </div>
                  </div>
                  <Badge
                    variant={p.status === "published" ? "success" : "outline"}
                    dot
                  >
                    {p.status === "published" ? "已发布" : "草稿"}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </DashSection>
      </div>
    </div>
  );
}
