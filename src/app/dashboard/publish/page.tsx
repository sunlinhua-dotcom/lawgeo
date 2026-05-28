import { desc, eq, inArray } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PublishManager } from "@/components/dashboard/publish-manager";

export const metadata = { title: "多平台发布", robots: { index: false } };

export default async function PublishDashPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const drafts = await db
    .select()
    .from(schema.contentDrafts)
    .where(eq(schema.contentDrafts.userId, session.userId))
    .orderBy(desc(schema.contentDrafts.createdAt))
    .limit(50);

  const draftIds = drafts.map((d) => d.id);
  const targets =
    draftIds.length > 0
      ? await db.select().from(schema.publishTargets).where(inArray(schema.publishTargets.draftId, draftIds))
      : [];

  return (
    <div className="px-6 py-8 lg:px-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">多平台发布</h1>
        <p className="mt-1 text-sm text-slate-500">
          把你的 AI 生成内容自动改写为 7 大平台规范，一键打开对应编辑器。
        </p>
      </div>
      <PublishManager drafts={drafts} targets={targets} />
    </div>
  );
}
