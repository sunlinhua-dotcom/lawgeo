import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/seo";
import { GenerateTool } from "@/components/tools/generate-tool";

export const metadata: Metadata = {
  title: "AI 内容生成工具 — 一键输出 GEO 友好内容",
  description:
    "lawGEO 的 AI 内容生成工具，由小米 MIMO 2.5 Pro 驱动。一次生成 FAQ / TL;DR / HowTo / 对比表 / 直接答案，自带 JSON-LD。",
  alternates: { canonical: "/tools/generate" },
};

export default function GenerateToolPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: "首页", path: "/" },
        { name: "免费工具", path: "/tools" },
        { name: "AI 生成", path: "/tools/generate" },
      ])} />
      <PageHero
        badge="AI 工具 · MIMO 2.5 Pro 驱动"
        title={<>输入话题，<span className="gradient-text">输出 GEO 友好内容</span></>}
        description="一次生成 FAQ / TL;DR / HowTo / 对比表 / 直接答案段落。自带律师广告合规审查与 JSON-LD。"
      />
      <section className="mx-auto max-w-5xl px-4 py-12 lg:px-8">
        <GenerateTool />
      </section>
    </>
  );
}
