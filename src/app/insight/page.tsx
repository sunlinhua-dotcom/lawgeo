import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Target, TrendingUp, GitCompare, Filter } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "GEO 洞察系统 — 关键词矩阵与 AI 提及频率分析",
  description:
    "lawGEO 的 GEO 洞察系统结合微信指数、百度指数、案由词库 × 地域矩阵，识别品牌当前在 AI 搜索中的内容缺口与高 ROI 选题。",
  alternates: { canonical: "/insight" },
};

export default function InsightPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "首页", path: "/" }, { name: "GEO 洞察", path: "/insight" }])} />
      <PageHero
        badge="产品 · GEO 洞察"
        title={<>先看清 AI 推荐谁，<span className="gradient-text">再决定写什么</span></>}
        description="GEO 洞察系统把关键词矩阵、AI 提及频率、竞品引用源、用户意图分级汇总到一张图。先洞察、后行动。"
      >
        <Button asChild size="lg" variant="primary">
          <Link href="/tools/audit">免费跑一次诊断</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/pricing">查看完整能力</Link>
        </Button>
      </PageHero>

      <section className="mx-auto max-w-6xl px-4 py-16 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          {[
            { icon: Target, title: "案由 × 地域矩阵", desc: "内置 1,800+ 律所长尾关键词，按意图、搜索量、AI 提及度排序。" },
            { icon: TrendingUp, title: "AI 提及频率", desc: "每日在 12 个平台跑你的关键词，识别哪些选题真的能被 AI 引用。" },
            { icon: GitCompare, title: "竞品引用源拆解", desc: "看清竞品在哪些页面被 AI 引用、引用频次、回答中的排位。" },
            { icon: Filter, title: "意图分级与优先级", desc: "把关键词按信息型/商业型/交易型/导航型分类，决定先做哪个。" },
          ].map((f) => {
            const Icon = f.icon;
            return (
              <Card key={f.title} className="lift">
                <CardHeader>
                  <Icon className="h-8 w-8 text-indigo-600" />
                  <CardTitle>{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-400">{f.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 rounded-2xl border border-slate-200 bg-slate-50 p-8 dark:border-slate-800 dark:bg-slate-900/50">
          <h2 className="text-2xl font-semibold">输出物</h2>
          <ul className="mt-4 space-y-2 text-slate-700 dark:text-slate-300">
            <li>· 关键词与问题的优先级清单（按 ROI 排序）</li>
            <li>· 竞品引用来源与平台分布热力图</li>
            <li>· 内容选题与发布渠道建议</li>
            <li>· 监测问题库（每日刷新，预警引用变化）</li>
            <li>· 月度趋势报告（趋势图 + 行动建议）</li>
          </ul>
        </div>

        <div className="mt-12 flex justify-center">
          <Button asChild size="lg" variant="primary">
            <Link href="/contact">
              预约 1v1 顾问 <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
