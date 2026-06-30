import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Sparkles, Layers, Code } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema, howToSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "AI 内容生成 — FAQ / TL;DR / HowTo / 对比表 / 直接答案",
  description:
    "BrandGEO 的 AI 内容生成引擎针对国内大模型 + Claude/ChatGPT/Perplexity 优化，一次输出 FAQ + TL;DR + HowTo + 对比表 + 直接答案段落，自带 schema.org JSON-LD。",
  alternates: { canonical: "/generate" },
};

const formats = [
  { name: "FAQ", desc: "问答式内容 + FAQPage JSON-LD", icon: FileText },
  { name: "TL;DR", desc: "顶层摘要 + 关键事实，3 行内", icon: Sparkles },
  { name: "HowTo", desc: "分步操作 + HowTo JSON-LD", icon: Layers },
  { name: "对比表格", desc: "结构化对比 + AI 易抽取", icon: Code },
];

export default function GeneratePage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "首页", path: "/" }, { name: "AI 内容生成", path: "/generate" }]),
          howToSchema({
            name: "如何用 BrandGEO 生成 AI 友好内容",
            description: "三步把任意品牌业务素材转成 GEO 友好的 FAQ + HowTo + 对比表",
            steps: [
              { name: "粘贴或上传素材", text: "把产品介绍、成分功效、使用流程文档贴入" },
              { name: "选择目标关键词", text: "从品类 × 场景矩阵里选 1–10 个目标关键词" },
              { name: "一键生成 4 种格式", text: "FAQ / TL;DR / HowTo / 对比表 + JSON-LD 一次导出" },
            ],
          }),
        ]}
      />
      <PageHero
        badge="产品 · AI 内容生成"
        title={<>把业务素材，<span className="gradient-text">变成 AI 想引用的样子</span></>}
        description="基于小米 MIMO 2.5 Pro 的统一生成引擎。一次输出 FAQ + TL;DR + HowTo + 对比表 + 直接答案，自动附 JSON-LD。"
      >
        <Button asChild size="lg" variant="primary">
          <Link href="/tools/generate">立即试用生成工具</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/pricing">查看定价</Link>
        </Button>
      </PageHero>

      <section className="mx-auto max-w-6xl px-4 py-16 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {formats.map((f) => {
            const Icon = f.icon;
            return (
              <Card key={f.name} className="lift">
                <CardHeader>
                  <Icon className="h-7 w-7 text-indigo-600" />
                  <CardTitle>{f.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{f.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold">为什么 AI 更愿意引用 BrandGEO 生成的内容？</h2>
            <ul className="mt-4 space-y-3 text-slate-700 dark:text-slate-300">
              <li>✓ 首段强制直答（answer-first），AI 摘要直接抓首段</li>
              <li>✓ 事实密度高（含价格、流程、案例、边界条件）</li>
              <li>✓ 每段可被单独引用，结构化数据完整</li>
              <li>✓ 自带 FAQPage / HowTo / Article JSON-LD</li>
              <li>✓ 化妆品广告合规审查模板，规避医疗功效、绝对化用语、速效宣称等红线</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-900 p-6 font-mono text-xs text-emerald-300 dark:border-slate-800">
            <div className="mb-2 text-slate-500">{"// 输出示例"}</div>
            <pre className="overflow-x-auto whitespace-pre-wrap">{`{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "敏感肌精华液哪个好用？",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "敏感肌选精华液优先看三点：成分简、无香精酒精 …"
    }
  }]
}`}</pre>
          </div>
        </div>
      </section>
    </>
  );
}
