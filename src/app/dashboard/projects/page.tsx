import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProjectsManager } from "@/components/dashboard/projects-manager";

export const metadata = { title: "项目管理", robots: { index: false } };

export default async function ProjectsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const projects = await db
    .select()
    .from(schema.projects)
    .where(eq(schema.projects.userId, session.userId))
    .orderBy(desc(schema.projects.createdAt));

  return (
    <div className="px-6 py-8 lg:px-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">项目管理</h1>
        <p className="mt-1 text-sm text-slate-500">每个项目对应一个品牌 / 产品线。可绑定关键词、监测周期与发布渠道。</p>
      </div>
      <ProjectsManager initialProjects={projects} />
    </div>
  );
}
