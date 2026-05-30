"use client";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LabelList,
} from "recharts";

export function BrandRadarChart({ data }: { data: Array<{ dim: string; value: number }> }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart data={data}>
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis dataKey="dim" tick={{ fontSize: 11, fill: "#64748b" }} />
        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
        <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.35} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

const SENT_COLORS = { positive: "#10b981", neutral: "#94a3b8", negative: "#f43f5e" };

export function SentimentPie({ data }: { data: { positive: number; neutral: number; negative: number } }) {
  const arr = [
    { name: "正面", key: "positive", value: data.positive },
    { name: "中性", key: "neutral", value: data.neutral },
    { name: "负面", key: "negative", value: data.negative },
  ].filter((d) => d.value > 0);
  if (arr.length === 0) return <div className="grid h-[200px] place-items-center text-sm text-slate-400">暂无情绪数据</div>;
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={arr} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2}>
          {arr.map((d) => (
            <Cell key={d.key} fill={SENT_COLORS[d.key as keyof typeof SENT_COLORS]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

/** 转化漏斗：曝光→提及→Top3→追问→命中 */
export function ConversionFunnel({ data }: { data: Array<{ stage: string; value: number }> }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} layout="vertical" margin={{ left: 20, right: 40 }}>
        <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} />
        <YAxis type="category" dataKey="stage" tick={{ fontSize: 11, fill: "#64748b" }} width={80} />
        <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
        <Bar dataKey="value" radius={[0, 6, 6, 0]} fill="#6366f1">
          <LabelList dataKey="value" position="right" style={{ fontSize: 11, fill: "#475569" }} />
          {data.map((_, i) => (
            <Cell key={i} fill={`hsl(${245 - i * 20}, 70%, ${60 - i * 3}%)`} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
