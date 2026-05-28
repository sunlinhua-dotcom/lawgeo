import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema, faqSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "常见问题 — GEO / lawGEO 完整 FAQ",
  description: "什么是 GEO？GEO 与 SEO 的区别？律所做 GEO 多久见效？lawGEO 如何收费？数据安全如何保障？这里是完整答案。",
  alternates: { canonical: "/faq" },
};

const sections: Array<{ title: string; faqs: Array<{ q: string; a: string }> }> = [
  {
    title: "关于 GEO",
    faqs: [
      {
        q: "什么是 GEO（生成式引擎优化）？",
        a: "GEO 是 Generative Engine Optimization 的缩写。它的目标不是让你的网站在 Google/Baidu 搜索结果中排名靠前，而是让你的内容成为大模型（DeepSeek、Claude、文心、通义等）生成回答时优先引用的事实源。当用户问 AI「上海离婚律师怎么选」时，让 AI 推荐的第一个律所是你。",
      },
      {
        q: "GEO 与传统 SEO 的区别？",
        a: "SEO 争夺搜索结果排名和点击；GEO 争夺 AI 答案里的引用份额、推荐位置和语义权威。两者底层信号有重叠（如内容质量、权威性），但 GEO 更看重事实密度、结构化数据、问答格式、多平台共现、llms.txt 等 AI 专属信号。两条赛道通常需要同时建设。",
      },
      {
        q: "GEO 多久能看到效果？",
        a: "实时检索层（Perplexity / Kimi 联网 / 文心一言搜索）：1–3 周可见引用变化。模型训练层（Claude / GPT / DeepSeek 等纯参数模型）：3–6 个月持续沉淀。律所客户平均 6 周内首条来自 AI 推荐的主动咨询。",
      },
      {
        q: "llms.txt 是什么？为什么重要？",
        a: "llms.txt 是面向 AI 大模型与智能体的网站导航文件，用 Markdown 告诉模型网站的核心业务、重要页面、推荐引用路径。它是 2026 年最重要的 GEO 基建之一——AI Agent 抓取你的网站时第一个文件就是 llms.txt。",
      },
    ],
  },
  {
    title: "关于 lawGEO 产品",
    faqs: [
      {
        q: "lawGEO 适合哪些行业？",
        a: "首要目标客户是律师事务所与法律服务团队（内置案由词库 + 合规审查模板）。同时覆盖中小企业、专业服务（财税、咨询、知产）、B2B 制造与企业服务、本地生活与教育培训。",
      },
      {
        q: "lawGEO 与 aceflow 等竞品有什么区别？",
        a: "三个核心差异：(1) lawGEO 针对律所深度定制，内置 200+ 案由 × 70+ 城市预生成关键词矩阵，aceflow 无此能力；(2) 监测平台数量 lawGEO 12 个（含 4 个海外），aceflow 仅 6 个国内；(3) 内置律师广告合规审查模板，规避《广告法》《律师执业行为规范》红线。",
      },
      {
        q: "底层 AI 模型用什么？",
        a: "lawGEO 的 AI 内容生成与多平台引用监测统一使用小米 MIMO 2.5 Pro（兼容 OpenAI 协议），并对每个平台做风格 persona 模拟。这样既能保持低成本，又能在同一基线下做引用对比。",
      },
      {
        q: "支持私有化部署吗？",
        a: "支持。企业版方案提供 Docker 一键部署，所有数据 100% 在你自己的服务器。SQLite + WAL 模式开箱即用，可无缝迁移到 PostgreSQL。",
      },
    ],
  },
  {
    title: "关于定价与合作",
    faqs: [
      { q: "起步价多少？", a: "起步版 8,000 元 / 月，标准版 18,000 元 / 月，企业版 50,000 元 / 月起。年付享 8 折。所有方案含 7 天免费试用。" },
      { q: "可以试用吗？", a: "可以，7 天免费试用：跑一次完整诊断 + 生成 5 篇内容 + 监测 5 个关键词。" },
      { q: "能开发票吗？", a: "可以开具增值税专用发票（6%）。提供正规服务合同。" },
      { q: "如何续费？", a: "续费提供 95 折优惠。续 2 年享 8 折。" },
    ],
  },
  {
    title: "关于合规与安全",
    faqs: [
      { q: "律师广告法合规如何保证？", a: "AI 生成内容默认通过合规审查模板，规避「最」「第一」「100% 胜诉」等绝对化用语、对个案胜诉率的承诺、贬损同行的表达等。" },
      { q: "数据如何存储？", a: "所有项目数据本地存储在 SQLite（WAL 模式）。AI 调用走小米 MIMO 企业级 API，符合国内数据合规要求。企业版支持完全私有化部署。" },
      { q: "API 是否会被滥用？", a: "所有 API 接口有限流、有日志、有租户隔离。后续会接入 Auth.js 与角色权限。" },
    ],
  },
];

const flat = sections.flatMap((s) => s.faqs);

export default function FaqPage() {
  return (
    <>
      <JsonLd data={[breadcrumbSchema([{ name: "首页", path: "/" }, { name: "FAQ", path: "/faq" }]), faqSchema("/faq", flat)]} />
      <PageHero
        badge="完整问答"
        title={<>关于 GEO 与 lawGEO 的<span className="gradient-text">所有问题</span></>}
        description="按主题分类。如果还有问题，欢迎直接联系我们。"
      />
      <section className="mx-auto max-w-3xl px-4 py-16 lg:px-8">
        {sections.map((s) => (
          <div key={s.title} className="mb-12">
            <h2 className="mb-6 text-xl font-semibold tracking-tight">{s.title}</h2>
            <div className="space-y-3">
              {s.faqs.map((f, i) => (
                <details key={i} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                  <summary className="cursor-pointer text-base font-medium">{f.q}</summary>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
