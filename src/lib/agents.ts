import "server-only";
import { ask } from "./ai";
import { runAudit } from "./audit";
import { ingestDocument } from "./rag";
import { buildPrompt, extractJsonLd, type ContentFormat } from "./prompts";
import { adaptForPlatform, type PublishPlatform } from "./publish";

/**
 * Agent 编排：把 15 个数字员工抽象成可组合的 step。
 * 用户可以选择跑单 Agent 或编排成 pipeline。
 */

export type AgentId =
  | "cake-chief" // 蛋糕 - 首席调度
  | "audit" // 诊断
  | "insight" // 洞察 / 意图
  | "matrix" // 品类矩阵
  | "generator" // 内容生成
  | "compliance" // 合规审查
  | "knowledge" // 知识库
  | "publisher" // 多平台发布
  | "monitor" // 监测
  | "compare" // 12 平台对比
  | "attribution" // 归因
  | "reporter" // 报告
  | "alert" // 告警
  | "translator" // 翻译
  | "reviewer"; // 审稿

export interface AgentDef {
  id: AgentId;
  name: string;
  role: string;
  desc: string;
  inputs: Record<string, string>;
}

export const AGENTS: Record<AgentId, AgentDef> = {
  "cake-chief": {
    id: "cake-chief",
    name: "蛋糕",
    role: "首席 Agent / 调度",
    desc: "调度其他 14 个 Agent 协同工作；可单独问它「我想做 GEO 该怎么开始」",
    inputs: { topic: "你的业务方向描述" },
  },
  audit: {
    id: "audit",
    name: "诊断 Agent",
    role: "GEO 健康检查",
    desc: "跑域名诊断，输出 0-100 分 + 优化建议",
    inputs: { domain: "目标域名" },
  },
  insight: {
    id: "insight",
    name: "洞察 Agent",
    role: "意图聚类",
    desc: "把关键词列表聚类为意图簇",
    inputs: { keywords: "关键词列表（逗号分隔）" },
  },
  matrix: {
    id: "matrix",
    name: "矩阵 Agent",
    role: "品类 × 场景",
    desc: "为品牌生成品类 × 城市的关键词矩阵（如美妆品类 × 城市）",
    inputs: { caseType: "品类 / 主题", cities: "目标城市（逗号分隔）" },
  },
  generator: {
    id: "generator",
    name: "生成 Agent",
    role: "内容工厂",
    desc: "FAQ / TL;DR / HowTo / 对比表 / 直接答案",
    inputs: { topic: "话题", format: "格式（faq/tldr/howto/compare/article/answer）" },
  },
  compliance: {
    id: "compliance",
    name: "合规 Agent",
    role: "广告法审查",
    desc: "检测内容中是否含「最」「第一」等绝对化用语",
    inputs: { text: "待审查内容" },
  },
  knowledge: {
    id: "knowledge",
    name: "知识库 Agent",
    role: "RAG 引擎",
    desc: "把文档加入知识库 + 检索相关片段",
    inputs: { title: "文档标题", text: "文档内容" },
  },
  publisher: {
    id: "publisher",
    name: "发布 Agent",
    role: "多平台适配",
    desc: "把内容改写为 7 大平台的发布版本",
    inputs: { title: "原标题", body: "原内容", platform: "目标平台" },
  },
  monitor: {
    id: "monitor",
    name: "监测 Agent",
    role: "12 平台跑词",
    desc: "把品牌词在指定平台跑一次",
    inputs: { question: "查询词", brand: "品牌名" },
  },
  compare: {
    id: "compare",
    name: "对比 Agent",
    role: "竞品对决",
    desc: "同问题在多个平台并发回答",
    inputs: { question: "查询词", platforms: "平台列表（逗号分隔）" },
  },
  attribution: {
    id: "attribution",
    name: "归因 Agent",
    role: "转化追踪",
    desc: "汇总短链点击 → 转化数据",
    inputs: {},
  },
  reporter: {
    id: "reporter",
    name: "报告 Agent",
    role: "数据可视化",
    desc: "生成月度全景报告",
    inputs: { yearMonth: "年月（YYYY-MM）" },
  },
  alert: {
    id: "alert",
    name: "告警 Agent",
    role: "邮件预警",
    desc: "检测引用率下跌并发告警邮件",
    inputs: {},
  },
  translator: {
    id: "translator",
    name: "翻译 Agent",
    role: "多语言出海",
    desc: "把中文内容翻译/本地化为目标语言",
    inputs: { text: "原文", targetLocale: "目标语言（en/es/fr/de/ja）" },
  },
  reviewer: {
    id: "reviewer",
    name: "审稿 Agent",
    role: "质量复核",
    desc: "评估内容的事实密度、首段直答、可引用性",
    inputs: { text: "待评分内容" },
  },
};

