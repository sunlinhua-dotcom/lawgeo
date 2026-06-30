import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/page-hero";
import { MarketStats } from "@/components/home/market-stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema, articleSchema } from "@/lib/seo";
import {
  ArrowRight,
  Sparkles,
  ExternalLink,
  Bot,
  ShoppingCart,
  Globe,
  FlaskConical,
  ShieldCheck,
  Store,
  Search,
} from "lucide-react";

export const metadata: Metadata = {
  title: "美妆行业 GEO 范例 — 国内外标杆动向与市场数据",
  description:
    "以美妆个护为旗舰的 GEO 行业洞察：欧莱雅 × OpenAI、雅诗兰黛 GEO 试点、理肤泉权威内容、Sephora 在 ChatGPT 上线 AI 导购，以及珀莱雅、花西子、小红书 × DeepSeek、豆包 / 元宝等国货实践。附 2026 GEO 市场规模与流量趋势。",
  alternates: { canonical: "/market-insights" },
};

// 中文排版：标题/段落 keep-all，数字 nowrap
const keepAll = { wordBreak: "keep-all" as const, textWrap: "balance" as const };

// 关键数据条（来自公开报道，详见页尾来源）
const beautyStats = [
  { value: "17%", label: "ChatGPT 已约占搜索量", note: "2025 Q4 公开估算" },
  { value: "5%", label: "ChatGPT 每周对话与美妆相关", note: "约 9 亿次 / 周中的占比" },
  { value: "4,652.9 亿", label: "2025 中国化妆品市场规模", note: "元，内容种草 + 直播转化驱动" },
  { value: "2026.03", label: "Sephora 在 ChatGPT 内上线 AI 导购", note: "美国先行，逐步扩量" },
];

// 国际标杆
const international = [
  {
    icon: Globe,
    title: "欧莱雅 × OpenAI",
    desc: "2026 年 6 月，欧莱雅与 OpenAI 达成合作，在 ChatGPT 内打造美妆体验并推进 CreAItech。其高层公开表示「大模型正在成为美妆发现的新入口」——AI 答案即货架。",
  },
  {
    icon: FlaskConical,
    title: "雅诗兰黛 GEO 试点",
    desc: "雅诗兰黛对旗下 3 个品牌启动为期 6 个月的 GEO 试点，核心是用皮肤科医师背书的专业内容，提升在 AI 答案中的可信度与被引用率。",
  },
  {
    icon: ShieldCheck,
    title: "理肤泉：权威内容护城河",
    desc: "理肤泉沉淀约 25 万名医护资源与 850+ 项医学研究，把「专业 + 证据」做成结构化内容资产——这正是 AI 在推荐功效护肤时优先吸收的信源。",
  },
  {
    icon: ShoppingCart,
    title: "Sephora × ChatGPT：Agentic Commerce",
    desc: "2026 年 3 月 Sephora 在 ChatGPT 内上线导购 App，用户一句「帮我找适合干皮的粉底」即得个性化推荐，并接入会员体系与 ACP 协议。「如果 ChatGPT 不推荐你，你在这个渠道就不存在」。",
  },
];

// 国货实践
const domestic = [
  {
    icon: Store,
    title: "珀莱雅：内容种草 + 榜单第一",
    desc: "珀莱雅以「内容种草 + 直播转化」协同登顶天猫护肤 GMV 榜首。在 AI 搜索里，靠成分功效页与高频测评问句覆盖，把「精华液哪个好用」的答案留在自己品牌。",
  },
  {
    icon: Sparkles,
    title: "花西子：国风信源差异化",
    desc: "花西子不打「大牌平替」，而是用雕花口红、蚕丝蜜粉等独特国风产品语言建立品牌烙印——清晰的实体与差异点，让 AI 更容易准确转述品牌定位。",
  },
  {
    icon: Search,
    title: "小红书 × DeepSeek、豆包 / 元宝",
    desc: "小红书接入 DeepSeek、上线 AI 搜索「点点」，豆包 / 元宝 / DeepSeek 成为国货美妆被发现的新场景。国内已出现按这些平台抓取偏好做 answer-first 内容的 GEO 服务。",
  },
  {
    icon: ShieldCheck,
    title: "AI 答案里的广告法合规",
    desc: "当品牌信息嵌入 AI 回答，若构成广告即须符合《广告法》《化妆品监督管理条例》：不宣称医疗功效、不用「最 / 第一 / 速效 / 根治」、测评标注肤质个体差异。合规是 GEO 的底线。",
  },
];

