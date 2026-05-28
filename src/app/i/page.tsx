import type { Metadata } from "next";
import Link from "next/link";
import { db, schema } from "@/lib/db";
import { desc, eq, count } from "drizzle-orm";
import { PageHero } from "@/components/layout/page-hero";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/seo";
import { INDUSTRIES } from "@/data/industries";
import { ArrowRight, BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "行业洞察 — 8 大行业 GEO 内容矩阵",
  description: "lawGEO 行业博客：律所 / 教育 / 快消 / 消费电子 / 金融 / 招商 / 广告 / AI 出海 8 大行业的 AI 友好内容矩阵。每篇都按 GEO 标准写作。",
  alternates: { canonical: "/i" },
};

export const revalidate = 300;

export default async function IndustryHubPage() {
  // 拉每个行业的文章数
  const counts = await db
    .select({ industry: schema.blogPosts.industry, n: count() })
    .from(schema.blogPosts)
    .where(eq(schema.blogPosts.status, "published"))
    .groupBy(schema.blogPosts.industry);
  const countMap = new Map(counts.map((c) => [c.industry, c.n]));

  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "首页", path: "/" }, { name: "行业洞察", path: "/i" }])} />
      <PageHero
        badge="GEO 行业内容矩阵"
        title={<>8 大行业 <span className="gradient-text">AI 友好</span> 内容矩阵</>}
        description="每个行业一个专属博客。所有文章按 2026 GEO 标准写作：40-60 字直接答案、事实密度、问答化、对比表、完整 schema.org。"
      />
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {INDUSTRIES.map((ind) => {
            const n = countMap.get(ind.slug) ?? 0;
            return (
              <Link key={ind.slug} href={`/i/${ind.slug}`}>
                <Card className="lift h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <BookOpen className="h-6 w-6" style={{ color: ind.primaryColor }} />
                      <Badge variant="primary"><span className="num">{n}</span> 篇</Badge>
                    </div>
                    <CardTitle className="mt-3">{ind.name}</CardTitle>
                    <CardDescription className="leading-relaxed">{ind.tagline}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {ind.pillars.slice(0, 4).map((p) => (
                        <Badge key={p.slug} variant="outline" className="text-[10px]">{p.name}</Badge>
                      ))}
                    </div>
                    <span className="inline-flex items-center gap-1 text-sm font-medium" style={{ color: ind.primaryColor }}>
                      浏览博客 <ArrowRight className="h-3 w-3" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
