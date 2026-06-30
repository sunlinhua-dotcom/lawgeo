import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/page-hero";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/seo";
import { POSTS } from "@/data/blog";

export const metadata: Metadata = {
  title: "知识库 — GEO 教程、案例、行业洞察",
  description: "BrandGEO 知识库：GEO 入门、llms.txt 部署、美妆个护实战手册、行业案例与方法论。",
  alternates: { canonical: "/blog" },
};

export default function BlogIndexPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "首页", path: "/" }, { name: "知识库", path: "/blog" }])} />
      <PageHero
        badge="知识库"
        title={<>GEO <span className="gradient-text">教程</span> · 案例 · 方法论</>}
        description="把 BrandGEO 团队在全行业 GEO 实战中沉淀的方法论、案例与教程整理成可执行文章。"
      />
      <section className="mx-auto max-w-5xl px-4 py-16 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          {POSTS.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`}>
              <Card className="lift h-full">
                <CardHeader>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <Badge variant="primary">{p.category}</Badge>
                    <span>
                      {p.date} · <span className="num">{p.readMinutes}</span> 分钟阅读
                    </span>
                  </div>
                  <CardTitle className="mt-2 text-xl">{p.title}</CardTitle>
                  <CardDescription className="leading-relaxed">{p.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="text-sm text-indigo-600">阅读全文 →</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
