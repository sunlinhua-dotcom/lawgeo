"use client";
import { useMemo, useState } from "react";
import { Download, Copy, Sparkles, Filter } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CASE_CATEGORIES } from "@/data/case-categories";
import { REGIONS, aiVisibility, type Region } from "@/data/regions";

const QUESTION_TEMPLATES = [
  "{city}{case}律师怎么收费",
  "{city}{case}律师推荐",
  "{city}{case}找哪家律所",
  "{city}{case}免费咨询",
  "{city}{case}哪个律所好",
  "{city}{case}怎么打官司",
];

type Row = {
  city: string;
  cityTier: number;
  parent: string;
  caseName: string;
  caseSlug: string;
  keyword: string;
  template: string;
  estVolume: number;
  aiMention: number;
  intent: "informational" | "commercial" | "transactional";
};

function intentFor(tpl: string): Row["intent"] {
  if (tpl.includes("收费") || tpl.includes("咨询") || tpl.includes("找哪家") || tpl.includes("推荐") || tpl.includes("哪个律所"))
    return "transactional";
  if (tpl.includes("怎么打") || tpl.includes("怎么")) return "commercial";
  return "informational";
}

function volumeFor(region: Region, parent: string, tplIdx: number): number {
  const tierBase = { 1: 1800, 2: 900, 3: 350 }[region.tier as 1 | 2 | 3];
  const parentBoost: Record<string, number> = {
    民事: 1.0,
    刑事: 0.7,
    "商事 / 公司": 0.8,
    劳动: 0.9,
    知识产权: 0.6,
    "涉外 / 跨境": 0.4,
    "互联网 / 新兴": 0.7,
    行政: 0.5,
  };
  const boost = parentBoost[parent] ?? 0.7;
  const tplPenalty = [1.0, 0.9, 0.75, 0.6, 0.5, 0.4][tplIdx] ?? 0.4;
  const seed = (region.slug + parent).split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  return Math.round(tierBase * boost * tplPenalty * (0.7 + ((seed % 60) / 100)));
}