export interface AgentRunResult {
  ok: boolean;
  output?: unknown;
  error?: string;
  latencyMs: number;
}

/**
 * 跑单个 Agent。
 */
export async function runAgent(
  agentId: AgentId,
  inputs: Record<string, string>,
  userId?: string,
): Promise<AgentRunResult> {
  const t0 = Date.now();
  try {
    switch (agentId) {
      case "audit": {
        const r = await runAudit(inputs.domain);
        return { ok: true, output: { domain: r.domain, score: r.score, verdict: r.verdict, suggestions: r.suggestions.slice(0, 5) }, latencyMs: Date.now() - t0 };
      }
      case "cake-chief": {
        const r = await ask({
          system: "你是 BrandGEO 的首席调度 Agent「蛋糕」。给用户的业务方向，给出 GEO 落地的 5 步行动计划与最该调用的 Agent 顺序。简洁清晰。",
          prompt: `业务方向：${inputs.topic}\n\n请给出：\n1. 应优先调用的 3 个 Agent 与顺序\n2. 预期产出物\n3. 见效周期估算`,
          temperature: 0.4,
        });
        return { ok: true, output: { plan: r.text }, latencyMs: Date.now() - t0 };
      }
      case "insight": {
        const kws = inputs.keywords.split(/[,，\n]/).map((s) => s.trim()).filter(Boolean);
        const r = await ask({
          system: "你是 GEO 意图聚类专家。把关键词聚类为 3–6 个意图簇，输出 JSON：{clusters:[{name, keywords, intent_type, priority}]}",
          prompt: kws.join("\n"),
          temperature: 0.3,
        });
        const m = r.text.match(/```json\s*([\s\S]+?)```/);
        try {
          return { ok: true, output: JSON.parse(m?.[1] ?? r.text), latencyMs: Date.now() - t0 };
        } catch {
          return { ok: true, output: { rawText: r.text }, latencyMs: Date.now() - t0 };
        }
      }
      case "matrix": {
        const cities = (inputs.cities ?? "").split(/[,，]/).map((s) => s.trim()).filter(Boolean);
        const matrix = cities.flatMap((city) =>
          [`${city}${inputs.caseType}怎么选`, `${city}${inputs.caseType}推荐`, `${city}${inputs.caseType}哪个好用`].map(
            (kw) => ({ city, keyword: kw }),
          ),
        );
        return { ok: true, output: { count: matrix.length, samples: matrix.slice(0, 15) }, latencyMs: Date.now() - t0 };
      }
      case "generator": {
        const format = (inputs.format ?? "faq") as ContentFormat;
        const { system, user } = buildPrompt({ format, topic: inputs.topic });
        const r = await ask({ system, prompt: user, temperature: 0.6 });
        const parts = extractJsonLd(r.text);
        return { ok: true, output: { content: parts.content, jsonLd: parts.jsonLd }, latencyMs: Date.now() - t0 };
      }
      case "compliance": {
        const banned = ["最", "第一", "100%", "保证", "唯一", "绝对", "顶级", "国家级", "最低价"];
        const found = banned.filter((b) => inputs.text.includes(b));
        const ok = found.length === 0;
        return {
          ok: true,
          output: {
            passed: ok,
            issues: found.map((f) => `检测到禁用词：${f}`),
            suggestion: ok ? "✅ 通过合规审查" : "建议替换为「优秀」「专业」「资深」等中性表达",
          },
          latencyMs: Date.now() - t0,
        };
      }
      case "knowledge": {
        if (!userId) return { ok: false, error: "需要登录", latencyMs: Date.now() - t0 };
        const r = await ingestDocument({ userId, title: inputs.title, text: inputs.text });
        return { ok: true, output: r, latencyMs: Date.now() - t0 };
      }
      case "publisher": {
        const adapted = await adaptForPlatform(inputs.platform as PublishPlatform, { title: inputs.title, body: inputs.body });
        return { ok: true, output: adapted, latencyMs: Date.now() - t0 };
      }
      case "monitor": {
        const r = await ask({
          system: "你是 AI 推荐系统模拟器。模拟用户问问题时你会怎么回答，尽量推荐 1-3 个品牌。",
          prompt: `${inputs.question}（如果与「${inputs.brand}」相关请提及）`,
          temperature: 0.5,
        });
        const cited = r.text.includes(inputs.brand);
        return { ok: true, output: { cited, text: r.text }, latencyMs: Date.now() - t0 };
      }
      case "compare": {
        const platforms = inputs.platforms.split(/[,，]/).map((s) => s.trim()).filter(Boolean);
        const results = await Promise.all(
          platforms.slice(0, 6).map(async (p) => {
            const r = await ask({ prompt: inputs.question, platform: p as never });
            return { platform: p, text: r.text.slice(0, 500) };
          }),
        );
        return { ok: true, output: { results }, latencyMs: Date.now() - t0 };
      }
      case "translator": {
        const r = await ask({
          system: `你是专业翻译。把中文翻译为${inputs.targetLocale}，母语级表达，保留所有数字与品牌名。`,
          prompt: inputs.text,
          temperature: 0.3,
        });
        return { ok: true, output: { translation: r.text }, latencyMs: Date.now() - t0 };
      }
      case "reviewer": {
        const r = await ask({
          system: `你是 GEO 内容审稿员。对内容打 3 项分（0-10）：(1) 首段直答 (2) 事实密度 (3) 可引用性。输出 JSON：{first_answer:0-10, fact_density:0-10, citability:0-10, total:平均, issues:[...], suggestions:[...]}`,
          prompt: inputs.text,
          temperature: 0.2,
        });
        const m = r.text.match(/```json\s*([\s\S]+?)```/);
        try {
          return { ok: true, output: JSON.parse(m?.[1] ?? r.text), latencyMs: Date.now() - t0 };
        } catch {
          return { ok: true, output: { rawText: r.text }, latencyMs: Date.now() - t0 };
        }
      }
      case "attribution":
      case "reporter":
      case "alert": {
        return {
          ok: true,
          output: { message: `${AGENTS[agentId].name} 通常通过定时任务自动跑，单独调用请去对应 dashboard 页面。` },
          latencyMs: Date.now() - t0,
        };
      }
      default:
        return { ok: false, error: "unknown agent", latencyMs: Date.now() - t0 };
    }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "agent failed", latencyMs: Date.now() - t0 };
  }
}

