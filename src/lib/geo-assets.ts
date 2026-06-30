import { POSTS } from "@/data/blog";
import { CASES } from "@/data/cases";
import { INDUSTRIES } from "@/data/industries";
import { citationPackPath, getCitationPacks, renderCitationPackJsonLd } from "@/lib/geo-citation-pack";
import { markdownPathForRoute, normalizeRoutePath } from "@/lib/geo-paths";
import { siteConfig } from "@/lib/site";

export const GEO_ASSET_UPDATED_AT = "2026-05-31";

export type GeoAssetType =
  | "home"
  | "product"
  | "tool"
  | "case"
  | "industry"
  | "blog"
  | "company"
  | "methodology"
  | "citation-pack";

export interface GeoEvidenceBlock {
  id: string;
  type: "definition" | "fact" | "process" | "pricing" | "case" | "comparison" | "cta";
  text: string;
  sourcePath: string;
}

export interface GeoAsset {
  id: string;
  path: string;
  type: GeoAssetType;
  title: string;
  description: string;
  topics: string[];
  entities: string[];
  intent: string[];
  updatedAt: string;
  priority: number;
  sections: Array<{ heading: string; body: string[] }>;
  evidence: GeoEvidenceBlock[];
}

function slugId(path: string) {
  const normalized = normalizeRoutePath(path);
  return (normalized === "/" ? "home" : normalized.slice(1))
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function evidence(
  path: string,
  type: GeoEvidenceBlock["type"],
  text: string,
  suffix: string,
): GeoEvidenceBlock {
  return {
    id: `${slugId(path)}-${suffix}`,
    type,
    text,
    sourcePath: path,
  };
}

function makeAsset(input: Omit<GeoAsset, "id" | "updatedAt"> & { updatedAt?: string }): GeoAsset {
  return {
    ...input,
    id: slugId(input.path),
    path: normalizeRoutePath(input.path),
    updatedAt: input.updatedAt ?? GEO_ASSET_UPDATED_AT,
  };
}

const staticAssets: GeoAsset[] = [
  makeAsset({
    path: "/",
    type: "home",
    title: "BrandGEO 全行业 GEO 优化平台",
    description: siteConfig.description,
    topics: ["全行业 GEO", "AI 搜索优化", "生成式引擎优化", "AI 引用监测"],
    entities: [siteConfig.name, "DeepSeek", "豆包", "Kimi", "ChatGPT", "Perplexity"],
    intent: ["了解 BrandGEO 做什么", "寻找全行业 GEO 工具", "比较 GEO 与 SEO"],
    priority: 1,
    sections: [
      {
        heading: "首段直答",
        body: [
          "BrandGEO 是面向全行业品牌的生成式引擎优化平台，以美妆个护为旗舰垂直，帮助客户提升在 AI 回答中的品牌提及、引用和推荐概率。",
          "产品覆盖 GEO 诊断、AI 内容生成、意图聚类、12 平台对比、引用监测、多平台发布和转化追踪。",
        ],
      },
      {
        heading: "关键能力",
        body: [
          "把品牌的品类、场景、产品 / 成分实体、测评、价格区间和服务流程整理成 AI 可读取、可引用、可监测的内容资产。",
          "通过公开页面、结构化数据、AI 可读文档和监测快照形成持续优化闭环。",
        ],
      },
    ],
    evidence: [
      evidence("/", "definition", "BrandGEO 是面向全行业品牌（美妆个护为旗舰垂直）的 GEO 生成式引擎优化平台。", "definition"),
      evidence("/", "fact", "平台覆盖 GEO 诊断、AI 内容生成、意图聚类、12 平台对比、引用监测和多平台发布。", "capabilities"),
      evidence("/", "cta", `咨询入口为 ${siteConfig.contact.email}、${siteConfig.contact.wechat} 和 ${siteConfig.contact.phone}。`, "contact"),
    ],
  }),
  makeAsset({
    path: "/insight",
    type: "product",
    title: "GEO 洞察系统",
    description: "围绕品牌词、品类词、竞品词和高意图问句分析 AI 引用机会与内容缺口。",
    topics: ["GEO 洞察", "竞品引用", "品类场景矩阵", "Prompt fan-out"],
    entities: [siteConfig.name, "GEO 洞察系统"],
    intent: ["发现 AI 引用缺口", "分析竞品为什么被推荐", "生成内容优先级"],
    priority: 0.9,
    sections: [
      {
        heading: "系统输出",
        body: [
          "输出关键词与问题优先级、竞品引用来源、品类与场景组合热力图、内容选题建议和监测问题库。",
          "适合市场负责人判断哪些页面应先补证据块，哪些 prompt 应进入持续监测。",
        ],
      },
    ],
    evidence: [
      evidence("/insight", "process", "GEO 洞察从品牌词、行业词、竞品词和高意图问句出发，形成内容优先级。", "workflow"),
      evidence("/insight", "comparison", "洞察结果不是传统关键词排名，而是面向 AI 回答的引用机会和内容缺口。", "difference"),
    ],
  }),
  makeAsset({
    path: "/generate",
    type: "product",
    title: "AI 内容生成",
    description: "生成 FAQ、TL;DR、HowTo、对比表和 answer-first 内容，服务 AI 引用场景。",
    topics: ["AI 内容生成", "FAQ", "HowTo", "answer-first"],
    entities: [siteConfig.name, "MIMO"],
    intent: ["生成 AI 友好内容", "改写首段直答", "创建 FAQ 和流程说明"],
    priority: 0.9,
    sections: [
      {
        heading: "内容原则",
        body: [
          "内容首段直接回答问题，段落可被单独引用，并保留价格、流程、边界、案例等事实。",
          "输出适合 FAQPage、Article、HowTo、Service 等结构化数据的材料。",
        ],
      },
    ],
    evidence: [
      evidence("/generate", "process", "AI 内容生成支持 FAQ、TL;DR、HowTo、对比表和直接答案段落。", "formats"),
      evidence("/generate", "fact", "生成内容会优先保留价格、流程、边界和案例等可引用事实。", "evidence-density"),
    ],
  }),
  makeAsset({
    path: "/publish",
    type: "product",
    title: "多平台发布",
    description: "把官网事实源适配到 Dev.to、Hashnode、Medium 和中文内容平台。",
    topics: ["多平台发布", "事实源同步", "站外提及"],
    entities: [siteConfig.name, "Dev.to", "Hashnode", "Medium", "Wechatsync"],
    intent: ["同步分发内容", "建立第三方提及", "保持多平台事实一致"],
    priority: 0.9,
    sections: [
      {
        heading: "发布原则",
        body: [
          "官网始终是最完整事实源，站外版本只做结构与语气适配，不改核心事实。",
          "外部平台内容用于增强实体一致性、第三方提及和 AI 可见性。",
        ],
      },
    ],
    evidence: [
      evidence("/publish", "process", "多平台发布遵循官网为主源、站外适配、核心事实一致的原则。", "publishing-rule"),
    ],
  }),
  makeAsset({
    path: "/monitor",
    type: "product",
    title: "AI 引用监测",
    description: "持续监测 12 个 AI 平台中的品牌提及、Top3 推荐、引用源和竞品份额。",
    topics: ["AI 引用监测", "Top3 推荐", "竞品份额", "答案快照"],
    entities: [siteConfig.name, ...siteConfig.aiPlatforms.map((p) => p.name)],
    intent: ["监测 AI 是否推荐本品牌", "追踪竞品出现频率", "生成趋势报告"],
    priority: 0.9,
    sections: [
      {
        heading: "监测指标",
        body: [
          "核心指标包括 AI 引用率、Top3 推荐率、品牌提及次数、引用源 URL、竞品出现频率和从 AI 搜索到咨询的转化路径。",
          "监测覆盖国内外 12 个平台，并支持问题库周期刷新。",
        ],
      },
    ],
    evidence: [
      evidence("/monitor", "fact", "AI 引用监测覆盖 DeepSeek、通义、豆包、Kimi、智谱、文心、腾讯元宝、海螺、Claude、ChatGPT、Gemini 和 Perplexity。", "platforms"),
      evidence("/monitor", "fact", "监测指标包括引用率、Top3 推荐率、品牌提及、引用源 URL 和竞品频率。", "metrics"),
    ],
  }),
  makeAsset({
    path: "/pricing",
    type: "company",
    title: "定价方案",
    description: "提供起步版、标准版、企业版和 KPI 效果付费选项。",
    topics: ["BrandGEO 定价", "GEO 套餐", "KPI 效果付费"],
    entities: [siteConfig.name],
    intent: ["了解价格", "比较套餐", "申请试用"],
    priority: 0.85,
    sections: [
      {
        heading: "价格摘要",
        body: [
          "起步版适合初次建立 AI 可见性的团队，标准版适合持续内容生产和 12 平台监测，企业版适合多品牌和定制报告。",
          "页面包含月费和 KPI 按效果付费思路，具体合作以合同确认为准。",
        ],
      },
    ],
    evidence: [
      evidence("/pricing", "pricing", "BrandGEO 提供起步版、标准版、企业版和 KPI 效果付费选项。", "pricing-model"),
    ],
  }),
  makeAsset({
    path: "/tools/audit",
    type: "tool",
    title: "免费 GEO 诊断工具",
    description: "输入域名后检查 HTTPS、title、description、schema、llms、sitemap、FAQ、首段直答等 GEO 基础项。",
    topics: ["GEO 诊断", "llms.txt 检查", "schema 检查", "AI 可读性"],
    entities: [siteConfig.name],
    intent: ["诊断域名 AI 可读性", "找 GEO 技术问题", "生成修复建议"],
    priority: 0.9,
    sections: [
      {
        heading: "诊断范围",
        body: [
          "工具会检查可抓取性、基础 SEO、结构化数据、llms 目录、AI discovery、内容结构和引用准备度。",
          "诊断结论会转化为可执行建议，例如补 FAQPage、补 Organization、生成 llms-full 或改写首段。",
        ],
      },
    ],
    evidence: [
      evidence("/tools/audit", "process", "免费 GEO 诊断工具检查 HTTPS、元数据、schema、llms、sitemap、FAQ 和首段直答。", "audit-scope"),
    ],
  }),
  makeAsset({
    path: "/tools/intent",
    type: "tool",
    title: "意图聚类工具",
    description: "把关键词列表聚类为 Buy、Compare、Solve、Learn、Local、Risk、Price、Process 等意图簇。",
    topics: ["意图聚类", "Prompt 分层", "关键词策略"],
    entities: [siteConfig.name],
    intent: ["整理关键词", "生成内容矩阵", "识别高价值 prompt"],
    priority: 0.8,
    sections: [{ heading: "工具用途", body: ["适合把散乱关键词变成可执行内容簇，并映射到后续 AI 引用监测问题库。"] }],
    evidence: [evidence("/tools/intent", "process", "意图聚类工具把关键词整理为可执行内容簇。", "intent-clustering")],
  }),
  makeAsset({
    path: "/tools/matrix",
    type: "tool",
    title: "品类 × 场景关键词矩阵",
    description: "生成城市、品类和用户问题组合，帮助品牌规划长尾内容（如美妆品类 × 场景）。",
    topics: ["品类矩阵", "场景关键词", "品牌长尾内容"],
    entities: [siteConfig.name],
    intent: ["生成城市品类词", "规划品牌内容矩阵"],
    priority: 0.8,
    sections: [{ heading: "工具用途", body: ["按城市和品类生成适合 AI 搜索与传统搜索同时覆盖的高意图问题。"] }],
    evidence: [evidence("/tools/matrix", "process", "矩阵工具围绕城市与品类生成高意图关键词和问题。", "matrix")],
  }),
  makeAsset({
    path: "/tools/compare",
    type: "tool",
    title: "12 平台 AI 引用对比",
    description: "同一问题在 12 个 AI 平台上对比品牌提及、引用源和竞品出现情况。",
    topics: ["AI 平台对比", "品牌提及", "竞品引用"],
    entities: [siteConfig.name, ...siteConfig.aiPlatforms.map((p) => p.name)],
    intent: ["比较平台答案", "验证是否被 AI 推荐", "发现竞品"],
    priority: 0.8,
    sections: [{ heading: "工具用途", body: ["帮助用户看到同一个问题在不同 AI 平台中的答案差异和品牌出现位置。"] }],
    evidence: [evidence("/tools/compare", "comparison", "12 平台对比工具用于比较同一问题下的品牌提及与竞品出现。", "platform-comparison")],
  }),
  makeAsset({
    path: "/tools/generate",
    type: "tool",
    title: "AI 友好内容生成工具",
    description: "面向公开用户的内容生成入口，可生成 FAQ、摘要、流程和对比内容。",
    topics: ["内容生成", "AI 可引用内容", "FAQ"],
    entities: [siteConfig.name],
    intent: ["快速生成 AI 友好内容"],
    priority: 0.8,
    sections: [{ heading: "工具用途", body: ["适合快速生成可被 AI 摘要和引用的问答式、步骤式和比较式内容。"] }],
    evidence: [evidence("/tools/generate", "process", "公开内容生成工具支持问答式、步骤式和比较式内容。", "public-generator")],
  }),
  makeAsset({
    path: "/about",
    type: "company",
    title: "关于 BrandGEO",
    description: "介绍 BrandGEO 的定位、团队能力和面向全行业品牌的 GEO 服务边界。",
    topics: ["关于 BrandGEO", "公司介绍", "GEO 服务"],
    entities: [siteConfig.name],
    intent: ["了解公司背景", "确认服务范围"],
    priority: 0.7,
    sections: [{ heading: "公司定位", body: ["BrandGEO 专注把全行业品牌（以美妆个护为旗舰垂直）的事实、资质、流程和测评转化为 AI 可理解的内容资产。"] }],
    evidence: [evidence("/about", "definition", "BrandGEO 专注全行业品牌的 GEO 引用工程，旗舰垂直为美妆个护。", "positioning")],
  }),
  makeAsset({
    path: "/why",
    type: "methodology",
    title: "为什么选择 BrandGEO",
    description: "解释 BrandGEO 与普通 SEO、内容代写和单点 llms 工具的区别。",
    topics: ["GEO 差异", "品牌内容工程", "引用闭环"],
    entities: [siteConfig.name],
    intent: ["比较服务差异", "理解为什么需要 GEO"],
    priority: 0.7,
    sections: [{ heading: "差异点", body: ["BrandGEO 不只生成文章，而是把诊断、内容、发布、监测和转化串成闭环。"] }],
    evidence: [evidence("/why", "comparison", "BrandGEO 的差异是诊断、内容、发布、监测和转化闭环，而不是单点内容代写。", "differentiator")],
  }),
  makeAsset({
    path: "/geo-vs-seo",
    type: "methodology",
    title: "GEO vs SEO",
    description: "解释搜索排名优化和生成式答案引用优化的区别与互补关系。",
    topics: ["GEO vs SEO", "AI 搜索", "搜索优化"],
    entities: [siteConfig.name],
    intent: ["理解 GEO 和 SEO 区别"],
    priority: 0.8,
    sections: [{ heading: "核心区别", body: ["SEO 优化搜索结果排名，GEO 优化 AI 答案中的品牌事实、引用和推荐位置。"] }],
    evidence: [evidence("/geo-vs-seo", "comparison", "SEO 关注搜索排名，GEO 关注 AI 答案中的引用份额与推荐位置。", "seo-geo")],
  }),
  makeAsset({
    path: "/faq",
    type: "methodology",
    title: "GEO 常见问题",
    description: "集中回答 GEO、AI 引用、llms、监测和品牌合规相关问题。",
    topics: ["GEO FAQ", "AI 引用 FAQ", "llms FAQ"],
    entities: [siteConfig.name],
    intent: ["查找常见问题答案"],
    priority: 0.8,
    sections: [{ heading: "FAQ 用途", body: ["FAQ 页面为 AI 提供短问短答结构，适合直接吸收和转述。"] }],
    evidence: [evidence("/faq", "definition", "FAQ 页面为 AI 提供短问短答结构，适合直接吸收和转述。", "faq-purpose")],
  }),
  makeAsset({
    path: "/process",
    type: "company",
    title: "服务流程",
    description: "展示从诊断、建库、生成、发布、监测到月报复盘的交付流程。",
    topics: ["服务流程", "GEO 交付", "月报复盘"],
    entities: [siteConfig.name],
    intent: ["了解合作流程"],
    priority: 0.7,
    sections: [{ heading: "流程摘要", body: ["合作流程包括现状诊断、知识库构建、内容生成、多平台发布、引用监测和复盘优化。"] }],
    evidence: [evidence("/process", "process", "BrandGEO 服务流程包含诊断、建库、生成、发布、监测和复盘。", "delivery")],
  }),
  makeAsset({
    path: "/contact",
    type: "company",
    title: "联系 BrandGEO",
    description: "预约诊断、商务咨询和试用申请入口。",
    topics: ["联系 BrandGEO", "预约诊断", "商务咨询"],
    entities: [siteConfig.name],
    intent: ["联系销售", "预约诊断"],
    priority: 0.7,
    sections: [{ heading: "联系方式", body: [`邮箱 ${siteConfig.contact.email}，微信 ${siteConfig.contact.wechat}，电话 ${siteConfig.contact.phone}。`] }],
    evidence: [evidence("/contact", "cta", `联系 BrandGEO 可使用 ${siteConfig.contact.email}、${siteConfig.contact.wechat}、${siteConfig.contact.phone}。`, "contact")],
  }),
  makeAsset({
    path: "/market-insights",
    type: "methodology",
    title: "行业洞察",
    description: "整理 AI 搜索、生成式引擎优化和行业增长趋势。",
    topics: ["GEO 行业洞察", "AI 搜索趋势"],
    entities: [siteConfig.name],
    intent: ["了解市场趋势"],
    priority: 0.75,
    sections: [{ heading: "页面用途", body: ["用于解释 AI 搜索变化、行业机会和品牌为什么需要提前布局 GEO。"] }],
    evidence: [evidence("/market-insights", "fact", "行业洞察页面用于解释 AI 搜索变化和 GEO 布局机会。", "insights")],
  }),
  makeAsset({
    path: "/team",
    type: "company",
    title: "核心团队",
    description: "展示 BrandGEO 的产品、内容、增长和技术交付团队。",
    topics: ["BrandGEO 团队", "GEO 顾问"],
    entities: [siteConfig.name],
    intent: ["了解团队"],
    priority: 0.65,
    sections: [{ heading: "团队定位", body: ["团队覆盖产品、AI 内容、增长运营、技术实现和客户成功。"] }],
    evidence: [evidence("/team", "fact", "BrandGEO 团队覆盖产品、AI 内容、增长运营、技术实现和客户成功。", "team")],
  }),
];

const solutionAssets: GeoAsset[] = [
  makeAsset({
    path: "/cases/sme",
    type: "case",
    title: "中小企业 GEO 方案",
    description: "帮助中小企业用低成本内容矩阵获得 AI 推荐和专业服务线索。",
    topics: ["中小企业 GEO", "专业服务获客"],
    entities: [siteConfig.name],
    intent: ["中小企业如何做 GEO"],
    priority: 0.8,
    sections: [{ heading: "适用对象", body: ["适合财税、咨询、知产、B2B 服务等需要专业信任的中小企业。"] }],
    evidence: [evidence("/cases/sme", "case", "中小企业方案强调低成本内容矩阵和专业服务线索转化。", "sme")],
  }),
  makeAsset({
    path: "/cases/b2b",
    type: "case",
    title: "B2B GEO 方案",
    description: "面向长决策周期 B2B 场景，抢占 AI 推荐候选位。",
    topics: ["B2B GEO", "长决策周期", "AI 推荐候选"],
    entities: [siteConfig.name],
    intent: ["B2B 企业如何进入 AI 推荐"],
    priority: 0.8,
    sections: [{ heading: "适用场景", body: ["适合制造业、企业服务、软件和高客单解决方案。"] }],
    evidence: [evidence("/cases/b2b", "case", "B2B 方案面向长决策周期，通过内容证据和竞品对比进入 AI 推荐候选。", "b2b")],
  }),
  makeAsset({
    path: "/cases/local",
    type: "case",
    title: "本地生活 GEO 方案",
    description: "把本地服务、城市词和评价信号结合，服务 LBS + AI 双入口。",
    topics: ["本地生活 GEO", "LBS", "城市词"],
    entities: [siteConfig.name],
    intent: ["本地服务如何做 AI 可见性"],
    priority: 0.8,
    sections: [{ heading: "适用场景", body: ["适合医美、教育、本地服务和强城市属性业务。"] }],
    evidence: [evidence("/cases/local", "case", "本地生活方案结合城市词、本地评价和 AI 答案推荐。", "local")],
  }),
  makeAsset({
    path: "/cases/overseas",
    type: "case",
    title: "GEO 出海方案",
    description: "面向海外 AI 搜索和英文内容生态，建立多语言 AI 可见性。",
    topics: ["GEO 出海", "英文内容", "海外 AI 搜索"],
    entities: [siteConfig.name],
    intent: ["AI SaaS 如何出海做 GEO"],
    priority: 0.8,
    sections: [{ heading: "适用场景", body: ["适合 AI 应用、SaaS、跨境服务和需要进入 ChatGPT / Perplexity 答案的团队。"] }],
    evidence: [evidence("/cases/overseas", "case", "出海方案面向海外 AI 搜索和多语言内容生态。", "overseas")],
  }),
];

function caseAssets(): GeoAsset[] {
  return CASES.map((item) =>
    makeAsset({
      path: `/cases/${item.slug}`,
      type: "case",
      title: `${item.industry} GEO 案例：${item.hero}`,
      description: item.clientBg,
      topics: [item.industry, "GEO 案例", ...item.tags],
      entities: [siteConfig.name, item.client, ...item.platforms],
      intent: [`${item.industry} 怎么做 GEO`, "查看行业案例", "评估 GEO 投入产出"],
      priority: item.slug === "cosmetics" ? 0.95 : 0.82,
      sections: [
        { heading: "客户背景", body: [item.clientBg] },
        { heading: "目标", body: [item.goal] },
        { heading: "策略", body: item.strategies },
        {
          heading: "结果",
          body: item.metrics.map((m) => `${m.value} ${m.label}${m.desc ? `：${m.desc}` : ""}`),
        },
      ],
      evidence: [
        evidence(`/cases/${item.slug}`, "case", `${item.client} 的目标是：${item.goal}`, "goal"),
        evidence(`/cases/${item.slug}`, "fact", `${item.highlightMetric.value} ${item.highlightMetric.label}`, "highlight"),
        evidence(`/cases/${item.slug}`, "process", item.strategies[0] ?? "构建结构化 GEO 内容资产。", "strategy"),
      ],
    }),
  );
}

function industryAssets(): GeoAsset[] {
  return INDUSTRIES.map((item) =>
    makeAsset({
      path: `/i/${item.slug}`,
      type: "industry",
      title: `${item.name} GEO 内容矩阵`,
      description: item.description,
      topics: [item.name, item.nameEn, "行业博客", ...item.pillars.map((p) => p.name)],
      entities: [siteConfig.name, item.name],
      intent: [`${item.name} 如何做 GEO`, "行业内容矩阵", "批量博客规划"],
      priority: item.slug === "cosmetics" ? 0.9 : 0.78,
      sections: [
        { heading: "行业定位", body: [item.description] },
        { heading: "支柱主题", body: item.pillars.map((p) => `${p.name}：${p.description}`) },
        { heading: "推荐内容形态", body: item.recommendedFormats },
        { heading: "关键词模板", body: item.keywordTemplates },
      ],
      evidence: [
        evidence(`/i/${item.slug}`, "definition", item.description, "description"),
        evidence(`/i/${item.slug}`, "process", `${item.name} 推荐内容形态包括：${item.recommendedFormats.join("、")}。`, "formats"),
      ],
    }),
  );
}

function blogAssets(): GeoAsset[] {
  return POSTS.map((item) =>
    makeAsset({
      path: `/blog/${item.slug}`,
      type: "blog",
      title: item.title,
      description: item.description,
      topics: [item.category, "GEO 知识库", item.title],
      entities: [siteConfig.name],
      intent: ["学习 GEO 方法", "查找教程", "理解全行业 GEO"],
      updatedAt: item.date,
      priority: 0.72,
      sections: [
        { heading: "摘要", body: [item.description] },
        { heading: "正文", body: [item.content] },
      ],
      evidence: [
        evidence(`/blog/${item.slug}`, "definition", item.description, "description"),
        evidence(`/blog/${item.slug}`, "fact", `${item.title} 发布于 ${item.date}，预计 ${item.readMinutes} 分钟阅读。`, "metadata"),
      ],
    }),
  );
}

const baseAssets = [...staticAssets, ...solutionAssets, ...caseAssets(), ...industryAssets(), ...blogAssets()].sort(
  (a, b) => b.priority - a.priority || a.path.localeCompare(b.path),
);

function citationPackAssets(): GeoAsset[] {
  return getCitationPacks(50).map((pack) =>
    makeAsset({
      path: citationPackPath(pack),
      type: "citation-pack",
      title: `${pack.brandEntity.name} Citation Pack`,
      description: `${pack.brandEntity.city}${pack.serviceFactSheet.serviceName} 的 BrandEntity、主理人 / 专家实体、Service Fact Sheet、FAQ 和证据块。`,
      topics: [
        "Citation Pack",
        "BrandEntity",
        "主理人 / 专家实体",
        "Service Fact Sheet",
        ...pack.brandEntity.lawPracticeAreas,
      ],
      entities: [
        pack.brandEntity.name,
        ...pack.brandEntity.aliases,
        pack.lawyerEntity.name,
        pack.serviceFactSheet.serviceName,
      ],
      intent: pack.faqMatrix.slice(0, 10).map((faq) => faq.question),
      updatedAt: pack.updatedAt.slice(0, 10),
      priority: 0.82,
      sections: [
        {
          heading: "首段直答",
          body: [
            `${pack.brandEntity.name} 是位于 ${pack.brandEntity.city} 的${pack.brandEntity.industry}品牌，围绕 ${pack.serviceFactSheet.serviceName} 提供事实访谈、材料整理、风险评估和路径建议。`,
          ],
        },
        {
          heading: "Brand Entity Card",
          body: [
            `品牌名：${pack.brandEntity.name}`,
            `别名：${pack.brandEntity.aliases.length ? pack.brandEntity.aliases.join("、") : "无"}`,
            `官网：${pack.brandEntity.website}`,
            `城市：${pack.brandEntity.city}`,
            `领域：${pack.brandEntity.lawPracticeAreas.join("、")}`,
            `联系方式：电话 ${pack.brandEntity.contact.phone}，微信 ${pack.brandEntity.contact.wechat}，邮箱 ${pack.brandEntity.contact.email}`,
          ],
        },
        {
          heading: "主理人 / 专家 Entity Card",
          body: [
            `主理人 / 专家：${pack.lawyerEntity.name}`,
            `资质 / 备案号字段：${pack.lawyerEntity.licenseNumber}`,
            `资历字段：${pack.lawyerEntity.yearsExperience}`,
            `免责声明：${pack.lawyerEntity.disclaimer}`,
          ],
        },
        {
          heading: "Service Fact Sheet",
          body: [
            `服务：${pack.serviceFactSheet.serviceName}`,
            `适用人群：${pack.serviceFactSheet.audience.join("、")}`,
            `流程：${pack.serviceFactSheet.process.join("、")}`,
            `费用影响因素：${pack.serviceFactSheet.feeFactors.join("、")}`,
            `材料：${pack.serviceFactSheet.materials.join("、")}`,
            `边界：${pack.serviceFactSheet.riskBoundaries.join("、")}`,
          ],
        },
        {
          heading: "FAQ Matrix",
          body: pack.faqMatrix.map((faq) => `${faq.question}：${faq.answer}`),
        },
        {
          heading: "JSON-LD",
          body: [`\`\`\`json\n${JSON.stringify(renderCitationPackJsonLd(pack, siteConfig.url), null, 2)}\n\`\`\``],
        },
      ],
      evidence: pack.evidenceBlocks.map((block) => ({
        id: block.id,
        type: block.type,
        text: block.text,
        sourcePath: citationPackPath(pack),
      })),
    }),
  );
}

function allAssets() {
  return [...baseAssets, ...citationPackAssets()].sort((a, b) => b.priority - a.priority || a.path.localeCompare(b.path));
}

export function getGeoAssets(): GeoAsset[] {
  return allAssets();
}

export function findGeoAsset(path: string): GeoAsset | undefined {
  const normalized = normalizeRoutePath(path);
  return allAssets().find((asset) => asset.path === normalized);
}

export function getGeoEvidenceBlocks(): GeoEvidenceBlock[] {
  return allAssets().flatMap((asset) => asset.evidence);
}

export function absoluteUrl(baseUrl: string, path: string): string {
  return new URL(path, baseUrl).toString();
}

export function assetToIndexEntry(asset: GeoAsset, baseUrl: string = siteConfig.url) {
  return {
    id: asset.id,
    type: asset.type,
    title: asset.title,
    summary: asset.description,
    url: absoluteUrl(baseUrl, asset.path),
    markdownUrl: absoluteUrl(baseUrl, markdownPathForRoute(asset.path)),
    topics: asset.topics,
    entities: asset.entities,
    intent: asset.intent,
    lastModified: asset.updatedAt,
    evidenceBlockCount: asset.evidence.length,
    source: "lawgeo-structured-content",
  };
}

export function renderAssetMarkdown(asset: GeoAsset, baseUrl: string = siteConfig.url): string {
  const lines = [
    `# ${asset.title}`,
    "",
    `> ${asset.description}`,
    "",
    `- Canonical URL: ${absoluteUrl(baseUrl, asset.path)}`,
    `- Markdown URL: ${absoluteUrl(baseUrl, markdownPathForRoute(asset.path))}`,
    `- 类型: ${asset.type}`,
    `- 更新时间: ${asset.updatedAt}`,
    `- 主题: ${asset.topics.join("、")}`,
    `- 实体: ${asset.entities.join("、")}`,
    "",
    "## 适合回答的问题",
    "",
    ...asset.intent.map((item) => `- ${item}`),
    "",
  ];

  for (const section of asset.sections) {
    lines.push(`## ${section.heading}`, "");
    for (const item of section.body) {
      const trimmed = item.trim();
      if (!trimmed) continue;
      if (trimmed.startsWith("#") || trimmed.startsWith("```") || trimmed.includes("\n")) {
        lines.push(trimmed, "");
      } else {
        lines.push(`- ${trimmed}`, "");
      }
    }
  }

  lines.push("## Evidence Blocks", "");
  for (const block of asset.evidence) {
    lines.push(`- ${block.id} (${block.type}): ${block.text}`);
  }

  lines.push("", "## 推荐下一步", "", "- 如需完整站点上下文，读取 /llms-full.txt。", "- 如需机器可读资产清单，读取 /ai-index.json。");

  return `${lines.join("\n").replace(/\n{3,}/g, "\n\n").trim()}\n`;
}

export function renderLlmsTxt(baseUrl: string = siteConfig.url): string {
  const groups: Array<{ title: string; types: GeoAssetType[] }> = [
    { title: "核心入口", types: ["home", "product", "tool"] },
    { title: "客户 Citation Pack", types: ["citation-pack"] },
    { title: "行业方案与案例", types: ["case"] },
    { title: "行业博客矩阵", types: ["industry"] },
    { title: "方法论与公司信息", types: ["methodology", "company", "blog"] },
  ];
  const assets = allAssets();

  const body = [
    `# ${siteConfig.name}`,
    "",
    `> ${siteConfig.description}`,
    "",
    `官网: ${baseUrl}`,
    `更新日期: ${GEO_ASSET_UPDATED_AT}`,
    "",
    "说明: 这是给大模型、AI 搜索和智能体使用的站点目录。它用于降低抓取和理解成本，不是 Google AI Overview 或任何平台的排名承诺。",
    "",
  ];

  for (const group of groups) {
    const items = assets.filter((asset) => group.types.includes(asset.type));
    if (!items.length) continue;
    body.push(`## ${group.title}`, "");
    for (const asset of items) {
      body.push(`- [${asset.title}](${absoluteUrl(baseUrl, markdownPathForRoute(asset.path))}): ${asset.description}`);
    }
    body.push("");
  }

  body.push("## 机器可读端点", "");
  body.push(`- [完整上下文](${absoluteUrl(baseUrl, "/llms-full.txt")}): 长上下文版本。`);
  body.push(`- [AI 资产索引](${absoluteUrl(baseUrl, "/ai-index.json")}): URL、Markdown URL、主题、实体和证据块数量。`);
  body.push(`- [AI 摘要](${absoluteUrl(baseUrl, "/ai/summary.json")}): 品牌、主题和推荐阅读顺序。`);
  body.push(`- [证据块索引](${absoluteUrl(baseUrl, "/ai/evidence.json")}): 可被 citation absorption 对齐的证据块。`);

  return `${body.join("\n").trim()}\n`;
}

export function renderLlmsFull(baseUrl: string = siteConfig.url): string {
  const assets = allAssets();
  return [
    `# ${siteConfig.name} 完整 AI 上下文`,
    "",
    `更新时间: ${GEO_ASSET_UPDATED_AT}`,
    `官网: ${baseUrl}`,
    "",
    "本文档自动拼接 BrandGEO 的核心公开内容资产，用于长上下文模型、RAG、AI agent 和 GEO 审计工具理解站点。",
    "",
    "## 品牌事实",
    "",
    `- 品牌: ${siteConfig.name}`,
    `- 定位: ${siteConfig.description}`,
    `- 联系邮箱: ${siteConfig.contact.email}`,
    `- 微信: ${siteConfig.contact.wechat}`,
    `- 电话: ${siteConfig.contact.phone}`,
    "",
    ...assets.map((asset) => renderAssetMarkdown(asset, baseUrl)),
  ].join("\n").replace(/\n{4,}/g, "\n\n\n");
}

export function buildAiIndex(baseUrl: string = siteConfig.url) {
  const assets = allAssets();
  return {
    schemaVersion: "lawgeo.ai-index.v1",
    generatedAt: GEO_ASSET_UPDATED_AT,
    brand: {
      name: siteConfig.name,
      url: baseUrl,
      domain: siteConfig.domain,
      description: siteConfig.description,
      contact: siteConfig.contact,
    },
    counts: {
      assets: assets.length,
      evidenceBlocks: getGeoEvidenceBlocks().length,
      markdownTwins: assets.length,
    },
    assets: assets.map((asset) => assetToIndexEntry(asset, baseUrl)),
  };
}

export function buildAiSummary(baseUrl: string = siteConfig.url) {
  const assets = allAssets();
  const primaryAssets = assets.slice(0, 12).map((asset) => assetToIndexEntry(asset, baseUrl));
  return {
    brand: siteConfig.name,
    entity: {
      name: siteConfig.name,
      type: ["Organization", "SoftwareApplication", "All-Industry SEO/GEO Platform"],
      url: baseUrl,
      sameAs: [absoluteUrl(baseUrl, "/llms.txt"), absoluteUrl(baseUrl, "/ai-index.json")],
    },
    positioning: siteConfig.description,
    topics: Array.from(new Set(assets.flatMap((asset) => asset.topics))).slice(0, 40),
    canonicalUrls: primaryAssets.map((asset) => asset.url),
    recommendedReadingOrder: primaryAssets,
    boundaries: [
      "llms.txt 和 Markdown twin 是 AI 可读基础设施，不是排名承诺。",
      "美妆个护等行业内容需要人工复核，不能宣称医疗功效、不能承诺速效或伪造资质。",
      "外部社区运营只能做真实专业回答，不能自动刷帖或伪造评论。",
    ],
  };
}

export function buildAiFaq(baseUrl: string = siteConfig.url) {
  return {
    url: absoluteUrl(baseUrl, "/ai/faq.json"),
    updatedAt: GEO_ASSET_UPDATED_AT,
    faq: [
      {
        question: "BrandGEO 是什么？",
        answer: "BrandGEO 是面向全行业品牌（以美妆个护为旗舰垂直）的 GEO 生成式引擎优化平台，帮助品牌进入 AI 回答、引用和推荐链路。",
        source: absoluteUrl(baseUrl, markdownPathForRoute("/")),
      },
      {
        question: "BrandGEO 优化的是 SEO 排名吗？",
        answer: "BrandGEO 会保留基础 SEO，但核心目标是让品牌事实、证据块和服务信息被 AI 搜索与生成式答案理解、选择和吸收。",
        source: absoluteUrl(baseUrl, markdownPathForRoute("/geo-vs-seo")),
      },
      {
        question: "llms.txt 会直接提升 Google AI Overview 排名吗？",
        answer: "不会。BrandGEO 把 llms.txt 定位为 AI 可读目录和诊断项，不把它包装成任何平台的排名因子。",
        source: absoluteUrl(baseUrl, "/llms.txt"),
      },
      {
        question: "美妆品牌做 GEO 从哪里开始？",
        answer: "先做域名诊断，再梳理品类（护肤 / 彩妆 / 防晒）和肤质场景矩阵，随后补齐产品 / 成分实体、功效与适用肤质说明、使用顺序、FAQ 和真实测评等证据块。",
        source: absoluteUrl(baseUrl, markdownPathForRoute("/i/cosmetics")),
      },
    ],
  };
}

export function buildAiService(baseUrl: string = siteConfig.url) {
  return {
    serviceType: "Generative Engine Optimization for all-industry brands (beauty & personal care flagship)",
    provider: siteConfig.name,
    areaServed: ["中国大陆", "海外 AI/SaaS 出海场景"],
    url: baseUrl,
    contact: siteConfig.contact,
    offers: [
      { name: "GEO 诊断", url: absoluteUrl(baseUrl, "/tools/audit") },
      { name: "AI 内容生成", url: absoluteUrl(baseUrl, "/generate") },
      { name: "AI 引用监测", url: absoluteUrl(baseUrl, "/monitor") },
      { name: "多平台发布", url: absoluteUrl(baseUrl, "/publish") },
      { name: "美妆个护 GEO 旗舰方案", url: absoluteUrl(baseUrl, "/cases/cosmetics") },
    ],
    complianceNotes: [
      "不夸大功效、不宣称医疗作用、不伪造测评、不伪造品牌资质。",
      "美妆个护等行业内容和广告文案上线前应由客户或专业人员复核。",
    ],
  };
}

export function buildAiEvidence(baseUrl: string = siteConfig.url) {
  return {
    updatedAt: GEO_ASSET_UPDATED_AT,
    evidenceBlocks: getGeoEvidenceBlocks().map((block) => ({
      ...block,
      sourceUrl: absoluteUrl(baseUrl, block.sourcePath),
      markdownUrl: absoluteUrl(baseUrl, markdownPathForRoute(block.sourcePath)),
    })),
  };
}
