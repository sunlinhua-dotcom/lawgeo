"use client";
import { useState } from "react";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  PolarRadiusAxis,
} from "recharts";
import { Sparkles, Loader2, Wand2, FileText, Copy, ArrowRight, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StepFlow, StepPanel } from "@/components/ui/step-flow";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ContentArticle } from "@/lib/db/schema";

interface IntentLite {
  id: string;
  text: string;
  geoIndex: number | null;
}
interface Scores {
  total: number;
  title: number;
  firstPara: number;
  deAi: number;
  structure: number;
  authority: number;
  match: number;
  conversion: number;
  reasons: Record<string, string>;
}

const DIMS: Array<{ key: keyof Scores; label: string }> = [
  { key: "title", label: "标题" },
  { key: "firstPara", label: "首段直答" },
  { key: "deAi", label: "去AI味" },
  { key: "structure", label: "结构" },
  { key: "authority", label: "权威性" },
  { key: "match", label: "匹配" },
  { key: "conversion", label: "转化" },
];

export function ContentWizard({
  brandName,
  intents,
  presetIntent,
  initialArticles,
}: {
  brandName: string;
  intents: IntentLite[];
  presetIntent?: string;
  initialArticles: ContentArticle[];
}) {
  const [step, setStep] = useState(0);
  const [intent, setIntent] = useState(presetIntent ?? "");
  const [intentId, setIntentId] = useState<string | undefined>();
  const [titles, setTitles] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [genTitles, setGenTitles] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [content, setContent] = useState("");
  const [scores, setScores] = useState<Scores | null>(null);
  const [elapsed, setElapsed] = useState(0);

  /** 计时器：AI 调用期间每秒 +1，给用户「在跑」的反馈 */
  function startTimer() {
    setElapsed(0);
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }

  /** 不等 AI 的即时模板标题（秒出） */
  function templateTitles() {
    if (!intent.trim()) return;
    const i = intent.trim();
    setTitles([
      `${i}？${brandName}专业解答（2026 最新）`,
      `${brandName}：关于「${i}」你该知道的 5 件事`,
      `${i}怎么办？一篇讲清流程、费用与注意事项`,
      `${i} | ${brandName}实务指南`,
      `${i}？看完这篇就懂了`,
    ]);
    if (!title) setTitle(`${i}？${brandName}专业解答（2026 最新）`);
    toast.success("已生成模板标题，可直接选用或点「AI 生成标题」要更优的");
  }

  async function generateTitles() {
    if (!intent.trim()) return;
    setGenTitles(true);
    const stop = startTimer();
    const ctl = new AbortController();
    const timeout = setTimeout(() => ctl.abort(), 90000);
    try {
      const r = await fetch("/api/content/titles", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ intent, brandName }),
        signal: ctl.signal,
      }).then((x) => x.json());
      if (r.titles?.length) {
        setTitles(r.titles);
        if (!title) setTitle(r.titles[0]);
        toast.success("AI 标题已生成");
      } else {
        throw new Error(r.error || "未返回标题");
      }
    } catch (e) {
      const aborted = e instanceof Error && e.name === "AbortError";
      toast.error(aborted ? "AI 较慢超时了，先用模板标题吧" : "AI 标题失败，用模板标题");
      templateTitles();
    } finally {
      clearTimeout(timeout);
      stop();
      setGenTitles(false);
    }
  }

  async function generate() {
    setGenerating(true);
    setContent("");
    setScores(null);
    const stop = startTimer();
    const ctl = new AbortController();
    const timeout = setTimeout(() => ctl.abort(), 150000);
    try {
      const r = await fetch("/api/content/generate-scored", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title, intent, intentId, keywords: intent ? [intent] : [] }),
        signal: ctl.signal,
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setContent(d.content);
      setScores(d.scores);
      setStep(2);
      toast.success(`生成完成，GEO 总分 ${d.scores.total}`);
    } catch (e) {
      const aborted = e instanceof Error && e.name === "AbortError";
      toast.error(aborted ? "生成超时（MIMO 较慢），请重试" : e instanceof Error ? e.message : "生成失败");
    } finally {
      clearTimeout(timeout);
      stop();
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card variant="elevated">
        <CardContent className="pt-6">
          <StepFlow
            steps={[
              { id: "intent", title: "选意图 + 标题", canProceed: () => (!title.trim() ? "请先选/写一个标题" : true) },
              { id: "gen", title: "生成 + 7 维评分" },
              { id: "done", title: "结果" },
            ]}
            current={step}
            onCurrentChange={setStep}
            onFinish={() => {
              if (step === 1) generate();
            }}
            finishLabel={step === 1 ? "生成并评分" : "完成"}
            busy={generating}
          >
            {/* step 1 */}
            <StepPanel>
              <div>
                <div className="mb-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">意图词</div>
                {intents.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {intents.slice(0, 12).map((it) => (
                      <button
                        key={it.id}
                        onClick={() => {
                          setIntent(it.text);
                          setIntentId(it.id);
                        }}
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-xs",
                          intent === it.text
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                            : "border-slate-200 hover:bg-slate-50 dark:border-slate-700",
                        )}
                      >
                        {it.text}
                        {it.geoIndex != null && <span className="num ml-1 text-[10px] text-slate-400">{it.geoIndex}</span>}
                      </button>
                    ))}
                  </div>
                )}
                <Input value={intent} onChange={(e) => setIntent(e.target.value)} placeholder="或手动输入意图词" />
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">标题</span>
                  <div className="flex items-center gap-1">
                    <Button size="xs" variant="ghost" onClick={templateTitles} disabled={!intent.trim() || genTitles}>
                      <FileText className="h-3 w-3" />
                      <span className="ml-1">模板标题（秒出）</span>
                    </Button>
                    <Button size="xs" variant="ghost" onClick={generateTitles} disabled={genTitles || !intent.trim()}>
                      {genTitles ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
                      <span className="ml-1">{genTitles ? `AI 生成中 ${elapsed}s…` : "AI 生成标题"}</span>
                    </Button>
                  </div>
                </div>
                {genTitles && (
                  <div className="mb-2 rounded-lg bg-indigo-50 px-3 py-1.5 text-[11px] text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    MIMO 生成中（通常 15-25 秒），请稍候… 已等 {elapsed}s。急的话点「模板标题」秒出。
                  </div>
                )}
                {titles.length > 0 && (
                  <div className="mb-2 space-y-1">
                    {titles.map((t) => (
                      <button
                        key={t}
                        onClick={() => setTitle(t)}
                        className={cn(
                          "block w-full rounded-lg border px-3 py-1.5 text-left text-sm",
                          title === t ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950" : "border-slate-200 hover:bg-slate-50 dark:border-slate-700",
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="或手动写标题" />
              </div>
            </StepPanel>

            {/* step 2 */}
            <StepPanel>
              <Card variant="flat">
                <CardContent className="p-6 text-center">
                  <Sparkles className="mx-auto h-8 w-8 text-indigo-600" />
                  <div className="mt-3 text-sm font-medium">{title}</div>
                  <div className="mt-1 text-xs text-slate-500">意图：{intent || "—"}</div>
                  <p className="mt-4 text-xs text-slate-500">
                    点下方「生成并评分」：AI 写正文 + 注入品牌知识库 + 7 维 GEO 评分。约 30-60 秒。
                  </p>
                  {generating && (
                    <div className="mt-4">
                      <div className="flex items-center justify-center gap-2 text-sm text-indigo-600">
                        <Loader2 className="h-4 w-4 animate-spin" /> 生成 + 评分中… 已等 {elapsed}s
                      </div>
                      <div className="mx-auto mt-3 h-1.5 max-w-xs overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div className="h-full animate-pulse bg-gradient-to-r from-indigo-500 to-violet-500" style={{ width: `${Math.min(95, elapsed * 1.6)}%` }} />
                      </div>
                      <p className="mt-2 text-[11px] text-slate-400">MIMO 写正文约 40-70 秒，评分再 +15 秒，请耐心等。不要离开本页。</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </StepPanel>

            {/* step 3 */}
            <StepPanel>
              {scores && (
                <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        GEO 总分 <span className="num text-2xl text-indigo-600">{scores.total}</span>
                      </CardTitle>
                      <p className="text-[10px] text-slate-400">由 MIMO 按 7 维 GEO rubric 对生成的正文实时打分（0-100），非随机。</p>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <RadarChart data={DIMS.map((d) => ({ dim: d.label, score: scores[d.key] as number }))}>
                          <PolarGrid stroke="#e2e8f0" />
                          <PolarAngleAxis dataKey="dim" tick={{ fontSize: 10, fill: "#64748b" }} />
                          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                          <Radar dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.35} />
                        </RadarChart>
                      </ResponsiveContainer>
                      <div className="mt-2 space-y-1">
                        {DIMS.map((d) => (
                          <div key={d.key} className="flex items-center justify-between text-xs">
                            <span className="text-slate-600 dark:text-slate-400">{d.label}</span>
                            <span className="num font-medium">{scores[d.key] as number}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-base">生成的正文</CardTitle>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(content); toast.success("已复制"); }}>
                          <Copy className="mr-1 h-3 w-3" /> 复制
                        </Button>
                        <Button asChild size="sm" variant="primary">
                          <Link href="/dashboard/publish"><ArrowRight className="mr-1 h-3 w-3" /> 去发布</Link>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm dark:bg-slate-800">{content}</pre>
                    </CardContent>
                  </Card>
                </div>
              )}
            </StepPanel>
          </StepFlow>
        </CardContent>
      </Card>

      {/* 历史 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">已生成内容（{initialArticles.length}）</CardTitle>
        </CardHeader>
        <CardContent>
          {initialArticles.length === 0 ? (
            <EmptyState icon={FileText} title="还没有内容" description="用上面的向导生成第一篇。" />
          ) : (
            <div className="space-y-2">
              {initialArticles.map((a) => {
                const s = a.scores ? (JSON.parse(a.scores) as Scores) : null;
                return (
                  <div key={a.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 dark:border-slate-800">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{a.title}</div>
                      <div className="text-[10px] text-slate-500">{a.intentText} · {new Date(a.createdAt).toLocaleDateString("zh-CN")}</div>
                    </div>
                    {s && <Badge variant={s.total >= 80 ? "success" : s.total >= 60 ? "warning" : "outline"}>GEO <span className="num ml-1">{s.total}</span></Badge>}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
