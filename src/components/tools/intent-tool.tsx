"use client";
import { useState } from "react";
import { Target, Loader2, Download, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Cluster {
  name: string;
  intent_type: "informational" | "commercial" | "transactional" | "navigational";
  description: string;
  keywords: string[];
  ai_difficulty: "easy" | "medium" | "hard";
  priority: number;
  recommended_format: string;
  competitive_landscape: string;
  key_facts_to_include: string[];
}

interface Result {
  clusters: Cluster[];
  ungrouped: string[];
  summary: { total_keywords: number; cluster_count: number; top_intent_type: string; recommendation: string };
  latencyMs: number;
}

const PRESETS = [
  {
    label: "律所案由",
    text:
      "上海离婚律师推荐\n上海离婚律师收费\n离婚律师哪家好\n离婚冷静期是什么\n上海合同纠纷律师\n合同违约怎么起诉\n上海劳动仲裁找谁\n劳动仲裁多久出结果\n上海知识产权律师\n商标侵权怎么打官司",
  },
  {
    label: "教育培训",
    text:
      "国家电网考试培训\n国家电网考试报名\n国家电网笔试通过率\n电力国企面试技巧\n国家电网考试时间\n培训机构推荐\n哪个国考培训好\n国考培训费用",
  },
  {
    label: "B2B SaaS",
    text:
      "GEO 工具推荐\nAI 搜索优化平台\n什么是 GEO\nGEO 多少钱\nGEO 见效周期\n品牌 AI 引用监测\n如何让品牌被 AI 推荐\nlawGEO vs aceflow",
  },
];

const TYPE_LABEL: Record<string, { label: string; color: string }> = {
  informational: { label: "信息型", color: "bg-blue-100 text-blue-700" },
  commercial: { label: "商业型", color: "bg-amber-100 text-amber-700" },
  transactional: { label: "交易型", color: "bg-emerald-100 text-emerald-700" },
  navigational: { label: "导航型", color: "bg-slate-100 text-slate-700" },
};

const DIFFICULTY_LABEL: Record<string, { label: string; color: string }> = {
  easy: { label: "容易", color: "text-emerald-600" },
  medium: { label: "中等", color: "text-amber-600" },
  hard: { label: "困难", color: "text-rose-600" },
};

export function IntentTool() {
  const [text, setText] = useState("");
  const [industry, setIndustry] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function run() {
    const kws = text.split(/\n+/).map((s) => s.trim()).filter(Boolean);
    if (kws.length === 0) return;
    setLoading(true);
    setErr(null);
    setResult(null);
    try {
      const res = await fetch("/api/intent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ keywords: kws, industry: industry || undefined }),
      });
      if (!res.ok) throw new Error(await res.text());
      setResult(await res.json());
    } catch (e) {
      setErr(e instanceof Error ? e.message : "聚类失败");
    } finally {
      setLoading(false);
    }
  }

  function exportJson() {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "intent-clusters.json";
    a.click();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">关键词输入</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">行业（可选）</label>
              <input
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="如：法律服务 / 教育培训 / 金融"
                className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">关键词（每行一个，最多 100 个）</label>
              <Textarea
                rows={14}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="上海离婚律师推荐&#10;上海离婚律师收费&#10;离婚冷静期是什么&#10;..."
                className="font-mono text-sm"
              />
              <div className="mt-1 text-xs text-slate-500">
                当前 <span className="num">{text.split(/\n+/).filter((l) => l.trim()).length}</span> 个关键词
              </div>
            </div>
            <div>
              <div className="mb-2 text-xs font-medium text-slate-600">快捷示例</div>
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => setText(p.text)}
                    className="rounded-md border border-slate-200 px-2 py-1 text-xs hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={run} variant="primary" size="lg" className="w-full" disabled={loading || !text.trim()}>
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 聚类中…</>
              ) : (
                <><Target className="mr-2 h-4 w-4" /> 开始聚类</>
              )}
            </Button>
            {err && <div className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-950 dark:text-rose-300">{err}</div>}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {!result && !loading && (
          <div className="grid h-full min-h-96 place-items-center rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center dark:border-slate-800">
            <div>
              <Target className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm text-slate-500">粘贴你的关键词列表，AI 将聚类为意图簇并给出优先级建议。</p>
            </div>
          </div>
        )}
        {loading && (
          <div className="grid h-full min-h-96 place-items-center rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
              <p className="mt-3 text-sm text-slate-500">分析意图中…</p>
            </div>
          </div>
        )}
        {result && (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">聚类汇总</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline">耗时 <span className="num ml-1">{result.latencyMs}ms</span></Badge>
                    <Button size="sm" variant="ghost" onClick={exportJson}>
                      <Download className="mr-1 h-3 w-3" /> 导出 JSON
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <div className="num text-2xl font-semibold text-indigo-600">{result.summary.total_keywords}</div>
                    <div className="text-xs text-slate-500">关键词总数</div>
                  </div>
                  <div>
                    <div className="num text-2xl font-semibold text-violet-600">{result.summary.cluster_count}</div>
                    <div className="text-xs text-slate-500">意图簇数量</div>
                  </div>
                  <div>
                    <div className="text-xl font-semibold">{result.summary.top_intent_type}</div>
                    <div className="text-xs text-slate-500">主导意图类型</div>
                  </div>
                </div>
                <div className="mt-4 rounded-lg bg-indigo-50 p-3 text-sm text-indigo-900 dark:bg-indigo-950 dark:text-indigo-200">
                  💡 {result.summary.recommendation}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {result.clusters
                .sort((a, b) => b.priority - a.priority)
                .map((c) => (
                  <Card key={c.name} className="lift">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{c.name}</CardTitle>
                          <p className="mt-1 text-xs text-slate-500">{c.description}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="num text-2xl font-semibold text-indigo-600">{c.priority}/10</span>
                          <span className="text-[10px] text-slate-400">优先级</span>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <Badge className={TYPE_LABEL[c.intent_type]?.color ?? ""}>{TYPE_LABEL[c.intent_type]?.label ?? c.intent_type}</Badge>
                        <Badge variant="outline">
                          <span className={DIFFICULTY_LABEL[c.ai_difficulty]?.color ?? ""}>
                            AI 难度：{DIFFICULTY_LABEL[c.ai_difficulty]?.label ?? c.ai_difficulty}
                          </span>
                        </Badge>
                        <Badge variant="primary">📄 {c.recommended_format}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="text-xs font-medium text-slate-500">该簇关键词 ({c.keywords.length})</div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {c.keywords.map((k) => (
                            <Badge key={k} variant="outline" className="text-xs">{k}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-slate-500">🏆 竞争格局</div>
                        <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">{c.competitive_landscape}</p>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-slate-500">📌 必须包含的事实</div>
                        <ul className="mt-1 space-y-0.5 text-xs text-slate-700 dark:text-slate-300">
                          {c.key_facts_to_include.map((f, i) => (
                            <li key={i}>· {f}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>

            {result.ungrouped.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">未归类关键词</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {result.ungrouped.map((k) => (
                      <Badge key={k} variant="outline">{k}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50 dark:border-indigo-900 dark:from-indigo-950 dark:to-violet-950">
              <CardContent className="p-6 text-center">
                <Sparkles className="mx-auto h-6 w-6 text-indigo-600" />
                <p className="mt-2 text-sm text-indigo-900 dark:text-indigo-200">
                  把高优先级意图簇的关键词导出，到 <a href="/tools/generate" className="font-semibold underline">AI 生成工具</a> 批量生成 GEO 友好内容。
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
