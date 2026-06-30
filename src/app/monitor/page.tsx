import type { Metadata } from "next";
import Link from "next/link";
import { LineChart, BellRing, Bot, TrendingUp } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "AI 引用监测 — 12 平台日级追踪",
  description:
    "每日在 DeepSeek/通义/豆包/Kimi/智谱/文心/元宝/海螺/Claude/ChatGPT/Gemini/Perplexity 共 12 个 AI 平台跑你的关键词，追踪引用率、Top3 推荐率、竞品份额。",
  alternates: { canonical: "/monitor" },
};

export default function MonitorPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "首页", path: "/" }, { name: "AI 引用监测", path: "/monitor" }])} />
      <PageHero
        badge="产品 · AI 引用监测"
        title={<>每天在 <span className="num">12</span> 个 AI 平台<br /><span className="gradient-text">跑你的关键词</span></>}
        description="aceflow 等竞品仅覆盖 6 个国内平台，BrandGEO 同时监测 8 个国内 + 4 个海外平台，给出完整 AI 引用份额视图。"
      >
        <Button asChild size="lg" variant="primary">
          <Link href="/tools/compare">体验对比工具</Link>
        </Button>
      </PageHero>

      <section className="mx-auto max-w-6xl px-4 py-16 lg:px-8">
        <h2 className="mb-6 text-xl font-semibold">覆盖平台</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {siteConfig.aiPlatforms.map((p) => (
            <div
              key={p.id}
              className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-center text-sm font-medium dark:border-slate-800 dark:bg-slate-900"
            >
              <Bot className="mx-auto h-4 w-4 text-indigo-500" />
              <div className="mt-1.5">{p.name}</div>
              <div className="text-[10px] text-slate-400">{p.cn ? "国内" : "海外"}</div>
            </div>
          ))}
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {[
            { icon: LineChart, title: "引用率趋势", desc: "每个关键词每日跑一次，趋势图直接看变化" },
            { icon: TrendingUp, title: "Top3 推荐率", desc: "看你是否进入 AI 推荐品牌的前三位" },
            { icon: BellRing, title: "邮件预警", desc: "引用率波动 / 竞品反超 / Top3 跌出立即邮件告警" },
          ].map((f) => {
            const Icon = f.icon;
            return (
              <Card key={f.title}>
                <CardHeader>
                  <Icon className="h-6 w-6 text-indigo-600" />
                  <CardTitle className="text-base">{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{f.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </>
  );
}
