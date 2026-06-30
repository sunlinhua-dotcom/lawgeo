import type { Metadata } from "next";
import Link from "next/link";
import { Cpu, Sparkles, Bot, Users, ArrowRight, Briefcase } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "核心团队 — 顶尖架构师 + AI Agent 数字员工",
  description: "BrandGEO 团队由来自诺基亚、三星、喜马拉雅、新潮传媒的资深架构师组成。配合 15 个 AI Agent 数字员工，技术与产能双轮驱动。",
  alternates: { canonical: "/team" },
};

const founders = [
  {
    name: "张凌华",
    role: "创始人 & 首席科学家",
    bio: "十余年架构师生涯，主导多款 AI 产品的架构设计。曾任诺基亚、三星架构师；后任喜马拉雅政府及央国企事业部总经理。深谙大型分布式系统、AI 算法与企业级产品落地。",
    tags: ["AI 架构", "大模型工程", "企业级落地"],
    icon: Cpu,
  },
];

const advisors = [
  {
    title: "诺基亚架构师",
    desc: "前诺基亚核心架构师，多年电信级系统设计与部署经验。",
  },
  {
    title: "三星架构师",
    desc: "前三星资深架构师，移动互联网与硬件集成领域建树颇丰。",
  },
  {
    title: "喜马拉雅 ADX / DSP",
    desc: "曾负责喜马拉雅 ADX 与 DSP 广告管理系统，精通广告投放与优化。",
  },
  {
    title: "新潮传媒 AI CTO",
    desc: "前新潮传媒 AI CTO，推动 AI 技术在传媒领域的创新应用。",
  },
];

const agents = [
  { name: "蛋糕", role: "首席 Agent / 调度器", task: "调度其他 14 个 Agent 协同工作；面向客户的总入口" },
  { name: "诊断 Agent", role: "GEO 健康检查", task: "跑域名诊断，生成 PDF 报告" },
  { name: "洞察 Agent", role: "意图挖掘", task: "关键词聚类、竞品分析、内容缺口识别" },
  { name: "矩阵 Agent", role: "品类 × 场景", task: "生成长尾关键词矩阵，按 ROI 排序" },
  { name: "生成 Agent", role: "内容工厂", task: "FAQ / TL;DR / HowTo / 对比表批量生成" },
  { name: "合规 Agent", role: "广告法审查", task: "化妆品 / 金融 / 法律 红线检测" },
  { name: "知识库 Agent", role: "RAG 引擎", task: "文档分块、检索、注入" },
  { name: "发布 Agent", role: "多平台适配", task: "改写 + 一键打开 7 大平台编辑器" },
  { name: "监测 Agent", role: "12 平台跑词", task: "每日 cron 抓取，落库 ai_queries" },
  { name: "对比 Agent", role: "竞品对决", task: "同问题 12 平台并发，识别引用差异" },
  { name: "归因 Agent", role: "转化追踪", task: "AI → 短链 → 留资 → 签约漏斗" },
  { name: "报告 Agent", role: "数据可视化", task: "生成周报 / 月报 / PDF" },
  { name: "告警 Agent", role: "邮件预警", task: "引用率下跌、Top3 跌出实时告警" },
  { name: "翻译 Agent", role: "多语言出海", task: "20+ 语言母语级生成与本地化" },
  { name: "审稿 Agent", role: "质量复核", task: "事实密度、首段直答、可引用性评分" },
];

export default function TeamPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "首页", path: "/" }, { name: "团队", path: "/team" }])} />

      <PageHero
        badge="核心团队"
        title={<>顶尖架构师 +<br /><span className="gradient-text">15 个 AI Agent 数字员工</span></>}
        description="技术与产能双轮驱动。我们既相信资深人类专家的判断力，也相信 AI Agent 的并行扩展性。"
      />

      {/* 创始人 */}
      <section className="mx-auto max-w-5xl px-4 py-16 lg:px-8">
        <h2 className="mb-8 text-2xl font-semibold">创始团队</h2>
        <div className="grid gap-6">
          {founders.map((f) => {
            const Icon = f.icon;
            return (
              <Card key={f.name} className="lift">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="grid h-16 w-16 flex-shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md">
                      <Icon className="h-7 w-7" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{f.name}</CardTitle>
                      <Badge variant="primary" className="mt-1">{f.role}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="leading-relaxed text-slate-700 dark:text-slate-300">{f.bio}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {f.tags.map((t) => (
                      <Badge key={t} variant="outline">{t}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 技术顾问 */}
      <section className="border-y border-slate-100 bg-slate-50/50 dark:border-slate-900 dark:bg-slate-950/50">
        <div className="mx-auto max-w-5xl px-4 py-16 lg:px-8">
          <h2 className="mb-8 text-2xl font-semibold">技术顾问背景</h2>
          <p className="mb-8 text-slate-600 dark:text-slate-400">
            我们的核心团队汇聚了来自顶尖科技公司的专家，在各自领域拥有深厚背景与丰富实战经验。
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {advisors.map((a) => (
              <Card key={a.title}>
                <CardHeader>
                  <Briefcase className="h-5 w-5 text-indigo-600" />
                  <CardTitle className="text-base">{a.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{a.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI Agent 团队 */}
      <section className="mx-auto max-w-6xl px-4 py-16 lg:px-8">
        <div className="text-center mb-12">
          <Badge variant="primary" className="mb-3">
            <Bot className="mr-1 h-3 w-3" /> 数字员工矩阵
          </Badge>
          <h2 className="text-3xl font-semibold tracking-tight">
            15 个 AI Agent 24/7 不眠工作
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400">
            「蛋糕」是张凌华创造的首席 Agent，负责调度其他 14 个 Agent 协同完成 GEO 全链路。
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((a, i) => (
            <Card key={a.name} className={i === 0 ? "border-indigo-300 bg-gradient-to-br from-indigo-50 to-white dark:border-indigo-900 dark:from-indigo-950 dark:to-slate-900" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={`grid h-9 w-9 place-items-center rounded-lg ${i === 0 ? "bg-gradient-to-br from-amber-400 to-rose-500" : "bg-gradient-to-br from-indigo-500 to-violet-500"} text-white`}>
                    <Sparkles className="h-4 w-4" />
                  </div>
                  {i === 0 && <Badge variant="primary">首席</Badge>}
                </div>
                <CardTitle className="text-base mt-2">{a.name}</CardTitle>
                <Badge variant="outline">{a.role}</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-600 dark:text-slate-400">{a.task}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button asChild variant="primary" size="lg">
            <Link href="/dashboard/agents">
              查看 Agent 编排控制台 <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-slate-100 dark:border-slate-900">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center lg:px-8">
          <Users className="mx-auto h-10 w-10 text-indigo-600" />
          <h2 className="mt-4 text-2xl font-semibold tracking-tight">想加入团队 / 成为顾问？</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">我们持续招募 AI 工程师、内容运营、行业顾问。</p>
          <div className="mt-6">
            <Button asChild variant="primary">
              <Link href="/contact?topic=hire">联系我们</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
