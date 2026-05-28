"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  Code,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { AuditResult } from "@/lib/audit-types";

export function AuditTool() {
  const sp = useSearchParams();
  const [domain, setDomain] = useState(sp.get("d") ?? "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const d = sp.get("d");
    if (d) void run(d);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      setResult(await res.json());
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "诊断失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-indigo-100/30 dark:border-slate-800 dark:bg-slate-900">
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
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 诊断中…
              </>
            ) : (
              <>开始诊断 <ArrowRight className="ml-1 h-4 w-4" /></>
            )}
          </Button>
        </form>

        {err && (
          <div className="mt-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300">
            {err}
          </div>
        )}

        {result && <FullAuditView r={result} />}
      </div>
    </div>
  );
}

function FullAuditView({ r }: { r: AuditResult }) {
  const tone =
    r.score >= 80 ? "emerald" : r.score >= 60 ? "amber" : r.score >= 40 ? "orange" : "rose";
  const ringClass = {
    emerald: "ring-emerald-500/30 text-emerald-600",
    amber: "ring-amber-500/30 text-amber-600",
    orange: "ring-orange-500/30 text-orange-600",
    rose: "ring-rose-500/30 text-rose-600",
  }[tone];

  const pass = r.checks.filter((c) => c.status === "pass").length;
  const warn = r.checks.filter((c) => c.status === "warn").length;
  const fail = r.checks.filter((c) => c.status === "fail").length;

  return (
    <div className="mt-8 border-t border-slate-100 pt-8 dark:border-slate-800">
      {/* 总分 */}
      <div className="flex flex-col items-center gap-6 sm:flex-row">
        <div className={`grid h-32 w-32 flex-shrink-0 place-items-center rounded-full ring-8 ${ringClass}`}>
          <div className="text-center">
            <div className="text-4xl font-bold num">{r.score}</div>
            <div className="text-xs text-slate-500">/ 100</div>
          </div>
        </div>
        <div className="flex-1 text-center sm:text-left">
          <div className="text-sm uppercase tracking-wider text-slate-500">{r.domain}</div>
          <div className="mt-1 text-2xl font-semibold">{r.verdict}</div>
          <p className="mt-2 text-slate-600 dark:text-slate-400">{r.summary}</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs sm:justify-start">
            <Badge variant="success">✓ {pass} 通过</Badge>
            <Badge variant="warning">⚠ {warn} 警告</Badge>
            <Badge variant="default" className="bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300">✗ {fail} 缺失</Badge>
            <Badge variant="outline">耗时 <span className="num ml-1">{r.elapsedMs}ms</span></Badge>
          </div>
        </div>
      </div>

      {/* 操作 */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg" variant="primary" className="flex-1">
          <a href={`/api/audit/pdf?d=${encodeURIComponent(r.domain)}`} target="_blank" rel="noreferrer">
            <Download className="mr-2 h-4 w-4" /> 下载 PDF 报告
          </a>
        </Button>
        <Button asChild size="lg" variant="outline" className="flex-1">
          <Link href={`/tools/generate?d=${encodeURIComponent(r.domain)}`}>
            <Sparkles className="mr-2 h-4 w-4" /> 用 AI 生成优化内容
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="flex-1">
          <a href={`/api/audit?d=${encodeURIComponent(r.domain)}`} target="_blank" rel="noreferrer">
            <Code className="mr-2 h-4 w-4" /> 查看 JSON
          </a>
        </Button>
      </div>

      {/* 优先建议 */}
      {r.suggestions.length > 0 && (
        <div className="mt-8 rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50 p-6 dark:border-indigo-900 dark:from-indigo-950 dark:to-violet-950">
          <h3 className="mb-3 text-base font-semibold text-indigo-900 dark:text-indigo-100">
            🎯 优先优化建议（按 ROI 排序）
          </h3>
          <ol className="space-y-2">
            {r.suggestions.map((s, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-indigo-900 dark:text-indigo-200">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white num">{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* 详细检查 */}
      <div className="mt-8">
        <h3 className="mb-4 text-base font-semibold">详细检查 (<span className="num">{r.checks.length}</span> 项)</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {r.checks.map((c) => (
            <div
              key={c.id}
              className="flex items-start gap-3 rounded-lg border border-slate-100 px-4 py-3 dark:border-slate-800"
            >
              {c.status === "pass" ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" />
              ) : c.status === "warn" ? (
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
              ) : (
                <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-500" />
              )}
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{c.label}</div>
                <div className="mt-0.5 break-words text-xs text-slate-500">{c.detail}</div>
              </div>
              <Badge variant="outline" className="flex-shrink-0">
                <span className="num">{c.weight}</span> 分
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Meta 详情 */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-800">
          <div className="text-sm font-semibold">页面元数据</div>
          <dl className="mt-3 space-y-2 text-xs">
            <Row label="Title">{r.meta.title ?? "—"} {r.meta.titleLength && <span className="text-slate-400">({r.meta.titleLength} 字)</span>}</Row>
            <Row label="Description">{r.meta.description ?? "—"} {r.meta.descLength && <span className="text-slate-400">({r.meta.descLength} 字)</span>}</Row>
            <Row label="语言">{r.meta.lang ?? "未声明"}</Row>
            <Row label="H1 数量">{r.meta.h1Count}</Row>
            <Row label="正文字数（粗略）">{r.meta.wordCount}</Row>
            <Row label="canonical">{r.meta.canonical ?? "—"}</Row>
            <Row label="OG 标签">{r.meta.ogTags}</Row>
            <Row label="Twitter 标签">{r.meta.twitterTags}</Row>
          </dl>
        </div>
        <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-800">
          <div className="text-sm font-semibold">JSON-LD Schema</div>
          <div className="mt-3">
            <div className="mb-1 text-xs text-emerald-600">已发现 ({r.schemas.found.length})</div>
            <div className="flex flex-wrap gap-1.5">
              {r.schemas.found.length === 0 ? (
                <span className="text-xs text-slate-400">未发现任何 schema</span>
              ) : (
                r.schemas.found.map((t) => (
                  <Badge key={t} variant="success">
                    {t}
                  </Badge>
                ))
              )}
            </div>
            <div className="mt-4 mb-1 text-xs text-rose-600">建议补全 ({r.schemas.missing.length})</div>
            <div className="flex flex-wrap gap-1.5">
              {r.schemas.missing.map((t) => (
                <Badge key={t} variant="warning">{t}</Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <dt className="w-24 flex-shrink-0 text-slate-500">{label}</dt>
      <dd className="flex-1 break-words text-slate-900 dark:text-slate-100">{children}</dd>
    </div>
  );
}
