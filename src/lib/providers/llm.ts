import "server-only";
import { createOpenAI, type OpenAIProvider } from "@ai-sdk/openai";

/**
 * LLM 网关 provider 选择。
 *
 * 优先级：
 *   1. LiteLLM / OpenAI 兼容网关（LLM_GATEWAY_URL）—— 统一 100+ 模型 + 成本追踪
 *      repo: github.com/BerriAI/litellm（自托管 Docker，OpenAI 协议）
 *   2. 小米 MIMO 直连（builtin 兜底）
 *
 * 因为 LiteLLM 暴露的是标准 OpenAI 协议，我们只需把 baseURL/key 指过去即可，
 * 上层 ai.ts 的 generateText/streamText 调用完全不变。
 */

export interface LlmGatewayConfig {
  provider: "litellm-gateway" | "mimo";
  baseURL: string;
  apiKey: string;
  defaultModel: string;
  /** 网关模式下，平台 slug → 真实模型名 的映射（在网关侧配置 model alias） */
  modelMap: Record<string, string>;
}

const GATEWAY_URL = process.env.LLM_GATEWAY_URL?.trim();
const GATEWAY_KEY = process.env.LLM_GATEWAY_KEY?.trim();

const MIMO_KEY = process.env.MIMO_API_KEY ?? "";
const MIMO_BASE = process.env.MIMO_BASE_URL ?? "https://token-plan-cn.xiaomimimo.com/v1";
const MIMO_MODEL = process.env.MIMO_MODEL ?? "mimo-v2.5-pro";

export function getLlmConfig(): LlmGatewayConfig {
  if (GATEWAY_URL && GATEWAY_KEY) {
    return {
      provider: "litellm-gateway",
      baseURL: GATEWAY_URL,
      apiKey: GATEWAY_KEY,
      // 网关侧用 model 名直接路由；这里给一个通用默认
      defaultModel: process.env.LLM_GATEWAY_MODEL ?? "deepseek/deepseek-chat",
      // 平台 slug → 网关 model alias（在 LiteLLM config.yaml 里配同名 alias）
      modelMap: {
        deepseek: "deepseek/deepseek-chat",
        qwen: "qwen/qwen-max",
        doubao: "doubao/doubao-pro-32k",
        yuanbao: "hunyuan/hunyuan-pro",
        kimi: "moonshot/moonshot-v1-32k",
        zhipu: "zhipu/glm-4",
        claude: "anthropic/claude-opus-4-5",
        gpt: "openai/gpt-5",
        gemini: "gemini/gemini-2.5-pro",
        perplexity: "perplexity/sonar-large",
      },
    };
  }
  return {
    provider: "mimo",
    baseURL: MIMO_BASE,
    apiKey: MIMO_KEY || "missing-key",
    defaultModel: MIMO_MODEL,
    modelMap: {},
  };
}

let _provider: OpenAIProvider | null = null;
export function getLlmProvider(): OpenAIProvider {
  if (_provider) return _provider;
  const cfg = getLlmConfig();
  _provider = createOpenAI({ apiKey: cfg.apiKey, baseURL: cfg.baseURL });
  return _provider;
}

/** 给定平台 slug，返回应使用的 chat model 实例（网关模式走 alias，否则走 MIMO 单模型） */
export function modelForPlatform(platform?: string) {
  const cfg = getLlmConfig();
  const provider = getLlmProvider();
  if (cfg.provider === "litellm-gateway" && platform && cfg.modelMap[platform]) {
    return { model: provider.chat(cfg.modelMap[platform]), modelName: cfg.modelMap[platform], isGateway: true };
  }
  return { model: provider.chat(cfg.defaultModel), modelName: cfg.defaultModel, isGateway: cfg.provider === "litellm-gateway" };
}

export function llmStatus() {
  const cfg = getLlmConfig();
  return {
    provider: cfg.provider,
    baseURL: cfg.baseURL.replace(/\/+$/, ""),
    defaultModel: cfg.defaultModel,
    gatewayEnabled: cfg.provider === "litellm-gateway",
    platformModels: cfg.modelMap,
  };
}
