import { desc } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "线索", robots: { index: false } };

export default async function LeadsPage() {
  const leads = await db.select().from(schema.leads).orderBy(desc(schema.leads.createdAt)).limit(100);
  return (
    <div className="px-6 py-8 lg:px-10">
      <h1 className="text-2xl font-semibold">线索</h1>
      <p className="mt-1 text-sm text-slate-500">来自联系页与各落地页的所有留资。</p>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">最近 100 条</CardTitle>
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">还没有线索。</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2 text-left">姓名</th>
                    <th className="px-3 py-2 text-left">联系方式</th>
                    <th className="px-3 py-2 text-left">行业</th>
                    <th className="px-3 py-2 text-left">来源</th>
                    <th className="px-3 py-2 text-left">备注</th>
                    <th className="px-3 py-2 text-right">时间</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l) => (
                    <tr key={l.id} className="border-t border-slate-100 dark:border-slate-800">
                      <td className="px-3 py-2 font-medium">{l.name}</td>
                      <td className="px-3 py-2 text-slate-600">{l.contact}</td>
                      <td className="px-3 py-2"><Badge variant="outline">{l.industry ?? "—"}</Badge></td>
                      <td className="px-3 py-2 text-xs text-slate-500">{l.source ?? "—"}</td>
                      <td className="px-3 py-2 max-w-xs truncate text-xs text-slate-600">{l.message ?? "—"}</td>
                      <td className="px-3 py-2 text-right text-xs text-slate-500">{new Date(l.createdAt).toLocaleString("zh-CN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