/** 预定义 pipeline：「全链路 GEO」 */
export const PIPELINES: Array<{
  id: string;
  name: string;
  desc: string;
  steps: Array<{ agent: AgentId; label: string }>;
}> = [
  {
    id: "full-geo",
    name: "🚀 全链路 GEO 启动",
    desc: "新客户接入：诊断 → 意图聚类 → 品类矩阵 → 批量生成 → 合规审查",
    steps: [
      { agent: "audit", label: "1. 跑域名诊断" },
      { agent: "insight", label: "2. 关键词意图聚类" },
      { agent: "matrix", label: "3. 品类场景矩阵展开" },
      { agent: "generator", label: "4. 批量内容生成" },
      { agent: "compliance", label: "5. 合规审查" },
    ],
  },
  {
    id: "content-batch",
    name: "📝 内容批量生产",
    desc: "已有项目：生成 → 审稿 → 合规 → 多平台改写",
    steps: [
      { agent: "generator", label: "1. AI 生成内容" },
      { agent: "reviewer", label: "2. 内容质量打分" },
      { agent: "compliance", label: "3. 合规审查" },
      { agent: "publisher", label: "4. 多平台改写" },
    ],
  },
  {
    id: "overseas",
    name: "🌍 出海内容",
    desc: "中文内容 → 翻译 → 平台适配",
    steps: [
      { agent: "translator", label: "1. 翻译到目标语言" },
      { agent: "reviewer", label: "2. 译后审稿" },
    ],
  },
];
