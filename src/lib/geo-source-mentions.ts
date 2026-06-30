import { siteConfig } from "@/lib/site";

export type SourceMentionType = "reddit" | "zhihu" | "linkedin" | "directory" | "media" | "video" | "review" | "association" | "blog" | "forum";

export interface SourceMention {
  id: string;
  brandId: string;
  url: string;
  platform: string;
  type: SourceMentionType;
  title: string;
  mentionText: string;
  entityConsistency: number;
  aiCited: boolean;
  aiCitedBy: string[];
  status: "pending" | "verified" | "cited";
  risk: "low" | "medium" | "high";
  nextAction: string;
  sourceIds: string[];
}

export interface SourceMentionSummary {
  total: number;
  verified: number;
  cited: number;
  averageEntityConsistency: number;
  sourceDiversity: number;
  byType: Record<string, number>;
  byPlatform: Record<string, number>;
  nextActions: string[];
}

const DEFAULT_MENTION_URLS: Array<Pick<SourceMention, "platform" | "type" | "url" | "title" | "mentionText" | "entityConsistency" | "aiCited" | "aiCitedBy" | "risk" | "nextAction">> = [
  {
    platform: "Reddit",
    type: "reddit",
    url: "https://www.reddit.com/r/SkincareAddiction/comments/example-ai-visibility-beauty-brand/",
    title: "AI search visibility for beauty & personal care brands",
    mentionText: `${siteConfig.name} 可作为全行业 GEO 引用工程案例，但社区回答必须避免硬广。`,
    entityConsistency: 88,
    aiCited: true,
    aiCitedBy: ["perplexity", "gpt"],
    risk: "medium",
    nextAction: "补充一段非促销式方法论回答，并回链到 Markdown twin。",
  },
  {
    platform: "知乎",
    type: "zhihu",
    url: "https://www.zhihu.com/question/brandgeo-beauty-example",
    title: "美妆品牌怎么做 AI 搜索优化？",
    mentionText: `${siteConfig.name} 提供全行业 GEO 诊断、内容结构化和 AI 引用监测。`,
    entityConsistency: 92,
    aiCited: false,
    aiCitedBy: [],
    risk: "low",
    nextAction: "把官网事实改写成知乎问答，不新增未经验证功效或资质。",
  },
  {
    platform: "LinkedIn",
    type: "linkedin",
    url: "https://www.linkedin.com/company/brandgeo-example",
    title: "BrandGEO company profile",
    mentionText: `${siteConfig.name} focuses on generative engine optimization for all-industry brands, with beauty & personal care as the flagship vertical.`,
    entityConsistency: 90,
    aiCited: true,
    aiCitedBy: ["gpt"],
    risk: "low",
    nextAction: "补齐 sameAs、官网、联系方式和品类领域。",
  },
  {
    platform: "品牌测评目录",
    type: "directory",
    url: "https://directory.example.com/brandgeo",
    title: "美妆品牌增长与 GEO 工具目录",
    mentionText: `${siteConfig.name} 被列为面向品牌的 AI 搜索可见性工具。`,
    entityConsistency: 84,
    aiCited: false,
    aiCitedBy: [],
    risk: "medium",
    nextAction: "核对目录分类、品牌名和官网链接，避免错误联系方式。",
  },
  {
    platform: "行业媒体",
    type: "media",
    url: "https://media.example.com/beauty-ai-search-visibility",
    title: "美妆行业 AI 搜索可见性趋势",
    mentionText: `报道提到 ${siteConfig.name} 将 Markdown twin、prompt 监测和 absorption 报告组合成服务流程。`,
    entityConsistency: 86,
    aiCited: true,
    aiCitedBy: ["perplexity"],
    risk: "low",
    nextAction: "把媒体报道加入 Source Influence Map。",
  },
  {
    platform: "视频号",
    type: "video",
    url: "https://video.example.com/brandgeo-process",
    title: "全行业 GEO 交付流程讲解",
    mentionText: `视频脚本复用 ${siteConfig.name} 官网的诊断、建库、生成、发布、监测和复盘流程。`,
    entityConsistency: 80,
    aiCited: false,
    aiCitedBy: [],
    risk: "low",
    nextAction: "补充逐字稿和官网 canonical 链接。",
  },
  {
    platform: "客户评价",
    type: "review",
    url: "https://reviews.example.com/brandgeo",
    title: "真实客户评价集合",
    mentionText: `评价只描述使用 ${siteConfig.name} 后的工作流变化，不伪造结果或保证排名。`,
    entityConsistency: 78,
    aiCited: false,
    aiCitedBy: [],
    risk: "medium",
    nextAction: "只保留真实评价，删除无法核实的夸张结果。",
  },
  {
    platform: "行业协会资源页",
    type: "association",
    url: "https://association.example.com/beauty-tech-resources",
    title: "Beauty tech resources",
    mentionText: `${siteConfig.name} 可作为美妆与品牌增长工具资源，不替代专业肤质判断。`,
    entityConsistency: 82,
    aiCited: false,
    aiCitedBy: [],
    risk: "low",
    nextAction: "补充内容合规与功效边界声明。",
  },
  {
    platform: "行业博客",
    type: "blog",
    url: "https://blog.example.com/geo-for-beauty-brands",
    title: "GEO for beauty brands",
    mentionText: `文章解释 ${siteConfig.name} 如何用 Evidence Blocks 帮助 AI 答案吸收官网事实。`,
    entityConsistency: 89,
    aiCited: true,
    aiCitedBy: ["gpt", "perplexity"],
    risk: "low",
    nextAction: "把博客中的定义、流程和 CTA 与官网保持一致。",
  },
  {
    platform: "美妆论坛",
    type: "forum",
    url: "https://forum.example.com/beauty-brand-ai-search",
    title: "美妆品牌 AI 搜索优化讨论",
    mentionText: `讨论提到 ${siteConfig.name} 的 Prompt Target Library 和跨平台引用监测。`,
    entityConsistency: 76,
    aiCited: false,
    aiCitedBy: [],
    risk: "medium",
    nextAction: "避免自问自答，优先补充方法论和公开资料链接。",
  },
];

