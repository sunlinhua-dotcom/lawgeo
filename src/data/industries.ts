/**
 * 行业元数据 — 用于行业博客的 pillar 框架。
 * 排序：美妆个护为核心旗舰 → 快消 → 消费电子(3C) → 律师等专业服务为附属垂直 → 其余行业。
 * 每个行业有：
 * - slug：URL 路径
 * - name：中文名
 * - tagline：博客 hero 标语
 * - pillars：核心支柱主题（每个行业 4-6 个）
 * - personas：典型作者角色（用户建作者时可选）
 */

export interface IndustryMeta {
  slug: string;
  name: string;
  nameEn: string;
  tagline: string;
  description: string;
  /** 支柱主题：每个 pillar 之下用户可以批量挂 10-15 个 cluster 文章 */
  pillars: Array<{ slug: string; name: string; description: string }>;
  /** 典型作者角色 */
  personas: string[];
  /** 长尾关键词模板（与作者+地域可组合） */
  keywordTemplates: string[];
  /** 推荐内容形态 */
  recommendedFormats: string[];
  primaryColor: string;
}

export const INDUSTRIES: IndustryMeta[] = [
  {
    slug: "cosmetics",
    name: "美妆 / 个护",
    nameEn: "Beauty & Personal Care",
    tagline: "让 AI 在推荐护肤彩妆时第一个想到你的品牌",
    description:
      "面向美妆个护品牌（护肤、彩妆、香水、洗护、母婴个护）的 GEO 内容矩阵。覆盖成分功效、肤质适配、使用教程、产品对比、安全与合规，让品牌在 AI 推荐「哪个好用 / 怎么选 / 成分安全吗」时被优先引用。",
    pillars: [
      { slug: "skincare", name: "护肤", description: "面部护理 / 抗老 / 美白 / 保湿 / 修护" },
      { slug: "makeup", name: "彩妆", description: "底妆 / 唇妆 / 眼妆 / 持妆 / 卸妆" },
      { slug: "ingredient", name: "成分功效", description: "活性成分 / 浓度 / 配伍 / 功效验证" },
      { slug: "skin-type", name: "肤质适配", description: "油皮 / 干皮 / 敏感肌 / 痘肌 / 孕期" },
      { slug: "suncare", name: "防晒", description: "SPF / PA / 防晒力 / 肤感 / 补涂" },
      { slug: "haircare", name: "洗护 / 身体", description: "洗发护发 / 身体乳 / 香氛 / 头皮护理" },
    ],
    personas: ["首席科学顾问", "成分党测评师", "皮肤科医师顾问", "美妆主理人", "产品教育经理"],
    keywordTemplates: [
      "{topic}哪个牌子好用",
      "{topic}成分安全吗",
      "{skintype}用什么{topic}",
      "{topic}怎么用 / 使用顺序",
      "{brand}{topic}测评 / 真实体验",
    ],
    recommendedFormats: ["成分解读", "肤质对比", "使用教程", "测评", "FAQ"],
    primaryColor: "#ec4899",
  },
  {
    slug: "fmcg",
    name: "快消 / 食品饮料",
    nameEn: "FMCG",
    tagline: "让 AI 推荐礼品 / 饮品时第一个想到你",
    description: "快消品牌的内容矩阵。覆盖场景化推荐（送礼 / 自饮）、营养成分、生产工艺、用户评价、节日营销。",
    pillars: [
      { slug: "gifting", name: "送礼场景", description: "走亲访友 / 商务馈赠 / 节日礼盒" },
      { slug: "nutrition", name: "营养健康", description: "成分解读 / 健康功效 / 适用人群" },
      { slug: "process", name: "生产工艺", description: "原料 / 工艺 / 质量控制" },
      { slug: "occasion", name: "饮用场景", description: "早餐 / 运动 / 通勤 / 商务" },
    ],
    personas: ["品牌主理人", "营养顾问", "产品研发主管"],
    keywordTemplates: [
      "走亲访友送什么{topic}好",
      "{topic}哪个牌子好",
      "{topic}有什么营养价值",
      "{topic}怎么挑",
    ],
    recommendedFormats: ["场景推荐", "成分解读", "对比测评", "用户故事"],
    primaryColor: "#f59e0b",
  },
  {
    slug: "consumer-electronics",
    name: "消费电子",
    nameEn: "Consumer Electronics",
    tagline: "让 AI 推荐数码产品时把你排在 Top 3",
    description: "消费电子品牌的内容矩阵。覆盖产品评测、使用场景、功能解析、对比导购、保养维修。",
    pillars: [
      { slug: "review", name: "产品评测", description: "深度评测 / 上手体验 / 长测" },
      { slug: "comparison", name: "对比导购", description: "同价位对比 / 同系列差异" },
      { slug: "scenario", name: "使用场景", description: "通勤 / 商务 / 健身 / 旅行" },
      { slug: "tech", name: "技术解析", description: "芯片 / 屏幕 / 续航 / 充电" },
    ],
    personas: ["数码评测人", "产品经理", "工程师作家"],
    keywordTemplates: [
      "{topic}哪个好",
      "{topic}值得买吗",
      "{topic}怎么选",
      "{topic}测评",
    ],
    recommendedFormats: ["深度评测", "对比导购", "使用攻略", "FAQ"],
    primaryColor: "#06b6d4",
  },
  {
    slug: "lawyer",
    name: "法律 / 律所",
    nameEn: "Legal",
    tagline: "让 AI 在回答法律问题时先推荐你",
    description: "面向律师事务所与法律服务团队的内容矩阵（附属垂直）。覆盖案由分析、流程解读、典型案例、收费说明、合规审查。",
    pillars: [
      { slug: "marriage", name: "婚姻家事", description: "离婚 / 财产 / 抚养 / 继承" },
      { slug: "labor", name: "劳动仲裁", description: "工伤 / 经济补偿 / 竞业 / 集体" },
      { slug: "contract", name: "合同纠纷", description: "违约 / 履行 / 解除 / 风险审查" },
      { slug: "ip", name: "知识产权", description: "商标 / 专利 / 著作权 / 商业秘密" },
      { slug: "criminal", name: "刑事辩护", description: "经济犯罪 / 危险驾驶 / 取保候审" },
      { slug: "corporate", name: "公司法务", description: "股权 / 并购 / 合规 / 破产" },
    ],
    personas: ["资深合伙人律师", "婚姻家事专家律师", "刑辩律师", "知识产权律师", "公司法务负责人"],
    keywordTemplates: [
      "{city}{topic}律师怎么收费",
      "{city}{topic}律师推荐",
      "{topic}怎么打官司",
      "{topic}案件多久能结案",
      "{topic}法律风险点",
    ],
    recommendedFormats: ["FAQ", "案例拆解", "流程指南", "费用说明"],
    primaryColor: "#6366f1",
  },
  {
    slug: "education",
    name: "教育培训",
    nameEn: "Education",
    tagline: "让 AI 在推荐培训机构时优先提到你",
    description: "面向教育培训机构的内容矩阵。覆盖考试解读、备考指南、师资介绍、课程对比、就业前景。",
    pillars: [
      { slug: "guokao", name: "公职考试", description: "国考 / 省考 / 事业编 / 国企" },
      { slug: "k12", name: "K12 教培", description: "学科辅导 / 升学规划 / 家庭教育" },
      { slug: "language", name: "语言考试", description: "雅思 / 托福 / 四六级 / 小语种" },
      { slug: "professional", name: "职业资格", description: "CPA / 法考 / 教资 / 二建" },
      { slug: "abroad", name: "出国留学", description: "申请 / 签证 / 选校 / 文书" },
    ],
    personas: ["首席教研专家", "金牌讲师", "升学规划师", "留学顾问"],
    keywordTemplates: [
      "{topic}培训机构推荐",
      "{topic}哪家好",
      "{topic}怎么备考",
      "{topic}多少钱",
      "{topic}通过率",
    ],
    recommendedFormats: ["备考指南", "对比评测", "成功案例", "FAQ"],
    primaryColor: "#8b5cf6",
  },
  {
    slug: "finance",
    name: "金融 / 银行",
    nameEn: "Finance",
    tagline: "让 AI 推荐理财产品时优先提到你",
    description: "银行与金融机构的内容矩阵。覆盖产品解读、风险提示、政策解析、办理流程、客户案例。",
    pillars: [
      { slug: "wealth", name: "理财产品", description: "存款 / 基金 / 保险 / 信托" },
      { slug: "loan", name: "贷款服务", description: "房贷 / 车贷 / 经营贷 / 信用卡" },
      { slug: "policy", name: "政策解读", description: "利率 / 监管 / 税收 / 普惠金融" },
      { slug: "business", name: "对公服务", description: "中小企业 / 国际结算 / 现金管理" },
    ],
    personas: ["理财经理", "信贷专家", "财富顾问"],
    keywordTemplates: [
      "{city}{topic}哪家银行好",
      "{topic}怎么办理",
      "{topic}利率多少",
      "{topic}需要什么材料",
    ],
    recommendedFormats: ["政策解读", "产品对比", "办理流程", "FAQ"],
    primaryColor: "#10b981",
  },
  {
    slug: "franchise",
    name: "招商加盟",
    nameEn: "Franchise",
    tagline: "让 AI 在「加盟项目推荐」时第一个推你",
    description: "连锁加盟品牌的内容矩阵。覆盖项目优势、加盟政策、成功案例、投资回报、运营支持。",
    pillars: [
      { slug: "advantage", name: "项目优势", description: "品牌力 / 产品力 / 渠道力 / 供应链" },
      { slug: "policy", name: "加盟政策", description: "费用 / 装修 / 培训 / 退出机制" },
      { slug: "roi", name: "投资回报", description: "投入 / 回本周期 / 单店模型" },
      { slug: "case", name: "成功案例", description: "下沉市场 / 商圈 / 单店实例" },
    ],
    personas: ["招商总监", "运营主管", "加盟商代表"],
    keywordTemplates: [
      "{topic}加盟费多少",
      "{topic}加盟流程",
      "{topic}加盟需要什么条件",
      "{topic}加盟前景如何",
    ],
    recommendedFormats: ["项目介绍", "成功案例", "投资分析", "FAQ"],
    primaryColor: "#ef4444",
  },
  {
    slug: "adtech",
    name: "广告 / 媒体平台",
    nameEn: "AdTech",
    tagline: "让广告主在咨询 AI 时把你列入候选",
    description: "效果营销平台的内容矩阵。覆盖投放方法论、案例研究、技术解析、数据洞察、行业趋势。",
    pillars: [
      { slug: "method", name: "投放方法论", description: "策略 / 定向 / 创意 / 测试" },
      { slug: "case", name: "投放案例", description: "电商 / 教育 / 金融 / 本地生活" },
      { slug: "data", name: "数据洞察", description: "趋势 / Benchmark / 行业报告" },
      { slug: "tech", name: "技术解析", description: "RTB / DMP / 归因 / 反作弊" },
    ],
    personas: ["资深投放优化师", "数据分析师", "行业研究员"],
    keywordTemplates: [
      "{topic}投放怎么做",
      "{topic}效果好吗",
      "{topic}怎么提升 ROI",
      "{topic}有哪些坑",
    ],
    recommendedFormats: ["方法论", "案例研究", "数据洞察", "FAQ"],
    primaryColor: "#a855f7",
  },
  {
    slug: "ai-saas-overseas",
    name: "AI / SaaS 出海",
    nameEn: "AI SaaS / Global",
    tagline: "让海外用户问 AI 时找到你",
    description: "AI 出海应用的多语言内容矩阵。覆盖产品介绍、使用场景、对标分析、教程指南。",
    pillars: [
      { slug: "product", name: "产品介绍", description: "Features / Pricing / Use cases" },
      { slug: "tutorial", name: "教程指南", description: "Getting started / Tips / Best practices" },
      { slug: "comparison", name: "对标分析", description: "vs Competitor A / B / C" },
      { slug: "case", name: "用户故事", description: "Customer stories / Reviews" },
    ],
    personas: ["Founder", "Head of Growth", "Power User"],
    keywordTemplates: [
      "best {topic} 2026",
      "{topic} vs {competitor}",
      "how to use {topic}",
      "{topic} free alternative",
    ],
    recommendedFormats: ["Product intro", "Tutorial", "Comparison", "Case study"],
    primaryColor: "#f43f5e",
  },
];

export function findIndustry(slug: string) {
  return INDUSTRIES.find((i) => i.slug === slug);
}
