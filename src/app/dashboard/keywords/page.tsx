import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { db, schema } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Database, ArrowRight, Plus } from "lucide-react";

export const metadata = { title: "关键词矩阵", robots: { index: false } };

export default async function KeywordsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  // 获取用户的所有项目下的关键词
  const projects = await db
    .select()
    .from(schema.projects)
    .where(eq(schema.projects.userId, session.userId));

  const projectIds = projects.map((p) => p.id);
  const keywords =
    projectIds.length > 0
      ? await db
          .select()
          .from(schema.keywords)
          .where(eq(schema.keywords.projectId, projectIds[0]))
          .orderBy(desc(schema.keywords.priority))
          .limit(200)
      : [];

  return (
    <div className="px-6 py-8 lg:px-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">关键词矩阵</h1>
          <p className="mt-1 text-sm text-slate-500">你已加入监测的关键词。</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/tools/matrix">
              从矩阵生成器选词 <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="primary">
            <Link href="/dashboard/projects">
              <Plus className="mr-1 h-4 w-4" /> 管理项目
            </Link>
          </Button>
        </div>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Database className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">还没有项目，先创建一个项目再添加关键词。</p>
            <Button asChild variant="primary" className="mt-4">
              <Link href="/dashboard/projects">创建第一个项目</Link>
            </Button>
          </CardContent>
        </Card>
      ) : keywords.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Database className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">项目下还没有关键词。</p>
            <Button asChild variant="primary" className="mt-4">
              <Link href="/tools/matrix">从矩阵生成器选词</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{projects[0].name} 的关键词（共 {keywords.length} 条）</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2 text-left">关键词</th>
                    <th className="px-3 py-2 text-left">品类</th>
                    <th className="px-3 py-2 text-left">场景</th>
                    <th className="px-3 py-2 text-left">意图</th>
                    <th className="px-3 py-2 text-right">月搜索量</th>
                    <th className="px-3 py-2 text-right">优先级</th>
                  </tr>
                </thead>
                <tbody>
                  {keywords.map((k) => (
                    <tr key={k.id} className="border-t border-slate-100 dark:border-slate-800">
                      <td className="px-3 py-2 font-medium">{k.keyword}</td>
                      <td className="px-3 py-2 text-xs">{k.caseCategory ?? "—"}</td>
                      <td className="px-3 py-2 text-xs">{k.region ?? "—"}</td>
                      <td className="px-3 py-2">
                        <Badge variant="outline">{k.intent}</Badge>
                      </td>
                      <td className="px-3 py-2 text-right num">{k.monthlyVolume ?? "—"}</td>
                      <td className="px-3 py-2 text-right num">{k.priority}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
