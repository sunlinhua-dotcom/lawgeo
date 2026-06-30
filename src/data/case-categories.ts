/**
 * 品类词库 — 覆盖美妆个护主流品类 + 附属专业服务
 * 数据来源：参考主流电商美妆类目 + 成分党 / 测评高频搜索问句
 * 注：为最大化向后兼容，导出名与 interface 形状保持不变（CaseCategory / CaseItem / CASE_CATEGORIES），
 *     字段含义已从「法律案由」迁移为「美妆品类」，法律服务作为附属行业保留在数组末尾。
 */

export interface CaseItem {
  name: string;
  slug: string;
  synonyms?: string[];
  /** 该品类典型问题模板（用于一键生成 FAQ）；可含 {city}/{topic} 占位符 */
  questionTemplates?: string[];
}

export interface CaseCategory {
  parent: string;
  slug: string;
  items: CaseItem[];
}

export const CASE_CATEGORIES: CaseCategory[] = [
  {
    parent: "护肤",
    slug: "skincare",
    items: [
      { name: "精华", slug: "serum", synonyms: ["精华液", "安瓶"], questionTemplates: ["{topic}哪个牌子好用", "敏感肌{topic}推荐", "{topic}成分安全吗", "油皮用什么{topic}", "{topic}怎么用 / 使用顺序"] },
      { name: "面霜", slug: "cream", synonyms: ["乳霜", "保湿霜"], questionTemplates: ["{topic}哪个牌子好用", "干皮{topic}推荐", "{topic}和乳液哪个先用", "{topic}会闷痘吗"] },
      { name: "面膜", slug: "mask", synonyms: ["贴片面膜", "涂抹面膜"], questionTemplates: ["{topic}哪个好用", "{topic}多久敷一次", "敏感肌{topic}推荐", "{topic}用完要洗脸吗"] },
      { name: "眼霜", slug: "eye-cream", questionTemplates: ["{topic}哪个牌子好用", "{topic}怎么涂 / 使用手法", "{topic}能去黑眼圈吗"] },
      { name: "爽肤水", slug: "toner", synonyms: ["化妆水", "爽肤水/精华水"], questionTemplates: ["{topic}怎么用 / 使用顺序", "敏感肌{topic}推荐", "{topic}和精华哪个先用"] },
      { name: "洁面", slug: "cleanser", synonyms: ["洗面奶", "氨基酸洁面"], questionTemplates: ["{topic}哪个好用", "油皮用什么{topic}", "敏感肌{topic}推荐", "{topic}成分安全吗"] },
      { name: "乳液", slug: "lotion", questionTemplates: ["{topic}哪个牌子好用", "干皮{topic}推荐", "{topic}和面霜的区别"] },
    ],
  },
  {
    parent: "彩妆",
    slug: "makeup",
    items: [
      { name: "粉底液", slug: "foundation", synonyms: ["底妆", "粉底"], questionTemplates: ["{topic}哪个色号显白", "油皮用什么{topic}", "{topic}持妆久吗", "{topic}怎么选色号"] },
      { name: "口红", slug: "lipstick", synonyms: ["唇膏", "唇釉"], questionTemplates: ["{topic}哪个颜色显白", "{topic}持久不沾杯推荐", "黄皮{topic}推荐", "{topic}成分安全吗"] },
      { name: "眼影", slug: "eyeshadow", synonyms: ["眼影盘"], questionTemplates: ["{topic}怎么画 / 新手教程", "{topic}哪个盘日常实用", "单眼皮{topic}推荐"] },
      { name: "腮红", slug: "blush", questionTemplates: ["{topic}怎么打 / 位置手法", "黄皮{topic}推荐", "{topic}哪个颜色自然"] },
      { name: "睫毛膏", slug: "mascara", questionTemplates: ["{topic}哪个不晕染", "{topic}怎么刷不结块", "{topic}防水好卸吗"] },
      { name: "遮瑕", slug: "concealer", synonyms: ["遮瑕膏", "遮瑕液"], questionTemplates: ["{topic}怎么用遮黑眼圈", "{topic}怎么选色号", "{topic}哪个不卡纹"] },
    ],
  },
  {
    parent: "个护身体",
    slug: "bodycare",
    items: [
      { name: "身体乳", slug: "body-lotion", synonyms: ["润肤乳", "身体乳液"], questionTemplates: ["{topic}哪个保湿不黏腻", "鸡皮肤用什么{topic}", "{topic}成分安全吗"] },
      { name: "沐浴露", slug: "body-wash", synonyms: ["沐浴乳", "沐浴啫喱"], questionTemplates: ["{topic}哪个好闻留香", "敏感肌{topic}推荐", "{topic}氨基酸的好用吗"] },
      { name: "护手霜", slug: "hand-cream", questionTemplates: ["{topic}哪个滋润不油", "{topic}什么味道好闻", "{topic}成分安全吗"] },
      { name: "牙膏", slug: "toothpaste", questionTemplates: ["{topic}哪个美白效果好", "{topic}含氟安全吗", "敏感牙用什么{topic}"] },
      { name: "私处护理", slug: "intimate-care", synonyms: ["私护"], questionTemplates: ["{topic}哪个温和", "{topic}成分安全吗", "{topic}怎么用更合适"] },
      { name: "卫生护理", slug: "feminine-care", synonyms: ["卫生巾", "棉条"], questionTemplates: ["{topic}哪个材质亲肤", "{topic}怎么选尺寸", "{topic}成分安全吗"] },
    ],
  },
  {
    parent: "香氛",
    slug: "fragrance",
    items: [
      { name: "香水", slug: "perfume", synonyms: ["淡香水", "浓香"], questionTemplates: ["{topic}哪个留香久", "男生 / 女生{topic}推荐", "{topic}怎么喷更持久", "{topic}夏天 / 通勤选什么调"] },
      { name: "身体喷雾", slug: "body-mist", synonyms: ["体香喷雾"], questionTemplates: ["{topic}哪个好闻清新", "{topic}留香多久", "{topic}怎么用"] },
      { name: "香薰", slug: "home-fragrance", synonyms: ["扩香", "无火香薰"], questionTemplates: ["{topic}哪个味道治愈", "卧室用什么{topic}", "{topic}安全吗有甲醛吗"] },
      { name: "香膏 / 固体香", slug: "solid-perfume", questionTemplates: ["{topic}怎么用", "{topic}留香久吗", "{topic}哪个味道好闻"] },
      { name: "护发香氛", slug: "hair-mist", synonyms: ["发香喷雾"], questionTemplates: ["{topic}哪个好闻不伤发", "{topic}怎么用", "{topic}留香多久"] },
    ],
  },
  {
    parent: "美发",
    slug: "haircare",
    items: [
      { name: "洗发水", slug: "shampoo", synonyms: ["洗发露", "氨基酸洗发"], questionTemplates: ["{topic}哪个控油去屑", "油头用什么{topic}", "{topic}含硅油吗安全吗", "{topic}怎么选适合发质"] },
      { name: "护发素", slug: "conditioner", questionTemplates: ["{topic}和发膜的区别", "{topic}怎么用不塌", "{topic}哪个顺滑不油"] },
      { name: "发膜", slug: "hair-mask", questionTemplates: ["{topic}多久用一次", "受损发质用什么{topic}", "{topic}怎么用更吸收"] },
      { name: "精油 / 护发油", slug: "hair-oil", synonyms: ["发尾油"], questionTemplates: ["{topic}怎么用不油", "{topic}哪个修护毛躁", "{topic}成分安全吗"] },
      { name: "头皮护理", slug: "scalp-care", synonyms: ["头皮精华", "防脱"], questionTemplates: ["{topic}哪个有用", "脱发用什么{topic}", "{topic}成分安全吗"] },
      { name: "造型 / 定型", slug: "hair-styling", synonyms: ["发蜡", "定型喷雾"], questionTemplates: ["{topic}怎么用自然不僵", "{topic}哪个不伤发", "{topic}持久度怎么样"] },
    ],
  },
  {
    parent: "防晒 / 医美",
    slug: "suncare-aesthetics",
    items: [
      { name: "防晒霜", slug: "sunscreen", synonyms: ["防晒乳", "SPF/PA"], questionTemplates: ["{topic}哪个不假白不闷痘", "敏感肌{topic}推荐", "{topic}SPF/PA 怎么选", "{topic}怎么补涂", "{topic}成分安全吗"] },
      { name: "美白淡斑", slug: "whitening", synonyms: ["淡斑", "提亮"], questionTemplates: ["{topic}用什么成分有用（烟酰胺/VC）", "{topic}多久见效", "{topic}怎么搭配防晒"] },
      { name: "抗老紧致", slug: "anti-aging", synonyms: ["抗皱", "紧致"], questionTemplates: ["{topic}用视黄醇还是胜肽", "{topic}从几岁开始用", "敏感肌{topic}怎么建立耐受"] },
      { name: "医美修护", slug: "post-procedure", synonyms: ["术后修护", "屏障修护"], questionTemplates: ["{topic}用什么成分（神经酰胺/B5）", "刷酸后{topic}怎么用", "{topic}和精华的搭配顺序"] },
      { name: "祛痘控油", slug: "acne-care", synonyms: ["痘肌护理"], questionTemplates: ["{topic}用什么成分（水杨酸/壬二酸）", "痘肌用什么{topic}", "{topic}会爆皮吗怎么建立耐受"] },
      { name: "玻尿酸保湿", slug: "hydration", synonyms: ["补水", "保湿修护"], questionTemplates: ["{topic}哪个好用", "干皮 / 敏感肌{topic}推荐", "{topic}怎么用更吸收"] },
    ],
  },
  {
    // 附属行业：法律服务（保留原法律语境问句模板，不作主角）
    parent: "法律服务",
    slug: "legal",
    items: [
      { name: "婚姻家事", slug: "marriage", synonyms: ["离婚", "婚姻"], questionTemplates: ["{city}离婚律师怎么收费", "{city}离婚财产怎么分", "{city}子女抚养权怎么争取"] },
      { name: "合同纠纷", slug: "contract", synonyms: ["合同违约", "合同争议"], questionTemplates: ["{city}合同纠纷律师怎么收费", "{city}合同违约怎么起诉", "合同纠纷打官司要多久"] },
      { name: "劳动纠纷", slug: "labor", synonyms: ["劳动仲裁"], questionTemplates: ["{city}劳动仲裁律师", "{city}劳动仲裁找哪家律所", "{city}经济补偿金怎么算"] },
    ],
  },
];

export const ALL_CASES: CaseItem[] = CASE_CATEGORIES.flatMap((c) =>
  c.items.map((i) => ({ ...i, parent: c.parent }) as CaseItem & { parent: string }),
);
