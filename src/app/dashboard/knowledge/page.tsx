import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { KnowledgeManager } from "@/components/dashboard/knowledge-manager";

export const metadata = { title: "品牌知识库", robots: { index: false } };

export default async function KnowledgePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const docs = await db
    .select()
    .from(schema.knowledgeDocs)
    .where(eq(schema.knowledgeDocs.userId, session.userId))
    .orderBy(desc(schema.knowledgeDocs.createdAt));

  return (
    <div className="px-6 py-8 lg:px-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">品牌知识库</h1>
        <p className="mt-1 text-sm text-slate-500">
          上传品牌资料 / 课程介绍 / 案例文档 / FAQ。AI 生成内容时会自动检索相关片段作为事实依据，让回答更可信、更具体。
        </p>
      </div>
      <KnowledgeManager initialDocs={docs} />
    </div>
  );
}
