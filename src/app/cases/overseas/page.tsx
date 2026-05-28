import type { Metadata } from "next";
import Link from "next/link";
import { Globe, Languages, Users, Server, Headphones, Megaphone, ArrowRight, CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "GEO 出海方案 — 多语言 × 多平台 × 本地化",
  description: "覆盖 ChatGPT、Claude、Perplexity、Gemini、Meta AI 等海外主流 AI 平台。20+ 语言母语级生成。海外 KOL 与媒体资源对接。",
  alternates: { canonical: "/cases/overseas" },
};

const overseasPlatforms = [
  { name: "ChatGPT", region: "全球", strength: "对话场景" },
  { name: "Claude", region: "北美/欧洲", strength: "审慎深度" },
  { name: "Perplexity", region: "北美", strength: "引用源链接" },
  { name: "Gemini", region: "全球", strength: "搜索强联动" },
  { name: "Meta AI", region: "社交媒体", strength: "Facebook / Instagram" },
  { name: "Mistral Le Chat", region: "欧洲", strength: "欧盟合规" },
  { name: "Microsoft Copilot", region: "B2B 企业", strength: "Office 生态" },
  { name: "Grok", region: "X 平台", strength: "实时社交" },
];

const stats = [
  { value: "65%", label: "北美 AI 搜索使用率" },
  { value: "48%", label: "欧洲市场渗透率" },
  { value: "$50B", label: "2026 全球 AI 搜索市场" },
  { value: "3×", label: "海外用户对 AI 推荐品牌的信任度提升" },
];

const strategies = [
  {
    icon: Languages,
    title: "多语言内容矩阵",
    points: [
      "英语 / 西班牙语 / 法语 / 德语 / 日语 / 韩语等 20+ 语种",
      "母语级内容质量，规避翻译腔",
      "文化适配：节日、习俗、当地表达",
      "每种语言独立 schema.org 与 hreflang 标签",
    ],
  },
  {
    icon: Globe,
    title: "多平台协同优化",
    points: [
      "针对每个 AI 平台的回答偏好定制内容策略",
      "ChatGPT 注重对话场景，Perplexity 强调引用源",
      "Claude 偏好结构化深度，Gemini 强调搜索联动",
      "跨平台数据监测，动态调整优化方向",
    ],
  },
  {
    icon: Users,
    title: "本地化场景渗透",
    points: [
      "深入研究目标市场用户搜索习惯",
      "结合当地节日、热点事件布局内容",
      "本地化案例与用户评价增强可信度",
      "对接当地科技媒体、KOL 与权威信源",
    ],
  },
];

const capabilities = [
  { icon: Languages, title: "多语言 AI 生成引擎", desc: "20+ 语种母语级内容生成" },
  { icon: Globe, title: "跨平台数据监测系统", desc: "全球 AI 平台引用追踪" },
  { icon: Server, title: "海外服务器节点", desc: "CDN 多节点部署，全球低延迟" },
  { icon: Languages, title: "实时翻译与本地化工具", desc: "本地化质量检查 + 自动 hreflang" },
  { icon: Headphones, title: "多时区客户服务", desc: "7×24 全球时区无缝支持" },
  { icon: Megaphone, title: "海外 KOL 与媒体资源", desc: "对接科技媒体 + 行业 KOL" },
];

export default function OverseasCasePage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "首页", path: "/" },
          { name: "行业方案", path: "/cases" },
          { name: "出海", path: "/cases/overseas" },
        ])}
      />

      <PageHero
        badge="GEO 出海 · 抢占全球 AI 流量入口"
        title={<>覆盖海外主流 AI 平台<br /><span className="gradient-text">助力中国品牌全球化</span></>}
        description="海外市场 AI 搜索渗透率持续攀升，品牌出海迎来黄金窗口期。ChatGPT、Perplexity、Claude 等已成为欧美主流信息获取渠道。"
      >
        <Button asChild size="lg" variant="primary">
          <Link href="/contact?plan=overseas">预约出海方案</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/tools/generate">体验多语言生成</Link>
        </Button>
      </PageHero>

      {/* 市场数据 */}
      <section className="border-y border-slate-100 bg-slate-50/50 dark:border-slate-900 dark:bg-slate-950/50">
        <div className="mx-auto max-w-6xl px-4 py-12 lg:px-8">
          <h2 className="mb-8 text-center text-xl font-semibold">全球 AI 搜索市场格局</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="num text-4xl font-semibold text-indigo-600 lg:text-5xl">{s.value}</div>
                <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 平台矩阵 */}
      <section className="mx-auto max-w-6xl px-4 py-16 lg:px-8">
        <h2 className="mb-8 text-2xl font-semibold">海外主流 AI 平台矩阵</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {overseasPlatforms.map((p) => (
            <Card key={p.name}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{p.name}</CardTitle>
                <div className="flex flex-wrap gap-1 mt-1">
                  <Badge variant="outline">{p.region}</Badge>
                  <Badge variant="primary">{p.strength}</Badge>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* 三大核心策略 */}
      <section className="border-y border-slate-100 bg-slate-50/50 dark:border-slate-900 dark:bg-slate-950/50">
        <div className="mx-auto max-w-6xl px-4 py-16 lg:px-8">
          <h2 className="mb-12 text-center text-2xl font-semibold">出海 GEO 三大核心策略</h2>
          <div className="grid gap-6 lg:grid-cols-3">
            {strategies.map((s) => {
              const Icon = s.icon;
              return (
                <Card key={s.title} className="lift">
                  <CardHeader>
                    <Icon className="h-8 w-8 text-indigo-600" />
                    <CardTitle className="mt-3">{s.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {s.points.map((p, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* 服务能力 */}
      <section className="mx-auto max-w-6xl px-4 py-16 lg:px-8">
        <h2 className="mb-12 text-center text-2xl font-semibold">出海 GEO 服务能力</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((c) => {
            const Icon = c.icon;
            return (
              <Card key={c.title}>
                <CardHeader>
                  <Icon className="h-6 w-6 text-indigo-600" />
                  <CardTitle className="text-base">{c.title}</CardTitle>
                  <CardDescription>{c.desc}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 标杆数字 */}
      <section className="border-t border-slate-100 bg-gradient-to-br from-indigo-50 to-violet-50 dark:border-slate-900 dark:from-indigo-950 dark:to-violet-950">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center lg:px-8">
          <Badge variant="primary" className="mb-3">标杆案例 · AI 出海应用</Badge>
          <h2 className="text-2xl font-semibold tracking-tight">
            国内 AI 文生图应用，3 个月海外下载 +280%
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            <div>
              <div className="num text-5xl font-semibold text-indigo-600">−65%</div>
              <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">CAC 获客成本下降</div>
            </div>
            <div>
              <div className="num text-5xl font-semibold text-violet-600">+280%</div>
              <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">海外下载量增长</div>
            </div>
            <div>
              <div className="num text-5xl font-semibold text-fuchsia-600">+150%</div>
              <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">付费转化率提升</div>
            </div>
          </div>
          <Button asChild size="lg" variant="primary" className="mt-10">
            <Link href="/cases/ai-saas-overseas">
              查看完整案例 <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
