import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, X, Target, Trophy, Award, ShieldCheck, ArrowRight } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema, faqSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "定价方案 — 月费订阅 或 按效果付费（KPI）",
  description: "两种付费模式：月费 8K / 18K / 50K 起，或按意图词效果付费（Top1 ¥6,900 / Top3 ¥5,900 / 推荐露出 ¥4,900），未达 KPI 全额退款。",
  alternates: { canonical: "/pricing" },
};

const tiers = [
  {
    name: "起步版",
    price: 8000,
    suit: "适合初次尝试 GEO 的律所与中小企业",
    features: [
      { ok: true, text: "30 个关键词" },
      { ok: true, text: "4 个 AI 平台监测" },
      { ok: true, text: "AI 生成 30 篇 / 月" },
      { ok: true, text: "案由 × 地域矩阵基础版" },
      { ok: true, text: "月度趋势报告" },
      { ok: false, text: "多平台分发" },
      { ok: false, text: "1v1 顾问" },
    ],
  },
  {
    name: "标准版",
    price: 18000,
    featured: true,
    suit: "推荐：中型律所与连锁专业服务",
    features: [
      { ok: true, text: "100 个关键词" },
      { ok: true, text: "12 个 AI 平台监测" },
      { ok: true, text: "AI 生成 200 篇 / 月" },
      { ok: true, text: "案由 × 地域矩阵完整版" },
      { ok: true, text: "7 渠道多平台分发" },
      { ok: true, text: "周度趋势报告 + 邮件预警" },
      { ok: true, text: "2 次 / 月 1v1 顾问" },
    ],
  },
  {
    name: "企业版",
    price: "50000+",
    suit: "大型律所、集团公司、连锁机构",
    features: [
      { ok: true, text: "关键词不限" },
      { ok: true, text: "12 个 AI 平台监测" },
      { ok: true, text: "AI 生成不限量" },
      { ok: true, text: "定制案由词库" },
      { ok: true, text: "私有化部署 / 数据本地" },
      { ok: true, text: "定制周报 + 月度复盘" },
      { ok: true, text: "专属顾问 + SLA" },
    ],
  },
];

const kpiTiers = [
  {
    name: "Top 1 占位",
    price: 6900,
    icon: Trophy,
    color: "from-amber-500 to-orange-500",
    desc: "确保品牌在核心意图词的 AI 推荐中稳居首位",
    deliverable: "输入 100 次 ≥ 80 次出现在第 1 位",
    why: "适合行业 Top 品牌、高客单服务、品牌主导战略",
  },
  {
    name: "Top 3 占位",
    price: 5900,
    icon: Award,
    color: "from-indigo-500 to-violet-500",
    desc: "确保品牌进入核心意图词 AI 推荐的前三",
    deliverable: "输入 100 次 ≥ 80 次出现在前 3",
    why: "性价比最高，适合多数 B2B / B2C 决策型场景",
    featured: true,
  },
  {
    name: "推荐露出",
    price: 4900,
    icon: Target,
    color: "from-cyan-500 to-sky-500",
    desc: "确保品牌在 AI 场景下被推荐露出",
    deliverable: "输入 100 次 ≥ 80 次品牌名被提及",
    why: "适合品牌冷启动、追求 AI 可见度入门方案",
  },
];

const faqs = [
  { q: "「意图词」是什么？", a: "意图词指某一个语义簇，例如「社区电梯媒体」。基于这个词延伸出来的几十上百个长尾（「推荐」「哪家强」「哪个好」）因为语义相同，全部包含赠送。一个意图词 = 一个语义 + 它的全部长尾变体。" },
  { q: "未达 KPI 真的全额退款？", a: "是的。我们对每个意图词设定 80% 成功率作为交付标准（100 次查询 ≥80 次满足 KPI）。未达成功率，按未达成的意图词数量等比退款。退款流程明确写入合同。" },
  { q: "KPI 付费的服务周期？", a: "交付后 3 个月 / 平台（豆包、DeepSeek 为主平台），并额外赠送您在腾讯元宝、通义、Kimi、文心等主流 AI 平台的优化服务。" },
  { q: "如何验收？", a: "我们提供完整的查询日志（带时间戳、平台、查询语句、返回内容、品牌位置）。支持第三方数据核验。" },
  { q: "月费 vs KPI 怎么选？", a: "如果你重视长期内容资产积累、需要 SaaS 工具能力（生成 / 监测 / 发布全套）—— 选月费。如果你只关心结果、愿意按效果付费 —— 选 KPI。两者也可组合：月费基础订阅 + KPI 兜底关键词。" },
  { q: "试用方案？", a: "提供 7 天免费试用，可跑完整诊断 + 5 篇 AI 生成 + 5 个关键词监测。" },
  { q: "可以开发票吗？", a: "可以开具增值税专用发票（6%）。提供正规服务合同。" },
];

