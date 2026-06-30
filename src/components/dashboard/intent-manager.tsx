"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Loader2, RefreshCw, Trash2, Target, Flame, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import type { Intent } from "@/lib/db/schema";
import Link from "next/link";

const HEAT_STYLE: Record<string, string> = {
  高热度: "bg-red-50 text-red-700 border-red-100 dark:bg-red-950 dark:text-red-300",
  中高热度: "bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-950 dark:text-orange-300",
  中等热度: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950 dark:text-amber-300",
  长尾热度: "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400",
};

const TYPE_LABEL: Record<string, string> = {
  informational: "信息型",
  commercial: "商业型",
  transactional: "交易型",
  navigational: "导航型",
};

export function IntentManager({ initialIntents, brandName }: { initialIntents: Intent[]; brandName: string }) {
  const router = useRouter();
  const [intents, setIntents] = useState(initialIntents);
  const [text, setText] = useState("");
  const [adding, setAdding] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  async function add() {
    const texts = text.split(/\n+/).map((s) => s.trim()).filter(Boolean);
    if (texts.length === 0) return;
    setAdding(true);
    try {
      const res = await fetch("/api/intents", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ texts }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      toast.success(`新增 ${d.created} 个意图词`);
      setText("");
      const fresh = await fetch("/api/intents").then((r) => r.json());
      setIntents(fresh.intents);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "失败");
    } finally {
      setAdding(false);
    }
  }

  async function refreshIndex() {
    setRefreshing(true);
    try {
      const res = await fetch("/api/intents", { method: "PATCH" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      toast.success(`已刷新 ${d.updated} 个意图词的 GEO 指数`);
      const fresh = await fetch("/api/intents").then((r) => r.json());
      setIntents(fresh.intents);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "失败");
    } finally {
      setRefreshing(false);
    }
  }

  async function del(id: string) {
    await fetch("/api/intents", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ids: [id] }),
    });
    setIntents((s) => s.filter((x) => x.id !== id));
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">添加意图词</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`每行一个，如：\n敏感肌精华液哪个好用\n烟酰胺美白有用吗\n${brandName}怎么样`}
            rows={4}
            hint="可从洞察报告/关键词矩阵复制。添加后点「刷新 GEO 指数」让 AI 评估热度。"
          />
          <div className="flex gap-2">
            <Button onClick={add} variant="primary" disabled={adding || !text.trim()}>
              {adding ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Plus className="mr-1 h-4 w-4" />}
              添加
            </Button>
            <Button onClick={refreshIndex} variant="outline" disabled={refreshing || intents.length === 0}>
              {refreshing ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-1 h-4 w-4" />}
              刷新 GEO 指数
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">意图词库（{intents.length}）</CardTitle>
        </CardHeader>
        <CardContent>
          {intents.length === 0 ? (
            <EmptyState icon={Target} title="还没有意图词" description="上面添加，或从洞察报告导入。" />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
              <table className="w-full text-sm">
                <thead className="bg-slate-50/60 text-[10px] uppercase tracking-wider text-slate-500 dark:bg-slate-800/40">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-medium">意图词</th>
                    <th className="px-3 py-2.5 text-left font-medium">类型</th>
                    <th className="px-3 py-2.5 text-left font-medium">热度</th>
                    <th className="px-3 py-2.5 text-right font-medium">月搜索量</th>
                    <th className="px-3 py-2.5 text-right font-medium">GEO 指数</th>
                    <th className="px-3 py-2.5 text-right font-medium">优先级</th>
                    <th className="px-3 py-2.5"></th>
                  </tr>
                </thead>
                <tbody>
                  {intents.map((it) => (
                    <tr key={it.id} className="border-t border-slate-100 hover:bg-slate-50/60 dark:border-slate-800 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-2.5 font-medium">{it.text}</td>
                      <td className="px-3 py-2.5">
                        <Badge variant="outline" className="text-[10px]">{TYPE_LABEL[it.intentType ?? "commercial"]}</Badge>
                      </td>
                      <td className="px-3 py-2.5">
                        {it.heatLevel ? (
                          <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px]", HEAT_STYLE[it.heatLevel])}>
                            <Flame className="h-2.5 w-2.5" /> {it.heatLevel}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">未评估</span>
                        )}
                      </td>
                      <td className="num px-3 py-2.5 text-right">{it.searchVolume?.toLocaleString() ?? "—"}</td>
                      <td className="px-3 py-2.5 text-right">
                        {it.geoIndex != null ? (
                          <span className="num font-semibold text-indigo-600">{it.geoIndex}</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="num px-3 py-2.5 text-right">{it.priority}</td>
                      <td className="px-3 py-2.5 text-right">
                        <Link
                          href={`/dashboard/content?intent=${encodeURIComponent(it.text)}`}
                          className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline"
                        >
                          写内容 <ArrowRight className="h-3 w-3" />
                        </Link>
                        <button onClick={() => del(it.id)} className="ml-2 text-slate-400 hover:text-rose-600">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
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
