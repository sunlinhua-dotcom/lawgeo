"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Link2, Loader2, Copy, Trash2, BarChart3, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import type { ConversionLink, ConversionEvent } from "@/lib/db/schema";

const SOURCES = [
  { value: "ai-recommend", label: "AI 推荐（DeepSeek / Claude 等）" },
  { value: "ai-zhihu", label: "知乎 AI 引用" },
  { value: "ai-perplexity", label: "Perplexity 引用" },
  { value: "organic", label: "自然搜索" },
  { value: "zhihu", label: "知乎原文" },
  { value: "wechat", label: "公众号" },
  { value: "other", label: "其他" },
];

export function ConversionManager({
  initialLinks,
  initialEvents,
}: {
  initialLinks: ConversionLink[];
  initialEvents: ConversionEvent[];
}) {
  const router = useRouter();
  const [links, setLinks] = useState(initialLinks);
  const [targetUrl, setTargetUrl] = useState("");
  const [label, setLabel] = useState("");
  const [source, setSource] = useState("ai-recommend");
  const [campaign, setCampaign] = useState("");
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<{ shortCode: string } | null>(null);

  async function create() {
    if (!targetUrl) return;
    setBusy(true);
    try {
      const res = await fetch("/api/conversion/links", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ targetUrl, label, source, campaign }),
      });
      const data = await res.json();
      setCreated({ shortCode: data.shortCode });
      setTargetUrl("");
      setLabel("");
      setCampaign("");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function del(id: string) {
    if (!confirm("删除该短链？相关事件保留但归属丢失。")) return;
    await fetch("/api/conversion/links", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setLinks((l) => l.filter((x) => x.id !== id));
  }

  // 漏斗聚合
  const funnel = useMemo(() => {
    const c = { view: 0, click: 0, lead: 0, signup: 0, purchase: 0 };
    for (const e of initialEvents) {
      c[e.eventType as keyof typeof c]++;
    }
    return [
      { stage: "曝光 / 阅读", value: c.view, color: "#94a3b8" },
      { stage: "点击短链", value: c.click, color: "#6366f1" },
      { stage: "留资", value: c.lead, color: "#8b5cf6" },
      { stage: "注册 / 试用", value: c.signup, color: "#a855f7" },
      { stage: "签约 / 购买", value: c.purchase, color: "#10b981" },
    ];
  }, [initialEvents]);

  const bySource = useMemo(() => {
    const m = new Map<string, { source: string; clicks: number; conversions: number; value: number }>();
    for (const l of links) {
      const k = l.source ?? "other";
      const cur = m.get(k) ?? { source: k, clicks: 0, conversions: 0, value: 0 };
      cur.clicks += l.clicks;
      cur.conversions += l.conversions;
      cur.value += l.valueCents;
      m.set(k, cur);
    }
    return Array.from(m.values());
  }, [links]);

  const totalClicks = links.reduce((s, l) => s + l.clicks, 0);
  const totalConv = links.reduce((s, l) => s + l.conversions, 0);
  const totalValueYuan = links.reduce((s, l) => s + l.valueCents, 0) / 100;
  const cvr = totalClicks > 0 ? Math.round((totalConv / totalClicks) * 1000) / 10 : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="text-xs text-slate-500">短链总数</div>
            <div className="num mt-1 text-3xl font-semibold">{links.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-xs text-slate-500">总点击</div>
            <div className="num mt-1 text-3xl font-semibold text-indigo-600">{totalClicks.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-xs text-slate-500">转化数</div>
            <div className="num mt-1 text-3xl font-semibold text-emerald-600">{totalConv.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-xs text-slate-500">CVR / 价值</div>
            <div className="num mt-1 text-3xl font-semibold">
              {cvr}<span className="text-base text-slate-400">%</span>
            </div>
            <div className="text-xs text-slate-500">¥<span className="num">{totalValueYuan.toLocaleString()}</span></div>
          </CardContent>
        </Card>
      </div>

      {/* 漏斗 */}
      {initialEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              <BarChart3 className="mr-1 inline h-4 w-4" /> 30 天转化漏斗
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={funnel} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="stage" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {funnel.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* 按来源分组 */}
      {bySource.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              <TrendingUp className="mr-1 inline h-4 w-4" /> 按来源归因
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2 text-left">来源</th>
                    <th className="px-3 py-2 text-right">点击</th>
                    <th className="px-3 py-2 text-right">转化</th>
                    <th className="px-3 py-2 text-right">CVR</th>
                    <th className="px-3 py-2 text-right">价值 (¥)</th>
                  </tr>
                </thead>
                <tbody>
                  {bySource.map((row) => (
                    <tr key={row.source} className="border-t border-slate-100 dark:border-slate-800">
                      <td className="px-3 py-2 font-medium">
                        {SOURCES.find((s) => s.value === row.source)?.label ?? row.source}
                      </td>
                      <td className="px-3 py-2 text-right num">{row.clicks.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right num">{row.conversions.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right num">
                        {row.clicks > 0 ? ((row.conversions / row.clicks) * 100).toFixed(1) : 0}%
                      </td>
                      <td className="px-3 py-2 text-right num">{(row.value / 100).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 创建短链 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">创建追踪短链</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">目标 URL *</label>
            <Input
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://example.com/landing"
            />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">标签</label>
              <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="如：官方旗舰店 / 会员注册" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">来源</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
              >
                {SOURCES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">活动名</label>
              <Input value={campaign} onChange={(e) => setCampaign(e.target.value)} placeholder="2026Q1-beauty" />
            </div>
          </div>
          <Button onClick={create} disabled={busy || !targetUrl} variant="primary">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="mr-2 h-4 w-4" />}
            生成短链
          </Button>
          {created && (
            <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm dark:border-emerald-900 dark:bg-emerald-950">
              ✅ 已生成：<code className="text-emerald-700 dark:text-emerald-300">{location.origin}/r/{created.shortCode}</code>
              <Button
                size="sm"
                variant="ghost"
                className="ml-2"
                onClick={() => navigator.clipboard.writeText(`${location.origin}/r/${created.shortCode}`)}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 链接列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">所有短链</CardTitle>
        </CardHeader>
        <CardContent>
          {links.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              <Link2 className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3">还没有追踪链接。</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2 text-left">短链</th>
                    <th className="px-3 py-2 text-left">标签 / 来源</th>
                    <th className="px-3 py-2 text-right">点击</th>
                    <th className="px-3 py-2 text-right">转化</th>
                    <th className="px-3 py-2 text-right">价值</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {links.map((l) => (
                    <tr key={l.id} className="border-t border-slate-100 dark:border-slate-800">
                      <td className="px-3 py-2">
                        <code className="text-xs text-indigo-600">/r/{l.shortCode}</code>
                      </td>
                      <td className="px-3 py-2 text-xs">
                        <div className="font-medium">{l.label ?? "—"}</div>
                        <Badge variant="outline" className="mt-0.5">{l.source}</Badge>
                      </td>
                      <td className="px-3 py-2 text-right num">{l.clicks.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right num">{l.conversions.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right num">¥{(l.valueCents / 100).toLocaleString()}</td>
                      <td className="px-3 py-2">
                        <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(`${location.origin}/r/${l.shortCode}`)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-rose-600" onClick={() => del(l.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="rounded-xl bg-indigo-50 p-4 text-sm text-indigo-900 dark:bg-indigo-950 dark:text-indigo-200">
        💡 落地页埋点示例：
        <pre className="mt-2 text-xs bg-white/50 dark:bg-slate-900/50 p-2 rounded overflow-x-auto">{`// 留资成功后调用
fetch('/api/conversion/event', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    code: new URL(location.href).searchParams.get('lg_ref'),
    type: 'lead',
    value: 0
  })
})`}</pre>
      </div>
    </div>
  );
}
