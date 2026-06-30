"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Loader2, Radar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LiveAuditCheck {
  id: string;
  label: string;
  status: "pass" | "warning" | "fail";
  evidence: string;
  score: number;
  maxScore: number;
}

interface LiveAuditLayer {
  id: string;
  label: string;
  score: number;
  status: "healthy" | "partial" | "critical";
}

interface LiveAuditResult {
  score: number;
  canonicalUrl: string;
  layers: LiveAuditLayer[];
  liveChecks: LiveAuditCheck[];
  crawled: {
    homepageStatus?: number;
    robotsStatus?: number;
    sitemapStatus?: number;
    sitemapUrlCount: number;
    markdownStatus?: number;
    llmsStatus?: number;
    aiIndexStatus?: number;
    latencyMs: number;
  };
  understood: {
    schemaTypes: string[];
    bodyTextLength: number;
    h1Count: number;
    h2Count: number;
    scriptCount: number;
  };
  limitations: string[];
}

export function GeoLiveAuditPanel({ defaultSiteUrl }: { defaultSiteUrl: string }) {
  const [siteUrl, setSiteUrl] = useState(defaultSiteUrl);
  const [result, setResult] = useState<LiveAuditResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function runAudit() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/geo/audit-v2?siteUrl=${encodeURIComponent(siteUrl)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Audit v2 运行失败");
      setResult(data.liveAudit);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Audit v2 运行失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-4">
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
          <span>审计 URL</span>
          <Input
            className="mt-1.5"
            value={siteUrl}
            onChange={(event) => setSiteUrl(event.target.value)}
            data-testid="geo-live-audit-url"
          />
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="primary"
            onClick={runAudit}
            disabled={loading || !siteUrl.trim()}
            data-testid="geo-live-audit-run"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Radar className="mr-2 h-4 w-4" />}
            运行实时 Audit v2
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/api/geo/audit-v2?siteUrl=${encodeURIComponent(siteUrl)}`} target="_blank">
              打开 JSON <ExternalLink className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          {error && <span className="text-sm text-rose-600">{error}</span>}
        </div>

        {result && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-950" data-testid="geo-live-audit-result">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-medium">{result.canonicalUrl}</div>
                <div className="mt-1 text-xs text-slate-500">
                  robots {result.crawled.robotsStatus ?? "—"} · sitemap {result.crawled.sitemapStatus ?? "—"} · markdown {result.crawled.markdownStatus ?? "—"}
                </div>
              </div>
              <Badge variant={result.score >= 80 ? "success" : result.score >= 50 ? "warning" : "danger"}>{result.score}/100</Badge>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
              <Tile label="sitemap URLs" value={result.crawled.sitemapUrlCount} />
              <Tile label="schema" value={result.understood.schemaTypes.length} />
              <Tile label="text" value={result.understood.bodyTextLength} />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {result ? (
          <>
            <div className="grid gap-2 sm:grid-cols-4">
              {result.layers.map((layer) => (
                <div key={layer.id} className="rounded-lg bg-slate-50 px-3 py-2 text-xs dark:bg-slate-950">
                  <div className="uppercase tracking-wide text-slate-400">{layer.label}</div>
                  <div className="num mt-1 text-xl font-semibold">{layer.score}</div>
                  <Badge variant={layer.status === "healthy" ? "success" : layer.status === "partial" ? "warning" : "danger"} size="sm">
                    {layer.status}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {result.liveChecks.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{item.label}</div>
                      <div className="mt-1 text-xs leading-relaxed text-slate-500">{item.evidence}</div>
                    </div>
                    <Badge variant={item.status === "pass" ? "success" : item.status === "warning" ? "warning" : "danger"}>
                      {item.score}/{item.maxScore}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950">
            点击运行后会检查 robots、sitemap、HTML、headers、Markdown twin、llms、ai-index、schema、正文结构、证据密度和负面信号。
          </div>
        )}
      </div>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-white p-2 dark:bg-slate-900">
      <div className="num text-lg font-semibold">{value}</div>
      <div className="text-slate-500">{label}</div>
    </div>
  );
}
