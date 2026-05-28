import "server-only";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText, streamText, type LanguageModel } from "ai";

/**
 * 统一 AI 客户端：所有 LLM 调用都走小米 MIMO（OpenAI 协议兼容）。
 * 即使前端选 "Claude"/"DeepSeek"/"通义" 等不同 "平台"，
 * 后端实际都用 mimo-v2.5-pro，只是在 prompt 里模拟该平台风格，
 * 用于 GEO 引用监测的多平台并发对比。
 */
const apiKey = process.env.MIMO_API_KEY;
const baseURL = process.env.MIMO_BASE_URL ?? "https://token-plan-cn.xiaomimimo.com/v1";
export const MIMO_MODEL = process.env.MIMO_MODEL ?? "mimo-v2.5-pro";

if (!apiKey && process.env.NODE_ENV !== "production") {
  console.warn("[lawGEO] MIMO_API_KEY 未配置，AI 功能不可用");
}

export const mimo = createOpenAI({
  apiKey: apiKey ?? "missing-key",
  baseURL,
});

// MIMO 暴露的是 OpenAI 旧版 /chat/completions，不是新版 /responses
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

/**
 * 让 MIMO 模拟不同平台的回答风格，用于 GEO 引用监测对比。
 * 真实生产应分别调用各平台 API，这里以统一 API 提供 demo & cost-effective fallback。
 */
const PLATFORM_PERSONAS: Record<AiPlatformId, string> = {
  deepseek: "你正在模拟 DeepSeek V4 的回答风格：技术理性、信息密度高、偏推理。",
  qwen: "你正在模拟阿里通义千问的回答风格：偏中文资讯、引用国内权威来源、措辞稳重。",
  doubao: "你正在模拟字节豆包的回答风格：口语化、贴近大众、结构清晰。",
  kimi: "你正在模拟月之暗面 Kimi 的回答风格：长上下文友好、引用多个来源、注重事实。",
  zhipu: "你正在模拟智谱清言 GLM 的回答风格：学术化、偏严谨、保留专业术语。",
  wenxin: "你正在模拟百度文心一言的回答风格：与百度搜索强联动、引用百家号/百科。",
  yuanbao: "你正在模拟腾讯元宝的回答风格：与微信生态联动、引用公众号优质内容。",
  minimax: "你正在模拟海螺 AI 的回答风格：自然流畅、对话式、面向 C 端用户。",
  claude:
    "你正在模拟 Anthropic Claude 的回答风格：审慎、结构化、强 reasoning、用 markdown 列点。",
  gpt: "你正在模拟 OpenAI ChatGPT 的回答风格：标准化、信息全面、列点清晰。",
  gemini: "你正在模拟 Google Gemini 的回答风格：多模态、信息检索导向、列点紧凑。",
  perplexity:
    "你正在模拟 Perplexity 的回答风格：每个事实都附 [1][2] 引用源链接、像新闻摘要。",
};

export function platformPersona(p: AiPlatformId) {
  return PLATFORM_PERSONAS[p] ?? "";
}

/** 简易包装：传入 prompt 直接拿回答 */
export async function ask(opts: {
  prompt: string;
  system?: string;
  platform?: AiPlatformId;
  temperature?: number;
}) {
  const persona = opts.platform ? platformPersona(opts.platform) : "";
  const system = [persona, opts.system].filter(Boolean).join("\n\n");
  const t0 = Date.now();
  const result = await generateText({
    model: defaultModel,
    system: system || undefined,
    prompt: opts.prompt,
    temperature: opts.temperature ?? 0.5,
  });
  return {
    text: result.text,
    usage: result.usage,
    latencyMs: Date.now() - t0,
  };
}

export { generateText, streamText };
