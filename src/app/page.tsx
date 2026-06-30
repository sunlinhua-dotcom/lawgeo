import Link from "next/link";
import {
  Sparkles,
  Search,
  FileText,
  Share2,
  LineChart,
  Scale,
  ArrowRight,
  CheckCircle2,
  Bot,
  Globe,
  Building2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { JsonLd } from "@/components/seo/json-ld";
import { faqSchema, breadcrumbSchema } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { HomeAuditDemo } from "@/components/home/audit-demo";
import { MarketStats } from "@/components/home/market-stats";

const products = [
  {
    icon: Search,
    title: "GEO 洞察系统",
    href: "/insight",
    desc: "结合微信指数、百度指数、品类词库与场景矩阵，识别品牌当前在 AI 搜索中的内容缺口与高 ROI 选题。",
    bullets: ["品类 × 场景矩阵", "竞品引用源拆解", "意图分级与优先级"],
    accent: "from-indigo-500 to-violet-500",
  },
  {
    icon: FileText,
    title: "AI 内容生成",
    href: "/generate",
    desc: "针对国内大模型 + Claude/ChatGPT/Perplexity 优化的生成引擎。一次输出 FAQ + TL;DR + HowTo + 对比表，自带 schema.org。",
    bullets: ["12 种 GEO 模板", "首段直答 + 事实密度", "JSON-LD 一键导出"],
    accent: "from-violet-500 to-fuchsia-500",
  },
  {
    icon: Share2,
    title: "多平台发布",
    href: "/publish",
    desc: "把官网事实源同步到知乎、百家号、公众号、小红书、今日头条、视频号，自动适配各平台规范。",
    bullets: ["7 大渠道适配", "标题/封面/字数自动改写", "回链官网原文"],
    accent: "from-fuchsia-500 to-rose-500",
  },
  {
    icon: LineChart,
    title: "AI 引用监测",
    href: "/monitor",
    desc: "每日在 12 个 AI 平台跑你的关键词查询，识别引用率、Top3 推荐率、竞品份额，自动生成优化建议。",
    bullets: ["12 平台同步监测", "竞品引用热力图", "趋势 + 邮件预警"],
    accent: "from-rose-500 to-amber-500",
  },
];

const stats = [
  { value: "12", label: "AI 平台覆盖", suffix: "个" },
  { value: "300+", label: "覆盖城市" },
  { value: "1,800+", label: "内置品类 × 场景关键词" },
  { value: "4.9", label: "客户评分", suffix: "/ 5" },
];

const faqs = [
  {
    q: "BrandGEO 与传统 SEO 工具有什么区别？",
    a: "传统 SEO 优化的是 Google/Baidu 的搜索结果排名，争夺点击。BrandGEO 优化的是大模型回答里的引用份额——用户问 DeepSeek/Claude/Kimi「敏感肌精华液哪个好用」时，你的内容被不被提及、被排在第几位、引用源 URL 是谁。这是两条完全不同的赛道。",
  },
  {
    q: "为什么美妆品牌特别需要 GEO？",
    a: "护肤选购是高意图、高复购、决策周期长的典型场景。消费者越来越习惯先问 AI 成分功效、肤质适配，再决定下单。如果 AI 推荐的永远是别家，再好的官网和详情页都拿不到转化。BrandGEO 让你的内容成为 AI 推荐产品时的首选引用源。",
  },
  {
    q: "多久能看到效果？",
    a: "实时检索层（Perplexity、Kimi 联网模式、文心一言搜索）在内容发布并被收录后 1–3 周可见引用变化；模型训练层（Claude/GPT/DeepSeek 等纯参数模型）需要 3–6 个月持续沉淀。",
  },
  {
    q: "BrandGEO 收费模式？",
    a: "起步版 8,000 元 / 月，含 30 个关键词、4 个平台监测、AI 生成 30 篇/月。标准版 18,000 元 / 月，含 100 个关键词、12 平台监测、AI 生成 200 篇/月。企业版可定制。年付享 2 折优惠。",
  },
];

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={[
          faqSchema("/", faqs),
          breadcrumbSchema([{ name: "首页", path: "/" }]),
        ]}
      />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-slate-100 dark:border-slate-900">
        <div className="dotgrid absolute inset-0 opacity-70" />
        <div className="absolute inset-x-0 -top-40 z-0 h-[500px] bg-gradient-to-b from-indigo-100/60 via-violet-50/30 to-transparent dark:from-indigo-950/30 dark:via-violet-950/20" />
        <div className="relative mx-auto max-w-7xl px-4 pt-20 pb-24 lg:px-8 lg:pt-28 lg:pb-32">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="primary" className="mb-6 px-3 py-1">
              <Sparkles className="mr-1.5 h-3 w-3" /> 2026 GEO 全新升级 · 12 平台覆盖
            </Badge>
            <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-slate-50">
              让 AI 在回答选购问题时
              <br />
              <span className="gradient-text">先推荐你的品牌</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-slate-600 dark:text-slate-400">
              BrandGEO 是国内首家面向 <strong className="text-slate-900 dark:text-slate-100">美妆个护与消费品牌</strong> 的 GEO（生成式引擎优化）平台。
              我们把你的官网内容打磨成 DeepSeek、文心、通义、豆包、Kimi、Claude、ChatGPT 共
              <span className="num"> 12 </span>个主流大模型最愿意引用的权威信源——
              不是争搜索结果，而是争 AI 推荐产品时的<strong className="text-slate-900 dark:text-slate-100">第一个名字</strong>。
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="xl" variant="primary">
                <Link href="/tools/audit">
                  免费跑一次 GEO 诊断 <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="xl" variant="outline">
                <Link href="/contact">预约 1v1 顾问</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-slate-500">
              无需注册 · <span className="num">30 秒</span>出诊断结论 · 可下载 PDF 报告
            </p>
          </div>

          {/* AI 平台 logo bar */}
          <div className="mx-auto mt-16 max-w-5xl">
            <p className="text-center text-xs uppercase tracking-widest text-slate-400">
              全平台覆盖 · 同步监测 · 真实引用追踪
            </p>
            <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {siteConfig.aiPlatforms.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-3 py-3 text-sm font-medium text-slate-700 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300"
                >
                  <Bot className="h-4 w-4 text-slate-400" />
                  <span>{p.name}</span>
                  {p.cn ? (
                    <Badge variant="outline" className="ml-auto h-4 px-1 text-[10px]">国内</Badge>
                  ) : (
                    <Badge variant="outline" className="ml-auto h-4 px-1 text-[10px]">海外</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────────────────── */}
      <section className="border-b border-slate-100 bg-slate-50/50 dark:border-slate-900 dark:bg-slate-950/50">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 md:grid-cols-4 lg:px-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 lg:text-4xl num">
                {s.value}
                {s.suffix && <span className="text-base text-slate-500">{s.suffix}</span>}
              </div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 市场规模数据 ─────────────────────────────────────────────── */}
      <MarketStats />

      {/* ── Live audit demo ─────────────────────────────────────────── */}
      <section className="border-b border-slate-100 dark:border-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
          <div className="mb-12 text-center">
            <Badge variant="primary" className="mb-3">免费工具</Badge>
            <h2 className="text-3xl font-semibold tracking-tight lg:text-4xl">
              输入任意域名，<span className="gradient-text">30 秒</span> 拿到 GEO 诊断
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              我们会自动检查 llms.txt、schema.org、robots、sitemap、首段直答、FAQ 结构化，并给出可执行的优化建议。
            </p>
          </div>
          <HomeAuditDemo />
        </div>
      </section>

      {/* ── 产品矩阵 ────────────────────────────────────────────────── */}
      <section className="border-b border-slate-100 dark:border-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
          <div className="mb-14 text-center">
            <Badge variant="primary" className="mb-3">核心产品矩阵</Badge>
            <h2 className="text-3xl font-semibold tracking-tight lg:text-4xl">
              从洞察到生成、从发布到监测，<br />
              一站式 GEO 全链路
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {products.map((p) => {
              const Icon = p.icon;
              return (
                <Card key={p.title} className="lift overflow-hidden">
                  <CardHeader>
                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${p.accent} text-white shadow-md`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="mt-4">{p.title}</CardTitle>
                    <CardDescription className="leading-relaxed">{p.desc}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                      {p.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                    <Button asChild variant="ghost" size="sm" className="mt-6 -ml-3">
                      <Link href={p.href}>
                        了解详情 <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 美妆行业深度 ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-slate-100 dark:border-slate-900">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/40 to-transparent dark:from-indigo-950/20" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <Badge variant="primary" className="mb-3">美妆专属</Badge>
              <h2 className="text-3xl font-semibold tracking-tight lg:text-4xl">
                内置 <span className="num">1,800+</span> 品类 ×<br />
                <span className="num">300+</span> 场景关键词矩阵
              </h2>
              <p className="mt-6 leading-relaxed text-slate-600 dark:text-slate-400">
                我们把精华、面霜、防晒、面膜、洁面、水乳、彩妆、身体护理、洗护、香氛等
                所有常见品类，与敏感肌、油痘肌、抗老、美白、补水、换季等典型场景做组合，预生成
                <span className="num"> 1,800+ </span>
                条高价值长尾关键词。一键拉取，自动按竞争度、搜索量、AI 提及频率排序。
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "覆盖主流品类 + 全肤质 / 全功效场景",
                  "AI 提及频率每日刷新，识别真正有流量的组合",
                  "一键批量生成 FAQ 页面 + 落地页骨架",
                  "内置化妆品广告合规审查，避免功效宣称红线",
                ].map((it) => (
                  <li key={it} className="flex items-start gap-2">
                    <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-indigo-600" />
                    <span className="text-slate-700 dark:text-slate-300">{it}</span>
                  </li>
                ))}
              </ul>
              <Button asChild size="lg" variant="primary" className="mt-8">
                <Link href="/tools/matrix">体验品类矩阵生成器</Link>
              </Button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-indigo-100/40 dark:border-slate-800 dark:bg-slate-900 dark:shadow-indigo-950/30">
              <div className="mb-4 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-rose-400" />
                  <div className="h-2 w-2 rounded-full bg-amber-400" />
                  <div className="h-2 w-2 rounded-full bg-emerald-400" />
                </div>
                <span>case-matrix.brandgeo.cn</span>
              </div>
              <div className="space-y-3 text-sm">
                {[
                  { kw: "敏感肌精华液哪个好用", vol: "2.1k", ai: "高", color: "emerald" },
                  { kw: "烟酰胺美白精华有用吗", vol: "1.8k", ai: "高", color: "emerald" },
                  { kw: "油皮用什么防晒不闷痘", vol: "1.6k", ai: "中", color: "amber" },
                  { kw: "玻尿酸精华怎么用效果好", vol: "1.2k", ai: "高", color: "emerald" },
                  { kw: "视黄醇敏感肌能用吗", vol: "950", ai: "中", color: "amber" },
                  { kw: "油痘肌怎么护肤", vol: "820", ai: "低", color: "rose" },
                ].map((row) => (
                  <div
                    key={row.kw}
                    className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/30"
                  >
                    <span className="text-slate-700 dark:text-slate-300">{row.kw}</span>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="num text-slate-500">{row.vol}/月</span>
                      <Badge
                        variant={row.color === "emerald" ? "success" : row.color === "amber" ? "warning" : "default"}
                      >
                        AI {row.ai}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center text-xs text-slate-400">
                ⋯ 还有 <span className="num">1,794</span> 条关键词
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 行业方案 ────────────────────────────────────────────────── */}
      <section className="border-b border-slate-100 dark:border-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
          <div className="mb-14 text-center">
            <Badge variant="primary" className="mb-3">行业方案</Badge>
            <h2 className="text-3xl font-semibold tracking-tight lg:text-4xl">
              不只美妆，所有<span className="gradient-text">高决策成本</span>行业都需要 GEO
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Sparkles, name: "美妆个护 / 消费品", href: "/cases/cosmetics", featured: true },
              { icon: Building2, name: "零售 / 连锁品牌", href: "/cases/sme" },
              { icon: Globe, name: "B2B / 制造业", href: "/cases/b2b" },
              { icon: Scale, name: "律所 / 专业服务", href: "/cases/lawyer" },
            ].map((c) => {
              const Icon = c.icon;
              return (
                <Link
                  key={c.href}
                  href={c.href}
                  className={`lift group flex flex-col gap-3 rounded-2xl border p-6 transition-colors ${
                    c.featured
                      ? "border-indigo-200 bg-gradient-to-br from-indigo-50 to-white dark:border-indigo-900 dark:from-indigo-950 dark:to-slate-900"
                      : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                  }`}
                >
                  <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  <div className="text-base font-semibold">{c.name}</div>
                  {c.featured && <Badge variant="primary" className="self-start">主打</Badge>}
                  <div className="mt-auto flex items-center gap-1 text-xs text-indigo-600 opacity-0 transition-opacity group-hover:opacity-100">
                    查看方案 <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────── */}
      <section className="border-b border-slate-100 dark:border-slate-900">
        <div className="mx-auto max-w-3xl px-4 py-20 lg:px-8">
          <div className="mb-12 text-center">
            <Badge variant="primary" className="mb-3">常见问题</Badge>
            <h2 className="text-3xl font-semibold tracking-tight lg:text-4xl">关于 GEO 你想问的</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((f, i) => (
              <details
                key={i}
                className="group rounded-xl border border-slate-200 bg-white p-5 open:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:open:bg-slate-800/50"
              >
                <summary className="flex cursor-pointer items-center justify-between text-base font-medium">
                  {f.q}
                  <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-90" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{f.a}</p>
              </details>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button asChild variant="outline" size="lg">
              <Link href="/faq">查看完整 FAQ</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600" />
        <div className="dotgrid absolute inset-0 opacity-20" />
        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center text-white lg:px-8">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            你的下一个客户，<br />正在问 AI
          </h2>
          <p className="mt-4 text-lg text-indigo-100">先让 AI 认识你。</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="xl" className="bg-white text-indigo-700 hover:bg-indigo-50">
              <Link href="/tools/audit">
                免费跑一次诊断 <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="xl" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
              <Link href="/contact">预约 1v1 顾问</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
