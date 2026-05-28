"use client";
import { useState } from "react";
import { Sparkles, Loader2, Copy, Download, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ContentFormat } from "@/lib/prompts";

const FORMATS: Array<{ id: ContentFormat; label: string; desc: string }> = [
  { id: "faq", label: "FAQ 问答", desc: "6–10 组 Q&A + FAQPage JSON-LD" },
  { id: "tldr", label: "TL;DR 摘要", desc: "顶层一句话 + 关键事实" },
  { id: "howto", label: "HowTo 步骤", desc: "分步指南 + HowTo schema" },
  { id: "compare", label: "对比表格", desc: "结构化对比 + 结论" },
  { id: "article", label: "完整文章", desc: "800–1500 字 + 直答首段" },
  { id: "answer", label: "直接答案段落", desc: "80–160 字 answer-first" },
];

const PRESETS = [
  { label: "上海离婚律师收费", topic: "上海离婚律师怎么收费", region: "上海", caseType: "婚姻家庭" },
  { label: "深圳劳动仲裁流程", topic: "深圳劳动仲裁找哪家律所", region: "深圳", caseType: "劳动仲裁" },
  { label: "北京合同纠纷起诉", topic: "北京合同纠纷律师推荐", region: "北京", caseType: "合同纠纷" },
  { label: "杭州知识产权咨询", topic: "杭州商标侵权律师", region: "杭州", caseType: "商标纠纷" },
];

export function GenerateTool() {
  const [format, setFormat] = useState<ContentFormat>("faq");
  const [topic, setTopic] = useState("");
  const [region, setRegion] = useState("");
  const [caseType, setCaseType] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ content: string; jsonLd: string | null; latencyMs: number } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function run() {
    if (!topic.trim()) return;
    setLoading(true);
    setErr(null);
    setResult(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ format, topic, region: region || undefined, caseType: caseType || undefined, context: context || undefined }),
      });
      if (!res.ok) throw new Error(await res.text());
      setResult(await res.json());
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "生成失败");
    } finally {
      setLoading(false);
    }
  }

  function applyPreset(p: typeof PRESETS[number]) {
    setTopic(p.topic);
    setRegion(p.region);
    setCaseType(p.caseType);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
      {/* 输入 */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">输出格式</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {FORMATS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFormat(f.id)}
                className={`rounded-lg border p-3 text-left text-xs transition-colors ${
                  format === f.id
                    ? "border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-950"
                    : "border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                }`}
              >
                <div className="font-medium">{f.label}</div>
                <div className="mt-0.5 text-[11px] text-slate-500">{f.desc}</div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">输入</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">话题 / 关键词 *</label>
              <Input
                placeholder="如：上海离婚律师怎么收费"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">地域（可选）</label>
                <Input
                  placeholder="如：上海"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">案由（可选）</label>
                <Input
                  placeholder="如：婚姻家庭"
                  value={caseType}
                  onChange={(e) => setCaseType(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">背景素材（可选）</label>
              <Textarea
                placeholder="贴入律所介绍、收费说明、典型案例等，模型会基于这些素材生成"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                rows={4}
                disabled={loading}
              />
            </div>

            <div>
              <div className="mb-2 text-xs font-medium text-slate-600">快捷预设</div>
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => applyPreset(p)}
                    className="rounded-md border border-slate-200 px-2 py-1 text-xs hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={run} disabled={loading || !topic.trim()} size="lg" variant="primary" className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 生成中…
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" /> 用 MIMO 生成
                </>
              )}
            </Button>
            {err && (
              <div className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                {err}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 输出 */}
      <div>
        {!result && !loading && (
          <div className="grid h-full min-h-96 place-items-center rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center dark:border-slate-800">
            <div>
              <Sparkles className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm text-slate-500">在左侧输入话题，AI 将生成 GEO 友好的内容。</p>
            </div>
          </div>
        )}
        {loading && (
          <div className="grid h-full min-h-96 place-items-center rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
              <p className="mt-3 text-sm text-slate-500">小米 MIMO 2.5 Pro 思考中…</p>
            </div>
          </div>
        )}
        {result && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base">生成结果</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline">耗时 <span className="num ml-1">{result.latencyMs}ms</span></Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigator.clipboard.writeText(result.content)}
                >
                  <Copy className="mr-1 h-3 w-3" /> 复制
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const blob = new Blob([result.content], { type: "text/markdown" });
                    const a = document.createElement("a");
                    a.href = URL.createObjectURL(blob);
                    a.download = `${topic}.md`;
                    a.click();
                  }}
                >
                  <Download className="mr-1 h-3 w-3" /> 下载 .md
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <article className="prose-cn max-w-none text-sm">
                <div className="prose prose-slate max-w-none rounded-lg bg-slate-50 p-4 dark:prose-invert dark:bg-slate-900">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.content}</ReactMarkdown>
                </div>
              </article>
              {result.jsonLd && (
                <details className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs dark:border-emerald-900 dark:bg-emerald-950" open>
                  <summary className="cursor-pointer font-semibold text-emerald-900 dark:text-emerald-200">
                    ✅ 附带的 JSON-LD（可直接贴到页面 head）
                  </summary>
                  <pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-emerald-900 dark:text-emerald-200">
                    {result.jsonLd}
                  </pre>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => result.jsonLd && navigator.clipboard.writeText(result.jsonLd)}
                  >
                    <Copy className="mr-1 h-3 w-3" /> 复制 JSON-LD
                  </Button>
                </details>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
