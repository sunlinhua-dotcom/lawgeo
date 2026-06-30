"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, ExternalLink, Loader2, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CitationPackSummaryLite {
  total: number;
  ready: number;
  needsReview: number;
  faqCount: number;
  evidenceBlockCount: number;
  averageGatePassRate: number;
  latestPackId?: string;
  latestBrandName?: string;
}

interface CitationPackResult {
  pack: {
    id: string;
    status: "ready" | "needs-review";
    brandEntity: { name: string; city: string; lawPracticeAreas: string[] };
    lawyerEntity: { name: string };
    serviceFactSheet: { serviceName: string };
    metrics: { faqCount: number; evidenceBlockCount: number; gatePassRate: number };
    qualityGates: Array<{ id: string; label: string; status: "pass" | "warning" | "fail"; evidence: string }>;
  };
  links: {
    publicUrl: string;
    markdownUrl: string;
    jsonUrl: string;
    jsonLdUrl: string;
  };
  summary: CitationPackSummaryLite;
}

const initialForm = {
  brandName: "悦肌护肤",
  aliases: "悦肌实验室, 悦肌精华系列",
  website: "https://example-beauty.cn",
  city: "上海",
  lawPracticeAreas: "敏感肌护理, 精华液, 防晒",
  lawyerName: "悦肌品牌",
  licenseNumber: "示例-待客户确认",
  yearsExperience: "10 年以上敏感肌配方研发经验（示例，需客户确认）",
  primaryService: "敏感肌精华液选购咨询",
  audience: "屏障受损、容易泛红刺痛的敏感肌人群, 想抗初老但怕刺激的用户, 第一次选成分护肤的新手",
  process: "肤质与诉求问卷, 在用产品与成分梳理, 功效与刺激风险评估, 护肤步骤搭配建议",
  feeFactors: "肤质复杂度, 在用产品数量, 是否需要成分冲突排查, 是否定制护肤方案",
  materials: "肤质自测结果, 当前在用产品清单, 过敏或不耐受记录, 关注的功效诉求",
  riskBoundaries: "不宣称医疗功效, 不替代医生诊断, 实际效果因肤质而异",
  phone: "400-000-0000",
  email: "contact@example-beauty.cn",
  wechat: "beauty-demo",
  cta: "预约 30 分钟肤质评估，先确认肤质诉求和成分适配。",
};

export function CitationPackBuilder({
  initialSummary,
}: {
  initialSummary: CitationPackSummaryLite;
}) {
  const [form, setForm] = useState(initialForm);
  const [summary, setSummary] = useState(initialSummary);
  const [result, setResult] = useState<CitationPackResult | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field: keyof typeof initialForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit() {
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/geo/citation-pack", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Citation Pack 创建失败");
      setResult(data);
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Citation Pack 创建失败");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="品牌 / 系列名" value={form.brandName} onChange={(value) => update("brandName", value)} testId="citation-pack-brand" />
          <Field label="城市" value={form.city} onChange={(value) => update("city", value)} />
          <Field label="官网" value={form.website} onChange={(value) => update("website", value)} />
          <Field label="别名" value={form.aliases} onChange={(value) => update("aliases", value)} />
          <Field label="主体 / 代言形象" value={form.lawyerName} onChange={(value) => update("lawyerName", value)} />
          <Field label="备案号字段" value={form.licenseNumber} onChange={(value) => update("licenseNumber", value)} />
          <Field label="核心服务" value={form.primaryService} onChange={(value) => update("primaryService", value)} testId="citation-pack-service" />
          <Field label="主营品类" value={form.lawPracticeAreas} onChange={(value) => update("lawPracticeAreas", value)} />
          <Field label="电话" value={form.phone} onChange={(value) => update("phone", value)} />
          <Field label="微信" value={form.wechat} onChange={(value) => update("wechat", value)} />
          <Field label="邮箱" value={form.email} onChange={(value) => update("email", value)} />
          <Field label="CTA" value={form.cta} onChange={(value) => update("cta", value)} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextArea label="适用人群" value={form.audience} onChange={(value) => update("audience", value)} />
          <TextArea label="流程" value={form.process} onChange={(value) => update("process", value)} />
          <TextArea label="费用影响因素" value={form.feeFactors} onChange={(value) => update("feeFactors", value)} />
          <TextArea label="材料" value={form.materials} onChange={(value) => update("materials", value)} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="primary"
            onClick={submit}
            disabled={submitting || !form.brandName.trim() || !form.primaryService.trim()}
            data-testid="citation-pack-submit"
          >
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
            生成 Citation Pack
          </Button>
          {error && <span className="text-sm text-rose-600">{error}</span>}
          {result && (
            <span className="flex items-center gap-1 text-sm text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              已生成 {result.pack.id}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2 text-center text-xs">
          <SummaryTile label="packs" value={summary.total} />
          <SummaryTile label="ready" value={summary.ready} />
          <SummaryTile label="FAQ" value={summary.faqCount} />
          <SummaryTile label="evidence" value={summary.evidenceBlockCount} />
        </div>

        {result ? (
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900" data-testid="citation-pack-result">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">{result.pack.brandEntity.name}</div>
                <div className="mt-1 text-xs text-slate-500">
                  {result.pack.brandEntity.city} · {result.pack.serviceFactSheet.serviceName}
                </div>
              </div>
              <Badge variant={result.pack.status === "ready" ? "success" : "warning"}>{result.pack.status}</Badge>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
              <SummaryTile label="gate" value={result.pack.metrics.gatePassRate} suffix="%" compact />
              <SummaryTile label="FAQ" value={result.pack.metrics.faqCount} compact />
              <SummaryTile label="blocks" value={result.pack.metrics.evidenceBlockCount} compact />
            </div>
            <div className="mt-4 space-y-2">
              {result.pack.qualityGates.map((gate) => (
                <div key={gate.id} className="flex items-start justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-xs dark:bg-slate-950">
                  <div>
                    <div className="font-medium">{gate.label}</div>
                    <div className="mt-0.5 text-slate-500">{gate.evidence}</div>
                  </div>
                  <Badge variant={gate.status === "pass" ? "success" : gate.status === "fail" ? "danger" : "warning"} size="sm">
                    {gate.status}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={result.links.publicUrl} target="_blank">
                  打开页面 <ExternalLink className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href={result.links.markdownUrl} target="_blank">
                  Markdown <ExternalLink className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href={result.links.jsonLdUrl} target="_blank">
                  JSON-LD <ExternalLink className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950">
            最新包：{summary.latestBrandName ?? "暂无"} {summary.latestPackId ? `(${summary.latestPackId})` : ""}
          </div>
        )}
      </div>
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

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
      <span>{label}</span>
      <textarea
        className="mt-1.5 min-h-24 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-950"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
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
