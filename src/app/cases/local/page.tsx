import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/page-hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "本地生活 / 医美 / 教育 GEO 方案",
  description: "区域咨询决策的 GEO 落地：医美、教培、本地服务。LBS + AI 双引擎覆盖。",
  alternates: { canonical: "/cases/local" },
};

export default function LocalCasePage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "首页", path: "/" }, { name: "行业方案", path: "/cases" }, { name: "本地生活", path: "/cases/local" }])} />
      <PageHero
        badge="行业方案"
        title={<>本地生活 / 医美 / 教育的<span className="gradient-text">区域 GEO</span></>}
        description="客户在问 AI「上海眼科医院推荐」「北京少儿英语怎么选」时，让你被推荐。"
      >
        <Button asChild size="lg" variant="primary"><Link href="/contact">联系方案沟通</Link></Button>
      </PageHero>
      <section className="mx-auto max-w-5xl px-4 py-16 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { title: "城市 × 服务矩阵", desc: "全国 300+ 城市 × 你的服务做长尾覆盖" },
            { title: "用户评价沉淀", desc: "把真实评价结构化成 AI 易引用的来源" },
            { title: "本地化合规", desc: "医美 / 教培的广告法红线全部预审" },
          ].map((c) => (
            <Card key={c.title}>
              <CardHeader><CardTitle className="text-base">{c.title}</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-slate-600 dark:text-slate-400">{c.desc}</p></CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
