import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/page-hero";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/seo";
import { CASES } from "@/data/cases";
import { ArrowRight, Scale, GraduationCap, Coffee, Smartphone, Megaphone, Store, Landmark, Globe, Building2, Sparkles } from "lucide-react";

const ICONS: Record<string, React.ElementType> = {
  cosmetics: Sparkles,
  lawyer: Scale,
  education: GraduationCap,
  fmcg: Coffee,
  "consumer-electronics": Smartphone,
  adtech: Megaphone,
  franchise: Store,
  finance: Landmark,
  "ai-saas-overseas": Globe,
};

export const metadata: Metadata = {
  title: "行业方案 / 标杆案例 — 美妆个护旗舰，全行业 GEO 增长记录",
  description: "BrandGEO 的真实标杆案例：以美妆个护为旗舰，覆盖快消 / 消费电子 / 教育 / 广告媒体 / 招商加盟 / 金融 / AI 出海，律所等专业服务为附属垂直。",
  alternates: { canonical: "/cases" },
};

export default function CasesPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "首页", path: "/" }, { name: "行业方案", path: "/cases" }])} />
      <PageHero
        badge="8 大行业 · 真实标杆案例"
        title={<>从美妆到专业服务，<span className="gradient-text">所有品牌</span>都需要 GEO</>}
        description="每个案例都附完整的客户背景、优化策略与达成数字。点击进入查看详细路径。"
      />
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CASES.map((c) => {
            const Icon = ICONS[c.slug] ?? Building2;
            const isFeatured = c.slug === "cosmetics";
            return (
              <Link key={c.slug} href={`/cases/${c.slug}`}>
                <Card className={`lift h-full ${isFeatured ? "border-indigo-300 bg-gradient-to-br from-indigo-50 to-white dark:border-indigo-900 dark:from-indigo-950 dark:to-slate-900" : ""}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Icon className="h-8 w-8 text-indigo-600" />
                      <div className="flex flex-col gap-1 items-end">
                        {isFeatured && <Badge variant="primary">主打行业</Badge>}
                        <Badge variant="outline">{c.industryEn}</Badge>
                      </div>
                    </div>
                    <CardTitle className="mt-3">{c.industry}</CardTitle>
                    <CardDescription className="leading-relaxed">{c.hero}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
                      <div className="num text-2xl font-semibold text-indigo-600">{c.highlightMetric.value}</div>
                      <div className="text-xs text-slate-500">{c.highlightMetric.label}</div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-indigo-600">
                      查看详情 <ArrowRight className="ml-1 h-3 w-3" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold">你的行业不在上面？</h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400">
            GEO 适用于所有「高决策成本 + 信息查询」行业。<br />
            预约 1v1 顾问，我们给你定制行业方案。
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/tools/audit"
              className="inline-flex items-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 px-7 py-3 text-base font-semibold text-white shadow-md"
            >
              免费跑诊断
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center rounded-xl border border-slate-200 px-7 py-3 text-base font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200"
            >
              预约顾问
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
