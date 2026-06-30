import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/layout/page-hero";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema, howToSchema } from "@/lib/seo";
import { AuditTool } from "@/components/tools/audit-tool";

export const metadata: Metadata = {
  title: "免费 GEO 诊断工具 — 30 秒看清你的站点 AI 友好度",
  description:
    "输入域名 30 秒拿到完整 GEO 诊断报告。自动检查 llms.txt / schema.org / FAQ / robots / sitemap / 首段直答 / 标题结构等 20 项指标，可下载 PDF。",
  alternates: { canonical: "/tools/audit" },
};

export default function AuditPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "首页", path: "/" },
            { name: "免费工具", path: "/tools" },
            { name: "GEO 诊断", path: "/tools/audit" },
          ]),
          howToSchema({
            name: "如何使用 BrandGEO 免费 GEO 诊断工具",
            description: "三步免费完成一次完整的 GEO 诊断",
            steps: [
              { name: "输入域名", text: "在工具中输入你的域名，例如 yourlawfirm.com" },
              { name: "等待诊断", text: "30 秒内自动完成 20 项 AI 友好度检测" },
              { name: "下载报告", text: "查看可执行建议并下载 PDF 报告与客户分享" },
            ],
          }),
        ]}
      />
      <PageHero
        badge="完全免费 · 无需注册"
        title={<>30 秒 拿到 完整 <span className="gradient-text">GEO 诊断</span></>}
        description="自动检查 20 项 AI 友好度指标，包括 llms.txt、schema.org、首段直答、FAQ 结构化、robots、sitemap 等。诊断完毕给出可执行的优化建议清单与 PDF 报告。"
      />
      <section className="mx-auto max-w-5xl px-4 py-12 lg:px-8">
        <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900" />}>
          <AuditTool />
        </Suspense>
      </section>
    </>
  );
}