export function MatrixTool() {
  const [selectedParents, setSelectedParents] = useState<string[]>(["民事", "劳动"]);
  const [selectedTiers, setSelectedTiers] = useState<number[]>([1, 2]);
  const [selectedTemplates, setSelectedTemplates] = useState<number[]>([0, 1, 2]);
  const [keywordFilter, setKeywordFilter] = useState("");
  const [sortBy, setSortBy] = useState<"volume" | "ai" | "alpha">("volume");

  const rows = useMemo<Row[]>(() => {
    const out: Row[] = [];
    const cities = REGIONS.filter((r) => selectedTiers.includes(r.tier));
    const cats = CASE_CATEGORIES.filter((c) => selectedParents.includes(c.parent));
    for (const region of cities) {
      const aiBase = aiVisibility(region, 50);
      for (const cat of cats) {
        for (const item of cat.items) {
          for (const tplIdx of selectedTemplates) {
            const tpl = QUESTION_TEMPLATES[tplIdx];
            const kw = tpl.replace("{city}", region.name).replace("{case}", item.name);
            if (keywordFilter && !kw.includes(keywordFilter)) continue;
            out.push({
              city: region.name,
              cityTier: region.tier,
              parent: cat.parent,
              caseName: item.name,
              caseSlug: item.slug,
              keyword: kw,
              template: tpl,
              estVolume: volumeFor(region, cat.parent, tplIdx),
              aiMention: Math.max(5, Math.min(95, aiBase - tplIdx * 3 + ((item.slug.length * 7) % 15))),
              intent: intentFor(tpl),
            });
          }
        }
      }
    }
    if (sortBy === "volume") out.sort((a, b) => b.estVolume - a.estVolume);
    else if (sortBy === "ai") out.sort((a, b) => b.aiMention - a.aiMention);
    else out.sort((a, b) => a.keyword.localeCompare(b.keyword, "zh"));
    return out;
  }, [selectedParents, selectedTiers, selectedTemplates, keywordFilter, sortBy]);

  const totalVolume = rows.reduce((s, r) => s + r.estVolume, 0);
  const avgAi = rows.length ? Math.round(rows.reduce((s, r) => s + r.aiMention, 0) / rows.length) : 0;

  function toggle<T>(set: T[], v: T, setter: (x: T[]) => void) {
    setter(set.includes(v) ? set.filter((x) => x !== v) : [...set, v]);
  }

  function exportCSV() {
    const header = ["城市", "城市级别", "案由门类", "案由", "关键词", "意图", "预估月搜索量", "AI 提及度"];
    const csv = [
      header.join(","),
      ...rows.map((r) => [r.city, `T${r.cityTier}`, r.parent, r.caseName, r.keyword, r.intent, r.estVolume, r.aiMention].join(",")),
    ].join("\n");
    download("matrix-keywords.csv", "text/csv;charset=utf-8", "﻿" + csv);
  }
  function exportMarkdown() {
    const md = [
      "| 城市 | 案由 | 关键词 | 意图 | 月搜索量 | AI 提及度 |",
      "|---|---|---|---|---|---|",
      ...rows.map((r) => `| ${r.city} | ${r.caseName} | ${r.keyword} | ${r.intent} | ${r.estVolume} | ${r.aiMention} |`),
    ].join("\n");
    download("matrix-keywords.md", "text/markdown;charset=utf-8", md);
  }
  function exportJsonLD() {
    const blocks = rows.slice(0, 50).map((r) => ({
      "@context": "https://schema.org",
      "@type": "Question",
      name: r.keyword,
      about: { "@type": "LegalService", name: `${r.city}${r.caseName}` },
    }));
    download("matrix-faq-schema.json", "application/json;charset=utf-8", JSON.stringify(blocks, null, 2));
  }

  function download(filename: string, mime: string, data: string) {
    const blob = new Blob([data], { type: mime });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function copyAll() {
    await navigator.clipboard.writeText(rows.map((r) => r.keyword).join("\n"));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      {/* 左侧筛选 */}
      <aside className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              <Filter className="mr-1 inline h-4 w-4" /> 筛选
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="mb-2 text-xs font-medium text-slate-500">案由门类</div>
              <div className="flex flex-wrap gap-1.5">
                {CASE_CATEGORIES.map((c) => (
                  <button
                    key={c.parent}
                    onClick={() => toggle(selectedParents, c.parent, setSelectedParents)}
                    className={`rounded-full px-2.5 py-1 text-xs transition-colors ${
                      selectedParents.includes(c.parent)
                        ? "bg-indigo-600 text-white"
                        : "border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                    }`}
                  >
                    {c.parent}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-2 text-xs font-medium text-slate-500">城市级别</div>
              <div className="flex gap-1.5">
                {[
                  { tier: 1, label: "一线" },
                  { tier: 2, label: "新一线" },
                  { tier: 3, label: "二三线" },
                ].map((t) => (
                  <button
                    key={t.tier}
                    onClick={() => toggle(selectedTiers, t.tier, setSelectedTiers)}
                    className={`flex-1 rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                      selectedTiers.includes(t.tier)
                        ? "bg-indigo-600 text-white"
                        : "border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-2 text-xs font-medium text-slate-500">问题模板</div>
              <div className="space-y-1.5">
                {QUESTION_TEMPLATES.map((tpl, i) => (
                  <label key={tpl} className="flex cursor-pointer items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={selectedTemplates.includes(i)}
                      onChange={() => toggle(selectedTemplates, i, setSelectedTemplates)}
                      className="rounded accent-indigo-600"
                    />
                    <span className="text-slate-700 dark:text-slate-300">{tpl}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-2 text-xs font-medium text-slate-500">关键词搜索</div>
              <input
                type="text"
                placeholder="如：北京、离婚、商标…"
                value={keywordFilter}
                onChange={(e) => setKeywordFilter(e.target.value)}
                className="h-9 w-full rounded-md border border-slate-200 px-3 text-xs dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">汇总</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">关键词总数</span>
              <span className="num font-semibold text-indigo-600">{rows.length.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">月搜索量合计</span>
              <span className="num font-semibold">{totalVolume.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">平均 AI 提及度</span>
              <span className="num font-semibold">{avgAi}</span>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <Button onClick={exportCSV} variant="primary" className="w-full">
            <Download className="mr-2 h-4 w-4" /> 导出 CSV
          </Button>
          <Button onClick={exportMarkdown} variant="outline" className="w-full">
            <Download className="mr-2 h-4 w-4" /> 导出 Markdown
          </Button>
          <Button onClick={exportJsonLD} variant="outline" className="w-full">
            <Download className="mr-2 h-4 w-4" /> 导出 FAQ JSON-LD
          </Button>
          <Button onClick={copyAll} variant="ghost" className="w-full">
            <Copy className="mr-2 h-4 w-4" /> 复制全部关键词
          </Button>
        </div>
      </aside>

      {/* 右侧矩阵 */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">排序：</span>
            {(["volume", "ai", "alpha"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setSortBy(k)}
                className={`rounded-md px-2.5 py-1 text-xs ${
                  sortBy === k
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "border border-slate-200 dark:border-slate-700"
                }`}
              >
                {k === "volume" ? "搜索量" : k === "ai" ? "AI 提及度" : "字母"}
              </button>
            ))}
          </div>
          <Button asChild size="sm" variant="primary">
            <Link href="/tools/generate">
              <Sparkles className="mr-1 h-3 w-3" /> 选关键词后批量 AI 生成
            </Link>
          </Button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3 text-left">关键词</th>
                <th className="px-3 py-3 text-left">城市</th>
                <th className="px-3 py-3 text-left">案由</th>
                <th className="px-3 py-3 text-right">月搜索量</th>
                <th className="px-3 py-3 text-right">AI 提及度</th>
                <th className="px-3 py-3 text-left">意图</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 300).map((r, i) => (
                <tr key={i} className="border-t border-slate-100 hover:bg-slate-50/50 dark:border-slate-800 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-2.5 font-medium">{r.keyword}</td>
                  <td className="px-3 py-2.5 text-slate-500">
                    {r.city} <span className="text-[10px] text-slate-400">T{r.cityTier}</span>
                  </td>
                  <td className="px-3 py-2.5 text-slate-500 text-xs">
                    <Badge variant="outline">{r.parent}</Badge> {r.caseName}
                  </td>
                  <td className="px-3 py-2.5 text-right num">{r.estVolume.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-right">
                    <span
                      className={`num inline-block rounded-full px-2 py-0.5 text-xs ${
                        r.aiMention >= 70
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                          : r.aiMention >= 40
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                            : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                      }`}
                    >
                      {r.aiMention}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-xs">
                    <Badge
                      variant={
                        r.intent === "transactional"
                          ? "primary"
                          : r.intent === "commercial"
                            ? "warning"
                            : "outline"
                      }
                    >
                      {r.intent === "transactional" ? "交易型" : r.intent === "commercial" ? "商业型" : "信息型"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length > 300 && (
            <div className="border-t border-slate-100 px-4 py-3 text-center text-xs text-slate-400 dark:border-slate-800">
              显示前 300 条，共 <span className="num">{rows.length.toLocaleString()}</span> 条。完整数据请导出。
            </div>
          )}
          {rows.length === 0 && (
            <div className="px-4 py-12 text-center text-sm text-slate-400">没有匹配的关键词，请调整筛选条件。</div>
          )}
        </div>
      </div>
    </div>
  );
}
