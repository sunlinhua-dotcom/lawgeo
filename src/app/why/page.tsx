import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, X } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "为什么选择 BrandGEO — 与 aceflow 等竞品对比",
  description: "BrandGEO 与 aceflow / 通用 GEO 工具的核心差异：美妆个护深度定制、12 平台覆盖、内置合规审查、免费工具开放。",
  alternates: { canonical: "/why" },
};

const compareRows = [
  { feature: "美妆个护深度定制", us: "内置 200+ 品类词库 + 70+ 场景矩阵", others: "无，仅通用关键词工具" },
  { feature: "AI 平台覆盖", us: "12 个（8 国内 + 4 海外）", others: "6 个（仅国内）" },
  { feature: "合规审查", us: "内置化妆品广告法审查模板", others: "需手动审查" },
  { feature: "AI 真实生成", us: "MIMO 2.5 Pro 真实 API", others: "部分仅模板" },
  { feature: "免费工具", us: "诊断 / 矩阵 / 对比全开放", others: "需付费试用" },
  { feature: "私有化部署", us: "支持，SQLite 一键迁移", others: "依赖云端" },
  { feature: "数据归属", us: "100% 归你所有", others: "存放在服务商" },
  { feature: "起步价", us: "8,000 元 / 月", others: "12,000 元 / 月起" },
];

export default function WhyPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "首页", path: "/" }, { name: "为什么选 BrandGEO", path: "/why" }])} />
      <PageHero
        badge="对比与选择"
        title={<>为什么品牌更应该<span className="gradient-text">选 BrandGEO</span></>}
        description="对比通用 GEO 平台、对比 aceflow，差异不只是「针对美妆」四个字。"
      />
      <section className="mx-auto max-w-5xl px-4 py-16 lg:px-8">
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="px-4 py-3 text-left font-medium">能力</th>
                <th className="px-4 py-3 text-left font-medium">
                  <Badge variant="primary">BrandGEO</Badge>
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">通用 GEO 平台</th>
              </tr>
            </thead>
            <tbody>
              {compareRows.map((r) => (
                <tr key={r.feature} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-3 font-medium">{r.feature}</td>
                  <td className="px-4 py-3 text-emerald-600">
                    <CheckCircle2 className="mr-1 inline h-4 w-4" /> {r.us}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    <X className="mr-1 inline h-4 w-4 text-slate-300" /> {r.others}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-12 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg" variant="primary">
            <Link href="/tools/audit">免费跑诊断</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/pricing">查看定价</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
