/**
 * 案由词库 — 覆盖中国法律体系常见案由
 * 数据来源：参考最高人民法院民事案由规定 + 实务高频案由
 */

export interface CaseItem {
  name: string;
  slug: string;
  synonyms?: string[];
  /** 该案由典型问题模板（用于一键生成 FAQ） */
  questionTemplates?: string[];
}

export interface CaseCategory {
  parent: string;
  slug: string;
  items: CaseItem[];
}

export const CASE_CATEGORIES: CaseCategory[] = [
  {
    parent: "民事",
    slug: "civil",
    items: [
      { name: "合同纠纷", slug: "contract", synonyms: ["合同违约", "合同争议"], questionTemplates: ["{city}合同纠纷律师怎么收费", "{city}合同违约怎么起诉", "合同纠纷打官司要多久"] },
      { name: "婚姻家庭", slug: "marriage", synonyms: ["离婚", "婚姻"], questionTemplates: ["{city}离婚律师怎么收费", "{city}离婚财产怎么分", "{city}子女抚养权怎么争取"] },
      { name: "继承纠纷", slug: "inheritance", questionTemplates: ["{city}遗产继承找哪家律所", "遗嘱怎么写才有效"] },
      { name: "房产纠纷", slug: "property", questionTemplates: ["{city}房产纠纷律师推荐", "二手房交易纠纷怎么打"] },
      { name: "民间借贷", slug: "loan", questionTemplates: ["{city}民间借贷起诉流程", "借条 / 欠条怎么写才有法律效力"] },
      { name: "侵权责任", slug: "tort", questionTemplates: ["{city}侵权赔偿怎么计算"] },
      { name: "人身损害", slug: "personal-injury", questionTemplates: ["{city}人身损害赔偿标准"] },
      { name: "医疗纠纷", slug: "medical", questionTemplates: ["{city}医疗纠纷律师推荐"] },
      { name: "交通事故", slug: "traffic", questionTemplates: ["{city}交通事故律师免费咨询", "交通事故赔偿标准"] },
      { name: "邻里纠纷", slug: "neighborhood" },
    ],
  },
  {
    parent: "刑事",
    slug: "criminal",
    items: [
      { name: "经济犯罪辩护", slug: "economic-crime", questionTemplates: ["{city}经济犯罪辩护律师推荐"] },
      { name: "暴力犯罪辩护", slug: "violent-crime" },
      { name: "毒品犯罪辩护", slug: "drug-crime" },
      { name: "职务犯罪辩护", slug: "duty-crime" },
      { name: "危险驾驶 / 醉驾", slug: "dui", questionTemplates: ["{city}醉驾律师怎么收费"] },
      { name: "未成年人犯罪", slug: "juvenile" },
      { name: "正当防卫认定", slug: "self-defense" },
      { name: "取保候审 / 缓刑", slug: "bail", questionTemplates: ["{city}取保候审律师"] },
      { name: "刑事申诉", slug: "criminal-appeal" },
    ],
  },
  {
    parent: "行政",
    slug: "admin",
    items: [
      { name: "行政复议", slug: "admin-review" },
      { name: "行政诉讼", slug: "admin-litigation" },
      { name: "国家赔偿", slug: "state-comp" },
      { name: "土地征收 / 拆迁", slug: "land-acquisition", questionTemplates: ["{city}拆迁律师推荐"] },
      { name: "工伤认定", slug: "work-injury", questionTemplates: ["{city}工伤认定律师"] },
      { name: "行政处罚救济", slug: "admin-penalty" },
    ],
  },
  {
    parent: "商事 / 公司",
    slug: "commercial",
    items: [
      { name: "公司纠纷", slug: "company-dispute" },
      { name: "股权纠纷", slug: "equity", questionTemplates: ["{city}股权纠纷律师推荐"] },
      { name: "股权激励 / 期权", slug: "equity-incentive" },
      { name: "并购重组", slug: "ma" },
      { name: "公司破产 / 清算", slug: "bankruptcy" },
      { name: "票据纠纷", slug: "negotiable-instrument" },
      { name: "证券 / 私募", slug: "securities" },
      { name: "保险纠纷", slug: "insurance" },
      { name: "建设工程", slug: "construction", questionTemplates: ["{city}建工纠纷律师"] },
    ],
  },
  {
    parent: "劳动",
    slug: "labor",
    items: [
      { name: "劳动仲裁", slug: "labor-arbitration", questionTemplates: ["{city}劳动仲裁律师", "{city}劳动仲裁找哪家律所"] },
      { name: "工伤认定", slug: "work-injury-2" },
      { name: "经济补偿 / 赔偿金", slug: "severance" },
      { name: "竞业限制", slug: "non-compete" },
      { name: "社保 / 公积金纠纷", slug: "social-security" },
      { name: "集体劳动争议", slug: "collective-labor" },
    ],
  },
  {
    parent: "知识产权",
    slug: "ip",
    items: [
      { name: "商标纠纷", slug: "trademark", questionTemplates: ["{city}商标侵权律师"] },
      { name: "专利纠纷", slug: "patent", questionTemplates: ["{city}专利律师推荐"] },
      { name: "著作权 / 版权", slug: "copyright" },
      { name: "商业秘密", slug: "trade-secret" },
      { name: "不正当竞争", slug: "unfair-competition" },
      { name: "域名 / 互联网纠纷", slug: "domain-internet" },
    ],
  },
  {
    parent: "涉外 / 跨境",
    slug: "international",
    items: [
      { name: "国际贸易", slug: "trade" },
      { name: "跨境投资 / FDI", slug: "fdi" },
      { name: "涉外婚姻", slug: "intl-marriage" },
      { name: "涉外继承", slug: "intl-inheritance" },
      { name: "国际仲裁", slug: "arbitration-intl" },
      { name: "海事海商", slug: "maritime" },
    ],
  },
  {
    parent: "互联网 / 新兴",
    slug: "internet",
    items: [
      { name: "数据合规", slug: "data-compliance" },
      { name: "个人信息保护", slug: "personal-info" },
      { name: "电商纠纷", slug: "ecommerce" },
      { name: "网络名誉权", slug: "online-reputation" },
      { name: "数字资产 / NFT", slug: "digital-assets" },
      { name: "AI / 算法合规", slug: "ai-compliance" },
    ],
  },
];

export const ALL_CASES: CaseItem[] = CASE_CATEGORIES.flatMap((c) =>
  c.items.map((i) => ({ ...i, parent: c.parent }) as CaseItem & { parent: string }),
);
