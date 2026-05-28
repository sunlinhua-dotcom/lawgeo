"use client";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
} from "recharts";

export function ScoreTrendChart({ data }: { data: Array<{ date: string; score: number }> }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748b" }} />
        <Tooltip
          contentStyle={{ borderRadius: 8, fontSize: 12 }}
          labelStyle={{ fontWeight: 600 }}
        />
        <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} fill="url(#scoreFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CitationTrendChart({
  data,
}: {
  data: Array<{ date: string; cited: number; total: number; rate: number }>;
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
        <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} />
        <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
        <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="cited" stroke="#10b981" strokeWidth={2} name="被引用次数" />
        <Line type="monotone" dataKey="total" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 4" name="查询总数" />
        <Line type="monotone" dataKey="rate" stroke="#6366f1" strokeWidth={2} name="引用率 %" />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function PlatformBarChart({
  data,
}: {
  data: Array<{ platform: string; cited: number; total: number }>;
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
        <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
        <XAxis dataKey="platform" tick={{ fontSize: 11, fill: "#64748b" }} />
        <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
        <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="total" fill="#cbd5e1" name="查询总数" radius={[4, 4, 0, 0]} />
        <Bar dataKey="cited" fill="#6366f1" name="被引用" radius={[4, 4, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={i % 2 === 0 ? "#6366f1" : "#8b5cf6"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
