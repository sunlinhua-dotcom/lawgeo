import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema, articleSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "GEO vs SEO — 两条赛道的本质差异",
  description: "GEO 与 SEO 的本质差异：SEO 优化搜索结果排名争夺点击；GEO 优化 AI 答案里的引用份额。完整对比清单与建设顺序建议。",
  alternates: { canonical: "/geo-vs-seo" },
};

const compareRows = [
  { dim: "优化对象", seo: "Google / Baidu 搜索结果排名", geo: "AI 答案中的引用份额与位置" },
  { dim: "核心指标", seo: "排名 / 点击率 / 流量", geo: "引用率 / Top3 / 品牌提及次数" },
  { dim: "技术手段", seo: "外链 / E-A-T / 关键词密度", geo: "schema.org / llms.txt / 事实密度 / 多平台共现" },
  { dim: "内容结构", seo: "长文 / SEO 内链", geo: "FAQ / TL;DR / HowTo / 对比表 / 首段直答" },
  { dim: "见效周期", seo: "3–6 个月", geo: "实时层 1–3 周 · 训练层 3–6 个月" },
  { dim: "结果信号", seo: "GSC / 流量分析", geo: "AI 平台问答抽样监测" },
];

export default function GeoVsSeoPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "首页", path: "/" }, { name: "GEO vs SEO", path: "/geo-vs-seo" }]),
          articleSchema({
            title: "GEO vs SEO — 两条赛道的本质差异",
            description: "GEO 与 SEO 的核心差异、信号、建设顺序",
            path: "/geo-vs-seo",
          }),
        ]}
      />
      <PageHero
        badge="方法论"
        title={<>GEO vs SEO：<span className="gradient-text">两条赛道</span>的本质差异</>}
        description="它们都关心「让你被搜到」，但搜的对象不同——一个是搜索引擎结果页，一个是 AI 答案里的引用。"
      />
      <section className="mx-auto max-w-4xl px-4 py-16 lg:px-8">
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="px-4 py-3 text-left font-medium">维度</th>
                <th className="px-4 py-3 text-left font-medium">SEO</th>
                <th className="px-4 py-3 text-left font-medium">GEO</th>
              </tr>
            </thead>
            <tbody>
              {compareRows.map((r) => (
                <tr key={r.dim} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-3 font-medium">{r.dim}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{r.seo}</td>
                  <td className="px-4 py-3 text-indigo-600">{r.geo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="prose prose-slate mt-12 max-w-none dark:prose-invert prose-cn">
          <h2>是否需要同时做？</h2>
          <p>需要，且互补。</p>
          <ul>
            <li>SEO 与 GEO 在<strong>权威性</strong>、<strong>内容质量</strong>、<strong>结构化数据</strong>等底层信号上有重叠</li>
            <li>但 GEO 多了几个 SEO 不重视的信号：llms.txt、首段直答、FAQ schema、事实密度、多平台共现</li>
            <li>建设顺序：先做 GEO 基建（llms.txt / schema / 首段直答 / FAQ 结构化）→ 同时维护已有 SEO 信号 → 内容矩阵双向扩张</li>
          </ul>
          <h2>什么时候 GEO 比 SEO 更重要？</h2>
          <p>满足以下任意一条，应优先做 GEO：</p>
          <ul>
            <li>客单价高、决策周期长的品牌与服务行业（美妆个护、消费品、零售、咨询、医疗、教育、律所）</li>
            <li>目标客户以 Z 世代或互联网原生用户为主</li>
            <li>SEO 已饱和，搜索流量见顶</li>
            <li>品牌新建立，没有外链权重，难以靠 SEO 突破</li>
          </ul>
        </div>
      </section>
    </>
  );
}
