import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { db, schema } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sparkles, ArrowRight } from "lucide-react";

export const metadata = { title: "AI 内容生成历史", robots: { index: false } };

export default async function GenHistoryPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const drafts = await db
    .select()
    .from(schema.contentDrafts)
    .where(eq(schema.contentDrafts.userId, session.userId))
    .orderBy(desc(schema.contentDrafts.createdAt))
    .limit(100);

  return (
    <div className="px-6 py-8 lg:px-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">AI 内容生成历史</h1>
          <p className="mt-1 text-sm text-slate-500">所有生成的 GEO 友好内容（含 JSON-LD）。</p>
        </div>
        <Button asChild variant="primary">
          <Link href="/tools/generate">
            <Sparkles className="mr-1 h-4 w-4" /> 新建生成 <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {drafts.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Sparkles className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">还没有生成记录。</p>
            <Button asChild variant="primary" className="mt-4">
              <Link href="/tools/generate">立即生成第一篇</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {drafts.map((d) => (
            <Card key={d.id} className="lift">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{d.title}</CardTitle>
                  <Badge variant="primary">{d.format.toUpperCase()}</Badge>
                </div>
                <div className="text-xs text-slate-500">
                  {new Date(d.createdAt).toLocaleString("zh-CN")}
                  {d.schemaJson && <Badge variant="success" className="ml-2">含 JSON-LD</Badge>}
                </div>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-4 text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line">
                  {d.body.slice(0, 280)}
                </p>
                <div className="mt-3 flex gap-2">
                  <Badge variant="outline">{d.status === "draft" ? "草稿" : d.status === "approved" ? "已审核" : "已发布"}</Badge>
                  {d.model && <Badge variant="outline">{d.model}</Badge>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
