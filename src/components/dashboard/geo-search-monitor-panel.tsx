"use client";

import Link from "next/link";
import { useState } from "react";
import { ExternalLink, Loader2, SearchCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchMonitorSummaryLite {
  total: number;
  done: number;
  providerCount: number;
  artifactCount: number;
  resultCount: number;
  brandResultCount: number;
  latestRunId?: string;
  latestProvider?: string;
  latestCadence?: string;
  latestNextRunAt?: string;
}

interface SearchMonitorRunLite {
  id: string;
  status: "done" | "partial" | "failed";
  brandName: string;
  provider: string;
  cadence: "manual" | "daily" | "weekly";
  queries: string[];
  metrics: {
    queryCount: number;
    resultCount: number;
    brandResultCount: number;
    artifactCount: number;
    averageRank: number | null;
  };
  artifacts: Array<{
    id: string;
    query: string;
    status: "captured" | "failed";
    statusCode?: number;
    artifactUrl?: string;
  }>;
  results: Array<{
    title: string;
    url: string;
    snippet: string;
    rank: number;
    mentionsBrand: boolean;
  }>;
}

interface SearchMonitorResponse {
  run: SearchMonitorRunLite;
  summary: SearchMonitorSummaryLite;
}

const initialForm = {
  brandName: "BrandGEO",
  queries: "BrandGEO 全行业 GEO\nBrandGEO AI 搜索优化\n美妆品牌 GEO 优化 BrandGEO",
  cadence: "daily",
};

export function GeoSearchMonitorPanel({
  initialSummary,
}: {
  initialSummary: SearchMonitorSummaryLite;
}) {
  const [form, setForm] = useState(initialForm);
  const [summary, setSummary] = useState(initialSummary);
  const [result, setResult] = useState<SearchMonitorRunLite | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/geo/search-monitor", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await response.json()) as SearchMonitorResponse & { error?: string };
      if (!response.ok) throw new Error(data.error || "Search Monitor 创建失败");
      setResult(data.run);
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search Monitor 创建失败");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
            <span>品牌名</span>
            <Input
              className="mt-1.5"
              value={form.brandName}
              onChange={(event) => setForm((current) => ({ ...current, brandName: event.target.value }))}
              data-testid="search-monitor-brand"
            />
          </label>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
            <span>频率</span>
            <select
              className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-950"
              value={form.cadence}
              onChange={(event) => setForm((current) => ({ ...current, cadence: event.target.value }))}
            >
              <option value="daily">daily</option>
              <option value="weekly">weekly</option>
              <option value="manual">manual</option>
            </select>
          </label>
        </div>
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
          <span>查询词</span>
          <textarea
            className="mt-1.5 min-h-28 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-950"
            value={form.queries}
            onChange={(event) => setForm((current) => ({ ...current, queries: event.target.value }))}
            data-testid="search-monitor-queries"
          />
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="primary"
            onClick={submit}
            disabled={submitting || !form.brandName.trim() || !form.queries.trim()}
            data-testid="search-monitor-submit"
          >
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <SearchCheck className="mr-2 h-4 w-4" />}
            运行搜索监测
          </Button>
          {error && <span className="text-sm text-rose-600">{error}</span>}
        </div>
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <SummaryTile label="runs" value={summary.total} />
          <SummaryTile label="artifacts" value={summary.artifactCount} />
          <SummaryTile label="results" value={summary.resultCount} />
          <SummaryTile label="brand" value={summary.brandResultCount} />
        </div>
      </div>

      {result ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900" data-testid="search-monitor-result">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">{result.brandName} · {result.provider}</div>
              <div className="mt-1 text-xs text-slate-500">
                {result.id} · {result.metrics.queryCount} queries · {result.metrics.resultCount} results
              </div>
            </div>
            <Badge variant={result.status === "done" ? "success" : result.status === "failed" ? "danger" : "warning"}>
              {result.status}
            </Badge>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
            <SummaryTile label="captured" value={result.metrics.artifactCount} compact />
            <SummaryTile label="brand" value={result.metrics.brandResultCount} compact />
            <SummaryTile label="avg rank" value={result.metrics.averageRank ?? 0} compact />
            <SummaryTile label="queries" value={result.metrics.queryCount} compact />
          </div>
          <div className="mt-4 space-y-2">
            {result.artifacts.map((artifact) => (
              <div key={artifact.id} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-xs dark:bg-slate-950">
                <div className="min-w-0">
                  <div className="truncate font-medium">{artifact.query}</div>
                  <div className="mt-0.5 text-slate-500">HTTP {artifact.statusCode ?? "n/a"} · {artifact.id}</div>
                </div>
                {artifact.artifactUrl ? (
                  <Link href={artifact.artifactUrl} target="_blank" className="shrink-0 text-indigo-600 hover:underline">
                    SERP <ExternalLink className="ml-1 inline h-3.5 w-3.5" />
                  </Link>
                ) : (
                  <Badge variant="danger" size="sm">failed</Badge>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            {result.results.slice(0, 4).map((item) => (
              <div key={`${item.rank}-${item.url}`} className="rounded-lg border border-slate-100 px-3 py-2 text-xs dark:border-slate-800">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 truncate font-medium">{item.rank}. {item.title}</div>
                  <Badge variant={item.mentionsBrand ? "success" : "outline"} size="sm">
                    {item.mentionsBrand ? "brand" : "neutral"}
                  </Badge>
                </div>
                <div className="mt-1 truncate text-slate-500">{item.url}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950">
          最新监测：{summary.latestRunId ?? "暂无"} {summary.latestProvider ? `(${summary.latestProvider})` : ""}
        </div>
      )}
    </div>
  );
}

function SummaryTile({
  label,
  value,
  compact = false,
}: {
  label: string;
  value: number;
  compact?: boolean;
}) {
  return (
    <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-950">
      <div className={compact ? "num text-base font-semibold" : "num text-lg font-semibold"}>{value}</div>
      <div className="text-slate-500">{label}</div>
    </div>
  );
}
