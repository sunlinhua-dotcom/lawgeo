"use client";
import { useEffect, useState } from "react";
import { Plug, CheckCircle2, Circle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Overview {
  llm: { provider: string; gatewayEnabled: boolean; defaultModel: string };
  scraper: { provider: string; firecrawlEnabled: boolean };
  answerCrawler: { provider: string; realCapture: boolean };
  knowledge: { provider: string; ragflowEnabled: boolean };
  publisher: { provider: string; enabled: boolean };
}

const ROWS: Array<{
  key: keyof Overview;
  label: string;
  oss: string;
  enabledKey: string;
  doc: string;
}> = [
  { key: "llm", label: "模型网关", oss: "LiteLLM", enabledKey: "gatewayEnabled", doc: "LLM_GATEWAY_URL" },
  { key: "scraper", label: "网页抓取", oss: "Firecrawl", enabledKey: "firecrawlEnabled", doc: "FIRECRAWL_API_URL" },
  { key: "answerCrawler", label: "真机答案抓取", oss: "Skyvern/Steel", enabledKey: "realCapture", doc: "BROWSER_AGENT_URL" },
  { key: "knowledge", label: "知识库 RAG", oss: "RAGFlow", enabledKey: "ragflowEnabled", doc: "RAGFLOW_API_URL" },
  { key: "publisher", label: "海外发布", oss: "Postiz", enabledKey: "enabled", doc: "POSTIZ_API_URL" },
];

export function ProvidersStatus() {
  const [data, setData] = useState<Overview | null>(null);

  useEffect(() => {
    fetch("/api/providers/status")
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .catch(() => {});
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Plug className="h-4 w-4 text-indigo-500" /> OSS 集成状态
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1.5">
          {ROWS.map((row) => {
            const cap = data?.[row.key] as Record<string, unknown> | undefined;
            const on = !!cap?.[row.enabledKey];
            const provider = (cap?.provider as string) ?? "—";
            return (
              <div
                key={row.key}
                className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 dark:border-slate-800"
              >
                <div className="flex items-center gap-2">
                  {on ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Circle className="h-3.5 w-3.5 text-slate-300" />
                  )}
                  <span className="text-sm">{row.label}</span>
                  <span className="text-[10px] text-slate-400">/ {row.oss}</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="text-[10px] text-slate-400">{provider}</code>
                  <Badge variant={on ? "success" : "outline"} className="text-[10px]">
                    {on ? "已接入" : "内置兜底"}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-slate-500">
          配置对应环境变量即自动切换到外部 OSS，失败自动降级。接入手册见{" "}
          <code className="text-indigo-600">docs/oss-integration-setup.md</code>。
        </p>
      </CardContent>
    </Card>
  );
}
