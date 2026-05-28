import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BlogManager } from "@/components/dashboard/blog-manager";
import { INDUSTRIES } from "@/data/industries";

export const metadata = { title: "行业博客 / 批量发布", robots: { index: false } };

export default async function BlogDashPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [posts, authors, jobs] = await Promise.all([
    db
      .select()
      .from(schema.blogPosts)
      .where(eq(schema.blogPosts.userId, session.userId))
      .orderBy(desc(schema.blogPosts.createdAt))
      .limit(200),
    db
      .select()
      .from(schema.authors)
      .where(eq(schema.authors.userId, session.userId))
      .orderBy(desc(schema.authors.createdAt)),
    db
      .select()
      .from(schema.bulkJobs)
      .where(eq(schema.bulkJobs.userId, session.userId))
      .orderBy(desc(schema.bulkJobs.createdAt))
      .limit(20),
  ]);

  return (
    <div className="px-6 py-8 lg:px-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">行业博客 — 批量 AI 友好内容</h1>
        <p className="mt-1 text-sm text-slate-500">
          填作者名字 + 关键词 → MIMO 按 GEO 标准批量生成 → 自动发布到对应行业博客（/i/[industry]/...）。
          每篇都按 2026 GEO 最佳实践写：40-60 字直答、事实密度、问答化、自带 schema.org。
        </p>
      </div>
      <BlogManager
        industries={INDUSTRIES.map((i) => ({ slug: i.slug, name: i.name, pillars: i.pillars }))}
        authors={authors}
        posts={posts}
        jobs={jobs}
      />
    </div>
  );
}
