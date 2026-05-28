import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { and, eq, ne, sql } from "drizzle-orm";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { db, schema } from "@/lib/db";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema, articleSchema } from "@/lib/seo";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { findIndustry } from "@/data/industries";
import { ArrowLeft, User, Calendar, Clock } from "lucide-react";

export const revalidate = 60;
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ industry: string; slug: string }>;
}): Promise<Metadata> {
  const raw = await params;
  const industry = decodeURIComponent(raw.industry);
  const slug = decodeURIComponent(raw.slug);
  const rows = await db
    .select()
    .from(schema.blogPosts)
    .where(and(eq(schema.blogPosts.industry, industry), eq(schema.blogPosts.slug, slug)))
    .limit(1);
  const post = rows[0];
  if (!post) return { title: "Not Found", robots: { index: false } };
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    alternates: { canonical: `/i/${industry}/${encodeURIComponent(slug)}` },
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
    },
  };
}

export default async function IndustryPostPage({
  params,
}: {
  params: Promise<{ industry: string; slug: string }>;
}) {
  const raw = await params;
  // Next.js 16 不自动 URL-decode 含非 ASCII 字符的 params
  const industry = decodeURIComponent(raw.industry);
  const slug = decodeURIComponent(raw.slug);
  const meta = findIndustry(industry);
  if (!meta) notFound();

  const rows = await db
    .select()
    .from(schema.blogPosts)
    .where(
      and(
        eq(schema.blogPosts.industry, industry),
        eq(schema.blogPosts.slug, slug),
        eq(schema.blogPosts.status, "published"),
      ),
    )
    .limit(1);
  const post = rows[0];
  if (!post) notFound();

  // 拉作者
  let author: typeof schema.authors.$inferSelect | undefined;
  if (post.authorId) {
    const a = await db.select().from(schema.authors).where(eq(schema.authors.id, post.authorId)).limit(1);
    author = a[0];
  }

  // 相关文章（同 industry，可选同 pillar）
  const related = await db
    .select()
    .from(schema.blogPosts)
    .where(
      and(
        eq(schema.blogPosts.industry, industry),
        eq(schema.blogPosts.status, "published"),
        ne(schema.blogPosts.id, post.id),
      ),
    )
    .limit(4);

  // 异步累加 view count（不阻塞渲染）
  try {
    await db
      .update(schema.blogPosts)
      .set({ viewCount: sql`${schema.blogPosts.viewCount} + 1` })
      .where(eq(schema.blogPosts.id, post.id));
  } catch {
    /* ignore */
  }

  // 解析 schema_json
  let extraSchema: Record<string, unknown>[] = [];
  if (post.schemaJson) {
    try {
      const parsed = JSON.parse(post.schemaJson);
      if (parsed["@graph"]) extraSchema = parsed["@graph"];
      else extraSchema = [parsed];
    } catch {}
  }

  const schemaBlocks = [
    articleSchema({
      title: post.title,
      description: post.excerpt ?? "",
      path: `/i/${industry}/${slug}`,
      date: post.publishedAt?.toISOString().slice(0, 10),
      author: author?.name,
    }),
    breadcrumbSchema([
      { name: "首页", path: "/" },
      { name: "行业洞察", path: "/i" },
      { name: meta.name, path: `/i/${industry}` },
      { name: post.title, path: `/i/${industry}/${slug}` },
    ]),
    ...extraSchema,
  ];

  return (
    <>
      <JsonLd data={schemaBlocks} />

      <article className="mx-auto max-w-3xl px-4 py-12 lg:px-8 lg:py-16">
        <Link
          href={`/i/${industry}`}
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> 返回 {meta.name} 博客
        </Link>

        <div className="mb-6 flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <Badge variant="primary" style={{ background: `${meta.primaryColor}15`, color: meta.primaryColor }}>
            {meta.name}
          </Badge>
          {post.pillarSlug && (
            <Badge variant="outline">{meta.pillars.find((p) => p.slug === post.pillarSlug)?.name ?? post.pillarSlug}</Badge>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("zh-CN") : ""}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span className="num">{post.readMinutes ?? 1}</span> 分钟阅读
          </span>
          <span className="num">{post.wordCount?.toLocaleString() ?? 0} 字</span>
        </div>

        <div className="prose prose-slate mt-4 max-w-none dark:prose-invert prose-cn prose-headings:tracking-tight prose-a:text-indigo-600 prose-blockquote:not-italic prose-blockquote:border-l-indigo-400 prose-blockquote:bg-indigo-50/50 prose-blockquote:py-3 prose-blockquote:px-4 prose-blockquote:rounded-r-lg dark:prose-blockquote:bg-indigo-950/30">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.body}</ReactMarkdown>
        </div>

        {author && (
          <div className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
                <User className="h-5 w-5" />
              </div>
              <div>
                <div className="text-base font-semibold">{author.name}</div>
                {author.title && <div className="text-xs text-indigo-600 mt-0.5">{author.title}</div>}
                {author.bio && <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{author.bio}</p>}
              </div>
            </div>
          </div>
        )}
      </article>

      {related.length > 0 && (
        <section className="border-t border-slate-100 bg-slate-50/30 dark:border-slate-900 dark:bg-slate-950/30">
          <div className="mx-auto max-w-5xl px-4 py-16 lg:px-8">
            <h2 className="mb-6 text-xl font-semibold">同行业相关文章</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {related.map((r) => (
                <Link key={r.id} href={`/i/${industry}/${r.slug}`}>
                  <Card className="lift h-full">
                    <CardHeader>
                      <CardTitle className="text-base leading-snug">{r.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="line-clamp-2 text-xs text-slate-600 dark:text-slate-400">{r.excerpt}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
