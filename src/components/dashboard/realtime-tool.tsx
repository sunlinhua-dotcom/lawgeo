"use client";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Zap,
  Loader2,
  CheckCircle2,
  XCircle,
  Trophy,
  Award,
  Target,
  Smile,
  Meh,
  Frown,
  ChevronDown,
  ChevronUp,
  PhoneCall,
  Camera,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { RealtimeSearch, RealtimeResult } from "@/lib/db/schema";

const PLATFORMS = [
  { id: "doubao", name: "豆包" },
  { id: "deepseek", name: "DeepSeek" },
  { id: "qwen", name: "通义千问" },
  { id: "yuanbao", name: "腾讯元宝" },
  { id: "kimi", name: "Kimi" },
  { id: "zhipu", name: "智谱" },
];

export function RealtimeTool({
  brandName,
  hasConversionTargets,
  initialHistory,
}: {
  brandName: string;
  hasConversionTargets: boolean;
  initialHistory: RealtimeSearch[];
}) {
  const [question, setQuestion] = useState("");
  const [targetWord, setTargetWord] = useState(brandName);
  const [platforms, setPlatforms] = useState<string[]>(["doubao", "deepseek", "qwen", "yuanbao"]);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<RealtimeResult[] | null>(null);
  const [summary, setSummary] = useState<Record<string, number> | null>(null);

  async function run() {
    if (!question.trim() || !targetWord.trim() || platforms.length === 0) return;
    setRunning(true);
    setResults(null);
    setSummary(null);
    try {
      const res = await fetch("/api/realtime", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question, targetWord, platforms }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setSummary(data.summary);
      // 拉详情
      const detail = await fetch(`/api/realtime/${data.searchId}`).then((r) => r.json());
      setResults(detail.results);
      toast.success(
        `完成：${data.summary.mentioned}/${data.summary.total} 提及，${data.summary.top1} Top1，${data.summary.converted} 转化命中`,
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "查询失败");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      {/* 左：表单 */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">查询设置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              label="查询问题"
              required
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="例如：敏感肌精华液哪个好用"
              rows={2}
              hint="模拟真实用户会问 AI 的问题"
            />
            <Input
              label="目标词（品牌/人名）"
              required
              value={targetWord}
              onChange={(e) => setTargetWord(e.target.value)}
              placeholder="例如：悦肌护肤"
              hint="检测 AI 答案里有没有提到它"
            />
            <div>
              <div className="mb-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">监测平台</div>
              <div className="grid grid-cols-3 gap-1.5">
                {PLATFORMS.map((p) => {
                  const on = platforms.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => setPlatforms((s) => (s.includes(p.id) ? s.filter((x) => x !== p.id) : [...s, p.id]))}
                      className={cn(
                        "rounded-lg border px-2 py-1.5 text-xs transition-colors",
                        on
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-950 dark:text-indigo-300"
                          : "border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800",
                      )}
                    >
                      {p.name}
                    </button>
                  );
                })}
              </div>
            </div>
            {!hasConversionTargets && (
              <div className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                <span>
                  还没配「转化目标」（电话/微信）。去{" "}
                  <Link href="/dashboard/brand-assets" className="font-semibold underline">
                    AI 品牌资产
                  </Link>{" "}
                  配置后，可测「AI 追问时会不会吐出联系方式」= 转化命中。
                </span>
              </div>
            )}
            <Button onClick={run} variant="primary" size="lg" className="w-full" disabled={running || !question || !targetWord}>
              {running ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 实时检测中（含追问）…
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" /> 开始实时检测
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {initialHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">历史查询</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                {initialHistory.slice(0, 8).map((h) => {
                  const s = h.summary ? (JSON.parse(h.summary) as Record<string, number>) : null;
                  return (
                    <div key={h.id} className="rounded-lg border border-slate-100 px-3 py-2 text-xs dark:border-slate-800">
                      <div className="truncate font-medium">{h.question}</div>
                      <div className="mt-0.5 flex items-center gap-2 text-slate-500">
                        <span>{h.targetWord}</span>
                        {s && (
                          <>
                            <span>· 提及 {s.mentioned}/{s.total}</span>
                            {s.converted > 0 && <Badge variant="success" className="text-[9px]">转化 {s.converted}</Badge>}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 右：结果 */}
      <div className="space-y-4">
        {summary && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <SummaryStat label="提及率" value={`${summary.total ? Math.round((summary.mentioned / summary.total) * 100) : 0}%`} sub={`${summary.mentioned}/${summary.total}`} />
            <SummaryStat label="Top1" value={summary.top1} icon={Trophy} color="text-amber-600" />
            <SummaryStat label="Top3" value={summary.top3} icon={Award} color="text-indigo-600" />
            <SummaryStat label="平台数" value={summary.total} icon={Target} />
            <SummaryStat label="转化命中" value={summary.converted} icon={PhoneCall} color="text-emerald-600" highlight />
          </div>
        )}

        {running && !results && (
          <Card>
            <CardContent className="grid place-items-center py-20">
              <div className="text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
                <p className="mt-3 text-sm text-slate-500">正在 {platforms.length} 个平台提问 + 追问转化…</p>
              </div>
            </CardContent>
          </Card>
        )}

        {!summary && !running && (
          <Card>
            <CardContent className="grid place-items-center py-20 text-center">
              <Zap className="h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm text-slate-500">填左侧问题 + 目标词，开始实时检测。</p>
            </CardContent>
          </Card>
        )}

        {results?.map((r) => <ResultCard key={r.id} r={r} />)}
      </div>
    </div>
  );
}

function SummaryStat({
  label,
  value,
  sub,
  icon: Icon,
  color,
  highlight,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon?: React.ElementType;
  color?: string;
  highlight?: boolean;
}) {
  return (
    <div className={cn("rounded-xl border p-3", highlight ? "border-emerald-300 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/30" : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900")}>
      <div className="flex items-center gap-1 text-[10px] text-slate-500">
        {Icon && <Icon className={cn("h-3 w-3", color)} />} {label}
      </div>
      <div className={cn("num mt-0.5 text-2xl font-semibold", color)}>{value}</div>
      {sub && <div className="num text-[10px] text-slate-400">{sub}</div>}
    </div>
  );
}

function ResultCard({ r }: { r: RealtimeResult }) {
  const [open, setOpen] = useState(false);
  const platformName = PLATFORMS.find((p) => p.id === r.platform)?.name ?? r.platform;
  const keywords = (() => {
    try {
      return JSON.parse(r.keywords ?? "[]") as string[];
    } catch {
      return [];
    }
  })();
  const SentIcon = r.sentiment === "positive" ? Smile : r.sentiment === "negative" ? Frown : Meh;

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="primary">{platformName}</Badge>
              {r.isMentioned ? (
                <Badge variant="success" dot>已提及 {r.rank ? `· Top${r.rank}` : ""}</Badge>
              ) : (
                <Badge variant="outline" dot>未提及</Badge>
              )}
              {r.isConverted && (
                <Badge variant="success">
                  <PhoneCall className="mr-1 h-3 w-3" /> 转化命中
                </Badge>
              )}
              {r.isReal ? (
                <Badge variant="primary"><Camera className="mr-1 h-3 w-3" />真机截图</Badge>
              ) : (
                <Badge variant="outline">MIMO 模拟</Badge>
              )}
            </div>
            <button onClick={() => setOpen(!open)} className="text-slate-400 hover:text-slate-700">
              {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <SentIcon className={cn("h-3.5 w-3.5", r.sentiment === "positive" ? "text-emerald-500" : r.sentiment === "negative" ? "text-rose-500" : "text-slate-400")} />
              {r.sentiment === "positive" ? "正面" : r.sentiment === "negative" ? "负面" : "中性"}
            </span>
            {keywords.length > 0 && <span>· 关键词 {keywords.length}</span>}
            <span className="num">· {r.latencyMs}ms</span>
          </div>
        </CardHeader>
        {open && (
          <CardContent className="space-y-3">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400">AI 回答</div>
              <p className="mt-1 whitespace-pre-line rounded-lg bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {r.answer}
              </p>
            </div>
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {keywords.map((k) => (
                  <Badge key={k} variant="outline" className="text-[10px]">{k}</Badge>
                ))}
              </div>
            )}
            {r.followupTriggered && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-900 dark:bg-emerald-950/30">
                <div className="flex items-center gap-1 text-xs font-medium text-emerald-800 dark:text-emerald-200">
                  <PhoneCall className="h-3.5 w-3.5" /> 追问转化测试
                </div>
                <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">问：{r.followupQuestion}</div>
                <p className="mt-1 whitespace-pre-line text-xs text-slate-700 dark:text-slate-300">{r.followupAnswer}</p>
                <div className="mt-2">
                  {r.isConverted ? (
                    <Badge variant="success"><CheckCircle2 className="mr-1 h-3 w-3" />AI 吐出了联系方式 = 转化命中</Badge>
                  ) : (
                    <Badge variant="outline"><XCircle className="mr-1 h-3 w-3" />未命中联系方式</Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
}
