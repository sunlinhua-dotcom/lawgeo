"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, Trash2, Send, BellRing } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AlertSubscription, Project } from "@/lib/db/schema";

const TYPES = [
  { value: "citation_drop", label: "引用率下跌（>30%）" },
  { value: "top3_lost", label: "跌出 Top 3 推荐" },
  { value: "competitor_overtake", label: "竞品反超" },
  { value: "weekly_digest", label: "每周数据简报" },
];

export function AlertsManager({
  initialSubs,
  projects,
  defaultEmail,
}: {
  initialSubs: AlertSubscription[];
  projects: Project[];
  defaultEmail: string;
}) {
  const router = useRouter();
  const [subs, setSubs] = useState(initialSubs);
  const [type, setType] = useState<string>("citation_drop");
  const [email, setEmail] = useState(defaultEmail);
  const [projectId, setProjectId] = useState<string>("");
  const [busy, setBusy] = useState(false);

  async function add() {
    setBusy(true);
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ type, email, projectId: projectId || null }),
      });
      const data = await res.json();
      setSubs((s) => [
        ...s,
        {
          id: data.id,
          userId: "",
          projectId: projectId || null,
          type: type as AlertSubscription["type"],
          email,
          enabled: true,
          lastSentAt: null,
          createdAt: new Date(),
        } as AlertSubscription,
      ]);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function del(id: string) {
    if (!confirm("确定删除该告警订阅？")) return;
    await fetch("/api/alerts", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setSubs((s) => s.filter((x) => x.id !== id));
  }

  async function test(id: string) {
    const res = await fetch("/api/alerts", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const r = await res.json();
    alert(r.simulated ? "已模拟发送（未配置 RESEND_API_KEY）" : r.ok ? "测试邮件已发送" : "发送失败：" + r.error);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">添加告警订阅</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">告警类型</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
              >
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">绑定项目（可选）</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
              >
                <option value="">— 所有项目 —</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">接收邮箱</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
            </div>
            <div className="flex items-end">
              <Button onClick={add} variant="primary" disabled={busy || !email} className="w-full">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="mr-1 h-4 w-4" /> 添加</>}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">已订阅的告警</CardTitle>
        </CardHeader>
        <CardContent>
          {subs.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              <BellRing className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3">还没有订阅任何告警。</p>
            </div>
          ) : (
            <div className="space-y-2">
              {subs.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3 dark:border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <BellRing className="h-4 w-4 text-indigo-500" />
                    <Badge variant="primary">{TYPES.find((t) => t.value === s.type)?.label.split("（")[0] ?? s.type}</Badge>
                    <span className="text-sm text-slate-600">→ {s.email}</span>
                    {s.projectId && (
                      <Badge variant="outline">
                        {projects.find((p) => p.id === s.projectId)?.name ?? s.projectId.slice(0, 6)}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => test(s.id)}>
                      <Send className="mr-1 h-3 w-3" /> 测试
                    </Button>
                    <Button size="sm" variant="ghost" className="text-rose-600" onClick={() => del(s.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="rounded-xl bg-indigo-50 p-4 text-sm text-indigo-900 dark:bg-indigo-950 dark:text-indigo-200">
        💡 邮件使用 Resend 发送。在 <code className="text-xs">.env.local</code> 配置 <code className="text-xs">RESEND_API_KEY</code> 即可启用真实发送。未配置时进入「模拟发送」模式，会在服务器日志里打印告警内容。
      </div>
    </div>
  );
}
