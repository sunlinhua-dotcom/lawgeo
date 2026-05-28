import type { Metadata } from "next";
import Link from "next/link";
import { Scale, Building2, Globe, Sparkles, ArrowRight } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "行业方案 — 律所 / SME / B2B / 本地生活",
  description: "lawGEO 行业 GEO 方案总览：律所主打方向、中小企业方案、B2B 制造业、本地生活与教育培训。",
  alternates: { canonical: "/cases" },
};

const cases = [
  { icon: Scale, href: "/cases/lawyer", title: "律所 / 法律服务", desc: "国内首家律所深度定制方案：案由词库 × 地域矩阵 × 合规审查模板。", featured: true },
  { icon: Building2, href: "/cases/sme", title: "中小企业 / 专业服务", desc: "低成本高 ROI 的 GEO 起步方案，适合财税、咨询、专业服务。" },
  { icon: Globe, href: "/cases/b2b", title: "B2B / 制造业", desc: "长决策周期场景的 AI 推荐占位，覆盖采购决策链路。" },
  { icon: Sparkles, href: "/cases/local", title: "本地生活 / 医美 / 教育", desc: "LBS + AI 双引擎，覆盖区域咨询决策。" },
];

export default function CasesPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "首页", path: "/" }, { name: "行业方案", path: "/cases" }])} />
      <PageHero
        badge="行业方案"
        title={<>不只律所，<span className="gradient-text">高决策成本</span>行业都需要 GEO</>}
        description="按行业特点定制的 GEO 方案。律所是主打方向，其他三类是通用扩展。"
      />
      <section className="mx-auto max-w-5xl px-4 py-16 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2">
          {cases.map((c) => {
            const Icon = c.icon;
            return (
              <Link key={c.href} href={c.href}>
                <Card className={`lift h-full ${c.featured ? "border-indigo-300 bg-gradient-to-br from-indigo-50 to-white dark:border-indigo-900 dark:from-indigo-950 dark:to-slate-900" : ""}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Icon className="h-7 w-7 text-indigo-600" />
                      {c.featured && <Badge variant="primary">主打</Badge>}
                    </div>
                    <CardTitle>{c.title}</CardTitle>
                    <CardDescription>{c.desc}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <span className="inline-flex items-center gap-1 text-sm text-indigo-600">
                      查看方案 <ArrowRight className="h-3 w-3" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
