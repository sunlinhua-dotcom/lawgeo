import "server-only";
import { createOpenAI, type OpenAIProvider } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText, streamText, type LanguageModel } from "ai";
import { getLlmConfig, getLlmProvider } from "./providers/llm";

/**
 * 统一 AI 客户端（三级路由）：
 *   1. 平台真实 key（ANTHROPIC_API_KEY 等）→ 直连官方
 *   2. LiteLLM 网关（LLM_GATEWAY_URL）→ 统一 100+ 模型 + 成本追踪（按平台 alias 路由）
 *   3. 小米 MIMO 直连（builtin 兜底）→ persona prompt 模拟各平台风格
 * 详见 docs/oss-integration-research.md。
 */
const MIMO_KEY = process.env.MIMO_API_KEY;
const MIMO_BASE = process.env.MIMO_BASE_URL ?? "https://token-plan-cn.xiaomimimo.com/v1";
export const MIMO_MODEL = process.env.MIMO_MODEL ?? "mimo-v2.5-pro";

if (!MIMO_KEY && process.env.NODE_ENV !== "production") {
  console.warn("[lawGEO] MIMO_API_KEY 未配置，AI 功能不可用");
}

export const mimo: OpenAIProvider = createOpenAI({
  apiKey: MIMO_KEY ?? "missing-key",
  baseURL: MIMO_BASE,
});

// MIMO 暴露的是 OpenAI 旧版 /chat/completions
export const defaultModel: LanguageModel = mimo.chat(MIMO_MODEL);

export type AiPlatformId =
  | "deepseek"
  | "qwen"
  | "doubao"
  | "kimi"
  | "zhipu"
  | "wenxin"
  | "yuanbao"
  | "minimax"
  | "claude"
  | "gpt"
  | "gemini"
  | "perplexity";

const PLATFORM_PERSONAS: Record<AiPlatformId, string> = {
  deepseek: "你正在模拟 DeepSeek V4 的回答风格：技术理性、信息密度高、偏推理。",
  qwen: "你正在模拟阿里通义千问的回答风格：偏中文资讯、引用国内权威来源、措辞稳重。",
  doubao: "你正在模拟字节豆包的回答风格：口语化、贴近大众、结构清晰。",
  kimi: "你正在模拟月之暗面 Kimi 的回答风格：长上下文友好、引用多个来源、注重事实。",
  zhipu: "你正在模拟智谱清言 GLM 的回答风格：学术化、偏严谨、保留专业术语。",
  wenxin: "你正在模拟百度文心一言的回答风格：与百度搜索强联动、引用百家号/百科。",
  yuanbao: "你正在模拟腾讯元宝的回答风格：与微信生态联动、引用公众号优质内容。",
  minimax: "你正在模拟海螺 AI 的回答风格：自然流畅、对话式、面向 C 端用户。",
  claude: "你正在模拟 Anthropic Claude 的回答风格：审慎、结构化、强 reasoning、用 markdown 列点。",
  gpt: "你正在模拟 OpenAI ChatGPT 的回答风格：标准化、信息全面、列点清晰。",
  gemini: "你正在模拟 Google Gemini 的回答风格：多模态、信息检索导向、列点紧凑。",
  perplexity: "你正在模拟 Perplexity 的回答风格：每个事实都附 [1][2] 引用源链接、像新闻摘要。",
};

export function platformPersona(p: AiPlatformId) {
  return PLATFORM_PERSONAS[p] ?? "";
}

/**
 * 平台 → 真实 provider 映射。
 *
 * 默认策略：**所有平台统一走小米 MIMO**（用户提供的唯一 API），不碰任何外部官方端点。
 * 仅当显式设置 `ALLOW_EXTERNAL_PROVIDERS=true` 且配了对应官方 key 时，才会切到官方平台。
 * 这样保证「所有 LLM 调用都只用 MIMO」，零外部依赖、零额外计费。
 */
interface PlatformProvider {
  model: LanguageModel;
  modelName: string;
  isReal: true;
}

const ALLOW_EXTERNAL = process.env.ALLOW_EXTERNAL_PROVIDERS === "true";

