import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/page-hero";
import { MarketStats } from "@/components/home/market-stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema, articleSchema } from "@/lib/seo";
import { ArrowRight, Sparkles, ExternalLink, Bot, ShoppingCart } from "lucide-react";

export const metadata: Metadata = {
  title: "GEO 行业洞察 — 市场规模、流量趋势、电商转化",
  description: "2026 GEO 行业完整数据：215% 市场增长、$50B 市场规模、AI 蚕食搜索流量趋势、AI 电商转化新场景。",
  alternates: { canonical: "/market-insights" },
};

const sources = [
  { name: "艾瑞咨询《2025 中国 GEO 市场白皮书》", url: "#" },
  { name: "Gartner Predicts 2026 — Generative Search", url: "#" },
  { name: "Statista — Global AI Search Market Forecast", url: "#" },
  { name: "Pew Research — AI Adoption Survey 2026", url: "#" },
];

const aiCommerce = [
  {
    icon: ExternalLink,
    title: "各大模型直达官网",
    desc: "智能 AI 助手已支持用户通过搜索结果直接访问品牌官方网站，实现无缝跳转，提升用户体验与转化效率。",
  },
  {
    icon: ShoppingCart,
    title: "ChatGPT 跳转亚马逊",
    desc: "ChatGPT 等 AI 工具在提供信息的同时智能推荐亚马逊等电商平台商品链接，为消费者提供便捷购物入口，加速决策过程。",
  },
  {
    icon: Bot,
    title: "豆包直通抖音商城",
    desc: "短视频平台 AI 应用如豆包，已能直接引导用户跳转至抖音商城进行商品浏览与购买，打通内容与销售环节。",
  },
];

export default function MarketInsightsPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "首页", path: "/" }, { name: "行业洞察", path: "/market-insights" }]),
          articleSchema({
            title: "2026 GEO 行业完整洞察",
            description: "市场规模、流量趋势、AI 电商转化新场景",
            path: "/market-insights",
          }),
        ]}
      />

      <PageHero
        badge="行业洞察 · 2026"
        title={<>GEO <span className="gradient-text">行业完整数据</span>洞察</>}
        description="2026 年 GEO 市场进入爆发期。本报告整合艾瑞、Gartner、Statista 等权威数据源，给出完整的行业格局。"
      />

      <MarketStats />

      {/* AI → 电商新场景 */}
      <section className="border-b border-slate-100 dark:border-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-16 lg:px-8">
          <h2 className="mb-3 text-3xl font-semibold tracking-tight">AI 平台已成品牌引流工具</h2>
          <p className="mb-12 text-slate-600 dark:text-slate-400">
            AI 不只回答问题，已经在直接促成电商转化。三个真实场景：
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {aiCommerce.map((c) => {
              const Icon = c.icon;
              return (
                <Card key={c.title} className="lift">
                  <CardHeader>
                    <Icon className="h-8 w-8 text-indigo-600" />
                    <CardTitle className="text-base">{c.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{c.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* 数据来源 */}
      <section className="border-b border-slate-100 dark:border-slate-900">
        <div className="mx-auto max-w-4xl px-4 py-12 lg:px-8">
          <h2 className="text-base font-semibold">数据来源</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
            {sources.map((s) => (
              <li key={s.name}>· {s.name}</li>
            ))}
          </ul>
          <div className="mt-4 text-xs text-slate-400">
            数据已脱敏整合并经 lawGEO 团队二次核验。引用时请注明 lawGEO 行业洞察。
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600" />
        <div className="relative mx-auto max-w-4xl px-4 py-16 text-center text-white lg:px-8">
          <Sparkles className="mx-auto h-10 w-10" />
          <h2 className="mt-4 text-3xl font-semibold tracking-tight">想要拿到这块流量？</h2>
          <p className="mt-3 text-indigo-100">
            $50B 的全球市场和 215% 的中国市场增速，意味着你的竞争对手现在就在做。
          </p>
          <div className="mt-8">
            <Button asChild size="xl" className="bg-white text-indigo-700 hover:bg-indigo-50">
              <Link href="/tools/audit">
                免费跑诊断 <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
