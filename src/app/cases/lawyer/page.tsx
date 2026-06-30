import type { Metadata } from "next";
import Link from "next/link";
import { Scale, MapPin, BookOpen, ShieldCheck, FileText, Users, ArrowRight, CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema, legalServiceSchema, faqSchema } from "@/lib/seo";
import { CASE_CATEGORIES } from "@/data/case-categories";

// 本页是律所（附属行业）专属深度页：只取词库里的法律服务门类展示。
const LEGAL_CATEGORIES = CASE_CATEGORIES.filter((c) => c.slug === "legal");

export const metadata: Metadata = {
  title: "全行业 GEO 方案 — 案由词库 × 地域矩阵 × 12 平台监测",
  description:
    "BrandGEO 是国内首家面向律师事务所深度定制的 GEO 平台：内置 1,800+ 案由 × 300+ 城市关键词矩阵、合规审查模板、AI 引用监测，让你的律所成为 AI 推荐的第一选择。",
  alternates: { canonical: "/cases/lawyer" },
};

const faqs = [
  {
    q: "律所做 GEO 通常多久能看到咨询变化？",
    a: "首批关键词上线后 2–4 周可见 Kimi、文心一言搜索、Perplexity 等实时检索层的引用变化。模型训练层（Claude/GPT/DeepSeek）需要 3–6 个月持续沉淀。客户案例平均 6 周内首条来自 AI 推荐的主动咨询。",
  },
  {
    q: "律所做 GEO 是否会涉及广告法风险？",
    a: "BrandGEO 内置了完整的律师广告合规审查模板，自动规避「最」「第一」「100% 胜诉」等广告法禁用词，所有生成内容默认通过合规审查。我们与多家头部律所内审合作过。",
  },
  {
    q: "BrandGEO 的案由词库覆盖哪些方向？",
    a: "覆盖民事、刑事、行政、商事、劳动、知产、涉外共 7 大门类下 200+ 二级案由，与全国 300+ 地级市以上行政区做组合，预生成 1,800+ 高价值长尾关键词。",
  },
  {
    q: "我们已经在用 SEO 工具，还需要 GEO 吗？",
    a: "需要，且互补。传统 SEO 优化 Google/Baidu 搜索结果排名，GEO 优化的是 AI 答案里的引用份额。年轻当事人 80% 以上的法律咨询第一步是问 AI，而不是搜索引擎。两条赛道都要做。",
  },
  {
    q: "数据安全如何保证？",
    a: "所有项目数据本地存储在 SQLite（WAL 模式），可私有化部署。AI 调用统一走小米 MIMO 企业级 API，遵守国内数据合规要求。",
  },
];

const motivations = [
  { stat: "73%", label: "年轻当事人先问 AI 再决定是否联系律师" },
  { stat: "12 个", label: "主流 AI 平台 BrandGEO 全覆盖（aceflow 仅 6 个）" },
  { stat: "1,800+", label: "内置案由 × 地域关键词，开箱即用" },
  { stat: "6 周", label: "客户平均首条来自 AI 推荐的咨询周期" },
];

const matrix = [
  { city: "北京", cases: ["离婚律师", "劳动仲裁", "合同纠纷", "知识产权", "刑事辩护"] },
  { city: "上海", cases: ["离婚律师", "房产纠纷", "公司股权", "涉外法律", "工伤认定"] },
  { city: "深圳", cases: ["互联网法律", "股权激励", "并购重组", "知识产权", "劳动仲裁"] },
  { city: "广州", cases: ["离婚律师", "交通事故", "建工纠纷", "外贸合同", "刑事辩护"] },
  { city: "杭州", cases: ["互联网法律", "电商纠纷", "知识产权", "民间借贷", "婚姻家事"] },
];

