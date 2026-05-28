"use client";
import { useState } from "react";
import { Search, Loader2, CheckCircle2, XCircle, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import type { AuditResult } from "@/lib/audit-types";

const SAMPLES = ["aceflow.top", "deepseek.com", "anthropic.com"];

export function HomeAuditDemo() {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function run(d?: string) {
    const target = (d ?? domain).trim();
    if (!target) return;
    setLoading(true);
    setErr(null);
    setResult(null);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ domain: target }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as AuditResult;
      setResult(data);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "诊断失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-indigo-100/30 dark:border-slate-800 dark:bg-slate-900 dark:shadow-indigo-950/30">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void run();
          }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="输入你的域名，如 yourlawfirm.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="h-12 pl-10 text-base"
              disabled={loading}
            />
          </div>
          <Button type="submit" size="lg" variant="primary" disabled={loading || !domain.trim()}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                诊断中…
              </>
            ) : (
              <>
                开始诊断 <ArrowRight className="ml-1 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          示例：
          {SAMPLES.map((s) => (
            <button
              key={s}
              onClick={() => {
                setDomain(s);
                void run(s);
              }}
              disabled={loading}
              className="rounded-md border border-slate-200 px-2 py-1 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              {s}
            </button>
          ))}
        </div>

        {err && (
          <div className="mt-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300">
            {err}
          </div>
        )}

        {result && <AuditResultView r={result} />}
      </div>
    </div>
  );
}

function AuditResultView({ r }: { r: AuditResult }) {
  const tone =
    r.score >= 80 ? "emerald" : r.score >= 60 ? "amber" : r.score >= 40 ? "orange" : "rose";
  const ringClass = {
    emerald: "ring-emerald-500/30 text-emerald-600",
    amber: "ring-amber-500/30 text-amber-600",
    orange: "ring-orange-500/30 text-orange-600",
    rose: "ring-rose-500/30 text-rose-600",
  }[tone];

  return (
    <div className="mt-6 border-t border-slate-100 pt-6 dark:border-slate-800">
      <div className="flex items-center gap-6">
        <div className={`grid h-24 w-24 place-items-center rounded-full ring-8 ${ringClass}`}>
          <div className="text-3xl font-bold num">{r.score}</div>
        </div>
        <div className="flex-1">
          <div className="text-sm text-slate-500">{r.domain} 的 GEO 得分</div>
          <div className="mt-1 text-lg font-semibold">{r.verdict}</div>
          <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">{r.summary}</div>
        </div>
      </div>

      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        {r.checks.map((c) => (
          <div
            key={c.id}
            className="flex items-start gap-2 rounded-lg border border-slate-100 px-3 py-2.5 text-sm dark:border-slate-800"
          >
            {c.status === "pass" ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
            ) : c.status === "warn" ? (
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
            ) : (
              <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-500" />
            )}
            <div className="flex-1">
              <div className="font-medium">{c.label}</div>
              <div className="text-xs text-slate-500">{c.detail}</div>
            </div>
          </div>
        ))}
      </div>

      {r.suggestions.length > 0 && (
        <div className="mt-6 rounded-xl bg-indigo-50/50 p-4 dark:bg-indigo-950/30">
          <div className="mb-2 text-sm font-semibold text-indigo-900 dark:text-indigo-200">
            🎯 优先优化建议
          </div>
          <ul className="space-y-1.5">
            {r.suggestions.slice(0, 5).map((s, i) => (
              <li key={i} className="text-sm text-indigo-900/80 dark:text-indigo-300">
                {i + 1}. {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg" variant="primary" className="flex-1">
          <Link href={`/tools/audit?d=${encodeURIComponent(r.domain)}`}>
            查看完整诊断报告 <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="flex-1">
          <Link href={`/api/audit/pdf?d=${encodeURIComponent(r.domain)}`}>下载 PDF 报告</Link>
        </Button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
        <Badge variant="outline">免费</Badge>
        <Badge variant="outline">{r.scannedAt}</Badge>
        <Badge variant="outline">耗时 <span className="num ml-1">{r.elapsedMs}ms</span></Badge>
      </div>
    </div>
  );
}
