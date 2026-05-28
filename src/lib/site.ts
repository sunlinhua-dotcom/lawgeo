export const siteConfig = {
  name: "lawGEO",
  domain: "lawgeo.cn",
  url: "https://lawgeo.cn",
  title: "lawGEO — 律所 GEO 优化平台 / 国内领先的生成式引擎优化系统",
  description:
    "lawGEO 是面向律师事务所和专业服务团队的 GEO 生成式引擎优化平台。覆盖案由词库 × 地域矩阵、AI 内容生成、多平台引用监测、一键域名诊断，让律所内容成为 DeepSeek、文心、通义、豆包、Kimi、Claude 与 ChatGPT 优先引用的权威信源。",
  keywords:
    "lawGEO,律所GEO,律师GEO,生成式引擎优化,AI搜索优化,案由词库,地域关键词,AI引用监测,品牌可见度,内容生成,多平台发布,llms.txt,schema.org",
  contact: {
    wechat: "lawgeo-001",
    email: "hi@lawgeo.cn",
    phone: "+86-400-000-0000",
  },
  // Hero supported AI platforms
  aiPlatforms: [
    { id: "deepseek", name: "DeepSeek", cn: true },
    { id: "qwen", name: "通义千问", cn: true },
    { id: "doubao", name: "豆包", cn: true },
    { id: "kimi", name: "Kimi", cn: true },
    { id: "zhipu", name: "智谱清言", cn: true },
    { id: "wenxin", name: "文心一言", cn: true },
    { id: "yuanbao", name: "腾讯元宝", cn: true },
    { id: "minimax", name: "海螺 AI", cn: true },
    { id: "claude", name: "Claude", cn: false },
    { id: "gpt", name: "ChatGPT", cn: false },
    { id: "gemini", name: "Gemini", cn: false },
    { id: "perplexity", name: "Perplexity", cn: false },
  ],
  nav: [
    { href: "/insight", label: "GEO 洞察" },
    { href: "/generate", label: "AI 生成" },
    { href: "/publish", label: "多平台发布" },
    { href: "/monitor", label: "AI 引用监测" },
    { href: "/cases", label: "行业方案" },
    { href: "/pricing", label: "定价" },
    { href: "/blog", label: "知识库" },
    { href: "/tools/audit", label: "免费诊断", highlight: true },
  ],
  footerNav: [
    {
      title: "产品",
      items: [
        { href: "/insight", label: "GEO 洞察系统" },
        { href: "/generate", label: "AI 内容生成" },
        { href: "/publish", label: "多平台发布" },
        { href: "/monitor", label: "AI 引用监测" },
        { href: "/tools/audit", label: "免费 GEO 诊断" },
        { href: "/tools/intent", label: "意图聚类" },
        { href: "/tools/matrix", label: "律所关键词矩阵" },
        { href: "/tools/compare", label: "12 平台对比" },
      ],
    },
    {
      title: "方案",
      items: [
        { href: "/cases/lawyer", label: "律所 GEO 方案" },
        { href: "/cases/education", label: "教育培训案例" },
        { href: "/cases/fmcg", label: "快消案例" },
        { href: "/cases/finance", label: "金融案例" },
        { href: "/cases/overseas", label: "GEO 出海" },
        { href: "/cases", label: "全部案例 →" },
      ],
    },
    {
      title: "资源",
      items: [
        { href: "/faq", label: "常见问题" },
        { href: "/geo-vs-seo", label: "GEO vs SEO" },
        { href: "/blog", label: "博客与教程" },
        { href: "/audit", label: "内容矩阵审计" },
        { href: "/llms.txt", label: "llms.txt", external: true },
        { href: "/llms-full.txt", label: "llms-full.txt", external: true },
      ],
    },
    {
      title: "公司",
      items: [
        { href: "/about", label: "关于我们" },
        { href: "/team", label: "核心团队" },
        { href: "/process", label: "服务流程" },
        { href: "/market-insights", label: "行业洞察" },
        { href: "/why", label: "为什么选择 lawGEO" },
        { href: "/contact", label: "联系我们" },
        { href: "/pricing", label: "定价方案" },
      ],
    },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