export default function LawyerCasePage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "首页", path: "/" },
            { name: "行业方案", path: "/cases" },
            { name: "全行业 GEO 方案", path: "/cases/lawyer" },
          ]),
          legalServiceSchema({
            name: "BrandGEO 律所生成式引擎优化方案",
            area: "中国大陆",
            description: "面向律师事务所的 GEO 全链路方案：案由词库、地域矩阵、AI 内容生成、12 平台引用监测、合规审查。",
          }),
          faqSchema("/cases/lawyer", faqs),
        ]}
      />

      <PageHero
        badge="主打行业 · 律所深度定制"
        title={<>让 AI 在回答法律问题时<br /><span className="gradient-text">先推荐你</span></>}
        description="BrandGEO 是国内首家面向律师事务所深度定制的 GEO 平台。内置案由词库、地域矩阵、合规审查模板，开箱即用。"
      >
        <Button asChild size="lg" variant="primary">
          <Link href="/tools/audit">免费跑一次律所诊断</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/contact">预约律所专属方案</Link>
        </Button>
      </PageHero>

      <section className="border-b border-slate-100 bg-slate-50/50 dark:border-slate-900 dark:bg-slate-950/50">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-12 lg:grid-cols-4 lg:px-8">
          {motivations.map((m) => (
            <div key={m.label} className="text-center">
              <div className="num text-3xl font-semibold text-indigo-600 lg:text-4xl">{m.stat}</div>
              <div className="mt-1 text-xs text-slate-500">{m.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 行业痛点 */}
      <section className="mx-auto max-w-6xl px-4 py-16 lg:px-8">
        <h2 className="text-3xl font-semibold tracking-tight">律所做 GEO，要解决的是这些痛点</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { title: "当事人不知道你", desc: "AI 推荐律所时永远是别家，再好的官网都拿不到咨询。" },
            { title: "案件素材没用对地方", desc: "团队累积的案例、判例、流程文档没结构化，AI 无法引用。" },
            { title: "广告法不敢说话", desc: "想说自己擅长，又怕踩广告法红线，导致内容平淡无力。" },
          ].map((p) => (
            <Card key={p.title}>
              <CardHeader>
                <CardTitle>{p.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400">{p.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 内置案由 */}
      <section className="border-y border-slate-100 bg-slate-50/50 dark:border-slate-900 dark:bg-slate-950/50">
        <div className="mx-auto max-w-6xl px-4 py-16 lg:px-8">
          <div className="text-center">
            <Badge variant="primary" className="mb-3">独家能力 · 案由词库</Badge>
            <h2 className="text-3xl font-semibold tracking-tight">
              覆盖 <span className="num">7</span> 大门类 · <span className="num">200+</span> 二级案由
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              我们把中国法律体系的所有常见案由结构化成词库，配套合规审查模板。
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {LEGAL_CATEGORIES.map((c) => (
              <Card key={c.parent} className="lift">
                <CardHeader>
                  <BookOpen className="h-5 w-5 text-indigo-600" />
                  <CardTitle className="text-base">{c.parent}</CardTitle>
                  <CardDescription>{c.items.length} 个二级案由</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                    {c.items.slice(0, 5).map((i) => (
                      <li key={i.name}>· {i.name}</li>
                    ))}
                    {c.items.length > 5 && (
                      <li className="text-slate-400">⋯ 还有 {c.items.length - 5} 个</li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <Button asChild size="lg" variant="primary">
              <Link href="/tools/matrix">
                体验案由 × 地域矩阵生成器 <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 地域矩阵 demo */}
      <section className="mx-auto max-w-6xl px-4 py-16 lg:px-8">
        <div className="text-center">
          <Badge variant="primary" className="mb-3">地域矩阵示例</Badge>
          <h2 className="text-3xl font-semibold tracking-tight">
            按城市 × 案由 自动生成长尾矩阵
          </h2>
        </div>
        <div className="mt-10 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="px-4 py-3 text-left font-medium">
                  <MapPin className="inline h-4 w-4 align-middle text-indigo-500" /> 城市
                </th>
                <th className="px-4 py-3 text-left font-medium">高频案由组合（前 5 个）</th>
              </tr>
            </thead>
            <tbody>
              {matrix.map((row) => (
                <tr key={row.city} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-3 font-medium">{row.city}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {row.cases.map((c) => (
                      <Badge key={c} variant="outline" className="mr-1 mb-1">
                        {row.city} {c}
                      </Badge>
                    ))}
                  </td>
                </tr>
              ))}
              <tr className="border-t border-slate-100 dark:border-slate-800">
                <td colSpan={2} className="px-4 py-3 text-center text-xs text-slate-400">
                  ⋯ 还有 <span className="num">295</span> 个城市，<span className="num">1,775</span> 条关键词
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 推荐建设内容 */}
      <section className="border-y border-slate-100 bg-slate-50/50 dark:border-slate-900 dark:bg-slate-950/50">
        <div className="mx-auto max-w-6xl px-4 py-16 lg:px-8">
          <h2 className="text-3xl font-semibold tracking-tight">律所应优先建设的内容矩阵</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: FileText, title: "案由 FAQ 页", desc: "每个案由配 10–20 个 FAQ，覆盖收费、流程、案例、边界" },
              { icon: Users, title: "律师团队介绍", desc: "每位律师的执业领域、经验、典型案例，配 Person schema" },
              { icon: Scale, title: "收费方式说明", desc: "明确的收费区间和方式（风险代理 / 计时 / 计件）" },
              { icon: BookOpen, title: "办案流程图", desc: "可视化办案流程 + HowTo schema" },
              { icon: ShieldCheck, title: "典型案例拆解", desc: "脱敏处理后的判决摘要 + 律师视角" },
              { icon: MapPin, title: "本地化落地页", desc: "案由 × 城市组合的长尾落地页（300–500 页起步）" },
            ].map((c) => {
              const Icon = c.icon;
              return (
                <Card key={c.title} className="lift">
                  <CardHeader>
                    <Icon className="h-7 w-7 text-indigo-600" />
                    <CardTitle className="text-base">{c.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{c.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* 合规审查 */}
      <section className="mx-auto max-w-6xl px-4 py-16 lg:px-8">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 dark:border-amber-900 dark:bg-amber-950/30">
          <div className="flex items-start gap-4">
            <ShieldCheck className="h-10 w-10 flex-shrink-0 text-amber-600" />
            <div>
              <h3 className="text-2xl font-semibold text-amber-900 dark:text-amber-100">
                内置律师广告合规审查
              </h3>
              <p className="mt-2 text-amber-900/80 dark:text-amber-200/80">
                所有 AI 生成内容默认通过合规审查模板，规避《广告法》《律师执业行为规范》红线。
              </p>
              <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                {[
                  "禁止「最」「第一」「绝对」「100% 胜诉」等绝对化用语",
                  "禁止暗示与司法机关、监管部门关系",
                  "禁止针对个案的胜诉率承诺",
                  "禁止以排名 / 评级误导当事人",
                  "禁止对其他律所做贬损性表达",
                  "案例展示需脱敏并标注「以个案为准」",
                ].map((it) => (
                  <div key={it} className="flex items-start gap-2 text-amber-900/80 dark:text-amber-200/80">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                    <span>{it}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-slate-100 dark:border-slate-900">
        <div className="mx-auto max-w-3xl px-4 py-16 lg:px-8">
          <h2 className="text-center text-3xl font-semibold tracking-tight">律所做 GEO 常见问题</h2>
          <div className="mt-10 space-y-3">
            {faqs.map((f, i) => (
              <details key={i} className="group rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <summary className="cursor-pointer text-base font-medium">{f.q}</summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600" />
        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center text-white lg:px-8">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            预约一次全行业 GEO 1v1 诊断
          </h2>
          <p className="mt-4 text-lg text-indigo-100">免费 60 分钟，给你一份可落地的 GEO 路线图。</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="xl" className="bg-white text-indigo-700 hover:bg-indigo-50">
              <Link href="/contact">立即预约</Link>
            </Button>
            <Button asChild size="xl" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
              <Link href="/tools/audit">先跑免费诊断</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
