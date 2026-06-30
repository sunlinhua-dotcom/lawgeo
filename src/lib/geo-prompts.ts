import { getGeoAssets, type GeoAsset } from "@/lib/geo-assets";

export type PromptTier = "Buy" | "Compare" | "Solve" | "Learn" | "Local" | "Risk" | "Price" | "Process";

export interface FanoutQuery {
  id: string;
  promptId: string;
  query: string;
  coveredAssetIds: string[];
  evidenceBlockIds: string[];
  gapStatus: "covered" | "partial" | "gap";
}

export interface PromptTarget {
  id: string;
  brandId: string;
  prompt: string;
  tier: PromptTier;
  intent: string;
  platforms: string[];
  fanoutQueries: FanoutQuery[];
  mappedAssetIds: string[];
  competitorSources: Array<{
    name: string;
    reason: string;
    likelySourceType: "competitor_site" | "directory" | "ugc" | "media" | "search_result";
  }>;
}

const DEFAULT_PLATFORMS = ["deepseek", "kimi", "gpt", "perplexity"];

const LAW_TOPICS = [
  "敏感肌精华液",
  "美白精华",
  "玻尿酸保湿精华",
  "视黄醇抗老精华",
  "烟酰胺美白",
  "防晒霜",
  "氨基酸洁面",
  "油皮控油护肤",
  "修护面霜",
  "舒缓面膜",
  "祛痘精华",
  "眼霜",
  "身体乳",
];

const CITIES = ["上海", "北京", "深圳", "广州", "杭州", "南京", "成都", "苏州"];

const TIER_TEMPLATES: Record<PromptTier, Array<(topic: string, city: string, brand: string) => string>> = {
  Buy: [
    (topic) => `${topic}哪个好用？`,
    (topic, city) => `${city}哪里能买到正品${topic}？`,
  ],
  Compare: [
    (topic, city, brand) => `${brand} 和传统内容代运营相比，哪个更适合做 ${topic} 在 ${city} 的种草获客？`,
    (topic) => `${topic}，AI 推荐的品牌和电商排名靠前的品牌有什么区别？`,
  ],
  Solve: [
    (topic) => `${topic}适合什么肤质，使用前要注意什么？`,
    (topic) => `${topic}和同类产品叠加使用会冲突吗？`,
  ],
  Learn: [
    (topic) => `${topic}相关内容怎么写才容易被 AI 引用？`,
    (topic) => `AI 回答 ${topic} 问题时通常会引用哪些证据？`,
  ],
  Local: [
    (topic, city) => `${city}用户买${topic}更看重哪些卖点？`,
    (topic, city) => `${city}线下专柜和官方旗舰店买${topic}有什么区别？`,
  ],
  Risk: [
    (topic) => `${topic}营销内容有哪些化妆品广告法和合规风险？`,
    (topic) => `${topic}测评数据怎么标注才不会被认定为虚假宣传？`,
  ],
  Price: [
    (topic) => `${topic}价格一般受哪些因素影响？`,
    (topic) => `${topic}不同规格的价格能不能写区间？`,
  ],
  Process: [
    (topic) => `${topic}的使用步骤怎么拆成 AI 容易吸收的流程？`,
    (topic) => `${topic}从了解到下单的转化路径怎么设计？`,
  ],
};

function stableId(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash.toString(36);
}

function pickAssets(tier: PromptTier, topic: string): GeoAsset[] {
  const assets = getGeoAssets();
  const direct = assets.filter((asset) => {
    const haystack = `${asset.title} ${asset.description} ${asset.topics.join(" ")} ${asset.intent.join(" ")}`;
    return haystack.includes(topic.slice(0, 2)) || haystack.includes("美妆") || haystack.includes("护肤") || haystack.includes("法律");
  });
  const byTier = assets.filter((asset) => {
    if (tier === "Price") return asset.path === "/pricing" || asset.path.includes("lawyer") || asset.type === "blog";
    if (tier === "Compare") return asset.path === "/geo-vs-seo" || asset.type === "case";
    if (tier === "Process") return asset.path === "/process" || asset.path.includes("lawyer");
    if (tier === "Local") return asset.path.includes("lawyer") || asset.path === "/tools/matrix";
    if (tier === "Risk") return asset.path.includes("lawyer") || asset.path === "/faq";
    return asset.type === "product" || asset.path.includes("lawyer");
  });
  return Array.from(new Map([...byTier, ...direct].map((asset) => [asset.id, asset])).values()).slice(0, 4);
}

