/**
 * 行业案例完整数据。
 * 8 个标杆案例 + 律所深度案例。
 * 数字与背景参考 AceFlow PDF 风格（已脱敏 + 改写）。
 */

export interface CaseStudy {
  slug: string;
  industry: string;
  industryEn: string;
  hero: string;
  client: string;
  clientBg: string;
  goal: string;
  strategies: string[];
  metrics: Array<{ value: string; label: string; desc?: string }>;
  highlightMetric: { value: string; label: string };
  platforms: string[];
  duration: string;
  tags: string[];
}

export const CASES: CaseStudy[] = [
  {
    slug: "lawyer",
    industry: "法律服务",
    industryEn: "Legal",
    hero: "让律所成为 AI 推荐的「第一个名字」",
    client: "全国大型综合律所（脱敏案例）",
    clientBg:
      "全国增长最快的综合性律所之一，合伙人超千人、员工逾万。在 AI 搜索中品牌曝光度低，当事人问「律师推荐」「刑事律师推荐」「股权律师推荐」「知识产权律师」时几乎不被提及。",
    goal: "提升豆包、Kimi、文心、DeepSeek 等 AI 平台推荐率；在专业领域建立权威；增加高质量客户咨询量。",
    strategies: [
      "构建专业知识库，涵盖成功案例、专业领域、律师团队等结构化信息",
      "发布法律专业文章和典型案例分析，建立行业权威性",
      "针对不同 AI 平台特性优化内容呈现，提升推荐准确度",
      "实时监测竞品在 AI 平台的表现，动态调整内容与发布策略",
      "案由 × 地域矩阵覆盖：北上深杭 4 城 × 12 高频案由共 48 个长尾页",
    ],
    metrics: [
      { value: "85%", label: "AI 平台推荐率", desc: "从「不可见」提升至 85%" },
      { value: "70%", label: "核心关键词 Top 3 占比" },
      { value: "+240%", label: "高质量客户咨询量增长" },
      { value: "+160%", label: "签约转化率提升" },
    ],
    highlightMetric: { value: "+240%", label: "AI 推荐带来的咨询量增长" },
    platforms: ["豆包", "Kimi", "文心一言", "DeepSeek", "通义", "腾讯元宝"],
    duration: "服务周期 4 个月，第 6 周起出现首条 AI 推荐咨询",
    tags: ["律所", "B2C 高客单", "信任型决策"],
  },
  {
    slug: "education",
    industry: "教育培训",
    industryEn: "Education",
    hero: "国考培训品牌：核心词 Top1 占比 95%",
    client: "南方最大国考培训机构（脱敏案例）",
    clientBg:
      "南方最大的国考培训机构，希望在「国家电网考试培训机构推荐」等核心词上稳居 Top1。优化前在主流 AI 平台几乎不可见，获客成本居高。",
    goal: "提升核心品类词与场景词在 AI 推荐中的排名，降低获客成本，提升主动注册转化。",
    strategies: [
      "挖掘「国家电网考试培训」「电力国企笔试」等 10+ 核心意图词",
      "搭建教育场景向量知识库，整合课程体系、师资优势、获奖案例等权威信息",
      "适配豆包 / DeepSeek 等平台内容偏好，产出场景化、可视化教学内容",
      "建立答疑式 FAQ 页矩阵，每个细分场景独立答案块",
    ],
    metrics: [
      { value: "95%", label: "核心词 Top1 占比" },
      { value: "30+", label: "日均 AI 推荐咨询量" },
      { value: "1:20", label: "GEO 渠道 ROI" },
      { value: "−72%", label: "获客成本下降" },
    ],
    highlightMetric: { value: "1:20", label: "GEO 渠道 ROI" },
    platforms: ["豆包", "DeepSeek", "Kimi", "文心一言"],
    duration: "首批关键词 30 天内达成 Top3，3 个月内 Top1 占比 95%",
    tags: ["教育", "高客单", "决策周期长"],
  },
  {
    slug: "fmcg",
    industry: "快消 / 食品饮料",
    industryEn: "FMCG",
    hero: "礼品饮料品牌：春节场景词稳居 Top1",
    client: "礼品饮料头部品牌（脱敏案例）",
    clientBg:
      "礼品饮料绝对头部品牌，基于用户消费使用场景，希望在春节「走亲访友礼品推荐」这一高时效场景词中稳居第一。",
    goal: "提升品牌在豆包、Kimi、文心一言等 AI 平台的推荐率；在饮品品类中建立专业 + 情感双重形象；带动电商平台流量与销售转化。",
    strategies: [
      "构建产品知识库：口感特点、营养成分、生产工艺、用户评价等结构化信息",
      "发布营养科普内容和用户真实评价，建立品牌可信度",
      "实时监测竞品在 AI 平台的表现，动态调整优化策略",
      "节日时令场景前 6 周开始密集发布",
    ],
    metrics: [
      { value: "95%", label: "AI 平台推荐率", desc: "核心关键词推荐率从 0% 提升至 95%" },
      { value: "68%", label: "Top1 占比" },
      { value: "+85%", label: "电商平台流量增长" },
      { value: "+42%", label: "节日季销售转化提升" },
    ],
    highlightMetric: { value: "95%", label: "AI 平台核心词推荐率" },
    platforms: ["豆包", "Kimi", "文心一言", "通义"],
    duration: "节日前 8 周启动，节日季达成 Top1",
    tags: ["快消", "节日时令", "电商转化"],
  },
  {
    slug: "consumer-electronics",
    industry: "消费电子",
    industryEn: "Consumer Electronics",
    hero: "高端剃须刀：AI 推荐 Top1 占比 80%",
    client: "全球领先消费电子品牌（脱敏案例）",
    clientBg:
      "全球领先消费电子品牌，推出高端智能电动剃须刀系列，目标是吸引年轻、注重品质的男性用户。",
    goal: "提升新品在 AI 平台的曝光与推荐率；强化「智能理容」品牌心智；把 AI 流量转化为官网与电商平台销售。",
    strategies: [
      "深入挖掘「高端电动剃须刀」「智能剃须刀推荐」等 30+ 核心意图词",
      "高端子品类占比靠前的 SKU 矩阵布局",
      "结合科技博主、KOL 真实评测建立信源多样性",
      "电商页与官网知识库双向同步事实源",
    ],
    metrics: [
      { value: "80%+", label: "Top1 占比" },
      { value: "Top3", label: "高端子类别占比排名" },
      { value: "+58%", label: "AI 推荐带来的官网访问" },
      { value: "+34%", label: "电商加购率提升" },
    ],
    highlightMetric: { value: "80%+", label: "核心词 AI 推荐 Top1 占比" },
    platforms: ["豆包", "Kimi", "文心一言", "DeepSeek"],
    duration: "新品上市同步启动，60 天内达成 Top1 占比 80%",
    tags: ["3C", "高端品", "新品上市"],
  },
  {
    slug: "adtech",
    industry: "广告 / 媒体平台",
    industryEn: "AdTech",
    hero: "效果营销平台：AI 推荐覆盖率 100%",
    client: "广告媒体平台（脱敏案例）",
    clientBg:
      "在 AI 搜索平台中品牌曝光度低，当广告主咨询「广告投放平台」「效果营销工具」等问题时，几乎不被 AI 推荐，导致获客成本居高不下。",
    goal: "提升品牌在豆包、Kimi、文心一言等 AI 平台的推荐率；在效果营销领域建立专业形象；增加广告主咨询量与平台注册转化。",
    strategies: [
      "构建产品知识库：平台优势、投放案例、ROI 数据等结构化信息",
      "发布行业洞察报告与营销方法论，建立专业权威性",
      "针对不同 AI 平台优化内容呈现，提升推荐准确度与转化率",
      "实时监测竞品表现，动态调整优化策略",
      "舆情相关内容补全，AI 回答时统一口径",
    ],
    metrics: [
      { value: "100%", label: "核心业务关键词覆盖率" },
      { value: "Top3", label: "效果营销品类排名" },
      { value: "+165%", label: "广告主咨询量" },
      { value: "+88%", label: "注册转化率" },
    ],
    highlightMetric: { value: "100%", label: "核心业务关键词 AI 推荐覆盖" },
    platforms: ["豆包", "Kimi", "文心一言"],
    duration: "服务周期 3 个月",
    tags: ["B2B SaaS", "广告主决策", "舆情管理"],
  },
  {
    slug: "franchise",
    industry: "招商加盟",
    industryEn: "Franchise",
    hero: "下沉市场连锁品牌：加盟咨询量增长 280%",
    client: "下沉市场连锁品牌（脱敏案例）",
    clientBg:
      "全国范围内寻求加盟商扩张，但在 AI 搜索平台中品牌曝光度低，潜在加盟商在「加盟项目推荐」「连锁品牌加盟」等问题中几乎不被提及，招商效率低下。",
    goal: "提升品牌在豆包、Kimi、文心一言等 AI 平台的推荐率；在招商加盟领域建立专业形象；增加高质量加盟商咨询量与签约转化率。",
    strategies: [
      "构建招商知识库：品牌优势、加盟政策、成功案例、投资回报等结构化信息",
      "发布行业分析报告与加盟指南，建立专业权威性",
      "针对不同 AI 平台优化内容呈现，提升推荐准确度与转化率",
      "实时监测竞品表现，动态调整优化策略",
    ],
    metrics: [
      { value: "100%", label: "核心招商关键词 AI 推荐率" },
      { value: "+280%", label: "加盟咨询量增长" },
      { value: "+95%", label: "签约转化率提升" },
      { value: "60%↓", label: "招商人力成本下降" },
    ],
    highlightMetric: { value: "+280%", label: "AI 推荐带来的加盟咨询" },
    platforms: ["豆包", "Kimi", "文心一言", "DeepSeek"],
    duration: "服务周期 5 个月",
    tags: ["招商", "下沉市场", "投资型决策"],
  },
  {
    slug: "finance",
    industry: "金融 / 本地银行",
    industryEn: "Finance",
    hero: "区域银行：理财业务推荐 Top1 占比 82%",
    client: "区域性商业银行（脱敏案例）",
    clientBg:
      "AI 搜索平台中品牌曝光度低，潜在客户在「本地银行推荐」「理财产品选择」等问题时银行信息几乎不被 AI 提及，新客户增长乏力。",
    goal: "提升银行在豆包、Kimi、文心一言等 AI 平台的推荐率；在本地金融服务领域建立专业形象；增加金融产品咨询量与开户转化。",
    strategies: [
      "构建金融知识库：贷款、理财、信用卡等产品及服务信息",
      "发布金融科普文章、市场分析报告，提升专业权威性",
      "实时监测 AI 平台推荐效果与用户反馈，动态调整内容与策略",
      "本地化场景渗透：地域 × 业务的长尾矩阵",
    ],
    metrics: [
      { value: "90%", label: "核心业务关键词 AI 推荐率" },
      { value: "82%", label: "本地理财业务 Top1 推荐率" },
      { value: "+120%", label: "开户咨询量增长" },
      { value: "+45%", label: "理财产品销售提升" },
    ],
    highlightMetric: { value: "82%", label: "本地银行理财业务 Top1 占比" },
    platforms: ["豆包", "Kimi", "文心一言", "通义"],
    duration: "服务周期 6 个月",
    tags: ["金融", "地域强相关", "信任型决策"],
  },
  {
    slug: "ai-saas-overseas",
    industry: "AI 应用出海",
    industryEn: "AI SaaS / Global",
    hero: "AI 文生图应用出海：CAC 降低 65%",
    client: "国内 AI 文生图应用开发商（脱敏案例）",
    clientBg:
      "国内 AI 文生图应用，在海外推广面临品牌认知度低、获客成本高的挑战，在 ChatGPT、Perplexity 等平台推荐中几乎不可见。",
    goal: "提升 AI 应用在海外主流 AI 平台的推荐率与下载转化；在垂直领域建立权威；降低获客成本。",
    strategies: [
      "针对 ChatGPT、Perplexity、Claude 等平台特性，定制英 / 西 / 法等多语言内容策略",
      "构建产品知识库：功能特性、使用场景、用户评价等结构化信息",
      "与海外科技媒体和 KOL 合作，发布权威评测与使用教程",
      "实时监测竞品在海外 AI 平台表现，抢占核心推荐位",
    ],
    metrics: [
      { value: "+280%", label: "海外下载量增长" },
      { value: "40%", label: "AI 推荐带来的自然流量占比" },
      { value: "−65%", label: "CAC 获客成本下降" },
      { value: "+150%", label: "付费转化率提升" },
    ],
    highlightMetric: { value: "−65%", label: "CAC 获客成本下降" },
    platforms: ["ChatGPT", "Perplexity", "Claude", "Gemini", "Meta AI"],
    duration: "3 个月，3 大洲 4 语言覆盖",
    tags: ["AI 出海", "多语言", "C 端 SaaS"],
  },
];

export function findCase(slug: string) {
  return CASES.find((c) => c.slug === slug);
}