export default function PricingPage() {
  return (
    <>
      <JsonLd data={[breadcrumbSchema([{ name: "首页", path: "/" }, { name: "定价", path: "/pricing" }]), faqSchema("/pricing", faqs)]} />
      <PageHero
        badge="两种付费模式"
        title={<>选 <span className="gradient-text">月费订阅</span> 或 <span className="gradient-text">按 KPI 付费</span></>}
        description="月费模式适合长期内容资产建设；KPI 模式按效果付费、未达全额退款。可单选，也可组合。"
      />

      {/* KPI 付费区 — 主推 */}
      <section className="border-b border-slate-100 dark:border-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
          <div className="mb-12 text-center">
            <Badge variant="primary" className="mb-3">
              <ShieldCheck className="mr-1 h-3 w-3" /> 按效果付费 · 未达全额退款
            </Badge>
            <h2 className="text-3xl font-semibold tracking-tight lg:text-4xl">
              按 KPI 付费：你只为<span className="gradient-text">结果</span>买单
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              每个意图词独立计价，达到 80% 成功率（100 次查询 ≥80 次满足 KPI）视为交付成功。
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {kpiTiers.map((t) => {
              const Icon = t.icon;
              return (
                <div
                  key={t.name}
                  className={`relative rounded-3xl border p-8 transition-all ${
                    t.featured
                      ? "border-indigo-500 bg-gradient-to-b from-indigo-50 to-white shadow-2xl shadow-indigo-200 dark:from-indigo-950 dark:to-slate-900"
                      : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                  }`}
                >
                  {t.featured && (
                    <Badge variant="primary" className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1">
                      性价比最优
                    </Badge>
                  )}
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${t.color} text-white shadow-md`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold">{t.name}</h3>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-2xl font-semibold">¥</span>
                    <span className="num text-5xl font-bold">{t.price.toLocaleString()}</span>
                    <span className="text-slate-500">/ 意图词</span>
                  </div>
                  <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">{t.desc}</p>
                  <div className="mt-6 rounded-lg bg-slate-50 p-3 text-xs dark:bg-slate-800">
                    <div className="font-medium text-slate-700 dark:text-slate-200">验收标准</div>
                    <div className="mt-1 text-slate-600 dark:text-slate-400">{t.deliverable}</div>
                  </div>
                  <div className="mt-4 text-xs text-slate-500">💡 {t.why}</div>
                  <Button asChild size="lg" variant={t.featured ? "primary" : "outline"} className="mt-6 w-full">
                    <Link href="/contact?plan=kpi">联系销售</Link>
                  </Button>
                </div>
              );
            })}
          </div>

          {/* 退款保障 */}
          <div className="mt-12 rounded-3xl border border-emerald-200 bg-emerald-50/50 p-8 dark:border-emerald-900 dark:bg-emerald-950/30">
            <div className="flex items-start gap-4">
              <ShieldCheck className="h-10 w-10 flex-shrink-0 text-emerald-600" />
              <div>
                <h3 className="text-xl font-semibold text-emerald-900 dark:text-emerald-100">效果保障：未达 KPI 全额退款</h3>
                <p className="mt-2 text-sm leading-relaxed text-emerald-900/80 dark:text-emerald-200/80">
                  我们对每个意图词设定 80% 成功率（100 次查询 ≥ 80 次满足 KPI）作为交付标准。<br />
                  服务到期未达成功率，按未达成意图词数量<strong>等比退款</strong>。<br />
                  退款条款明确写入服务合同，支持<strong>第三方数据核验</strong>。
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-900 dark:bg-indigo-950 dark:text-indigo-200">
            💡 「意图词」语义示例：「上海离婚律师」是一个意图词，<em>「上海离婚律师推荐」「上海哪家离婚律师好」「上海离婚律师收费」</em> 等长尾全部包含。
          </div>
        </div>
      </section>

      {/* 月费 SaaS 订阅 */}
      <section className="border-b border-slate-100 dark:border-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
          <div className="mb-12 text-center">
            <Badge variant="outline" className="mb-3">SaaS 月费</Badge>
            <h2 className="text-3xl font-semibold tracking-tight lg:text-4xl">长期内容资产建设</h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              全套 SaaS 工具（诊断 / 生成 / 监测 / 发布 / 知识库 / 报告）+ 团队协作。年付 8 折。
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {tiers.map((t) => (
              <div
                key={t.name}
                className={`relative rounded-3xl border p-8 ${
                  t.featured
                    ? "border-indigo-500 bg-gradient-to-b from-indigo-50 to-white shadow-2xl shadow-indigo-200 dark:from-indigo-950 dark:to-slate-900"
                    : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                }`}
              >
                {t.featured && (
                  <Badge variant="primary" className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1">推荐</Badge>
                )}
                <h3 className="text-xl font-semibold">{t.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-semibold">¥</span>
                  <span className="num text-5xl font-bold">
                    {typeof t.price === "number" ? t.price.toLocaleString() : t.price}
                  </span>
                  <span className="text-slate-500">/ 月</span>
                </div>
                <p className="mt-2 text-sm text-slate-500">{t.suit}</p>
                <Button asChild size="lg" variant={t.featured ? "primary" : "outline"} className="mt-6 w-full">
                  <Link href="/contact">{typeof t.price === "string" ? "联系销售" : "开始试用"}</Link>
                </Button>
                <ul className="mt-8 space-y-3 text-sm">
                  {t.features.map((f, i) => (
                    <li key={i} className={`flex items-start gap-2 ${f.ok ? "" : "text-slate-400 line-through"}`}>
                      {f.ok ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                      ) : (
                        <X className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      )}
                      {f.text}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-slate-100 dark:border-slate-900">
        <div className="mx-auto max-w-3xl px-4 py-16 lg:px-8">
          <h2 className="text-center text-3xl font-semibold tracking-tight">定价常见问题</h2>
          <div className="mt-10 space-y-3">
            {faqs.map((f, i) => (
              <details key={i} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <summary className="cursor-pointer text-base font-medium">{f.q}</summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600" />
        <div className="relative mx-auto max-w-4xl px-4 py-16 text-center text-white lg:px-8">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            先免费跑一次诊断，<br />再决定哪种付费方式
          </h2>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="xl" className="bg-white text-indigo-700 hover:bg-indigo-50">
              <Link href="/tools/audit">
                免费诊断 <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="xl" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
              <Link href="/contact">联系销售</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
