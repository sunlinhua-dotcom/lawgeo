import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/seo";
import { MatrixTool } from "@/components/tools/matrix-tool";
import { CASE_CATEGORIES } from "@/data/case-categories";
import { REGIONS } from "@/data/regions";

export const metadata: Metadata = {
  title: "品类 × 场景 关键词矩阵生成器",
  description:
    "BrandGEO 内置 200+ 品类 × 70+ 主要城市，一键生成长尾关键词矩阵。可按品类门类、城市级别、问题模板筛选导出。",
  alternates: { canonical: "/tools/matrix" },
};

export default function MatrixPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: "首页", path: "/" },
        { name: "免费工具", path: "/tools" },
        { name: "品类场景矩阵", path: "/tools/matrix" },
      ])} />
      <PageHero
        badge="独家能力 · 全行业通用"
        title={<>品类 × 场景 关键词矩阵 <span className="gradient-text">一键生成</span></>}
        description={`覆盖 ${CASE_CATEGORIES.reduce((s, c) => s + c.items.length, 0)} 个品类 × ${REGIONS.length} 个主要城市，支持按门类、城市级别、问题模板组合筛选，导出 CSV / Markdown / JSON-LD。`}
      />
      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <MatrixTool />
      </section>
    </>
  );
}
