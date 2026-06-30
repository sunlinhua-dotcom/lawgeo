"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Lightbulb,
  Loader2,
  Search,
  Swords,
  Link2,
  Flame,
  AlertTriangle,
  Download,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import type { Insight } from "@/lib/db/schema";

interface Report {
  websiteProfile: string;
  competitors: Array<{ name: string; reason: string }>;
  sources: Array<{ type: string; note: string }>;
  heatKeywords: Array<{ keyword: string; volume: number; heatLevel: string; intent: string }>;
  brandIssues: Array<{ issue: string; suggestion: string }>;
}

const HEAT_COLOR: Record<string, string> = {
  高热度: "text-red-600",
  中高热度: "text-orange-600",
  中等热度: "text-amber-600",
  长尾热度: "text-slate-500",
};

export function InsightManager({
  brand,
  initialInsights,
}: {
  brand: { name: string; industry: string | null; website: string | null };
  initialInsights: Insight[];
}) {
  const router = useRouter();
  const [insights, setInsights] = useState(initialInsights);
  const [keywords, setKeywords] = useState("");
  const [running, setRunning] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(
    initialInsights.find((i) => i.status === "done")?.id ?? null,
  );
  const [pollId, setPollId] = useState<string | null>(
    initialInsights.find((i) => i.status === "running" || i.status === "queued")?.id ?? null,
  );

  // 轮询进行中的任务
  useEffect(() => {
    if (!pollId) return;
    const t = setInterval(async () => {
      const r = await fetch(`/api/insights/${pollId}`).then((x) => x.json());
      setInsights((s) => s.map((i) => (i.id === pollId ? r.insight : i)));
      if (r.insight.status === "done" || r.insight.status === "failed") {
        setPollId(null);
        if (r.insight.status === "done") {
          setActiveId(pollId);
          toast.success("洞察报告已生成");
        } else {
          toast.error("洞察失败：" + (r.insight.error ?? ""));
        }
        router.refresh();
      }
    }, 3000);
    return () => clearInterval(t);
  }, [pollId, router]);

  async function start() {
    setRunning(true);
    try {
      const kws = keywords.split(/\n+/).map((s) => s.trim()).filter(Boolean);
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ keywords: kws }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      toast.success("已启动洞察分析");
      const fresh = await fetch("/api/insights").then((r) => r.json());
      setInsights(fresh.insights);
      setPollId(d.id);
      setKeywords("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "失败");
    } finally {
      setRunning(false);
    }
  }

  async function importToIntents(id: string) {
    const r = await fetch(`/api/insights/${id}`, { method: "POST" }).then((x) => x.json());
    if (r.ok) toast.success(`已导入 ${r.imported} 个意图词到意图库`);
    else toast.error(r.error ?? "导入失败");
  }

  const active = insights.find((i) => i.id === activeId);
  const report: Report | null = active?.report ? JSON.parse(active.report) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      {/* 左：创建 + 历史 */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">新建诊断</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg bg-slate-50 p-3 text-xs dark:bg-slate-800">
              <div>品牌：<strong>{brand.name}</strong></div>
              <div>行业：{brand.industry ?? "—"}</div>
              <div className="truncate">官网：{brand.website ?? "—"}</div>
            </div>
            <Textarea
              label="种子关键词（可选）"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder={"每行一个，如：\n敏感肌精华\n烟酰胺美白\n视黄醇抗老"}
              rows={3}
              hint="留空也行，AI 会按行业自动挖词"
            />
            <Button onClick={start} variant="primary" className="w-full" disabled={running || !!pollId}>
              {running || pollId ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" />分析中…</> : <><Search className="mr-1 h-4 w-4" />开始诊断</>}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">历史报告</CardTitle>
          </CardHeader>
          <CardContent>
            {insights.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">还没有报告</div>
            ) : (
              <div className="space-y-1.5">
                {insights.map((i) => (
                  <button
                    key={i.id}
                    onClick={() => i.status === "done" && setActiveId(i.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-xs",
                      activeId === i.id ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950" : "border-slate-100 dark:border-slate-800",
                    )}
                  >
                    <div className="min-w-0">
                      <div className="truncate font-medium">{i.brandName}</div>
                      <div className="text-[10px] text-slate-500">{new Date(i.createdAt).toLocaleString("zh-CN")}</div>
                    </div>
                    <Badge variant={i.status === "done" ? "success" : i.status === "failed" ? "danger" : "warning"} dot>
                      {i.status === "done" ? "完成" : i.status === "failed" ? "失败" : `${i.progress}%`}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 右：报告 */}
      <div className="space-y-4">
        {!report ? (
          <EmptyState
            icon={Lightbulb}
            title="洞察报告会显示在这里"
            description="左侧「开始诊断」，AI 会分析竞品、信源、热词、品牌问题。"
          />
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">📋 品牌画像</CardTitle>
                <Button size="sm" variant="outline" onClick={() => activeId && importToIntents(activeId)}>
                  <Download className="mr-1 h-3 w-3" /> 热词导入意图库
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700 dark:text-slate-300">{report.websiteProfile}</p>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="flex items-center gap-1.5 text-base"><Swords className="h-4 w-4 text-rose-500" />竞品分析</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {report.competitors.map((c, i) => (
                    <div key={i} className="rounded-lg border border-slate-100 p-2.5 text-xs dark:border-slate-800">
                      <div className="font-medium">{c.name}</div>
                      <div className="mt-0.5 text-slate-500">{c.reason}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="flex items-center gap-1.5 text-base"><Link2 className="h-4 w-4 text-indigo-500" />信源分析</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {report.sources.map((s, i) => (
                    <div key={i} className="rounded-lg border border-slate-100 p-2.5 text-xs dark:border-slate-800">
                      <Badge variant="outline" className="mb-1">{s.type}</Badge>
                      <div className="text-slate-500">{s.note}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="flex items-center gap-1.5 text-base"><Flame className="h-4 w-4 text-orange-500" />热词资产</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-[10px] uppercase text-slate-500">
                      <tr><th className="px-3 py-1.5 text-left">关键词</th><th className="px-3 py-1.5 text-left">意图</th><th className="px-3 py-1.5 text-right">月搜索量</th><th className="px-3 py-1.5 text-left">热度</th></tr>
                    </thead>
                    <tbody>
                      {report.heatKeywords.map((k, i) => (
                        <tr key={i} className="border-t border-slate-100 dark:border-slate-800">
                          <td className="px-3 py-1.5 font-medium">{k.keyword}</td>
                          <td className="px-3 py-1.5"><Badge variant="outline" className="text-[10px]">{k.intent}</Badge></td>
                          <td className="num px-3 py-1.5 text-right">{k.volume.toLocaleString()}</td>
                          <td className={cn("px-3 py-1.5 font-medium", HEAT_COLOR[k.heatLevel])}>{k.heatLevel}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="flex items-center gap-1.5 text-base"><AlertTriangle className="h-4 w-4 text-amber-500" />品牌问题 → 该补什么</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {report.brandIssues.map((b, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-lg border border-slate-100 p-2.5 text-xs dark:border-slate-800">
                    <ChevronRight className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-indigo-500" />
                    <div>
                      <div className="font-medium">{b.issue}</div>
                      <div className="mt-0.5 text-emerald-600 dark:text-emerald-400">→ {b.suggestion}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
