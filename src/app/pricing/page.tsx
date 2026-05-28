import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, X } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema, faqSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "定价方案 — lawGEO 起步 8,000 元 / 月",
  description: "lawGEO 三档定价：起步版 8,000 / 月、标准版 18,000 / 月、企业版 50,000 / 月起。年付享 8 折，含 7 天免费试用。",
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

const faqs = [
  { q: "是否提供试用？", a: "提供 7 天免费试用，可跑一次完整诊断 + 生成 5 篇内容 + 监测 5 个关键词。" },
  { q: "可以按月付吗？", a: "支持按月、按季度、按年付。年付享 8 折优惠（实际约 9,600 / 月起）。" },
  { q: "可以中途升级吗？", a: "可以，差价按剩余周期补充即可，立即生效。" },
  { q: "数据所有权归谁？", a: "全部数据归你所有。企业版支持私有化部署，所有数据 100% 在你自己的服务器。" },
  { q: "签合同 / 开发票吗？", a: "提供正规服务合同，支持开具增值税专用发票（6%）。" },
];

export default function PricingPage() {
  return (
    <>
      <JsonLd data={[breadcrumbSchema([{ name: "首页", path: "/" }, { name: "定价", path: "/pricing" }]), faqSchema("/pricing", faqs)]} />
      <PageHero
        badge="定价"
        title={<>简单<span className="gradient-text">透明</span>的 GEO 定价</>}
        description="按月付，随时升级降级。所有方案都含 7 天免费试用与一次免费诊断。年付享 8 折。"
      />

      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
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
                <Badge variant="primary" className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1">
                  推荐
                </Badge>
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
      </section>

      <section className="border-t border-slate-100 dark:border-slate-900">
        <div className="mx-auto max-w-3xl px-4 py-16 lg:px-8">
          <h2 className="text-center text-3xl font-semibold tracking-tight">定价常见问题</h2>
          <div className="mt-10 space-y-3">
            {faqs.map((f, i) => (
              <details key={i} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <summary className="cursor-pointer text-base font-medium">{f.q}</summary>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