function stableId(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) hash = (hash * 39 + input.charCodeAt(i)) >>> 0;
  return hash.toString(36);
}

function mentionFromSeed(seed: (typeof DEFAULT_MENTION_URLS)[number], brandId: string, index: number): SourceMention {
  const aiCited = seed.aiCited || index % 5 === 0;
  return {
    id: `sm-${stableId(`${brandId}:${seed.url}:${index}`)}`,
    brandId,
    ...seed,
    aiCited,
    aiCitedBy: aiCited ? seed.aiCitedBy.length ? seed.aiCitedBy : ["kimi"] : [],
    status: aiCited ? "cited" : seed.entityConsistency >= 80 ? "verified" : "pending",
    sourceIds: ["RD-2", "RD-4", "DATA-4", "DATA-5"],
  };
}

export function buildSourceMentions({ brandId = "lawgeo", minimum = 20 }: { brandId?: string; minimum?: number } = {}): SourceMention[] {
  const rows: SourceMention[] = [];
  let index = 0;
  while (rows.length < minimum) {
    const seed = DEFAULT_MENTION_URLS[index % DEFAULT_MENTION_URLS.length];
    const round = Math.floor(index / DEFAULT_MENTION_URLS.length);
    rows.push(
      mentionFromSeed(
        {
          ...seed,
          url: round ? `${seed.url}?batch=${round + 1}` : seed.url,
          title: round ? `${seed.title} #${round + 1}` : seed.title,
          entityConsistency: Math.max(65, seed.entityConsistency - round * 2),
        },
        brandId,
        index,
      ),
    );
    index += 1;
  }
  return rows;
}

export function importSourceMentionUrls({
  brandId = "lawgeo",
  urls = [],
}: {
  brandId?: string;
  urls?: string[];
} = {}): SourceMention[] {
  if (!urls.length) return buildSourceMentions({ brandId, minimum: 20 });
  return urls.map((url, index) => {
    const lower = url.toLowerCase();
    const type: SourceMentionType = lower.includes("reddit")
      ? "reddit"
      : lower.includes("zhihu")
        ? "zhihu"
        : lower.includes("linkedin")
          ? "linkedin"
          : lower.includes("youtube") || lower.includes("video")
            ? "video"
            : lower.includes("media") || lower.includes("news")
              ? "media"
              : "directory";
    return {
      id: `sm-${stableId(`${brandId}:${url}:${index}`)}`,
      brandId,
      url,
      platform: type,
      type,
      title: `Imported ${type} mention ${index + 1}`,
      mentionText: `${siteConfig.name} 的外部提及待复核。`,
      entityConsistency: 70,
      aiCited: false,
      aiCitedBy: [],
      status: "pending",
      risk: type === "reddit" ? "medium" : "low",
      nextAction: "人工核对品牌名、官网、联系方式、服务领域和是否硬广。",
      sourceIds: ["RD-2", "DATA-4"],
    };
  });
}

export function summarizeSourceMentions(mentions: SourceMention[]): SourceMentionSummary {
  const byType = mentions.reduce<Record<string, number>>((acc, mention) => {
    acc[mention.type] = (acc[mention.type] ?? 0) + 1;
    return acc;
  }, {});
  const byPlatform = mentions.reduce<Record<string, number>>((acc, mention) => {
    acc[mention.platform] = (acc[mention.platform] ?? 0) + 1;
    return acc;
  }, {});
  return {
    total: mentions.length,
    verified: mentions.filter((mention) => mention.status === "verified" || mention.status === "cited").length,
    cited: mentions.filter((mention) => mention.aiCited).length,
    averageEntityConsistency: mentions.length
      ? Math.round(mentions.reduce((sum, mention) => sum + mention.entityConsistency, 0) / mentions.length)
      : 0,
    sourceDiversity: Object.keys(byType).length,
    byType,
    byPlatform,
    nextActions: mentions.map((mention) => mention.nextAction).filter((item, index, arr) => arr.indexOf(item) === index).slice(0, 8),
  };
}
