"use client";
import { useState } from "react";
import { Loader2, Bot, CheckCircle2, XCircle, Send, BarChart3 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { siteConfig } from "@/lib/site";
import type { AiPlatformId } from "@/lib/ai";

const PRESETS = [
  { q: "敏感肌精华液哪个好用？", brand: "" },
  { q: "推荐几款适合油皮的防晒霜", brand: "" },
  { q: "烟酰胺美白精华怎么选", brand: "" },
  { q: "什么是 GEO 生成式引擎优化？", brand: "BrandGEO" },
];

interface ResultItem {
  platform: AiPlatformId;
  ok: boolean;
  text?: string;
  error?: string;
  cited?: boolean;
  rank?: number | null;
  latencyMs: number;
}

export function CompareTool() {
  const [question, setQuestion] = useState("");
  const [brand, setBrand] = useState("");
  const [selected, setSelected] = useState<AiPlatformId[]>(
    siteConfig.aiPlatforms.slice(0, 6).map((p) => p.id as AiPlatformId),
  );
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ResultItem[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function toggle(id: AiPlatformId) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }
  function selectAll() {
    setSelected(siteConfig.aiPlatforms.map((p) => p.id as AiPlatformId));
  }
  function selectCN() {
    setSelected(siteConfig.aiPlatforms.filter((p) => p.cn).map((p) => p.id as AiPlatformId));
  }

  async function run() {
    if (!question.trim() || selected.length === 0) return;
    setLoading(true);
    setErr(null);
    setResults(null);
    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question, platforms: selected, brand: brand || undefined }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResults(data.results as ResultItem[]);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "对比失败");
    } finally {
      setLoading(false);
    }
  }

  const summary = results
    ? {
        total: results.length,
        success: results.filter((r) => r.ok).length,
        cited: results.filter((r) => r.cited).length,
        top1: results.filter((r) => r.rank === 1).length,
      }
    : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      {/* 左侧 */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">输入</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">问题 *</label>
              <Input
                placeholder="如：敏感肌精华液哪个好用？"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">你的品牌名（用于追踪引用）</label>
              <Input
                placeholder="如：悦肌护肤"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <div className="mb-2 text-xs font-medium text-slate-600">快捷示例</div>
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((p) => (
                  <button
                    key={p.q}
                    onClick={() => {
                      setQuestion(p.q);
                      setBrand(p.brand);
                    }}
                    className="rounded-md border border-slate-200 px-2 py-1 text-xs hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    {p.q.slice(0, 16)}…
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base">选择平台 ({selected.length})</CardTitle>
            <div className="flex gap-1">
              <button onClick={selectAll} className="text-xs text-indigo-600 hover:underline">全选</button>
              <span className="text-slate-300">|</span>
              <button onClick={selectCN} className="text-xs text-indigo-600 hover:underline">仅国内</button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-1.5">
              {siteConfig.aiPlatforms.map((p) => {
                const id = p.id as AiPlatformId;
                const on = selected.includes(id);
                return (
                  <button
                    key={p.id}
                    onClick={() => toggle(id)}
                    className={`flex items-center gap-2 rounded-md border px-2 py-1.5 text-xs transition-colors ${
                      on
                        ? "border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-950"
                        : "border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <Bot className="h-3 w-3" />
                    {p.name}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={run}
          disabled={loading || !question.trim() || selected.length === 0}
          size="lg"
          variant="primary"
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 在 <span className="num">{selected.length}</span> 个平台跑中…
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" /> 同时对比 <span className="num ml-1">{selected.length}</span> 个平台
            </>
          )}
        </Button>

        {err && (
          <div className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-950 dark:text-rose-300">
            {err}
          </div>
        )}

        {summary && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                <BarChart3 className="mr-1 inline h-4 w-4" /> 引用汇总
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">成功响应</span>
                <span className="num">{summary.success} / {summary.total}</span>
              </div>
              {brand && (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-500">引用了「{brand}」</span>
                    <Badge variant={summary.cited > 0 ? "success" : "default"}>
                      <span className="num">{summary.cited}</span> 个平台
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">进入 Top 1</span>
                    <Badge variant={summary.top1 > 0 ? "primary" : "default"}>
                      <span className="num">{summary.top1}</span> 个平台
                    </Badge>
                  </div>
                  <div className="mt-3 rounded-md bg-slate-50 p-2 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    💡 GEO 优化的目标：让这个数字稳定 ≥{Math.ceil(summary.total * 0.5)} / {summary.total}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* 右侧结果 */}
      <div>
        {!results && !loading && (
          <div className="grid h-full min-h-96 place-items-center rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center dark:border-slate-800">
            <div>
              <Bot className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm text-slate-500">输入问题，看 12 个 AI 平台分别如何回答。</p>
            </div>
          </div>
        )}

        {loading && (
          <div className="grid h-full min-h-96 place-items-center rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
              <p className="mt-3 text-sm text-slate-500">{selected.length} 个平台并发查询中…</p>
            </div>
          </div>
        )}

        {results && (
          <div className="grid gap-3">
            {results.map((r) => {
              const meta = siteConfig.aiPlatforms.find((p) => p.id === r.platform);
              return (
                <Card key={r.platform}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-indigo-500" />
                      <CardTitle className="text-base">{meta?.name ?? r.platform}</CardTitle>
                      <Badge variant="outline" className="text-[10px]">{meta?.cn ? "国内" : "海外"}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {brand && (
                        r.cited ? (
                          <Badge variant="success">
                            <CheckCircle2 className="mr-1 h-3 w-3" /> 已引用
                            {r.rank ? <span className="num ml-1">Top {r.rank}</span> : null}
                          </Badge>
                        ) : (
                          <Badge variant="default">
                            <XCircle className="mr-1 h-3 w-3" /> 未引用
                          </Badge>
                        )
                      )}
                      <Badge variant="outline" className="text-[10px]">
                        <span className="num">{r.latencyMs}</span>ms
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {r.ok ? (
                      <div className="prose prose-sm prose-slate max-w-none dark:prose-invert">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {(r.text ?? "").slice(0, 1500)}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                        {r.error}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
