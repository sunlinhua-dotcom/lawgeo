import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/seo";
import { INDUSTRIES, findIndustry } from "@/data/industries";
import { BookOpen } from "lucide-react";

export const revalidate = 60;

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return INDUSTRIES.map((i) => ({ industry: i.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ industry: string }> }): Promise<Metadata> {
  const raw = await params;
  const industry = decodeURIComponent(raw.industry);
  const meta = findIndustry(industry);
  if (!meta) return {};
  return {
    title: `${meta.name}行业博客 — ${meta.tagline}`,
    description: meta.description,
    alternates: { canonical: `/i/${meta.slug}` },
    openGraph: { title: `${meta.name}行业博客`, description: meta.description, type: "website" },
  };
}

export default async function IndustryBlogPage({ params }: { params: Promise<{ industry: string }> }) {
  const raw = await params;
  const industry = decodeURIComponent(raw.industry);
  const meta = findIndustry(industry);
  if (!meta) notFound();

  const posts = await db
    .select()
    .from(schema.blogPosts)
    .where(and(eq(schema.blogPosts.industry, industry), eq(schema.blogPosts.status, "published")))
    .orderBy(desc(schema.blogPosts.publishedAt))
    .limit(100);

  // 按 pillar 分组
  const byPillar = new Map<string, typeof posts>();
  for (const p of posts) {
    const k = p.pillarSlug ?? "other";
    const arr = byPillar.get(k) ?? [];
    arr.push(p);
    byPillar.set(k, arr);
  }

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "首页", path: "/" },
            { name: "行业洞察", path: "/i" },
            { name: meta.name, path: `/i/${meta.slug}` },
          ]),
        ]}
      />

      <section className="relative overflow-hidden border-b border-slate-100 dark:border-slate-900">
        <div className="dotgrid absolute inset-0 opacity-50" />
        <div
          className="absolute inset-x-0 -top-40 z-0 h-[400px]"
          style={{ background: `linear-gradient(to bottom, ${meta.primaryColor}20, transparent)` }}
        />
        <div className="relative mx-auto max-w-6xl px-4 pt-20 pb-12 lg:px-8 lg:pt-28">
          <Link href="/i" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 mb-4">
            ← 返回行业总览
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="primary" style={{ background: `${meta.primaryColor}15`, color: meta.primaryColor }}>
              {meta.nameEn} · 行业博客
            </Badge>
            <span className="num text-xs text-slate-500">
              <span className="font-semibold">{posts.length}</span> 篇文章
            </span>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight lg:text-5xl">{meta.name}</h1>
          <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">{meta.tagline}</p>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {meta.description}
          </p>
        </div>
      </section>

      {/* Pillar 支柱主题导航 */}
      <section className="border-b border-slate-100 bg-slate-50/50 dark:border-slate-900 dark:bg-slate-950/50">
        <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
          <h2 className="text-sm uppercase tracking-wider text-slate-500 mb-4">支柱主题（Pillars）</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {meta.pillars.map((p) => {
              const n = byPillar.get(p.slug)?.length ?? 0;
              return (
                <Link
                  key={p.slug}
                  href={`#pillar-${p.slug}`}
                  className="lift rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{p.name}</div>
                    <Badge variant="outline"><span className="num">{n}</span></Badge>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">{p.description}</div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 文章列表 */}
      <section className="mx-auto max-w-6xl px-4 py-16 lg:px-8">
        {posts.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">该行业博客还没有发布文章。</p>
          </div>
        ) : (
          <>
            {Array.from(byPillar.entries()).map(([pillarKey, list]) => {
              const pillar = meta.pillars.find((p) => p.slug === pillarKey);
              return (
                <div key={pillarKey} id={`pillar-${pillarKey}`} className="mb-12 scroll-mt-20">
                  {pillar && (
                    <div className="mb-6">
                      <h2 className="text-2xl font-semibold tracking-tight">{pillar.name}</h2>
                      <p className="text-sm text-slate-500 mt-1">{pillar.description}</p>
                    </div>
                  )}
                  <div className="grid gap-4 md:grid-cols-2">
                    {list.map((p) => (
                      <Link key={p.id} href={`/i/${meta.slug}/${p.slug}`}>
                        <Card className="lift h-full">
                          <CardHeader>
                            <CardTitle className="text-base leading-snug">{p.title}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="line-clamp-3 text-sm text-slate-600 dark:text-slate-400">{p.excerpt}</p>
                            <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                              <span>{p.publishedAt ? new Date(p.publishedAt).toLocaleDateString("zh-CN") : ""}</span>
                              <span>·</span>
                              <span className="num">{p.readMinutes ?? 1} 分钟</span>
                              <span>·</span>
                              <span className="num">{p.wordCount?.toLocaleString() ?? 0} 字</span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </section>
    </>
  );
}