const aiCommerce = [
  {
    icon: ExternalLink,
    title: "AI 答案直达品牌官网",
    desc: "AI 助手已支持从答案直接跳转品牌官方网站与官方旗舰店，缩短「被推荐 → 进店 → 转化」的链路。",
  },
  {
    icon: ShoppingCart,
    title: "ChatGPT 内完成导购",
    desc: "借助 ACP（Agentic Commerce Protocol），Sephora 等品牌把商品数据直接喂给 ChatGPT，会员权益、样品、结算正逐步在对话内闭环。",
  },
  {
    icon: Bot,
    title: "豆包直通抖音商城",
    desc: "豆包等内容平台 AI 已能引导用户跳转抖音商城浏览购买，打通「内容种草 → AI 推荐 → 下单」环节。",
  },
];

// 真实公开来源
const sources = [
  { name: "BeautyMatter — Sephora Enters the Chat: Beauty Retail Gets Conversational", url: "https://beautymatter.com/articles/sephora-enters-the-chat-gpt-beauty-retail-gets-conversational" },
  { name: "Sephora Newsroom — Sephora App in ChatGPT", url: "https://newsroom.sephora.com/sephora-app-in-chatgpt-brings-a-new-personalized-beauty-experience/" },
  { name: "Forbes — Sephora & Shopify Double Down On Agentic Commerce (2026.03)", url: "https://www.forbes.com/sites/claraludmir/2026/03/25/both-sephora-and-shopify-double-down-on-agentic-commerce/" },
  { name: "Retail Dive — Sephora launches ChatGPT app", url: "https://www.retaildive.com/news/sephora-chatgpt-app-launch/815751/" },
  { name: "CBNData — 三大类目战绩：读懂抖音美妆双 11", url: "https://www.cbndata.com/information/293354" },
  { name: "中新网 — 当 AI 开始「打广告」，AI 的回答还「可信」吗", url: "https://www.chinanews.com.cn/sh/2026/01-20/10555063.shtml" },
  { name: "人人都是产品经理 — 小红书「如接」DeepSeek", url: "https://www.woshipm.com/ai/6193768.html" },
];

