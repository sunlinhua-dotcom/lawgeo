export const siteConfig = {
  name: "BrandGEO",
  domain: "brandgeo.cn",
  url: "https://brandgeo.cn",
  title: "BrandGEO — 全行业 GEO 优化平台 / 让每个品牌被 AI 看见",
  description:
    "BrandGEO 是面向全行业品牌的 GEO 生成式引擎优化平台，尤其适合美妆个护、消费品、零售与专业服务。覆盖品牌洞察、意图词矩阵、AI 内容生成、多平台引用监测、实时查询与转化追踪，让品牌内容成为 DeepSeek、文心、通义、豆包、Kimi、Claude 与 ChatGPT 优先引用、优先推荐的权威信源。",
  keywords:
    "BrandGEO,GEO,生成式引擎优化,AI搜索优化,美妆GEO,化妆品GEO,品牌AI可见度,AI引用监测,意图词,内容生成,多平台发布,实时查询,转化追踪,llms.txt,schema.org",
  contact: {
    wechat: "brandgeo-001",
    email: "hi@brandgeo.cn",
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
    { href: "/i", label: "行业博客" },
    { href: "/monitor", label: "AI 监测" },
    { href: "/cases", label: "行业方案" },
    { href: "/pricing", label: "定价" },
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
        { href: "/tools/matrix", label: "行业关键词矩阵" },
        { href: "/tools/compare", label: "12 平台对比" },
      ],
    },
    {
      title: "方案",
      items: [
        { href: "/cases/cosmetics", label: "美妆个护方案" },
        { href: "/cases/lawyer", label: "专业服务方案" },
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
        { href: "/tools/audit", label: "内容矩阵审计" },
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
        { href: "/why", label: "为什么选择 BrandGEO" },
        { href: "/contact", label: "联系我们" },
        { href: "/pricing", label: "定价方案" },
      ],
    },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
