"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, ExternalLink, Loader2, Route } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface GeoMvpFunnelSummaryLite {
  total: number;
  done: number;
  warning: number;
  latestRunId?: string;
  latestBrandName?: string;
  latestPackId?: string;
  latestCitationRunId?: string;
  latestAuditScore?: number;
  latestAverageAbsorption?: number;
}

interface GeoMvpFunnelResult {
  run: {
    id: string;
    status: "done" | "warning" | "failed";
    brandName: string;
    serviceName: string;
    packId: string;
    citationRunId: string;
    reportId: string;
    steps: Array<{
      id: string;
      label: string;
      status: "done" | "warning" | "failed";
      evidence: string;
      link?: string;
    }>;
    metrics: {
      auditScore: number;
      promptCount: number;
      snapshotCount: number;
      mentionRate: number;
      top3Rate: number;
      averageAbsorption: number;
      missingBlocks: number;
      actionItems: number;
    };
    links: {
      citationPack: string;
      markdown: string;
      jsonLd: string;
      citationRun: string;
      reportJson: string;
      reportHtml: string;
      reportPdf: string;
    };
  };
  summary: GeoMvpFunnelSummaryLite;
}

const initialForm = {
  brandName: "悦肌护肤",
  siteUrl: "http://localhost:4648",
  city: "上海",
  primaryService: "敏感肌精华液选购咨询",
  lawyerName: "悦肌品牌",
  lawPracticeAreas: "敏感肌护理, 精华液, 防晒",
  phone: "400-881-4648",
  email: "contact@brandgeo.cn",
  wechat: "brandgeo-demo",
};

export function GeoMvpFunnelWizard({
  initialSummary,
}: {
  initialSummary: GeoMvpFunnelSummaryLite;
}) {
  const [form, setForm] = useState(initialForm);
  const [summary, setSummary] = useState(initialSummary);
  const [result, setResult] = useState<GeoMvpFunnelResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function update(field: keyof typeof initialForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit() {
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/geo/funnel", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "MVP Funnel 创建失败");
      setResult(data);
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "MVP Funnel 创建失败");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="品牌 / 系列名" value={form.brandName} onChange={(value) => update("brandName", value)} testId="geo-funnel-brand" />
          <Field label="目标站点" value={form.siteUrl} onChange={(value) => update("siteUrl", value)} testId="geo-funnel-site" />
          <Field label="城市" value={form.city} onChange={(value) => update("city", value)} />
          <Field label="核心服务" value={form.primaryService} onChange={(value) => update("primaryService", value)} testId="geo-funnel-service" />
          <Field label="主体 / 代言形象" value={form.lawyerName} onChange={(value) => update("lawyerName", value)} />
          <Field label="主营品类" value={form.lawPracticeAreas} onChange={(value) => update("lawPracticeAreas", value)} />
          <Field label="电话" value={form.phone} onChange={(value) => update("phone", value)} />
          <Field label="微信" value={form.wechat} onChange={(value) => update("wechat", value)} />
          <Field label="邮箱" value={form.email} onChange={(value) => update("email", value)} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="primary"
            onClick={submit}
            disabled={submitting || !form.brandName.trim() || !form.siteUrl.trim()}
            data-testid="geo-funnel-submit"
          >
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Route className="mr-2 h-4 w-4" />}
            运行端到端向导
          </Button>
          {error && <span className="text-sm text-rose-600">{error}</span>}
          {result && (
            <span className="flex items-center gap-1 text-sm text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              已生成 {result.run.id}
            </span>
          )}
        </div>
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <SummaryTile label="runs" value={summary.total} />
          <SummaryTile label="done" value={summary.done} />
          <SummaryTile label="audit" value={summary.latestAuditScore ?? 0} />
          <SummaryTile label="abs" value={summary.latestAverageAbsorption ?? 0} />
        </div>
      </div>

      {result ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900" data-testid="geo-funnel-result">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">{result.run.brandName}</div>
              <div className="mt-1 text-xs text-slate-500">
                {result.run.serviceName} · {result.run.citationRunId}
              </div>
            </div>
            <Badge variant={result.run.status === "done" ? "success" : result.run.status === "failed" ? "danger" : "warning"}>
              {result.run.status}
            </Badge>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
            <SummaryTile label="audit" value={result.run.metrics.auditScore} compact />
            <SummaryTile label="snapshots" value={result.run.metrics.snapshotCount} compact />
            <SummaryTile label="top3" value={result.run.metrics.top3Rate} suffix="%" compact />
            <SummaryTile label="abs" value={result.run.metrics.averageAbsorption} compact />
          </div>
          <div className="mt-4 space-y-2">
            {result.run.steps.map((step) => (
              <div key={step.id} className="flex items-start justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-xs dark:bg-slate-950">
                <div>
                  <div className="font-medium">{step.label}</div>
                  <div className="mt-0.5 text-slate-500">{step.evidence}</div>
                </div>
                <Badge variant={step.status === "done" ? "success" : step.status === "failed" ? "danger" : "warning"} size="sm">
                  {step.status}
                </Badge>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <ActionLink href={result.run.links.citationPack} label="Citation Pack" />
            <ActionLink href={result.run.links.citationRun} label="Run JSON" />
            <ActionLink href={result.run.links.reportHtml} label="HTML 报告" />
            <ActionLink href={result.run.links.reportPdf} label="PDF" />
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950">
          最新闭环：{summary.latestBrandName ?? "暂无"} {summary.latestRunId ? `(${summary.latestRunId})` : ""}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  testId,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  testId?: string;
}) {
  return (
    <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
      <span>{label}</span>
      <Input className="mt-1.5" value={value} onChange={(event) => onChange(event.target.value)} data-testid={testId} />
    </label>
  );
}

function ActionLink({ href, label }: { href: string; label: string }) {
  return (
    <Button asChild variant="outline" size="sm">
      <Link href={href} target="_blank">
        {label} <ExternalLink className="ml-1 h-4 w-4" />
      </Link>
    </Button>
  );
}

function SummaryTile({
  label,
  value,
  suffix = "",
  compact = false,
}: {
  label: string;
  value: number;
  suffix?: string;
  compact?: boolean;
}) {
  return (
    <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-950">
      <div className={compact ? "num text-base font-semibold" : "num text-lg font-semibold"}>
        {value}{suffix}
      </div>
      <div className="text-slate-500">{label}</div>
    </div>
  );
}