export default function MarketInsightsPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "首页", path: "/" }, { name: "美妆行业 GEO 范例", path: "/market-insights" }]),
          articleSchema({
            title: "美妆行业 GEO 范例：国内外标杆动向与市场数据",
            description: "欧莱雅、雅诗兰黛、理肤泉、Sephora、珀莱雅、花西子等国内外美妆品牌的 GEO / AI 营销实践",
            path: "/market-insights",
          }),
        ]}
      />

      <PageHero
        badge="美妆行业 GEO 范例 · 2026"
        title={
          <>
            美妆品牌正在被 <span className="gradient-text">AI 搜索</span> 重新排序
          </>
        }
        description="大模型正成为美妆发现的新入口。本报告汇总国内外真实动向——欧莱雅、雅诗兰黛、理肤泉、Sephora 与珀莱雅、花西子、小红书——并给出 BrandGEO 的方法论。"
      />

      {/* 关键数据条 */}
      <section className="border-b border-slate-100 dark:border-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-12 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {beautyStats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <div className="num text-3xl font-semibold text-pink-600" style={{ whiteSpace: "nowrap" }}>
                  {s.value}
                </div>
                <div className="mt-2 text-sm font-medium" style={keepAll}>
                  {s.label}
                </div>
                <div className="mt-1 text-xs text-slate-400" style={keepAll}>
                  {s.note}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 国际标杆 */}
      <section className="border-b border-slate-100 dark:border-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-16 lg:px-8">
          <h2 className="mb-3 text-3xl font-semibold tracking-tight" style={keepAll}>
            国际标杆：头部美妆集团已经在抢 AI 答案位
          </h2>
          <p className="mb-12 max-w-3xl text-slate-600 dark:text-slate-400" style={keepAll}>
            从欧莱雅、雅诗兰黛到理肤泉、Sephora——国际美妆把「专业内容 + 结构化信源 + 对话式电商」做成了 GEO 的标准动作。
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            {international.map((c) => {
              const Icon = c.icon;
              return (
                <Card key={c.title} className="lift">
                  <CardHeader>
                    <Icon className="h-8 w-8 text-pink-600" />
                    <CardTitle className="text-base" style={keepAll}>{c.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400" style={keepAll}>
                      {c.desc}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* 国货实践 */}
      <section className="border-b border-slate-100 dark:border-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-16 lg:px-8">
          <h2 className="mb-3 text-3xl font-semibold tracking-tight" style={keepAll}>
            国货实践：种草、AI 搜索与合规并行
          </h2>
          <p className="mb-12 max-w-3xl text-slate-600 dark:text-slate-400" style={keepAll}>
            珀莱雅、花西子等国货品牌靠内容种草登顶榜单；小红书接入 DeepSeek、豆包 / 元宝崛起，让「成分功效 + answer-first 内容」成为被 AI 推荐的关键。
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            {domestic.map((c) => {
              const Icon = c.icon;
              return (
                <Card key={c.title} className="lift">
                  <CardHeader>
                    <Icon className="h-8 w-8 text-pink-600" />
                    <CardTitle className="text-base" style={keepAll}>{c.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400" style={keepAll}>
                      {c.desc}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* 市场大盘数据 */}
      <section className="border-b border-slate-100 dark:border-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-12 lg:px-8">
          <h2 className="mb-8 text-3xl font-semibold tracking-tight" style={keepAll}>
            GEO 市场大盘
          </h2>
          <MarketStats />
        </div>
      </section>

      {/* AI → 电商新场景 */}
      <section className="border-b border-slate-100 dark:border-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-16 lg:px-8">
          <h2 className="mb-3 text-3xl font-semibold tracking-tight" style={keepAll}>
            AI 平台已成品牌引流与导购工具
          </h2>
          <p className="mb-12 text-slate-600 dark:text-slate-400" style={keepAll}>
            AI 不只回答问题，已经在直接促成美妆电商转化。三个真实场景：
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {aiCommerce.map((c) => {
              const Icon = c.icon;
              return (
                <Card key={c.title} className="lift">
                  <CardHeader>
                    <Icon className="h-8 w-8 text-pink-600" />
                    <CardTitle className="text-base" style={keepAll}>{c.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400" style={keepAll}>
                      {c.desc}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* 数据来源 */}
      <section className="border-b border-slate-100 dark:border-slate-900">
        <div className="mx-auto max-w-4xl px-4 py-12 lg:px-8">
          <h2 className="text-base font-semibold">公开来源</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
            {sources.map((s) => (
              <li key={s.name}>
                ·{" "}
                {s.url.startsWith("http") ? (
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:text-pink-600 hover:underline">
                    {s.name}
                  </a>
                ) : (
                  s.name
                )}
              </li>
            ))}
          </ul>
          <div className="mt-4 text-xs text-slate-400" style={keepAll}>
            以上为公开报道与行业数据的整合摘要，部分数字为公开估算；案例展示用于说明 GEO 方法论，不代表任何品牌与 BrandGEO 的合作关系。
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-600 via-rose-500 to-fuchsia-600" />
        <div className="relative mx-auto max-w-4xl px-4 py-16 text-center text-white lg:px-8">
          <Sparkles className="mx-auto h-10 w-10" />
          <h2 className="mt-4 text-3xl font-semibold tracking-tight" style={keepAll}>
            把这些标杆动作，变成你品牌的方法论
          </h2>
          <p className="mt-3 text-pink-100" style={keepAll}>
            国际大牌和国货头部都已入场。看美妆旗舰案例如何把「成分词」留在 AI 答案里，或先免费跑一次诊断。
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="xl" className="bg-white text-pink-700 hover:bg-pink-50">
              <Link href="/cases/cosmetics">
                看美妆旗舰案例 <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="xl" variant="outline" className="border-white text-white hover:bg-white/10">
              <Link href="/tools/audit">免费跑诊断</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
