"use client";
import { useState } from "react";
import { Loader2, Play, Workflow, Sparkles, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface AgentDef {
  id: string;
  name: string;
  role: string;
  desc: string;
  inputs: Record<string, string>;
}
interface Pipeline {
  id: string;
  name: string;
  desc: string;
  steps: Array<{ agent: string; label: string }>;
}

export function AgentsConsole({ agents, pipelines }: { agents: AgentDef[]; pipelines: Pipeline[] }) {
  const [tab, setTab] = useState<"single" | "pipeline">("single");
  const [selected, setSelected] = useState<string>(agents[0]?.id ?? "");
  const agent = agents.find((a) => a.id === selected);

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button
          onClick={() => setTab("single")}
          className={`rounded-md px-3 py-1.5 text-sm ${
            tab === "single" ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "border border-slate-200 dark:border-slate-700"
          }`}
        >
          🤖 单 Agent 调用
        </button>
        <button
          onClick={() => setTab("pipeline")}
          className={`rounded-md px-3 py-1.5 text-sm ${
            tab === "pipeline" ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "border border-slate-200 dark:border-slate-700"
          }`}
        >
          🔄 Pipeline 编排
        </button>
      </div>

      {tab === "single" ? (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-1">
            {agents.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelected(a.id)}
                className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-colors ${
                  selected === a.id
                    ? "bg-indigo-50 border border-indigo-300 text-indigo-900 dark:bg-indigo-950 dark:border-indigo-700 dark:text-indigo-200"
                    : "border border-transparent hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-medium truncate">{a.name}</span>
                  {a.id === "cake-chief" && <Badge variant="primary" className="text-[10px]">首席</Badge>}
                </div>
                <div className="text-[10px] text-slate-500 truncate">{a.role}</div>
              </button>
            ))}
          </aside>
          <div>{agent && <AgentRunner key={agent.id} agent={agent} />}</div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {pipelines.map((p) => (
            <Card key={p.id} className="lift">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Workflow className="h-5 w-5 text-indigo-600" />
                  {p.name}
                </CardTitle>
                <p className="text-xs text-slate-500">{p.desc}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5 text-xs">
                  {p.steps.map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="num flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-medium dark:bg-slate-800">
                        {i + 1}
                      </span>
                      <span>{s.label}</span>
                      <Badge variant="outline" className="text-[10px] ml-auto">{s.agent}</Badge>
                    </div>
                  ))}
                </div>
                <Button
                  className="mt-4 w-full"
                  variant="primary"
                  onClick={() => alert("Pipeline 模式需要先填入各步骤的输入。当前推荐使用「单 Agent 调用」逐步跑。")}
                >
                  <Play className="mr-1 h-3 w-3" /> 启动 Pipeline
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function AgentRunner({ agent }: { agent: AgentDef }) {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; output?: unknown; error?: string; latencyMs: number } | null>(null);

  async function run() {
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch("/api/agents/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ agentId: agent.id, inputs }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setResult({ ok: false, error: e instanceof Error ? e.message : "调用失败", latencyMs: 0 });
    } finally {
      setBusy(false);
    }
  }

  const inputKeys = Object.entries(agent.inputs);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className={`grid h-10 w-10 place-items-center rounded-lg ${agent.id === "cake-chief" ? "bg-gradient-to-br from-amber-400 to-rose-500" : "bg-gradient-to-br from-indigo-500 to-violet-500"} text-white`}>
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>{agent.name}</CardTitle>
              <Badge variant="primary" className="mt-1">{agent.role}</Badge>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{agent.desc}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {inputKeys.length === 0 ? (
            <div className="text-sm text-slate-500">该 Agent 无需输入，直接运行。</div>
          ) : (
            inputKeys.map(([key, label]) => (
              <div key={key}>
                <label className="mb-1 block text-xs font-medium text-slate-600">{label}</label>
                {label.includes("内容") || label.includes("text") || key === "body" || key === "text" ? (
                  <Textarea
                    rows={4}
                    value={inputs[key] ?? ""}
                    onChange={(e) => setInputs({ ...inputs, [key]: e.target.value })}
                    placeholder={label}
                  />
                ) : (
                  <Input
                    value={inputs[key] ?? ""}
                    onChange={(e) => setInputs({ ...inputs, [key]: e.target.value })}
                    placeholder={label}
                  />
                )}
              </div>
            ))
          )}
          <Button onClick={run} disabled={busy} variant="primary" size="lg" className="w-full">
            {busy ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 运行中…</>
            ) : (
              <><Play className="mr-2 h-4 w-4" /> 调用 {agent.name}</>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                {result.ok ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <XCircle className="h-5 w-5 text-rose-500" />}
                运行结果
              </span>
              <Badge variant="outline">耗时 <span className="num ml-1">{result.latencyMs}ms</span></Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.error && (
              <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                {result.error}
              </div>
            )}
            {result.output != null && (
              <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-900 p-4 text-xs text-emerald-300">
                {typeof result.output === "string" ? result.output : JSON.stringify(result.output, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
