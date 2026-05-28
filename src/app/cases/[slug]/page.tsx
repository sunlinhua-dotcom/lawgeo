import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Target, Sparkles, BarChart3, Calendar } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema, articleSchema } from "@/lib/seo";
import { CASES, findCase } from "@/data/cases";

export function generateStaticParams() {
  return CASES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = findCase(slug);
  if (!c) return {};
  return {
    title: `${c.industry} GEO 标杆案例 — ${c.highlightMetric.label}`,
    description: `${c.hero} · ${c.metrics.map((m) => `${m.value} ${m.label}`).join(" · ")}`,
    alternates: { canonical: `/cases/${c.slug}` },
  };
}

export default async function CaseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // 律所页有独立深度版（/cases/lawyer 已存在），但这里也作为 fallback
  if (slug === "lawyer") {
    // /cases/lawyer 已由根 /cases/lawyer/page.tsx 提供更深页面
    // 这里也允许通过 [slug] 路由访问，但优先级低
  }
  const c = findCase(slug);
  if (!c) notFound();

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "首页", path: "/" },
            { name: "行业方案", path: "/cases" },
            { name: c.industry, path: `/cases/${c.slug}` },
          ]),
          articleSchema({
            title: `${c.industry} GEO 标杆案例 — ${c.hero}`,
            description: c.clientBg,
            path: `/cases/${c.slug}`,
          }),
        ]}
      />

      <PageHero
        badge={`标杆案例 · ${c.industryEn}`}
        title={<>{c.hero}</>}
        description={c.clientBg}
      >
        <Button asChild size="lg" variant="primary">
          <Link href="/tools/audit">免费跑诊断</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/contact">预约同行业方案</Link>
        </Button>
      </PageHero>

      {/* 数字 hero */}
      <section className="border-y border-slate-100 bg-slate-50/50 dark:border-slate-900 dark:bg-slate-950/50">
        <div className="mx-auto max-w-6xl px-4 py-12 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {c.metrics.map((m) => (
              <div key={m.label} className="text-center">
                <div className="num text-4xl font-semibold text-indigo-600 lg:text-5xl">{m.value}</div>
                <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">{m.label}</div>
                {m.desc && <div className="mt-1 text-xs text-slate-400">{m.desc}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 主体 */}
      <section className="mx-auto max-w-5xl px-4 py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-12">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-semibold">
                <Target className="h-6 w-6 text-indigo-600" /> 优化目标
              </h2>
              <p className="mt-4 leading-relaxed text-slate-700 dark:text-slate-300">{c.goal}</p>
            </div>

            <div>
              <h2 className="flex items-center gap-2 text-2xl font-semibold">
                <Sparkles className="h-6 w-6 text-indigo-600" /> 优化策略
              </h2>
              <ul className="mt-4 space-y-3">
                {c.strategies.map((s, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="num mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed text-slate-700 dark:text-slate-300">{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="flex items-center gap-2 text-2xl font-semibold">
                <BarChart3 className="h-6 w-6 text-indigo-600" /> 达成效果
              </h2>
              <div className="mt-4 rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50 p-6 dark:border-indigo-900 dark:from-indigo-950 dark:to-violet-950">
                <div className="num text-5xl font-bold text-indigo-700 dark:text-indigo-200">
                  {c.highlightMetric.value}
                </div>
                <div className="mt-2 text-base text-indigo-900 dark:text-indigo-200">
                  {c.highlightMetric.label}
                </div>
              </div>
              <ul className="mt-6 space-y-2">
                {c.metrics.map((m) => (
                  <li key={m.label} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                    <span className="text-slate-700 dark:text-slate-300">
                      <strong className="num">{m.value}</strong> · {m.label}
                      {m.desc && <span className="text-slate-500"> — {m.desc}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <aside className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">客户简介</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <div className="text-xs text-slate-500">行业</div>
                  <div className="font-medium">{c.industry}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">客户</div>
                  <div className="font-medium">{c.client}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> 服务周期
                  </div>
                  <div className="text-slate-700 dark:text-slate-300">{c.duration}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">覆盖平台</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {c.platforms.map((p) => (
                    <Badge key={p} variant="primary">{p}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">关键词</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {c.tags.map((t) => (
                    <Badge key={t} variant="outline">{t}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </section>

      {/* 相关案例 */}
      <section className="border-t border-slate-100 bg-slate-50/30 dark:border-slate-900 dark:bg-slate-950/30">
        <div className="mx-auto max-w-6xl px-4 py-16 lg:px-8">
          <h2 className="mb-8 text-2xl font-semibold">其他行业案例</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CASES.filter((x) => x.slug !== c.slug)
              .slice(0, 4)
              .map((x) => (
                <Link key={x.slug} href={`/cases/${x.slug}`}>
                  <Card className="lift h-full">
                    <CardHeader className="pb-3">
                      <Badge variant="primary" className="self-start">{x.industry}</Badge>
                      <CardTitle className="text-base mt-2">{x.hero}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="num text-2xl font-semibold text-indigo-600">{x.highlightMetric.value}</div>
                      <div className="text-xs text-slate-500">{x.highlightMetric.label}</div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
          </div>
          <div className="mt-8 text-center">
            <Button asChild variant="outline" size="lg">
              <Link href="/cases">查看全部案例 <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600" />
        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center text-white lg:px-8">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            你的行业，<br />也可以拿到这样的数字
          </h2>
          <p className="mt-4 text-lg text-indigo-100">先免费跑一次诊断，60 秒看清差距。</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="xl" className="bg-white text-indigo-700 hover:bg-indigo-50">
              <Link href="/tools/audit">免费跑诊断</Link>
            </Button>
            <Button asChild size="xl" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
              <Link href="/contact">预约 1v1 顾问</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