function realProvider(p: AiPlatformId): PlatformProvider | null {
  // 默认关闭：不配 ALLOW_EXTERNAL_PROVIDERS 就永远不碰外部端点，全部回落 MIMO。
  if (!ALLOW_EXTERNAL) return null;

  if (p === "claude" && process.env.ANTHROPIC_API_KEY) {
    const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    return { model: anthropic("claude-opus-4-5"), modelName: "claude-opus-4-5", isReal: true };
  }
  if (p === "gpt" && process.env.OPENAI_API_KEY) {
    const oai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
    return { model: oai.chat("gpt-5"), modelName: "gpt-5", isReal: true };
  }
  if (p === "deepseek" && process.env.DEEPSEEK_API_KEY) {
    const ds = createOpenAI({ apiKey: process.env.DEEPSEEK_API_KEY, baseURL: "https://api.deepseek.com/v1" });
    return { model: ds.chat("deepseek-chat"), modelName: "deepseek-chat", isReal: true };
  }
  if (p === "qwen" && process.env.QWEN_API_KEY) {
    const qwen = createOpenAI({ apiKey: process.env.QWEN_API_KEY, baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1" });
    return { model: qwen.chat("qwen-max"), modelName: "qwen-max", isReal: true };
  }
  if (p === "doubao" && process.env.DOUBAO_API_KEY) {
    const doubao = createOpenAI({ apiKey: process.env.DOUBAO_API_KEY, baseURL: "https://ark.cn-beijing.volces.com/api/v3" });
    return { model: doubao.chat("doubao-pro-32k"), modelName: "doubao-pro-32k", isReal: true };
  }
  if (p === "kimi" && process.env.KIMI_API_KEY) {
    const kimi = createOpenAI({ apiKey: process.env.KIMI_API_KEY, baseURL: "https://api.moonshot.cn/v1" });
    return { model: kimi.chat("moonshot-v1-32k"), modelName: "moonshot-v1-32k", isReal: true };
  }
  if (p === "zhipu" && process.env.ZHIPU_API_KEY) {
    const zhipu = createOpenAI({ apiKey: process.env.ZHIPU_API_KEY, baseURL: "https://open.bigmodel.cn/api/paas/v4" });
    return { model: zhipu.chat("glm-4"), modelName: "glm-4", isReal: true };
  }
  if (p === "perplexity" && process.env.PERPLEXITY_API_KEY) {
    const ppx = createOpenAI({ apiKey: process.env.PERPLEXITY_API_KEY, baseURL: "https://api.perplexity.ai" });
    return { model: ppx.chat("llama-3.1-sonar-large-128k-online"), modelName: "sonar-large-online", isReal: true };
  }
  return null;
}

/**
 * LiteLLM 网关 provider（中间层）。
 * 仅当 LLM_GATEWAY_URL 配置、且该平台在网关 modelMap 里时启用。
 */
function gatewayProvider(p: AiPlatformId): PlatformProvider | null {
  const cfg = getLlmConfig();
  if (cfg.provider !== "litellm-gateway") return null;
  const alias = cfg.modelMap[p];
  if (!alias) return null;
  const provider = getLlmProvider();
  return { model: provider.chat(alias), modelName: alias, isReal: true };
}

export function platformStatus(
  p: AiPlatformId,
): { mode: "real" | "gateway" | "mimo"; model: string } {
  const real = realProvider(p);
  if (real) return { mode: "real", model: real.modelName };
  const gw = gatewayProvider(p);
  if (gw) return { mode: "gateway", model: gw.modelName };
  // 默认：统一走用户的 MIMO API（带平台 persona 区分风格）
  return { mode: "mimo", model: MIMO_MODEL };
}

/** 简易包装：传入 prompt 直接拿回答 */
export async function ask(opts: {
  prompt: string;
  system?: string;
  platform?: AiPlatformId;
  temperature?: number;
}) {
  const persona = opts.platform ? platformPersona(opts.platform) : "";
  // 三级路由：平台真实 key → LiteLLM 网关 alias → MIMO 模拟
  const real = opts.platform ? realProvider(opts.platform) : null;
  const gw = !real && opts.platform ? gatewayProvider(opts.platform) : null;
  const chosen = real ?? gw;
  const model = chosen?.model ?? defaultModel;
  // 真实/网关 provider 用真模型，不需要 persona 模拟提示
  const system = chosen
    ? (opts.system ?? undefined)
    : [persona, opts.system].filter(Boolean).join("\n\n") || undefined;

  const t0 = Date.now();
  const result = await generateText({
    model,
    system,
    prompt: opts.prompt,
    temperature: opts.temperature ?? 0.5,
  });
  return {
    text: result.text,
    usage: result.usage,
    latencyMs: Date.now() - t0,
    modelUsed: chosen?.modelName ?? MIMO_MODEL,
    isReal: !!real,
    viaGateway: !!gw,
  };
}

export { generateText, streamText };
