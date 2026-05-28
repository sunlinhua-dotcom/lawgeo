import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft } from "lucide-react";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { articleSchema, breadcrumbSchema } from "@/lib/seo";
import { POSTS } from "@/data/blog";

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { title: post.title, description: post.description, type: "article", publishedTime: post.date },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <>
      <JsonLd
        data={[
          articleSchema({
            title: post.title,
            description: post.description,
            path: `/blog/${post.slug}`,
            date: post.date,
          }),
          breadcrumbSchema([
            { name: "首页", path: "/" },
            { name: "知识库", path: "/blog" },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
        ]}
      />
      <article className="mx-auto max-w-3xl px-4 py-16 lg:px-8">
        <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600">
          <ArrowLeft className="h-4 w-4" /> 返回知识库
        </Link>
        <div className="mt-6 flex items-center gap-3 text-xs text-slate-500">
          <Badge variant="primary">{post.category}</Badge>
          <span>{post.date}</span>
          <span>·</span>
          <span><span className="num">{post.readMinutes}</span> 分钟阅读</span>
        </div>
        <div className="prose prose-slate mt-8 max-w-none dark:prose-invert prose-cn prose-headings:tracking-tight prose-a:text-indigo-600">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </div>
      </article>
    </>
  );
}
