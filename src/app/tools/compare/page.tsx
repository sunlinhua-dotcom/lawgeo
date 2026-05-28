import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/seo";
import { CompareTool } from "@/components/tools/compare-tool";

export const metadata: Metadata = {
  title: "AI 平台引用对比 — 同一问题在 12 个大模型下的回答",
  description:
    "输入一个问题，同时在 DeepSeek/通义/豆包/Kimi/智谱/文心/元宝/海螺/Claude/ChatGPT/Gemini/Perplexity 共 12 个 AI 平台跑，看哪些平台会引用你的品牌。",
  alternates: { canonical: "/tools/compare" },
};

export default function ComparePage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: "首页", path: "/" },
        { name: "免费工具", path: "/tools" },
        { name: "AI 平台引用对比", path: "/tools/compare" },
      ])} />
      <PageHero
        badge="独家工具 · 12 平台同时跑"
        title={<>同一问题，<span className="gradient-text">12 个 AI 同时回答</span></>}
        description="精确看清你的品牌在哪些平台被引用、引用位置、排名如何。这是 aceflow 等竞品不提供的能力。"
      />
      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <CompareTool />
      </section>
    </>
  );
}
