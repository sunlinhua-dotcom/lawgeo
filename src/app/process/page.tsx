import type { Metadata } from "next";
import Link from "next/link";
import {
  MessageSquare,
  FileText,
  Search,
  Rocket,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema, howToSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "服务流程 — 从需求确认到成效追踪",
  description: "BrandGEO 5 步标准化服务流程：需求确认 → 方案报价 → 合同签订 → 项目执行 → 成效追踪。每个节点的产出物与交付标准明确。",
  alternates: { canonical: "/process" },
};

const steps = [
  {
    n: 1,
    icon: MessageSquare,
    title: "需求确认",
    desc: "深入了解品牌定位、目标受众与核心诉求",
    deliverables: [
      "1v1 1小时需求会议（视频或线下）",
      "品牌现状一页梳理",
      "竞品 AI 推荐对比快照",
    ],
    duration: "1–2 个工作日",
    color: "from-indigo-500 to-violet-500",
  },
  {
    n: 2,
    icon: Search,
    title: "方案报价",
    desc: "基于诊断结果，定制专属 GEO 优化方案",
    deliverables: [
      "免费 GEO 诊断报告（PDF）",
      "定制化服务方案与时间表",
      "明确的 KPI 与验收标准",
      "报价单（月费 / KPI 双选）",
    ],
    duration: "3–5 个工作日",
    color: "from-violet-500 to-fuchsia-500",
  },
  {
    n: 3,
    icon: FileText,
    title: "合同签订",
    desc: "确认合作细节，签署服务协议",
    deliverables: [
      "正式服务合同（含 KPI 退款条款）",
      "数据访问与隐私协议",
      "合规审查模板确认（化妆品 / 金融行业）",
      "增值税专用发票通道开通",
    ],
    duration: "1 周内",
    color: "from-fuchsia-500 to-rose-500",
  },
  {
    n: 4,
    icon: Rocket,
    title: "项目执行",
    desc: "执行内容生产与发布，实时监测 AI 平台表现",
    deliverables: [
      "品类 × 场景矩阵关键词部署",
      "AI 内容批量生成与人审",
      "多平台分发（官网 + 7 渠道）",
      "知识库持续维护与更新",
      "每周进度同步会",
    ],
    duration: "持续，按月迭代",
    color: "from-rose-500 to-amber-500",
  },
  {
    n: 5,
    icon: BarChart3,
    title: "成效追踪",
    desc: "数据分析与效果复盘",
    deliverables: [
      "每周优化周报（含数据图表）",
      "每月全景分析报告",
      "Top1 / Top3 / 推荐率 KPI 达成验收",
      "第三方数据核验支持",
      "下一阶段优化建议",
    ],
    duration: "贯穿全周期",
    color: "from-amber-500 to-emerald-500",
  },
];

export default function ProcessPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "首页", path: "/" }, { name: "服务流程", path: "/process" }]),
          howToSchema({
            name: "BrandGEO 标准服务流程",
            description: "5 步从需求到成效的完整工作流",
            steps: steps.map((s) => ({ name: s.title, text: s.desc })),
          }),
        ]}
      />

      <PageHero
        badge="服务流程"
        title={<>5 步走完整 <span className="gradient-text">GEO 服务流程</span></>}
        description="每一步的产出物、交付标准与时间预期都明确写在合同里。你永远知道下一步是什么。"
      />

      {/* 流程时间线 */}
      <section className="mx-auto max-w-5xl px-4 py-16 lg:px-8">
        <div className="relative">
          {/* 竖向连接线 */}
          <div className="absolute left-6 top-12 bottom-12 w-px bg-gradient-to-b from-indigo-200 via-fuchsia-200 to-amber-200 dark:from-indigo-900 dark:via-fuchsia-900 dark:to-amber-900 lg:left-8" />

          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.n} className="relative mb-12 flex gap-6 last:mb-0">
                <div
                  className={`relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${s.color} text-white shadow-lg lg:h-16 lg:w-16`}
                >
                  <Icon className="h-5 w-5 lg:h-6 lg:w-6" />
                </div>
                <Card className="flex-1 lift">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="num text-xs font-medium text-slate-400">Step {s.n}</span>
                        <CardTitle>{s.title}</CardTitle>
                      </div>
                      <Badge variant="outline">
                        <Calendar className="mr-1 h-3 w-3" /> {s.duration}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{s.desc}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs font-medium text-slate-500 mb-2">交付物</div>
                    <ul className="space-y-1.5">
                      {s.deliverables.map((d) => (
                        <li key={d} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </section>

      {/* 合作权益 */}
      <section className="border-y border-slate-100 bg-slate-50/50 dark:border-slate-900 dark:bg-slate-950/50">
        <div className="mx-auto max-w-6xl px-4 py-16 lg:px-8">
          <h2 className="text-center text-2xl font-semibold">合作权益</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "免费诊断", desc: "1 次品牌 AI 现状全面诊断报告（含推荐率、排名、竞品分析）" },
              { title: "向量数据库", desc: "合作期内免费维护品牌向量数据库，支持动态更新" },
              { title: "效果保障", desc: "按 KPI 付费，未达承诺效果全额退款，退款条款写入合同" },
              { title: "数据透明", desc: "每周优化周报、每月全景报告，支持第三方数据核验" },
            ].map((b) => (
              <Card key={b.title} className="lift">
                <CardHeader>
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                  <CardTitle className="text-base">{b.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{b.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600" />
        <div className="relative mx-auto max-w-4xl px-4 py-16 text-center text-white lg:px-8">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">现在就开始第 1 步</h2>
          <p className="mt-4 text-lg text-indigo-100">先免费跑诊断，60 秒看清差距。</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="xl" className="bg-white text-indigo-700 hover:bg-indigo-50">
              <Link href="/tools/audit">免费跑诊断 <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="xl" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
              <Link href="/contact">预约需求沟通</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
