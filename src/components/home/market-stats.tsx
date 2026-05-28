"use client";
import { TrendingUp } from "lucide-react";
import Link from "next/link";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { Badge } from "@/components/ui/badge";

const globalSize = [
  { year: "2024", v: 12.5 },
  { year: "2025", v: 28.4 },
  { year: "2026", v: 50.0 },
  { year: "2027", v: 76.2 },
  { year: "2028", v: 108.0 },
];

const chinaSize = [
  { year: "2024", v: 38 },
  { year: "2025", v: 96 },
  { year: "2026", v: 175 },
  { year: "2027", v: 268 },
  { year: "2028", v: 380 },
];

const aiVsSearch = [
  { year: "2024", ai: 12, search: 88 },
  { year: "2025", ai: 28, search: 72 },
  { year: "2026", ai: 38, search: 62 },
  { year: "2027", ai: 46, search: 54 },
  { year: "2028", ai: 50, search: 50 },
];

export function MarketStats() {
  return (
    <section className="border-b border-slate-100 bg-slate-50/30 dark:border-slate-900 dark:bg-slate-950/30">
      <div className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <div className="mb-14 text-center">
          <Badge variant="primary" className="mb-3">
            <TrendingUp className="mr-1 h-3 w-3" /> 市场爆发式增长
          </Badge>
          <h2 className="text-3xl font-semibold tracking-tight lg:text-4xl">
            GEO 成为品牌<span className="gradient-text">必争之地</span>
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400">
            搜索流量正在从传统引擎不可逆转地迁移到大模型。这是 SEO 之后的下一个十年。
          </p>
        </div>

        {/* 4 个关键数据 */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-16">
          <Stat value="215%" label="2025 GEO 市场同比增长" source="艾瑞咨询" />
          <Stat value="50%" label="2028 AI 蚕食搜索流量比例" source="Gartner" tone="violet" />
          <Stat value="$50B" label="2026 全球 AI 搜索市场规模" source="Statista" tone="fuchsia" />
          <Stat value="65%" label="北美 AI 搜索使用率" source="Pew Research" tone="rose" />
        </div>

        {/* 3 张图表 */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard title="全球 GEO 市场规模" unit="亿美元">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={globalSize} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="v" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="中国 GEO 市场规模" unit="亿人民币">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chinaSize} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="v" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="AI 搜索 vs 传统搜索流量占比" unit="%" full>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={aiVsSearch} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="ai" stroke="#6366f1" strokeWidth={3} name="AI 搜索" />
                <Line type="monotone" dataKey="search" stroke="#cbd5e1" strokeWidth={3} name="传统搜索" strokeDasharray="6 6" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/market-insights"
            className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:underline"
          >
            查看完整行业洞察报告 →
          </Link>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label, source, tone = "indigo" }: { value: string; label: string; source: string; tone?: string }) {
  const colorClass = {
    indigo: "text-indigo-600",
    violet: "text-violet-600",
    fuchsia: "text-fuchsia-600",
    rose: "text-rose-600",
  }[tone] ?? "text-indigo-600";
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900">
      <div className={`num text-4xl font-semibold lg:text-5xl ${colorClass}`}>{value}</div>
      <div className="mt-2 text-sm text-slate-700 dark:text-slate-300">{label}</div>
      <div className="mt-1 text-xs text-slate-400">来源：{source}</div>
    </div>
  );
}

function ChartCard({
  title,
  unit,
  children,
  full = false,
}: {
  title: string;
  unit: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 ${full ? "lg:col-span-2" : ""}`}>
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-base font-semibold">{title}</h3>
        <span className="text-xs text-slate-500">单位：{unit}</span>
      </div>
      {children}
    </div>
  );
}