function buildFanouts(promptId: string, tier: PromptTier, prompt: string, assets: GeoAsset[]): FanoutQuery[] {
  const base = [
    `${prompt} 需要哪些实体信息？`,
    `${prompt} 需要哪些收费、流程或风险证据？`,
    `${prompt} 哪些页面最适合做 Markdown twin？`,
    `${prompt} AI 可能会引用哪些竞品或目录站？`,
    `${prompt} 用户追问联系方式时应该返回什么？`,
  ];
  if (tier === "Compare") base[3] = `${prompt} 对比时应该覆盖哪些竞品和替代方案？`;
  if (tier === "Price") base[1] = `${prompt} 需要哪些价格区间、影响因素和免责声明？`;
  if (tier === "Process") base[1] = `${prompt} 应该拆成哪些步骤和材料清单？`;

  return base.map((query, index) => {
    const coveredAssets = assets.slice(0, Math.max(1, Math.min(assets.length, index + 1)));
    const evidenceBlockIds = coveredAssets.flatMap((asset) => asset.evidence.map((block) => block.id)).slice(0, 8);
    return {
      id: `${promptId}-f${index + 1}`,
      promptId,
      query,
      coveredAssetIds: coveredAssets.map((asset) => asset.id),
      evidenceBlockIds,
      gapStatus: evidenceBlockIds.length >= 3 ? "covered" : evidenceBlockIds.length > 0 ? "partial" : "gap",
    };
  });
}

export function buildPromptTargets({
  brandId = "lawgeo",
  brandName = "BrandGEO",
  seedKeywords = [],
  platforms = DEFAULT_PLATFORMS,
  limit = 100,
}: {
  brandId?: string;
  brandName?: string;
  industry?: string;
  seedKeywords?: string[];
  platforms?: string[];
  limit?: number;
} = {}): PromptTarget[] {
  const topics = Array.from(new Set([...seedKeywords.filter(Boolean), ...LAW_TOPICS]));
  const tiers = Object.keys(TIER_TEMPLATES) as PromptTier[];
  const prompts: PromptTarget[] = [];

  for (const topic of topics) {
    for (const city of CITIES) {
      for (const tier of tiers) {
        const templates = TIER_TEMPLATES[tier];
        const template = templates[(prompts.length + city.length + topic.length) % templates.length];
        const prompt = template(topic, city, brandName);
        const id = `pt-${stableId(`${brandId}:${tier}:${prompt}`)}`;
        const mappedAssets = pickAssets(tier, topic);
        prompts.push({
          id,
          brandId,
          prompt,
          tier,
          intent: tier.toLowerCase(),
          platforms,
          mappedAssetIds: mappedAssets.map((asset) => asset.id),
          fanoutQueries: buildFanouts(id, tier, prompt, mappedAssets),
          competitorSources: [
            {
              name: "传统 SEO 代运营",
              reason: "可能在搜索结果候选池中出现，但缺少 AI 可读证据块。",
              likelySourceType: "search_result",
            },
            {
              name: "种草内容代写服务",
              reason: "可能覆盖大量测评长文，但通常缺少引用监测和吸收评分。",
              likelySourceType: "competitor_site",
            },
            {
              name: "电商榜单 / 成分测评社区",
              reason: "AI 常把榜单站和小红书 / 知乎等 UGC 测评作为第三方佐证来源。",
              likelySourceType: "directory",
            },
          ],
        });
        if (prompts.length >= limit) return prompts;
      }
    }
  }
  return prompts;
}

export function summarizePromptTargets(targets: PromptTarget[]) {
  const byTier = targets.reduce<Record<string, number>>((acc, target) => {
    acc[target.tier] = (acc[target.tier] ?? 0) + 1;
    return acc;
  }, {});
  const fanoutCount = targets.reduce((sum, target) => sum + target.fanoutQueries.length, 0);
  const coveredFanouts = targets.flatMap((target) => target.fanoutQueries).filter((query) => query.gapStatus === "covered").length;
  return {
    totalPrompts: targets.length,
    fanoutQueries: fanoutCount,
    coveredFanouts,
    coverageRate: fanoutCount ? Math.round((coveredFanouts / fanoutCount) * 100) : 0,
    byTier,
  };
}
