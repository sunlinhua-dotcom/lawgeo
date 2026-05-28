import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/seo";
import { IntentTool } from "@/components/tools/intent-tool";

export const metadata: Metadata = {
  title: "AI 意图定位工具 — 关键词聚类与意图分析",
  description: "粘贴关键词列表，AI 自动聚类为意图簇，给出每簇的优先级、AI 推荐难度、推荐内容形态。",
  alternates: { canonical: "/tools/intent" },
};

export default function IntentPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: "首页", path: "/" },
        { name: "免费工具", path: "/tools" },
        { name: "意图定位", path: "/tools/intent" },
      ])} />
      <PageHero
        badge="GEO 营销节点 2 · 意图定位"
        title={<>把关键词<span className="gradient-text">聚类成意图</span></>}
        description="精准锁定品牌核心意图，确保 AI 理解你在卖什么、为谁服务。每个意图簇都给出可执行的内容方向。"
      />
      <section className="mx-auto max-w-6xl px-4 py-12 lg:px-8">
        <IntentTool />
      </section>
    </>
  );
}
