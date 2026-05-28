import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/page-hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "中小企业 GEO 方案 — 低成本高 ROI 的 AI 可见性建设",
  description: "中小企业、财税、咨询、专业服务团队的 GEO 落地方案。先聚焦 10–30 个核心问题，再做内容矩阵扩张。",
  alternates: { canonical: "/cases/sme" },
};

export default function SmeCasePage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "首页", path: "/" }, { name: "行业方案", path: "/cases" }, { name: "中小企业", path: "/cases/sme" }])} />
      <PageHero
        badge="行业方案"
        title={<>中小企业的<span className="gradient-text">最小可用 GEO</span></>}
        description="低成本起步、聚焦高 ROI 问题。适合财税、咨询、知产、专业服务团队。"
      >
        <Button asChild size="lg" variant="primary">
          <Link href="/tools/audit">免费跑诊断</Link>
        </Button>
      </PageHero>
      <section className="mx-auto max-w-5xl px-4 py-16 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { title: "聚焦 30 个核心问题", desc: "不贪多，先把客户最常问的 30 个问题做成 FAQ" },
            { title: "官网先做完整版", desc: "把官网当做最完整事实源，自动外溢到知乎、公众号" },
            { title: "用周度趋势复盘", desc: "每周看哪些问题开始被 AI 引用，复盘下一轮选题" },
          ].map((c) => (
            <Card key={c.title}>
              <CardHeader>
                <CardTitle className="text-base">{c.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 dark:text-slate-400">{c.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="prose prose-slate mt-16 max-w-none dark:prose-invert prose-cn">
          <h2>推荐起步预算</h2>
          <p>起步版 8,000 元 / 月，含 30 关键词 + 4 平台监测 + 30 篇 AI 生成。3 个月内可看到首批 AI 引用变化。</p>
          <h2>不适合谁</h2>
          <ul>
            <li>纯 C 端冲动消费品类（GEO 杠杆较小，建议 SEO + 信息流）</li>
            <li>客单价 &lt; 100 元的快消品类</li>
            <li>无任何官网内容的全新品牌（建议先做 1 个月内容沉淀再启动）</li>
          </ul>
        </div>
      </section>
    </>
  );
}
