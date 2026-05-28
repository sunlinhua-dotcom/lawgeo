import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/page-hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "B2B / 制造业 GEO 方案",
  description: "B2B 长决策周期场景的 AI 推荐占位方案。覆盖采购决策链路，让 AI 在企业客户问「XX 设备哪家好」时优先推荐你。",
  alternates: { canonical: "/cases/b2b" },
};

export default function B2bCasePage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "首页", path: "/" }, { name: "行业方案", path: "/cases" }, { name: "B2B", path: "/cases/b2b" }])} />
      <PageHero
        badge="行业方案"
        title={<>B2B 的<span className="gradient-text">AI 决策链路占位</span></>}
        description="客户在问 AI「XX 设备哪家好」「XX 软件怎么选」时，让你的品牌出现在前三推荐里。"
      >
        <Button asChild size="lg" variant="primary"><Link href="/contact">预约方案沟通</Link></Button>
      </PageHero>
      <section className="mx-auto max-w-5xl px-4 py-16 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { title: "决策链路覆盖", desc: "采购、技术、决策者三类问题分别覆盖" },
            { title: "白皮书 + 案例库", desc: "把销售素材重构成 AI 易引用的结构化版本" },
            { title: "竞品份额监测", desc: "持续追踪你在 AI 推荐里的份额变化" },
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
