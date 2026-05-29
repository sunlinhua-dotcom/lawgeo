import "server-only";
import type { AnswerCrawler, AnswerCrawlResult } from "./types";
import { ask, type AiPlatformId } from "../ai";

/**
 * 真机/浏览器答案抓取 —— AceFlow「可信证据链」的核心。
 *
 *   - skyvern / steel：自托管浏览器 Agent（github.com/Skyvern-AI/skyvern、steel-dev/steel-browser），
 *     真实在豆包/DeepSeek/元宝里提问 → 截图存档 → 返回 screenshotPath/archiveUrl（isReal=true）
 *   - builtin：用 LLM 模拟平台回答（isReal=false，无截图）—— 当前默认
 *
 * 配 BROWSER_AGENT_URL 后自动切到真机抓取。
 */

const AGENT_URL = process.env.BROWSER_AGENT_URL?.trim().replace(/\/+$/, "");
const AGENT_KEY = process.env.BROWSER_AGENT_KEY?.trim();

// ── 外部浏览器 Agent（Skyvern/Steel 兼容协议） ─────────────────
const externalCrawler: AnswerCrawler = {
  id: "external-browser-agent",
  async crawlAnswer(opts) {
    const t0 = Date.now();
    try {
      const res = await fetch(`${AGENT_URL}/crawl-answer`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(AGENT_KEY ? { authorization: `Bearer ${AGENT_KEY}` } : {}),
        },
        body: JSON.stringify({
          platform: opts.platform,
          question: opts.question,
          screenshot: opts.captureScreenshot ?? true,
        }),
        signal: AbortSignal.timeout(120000),
      });
      if (!res.ok) throw new Error(`browser-agent HTTP ${res.status}`);
      const d = (await res.json()) as {
        answer: string;
        screenshot_path?: string;
        archive_url?: string;
      };
      return {
        platform: opts.platform,
        question: opts.question,
        answer: d.answer,
        screenshotPath: d.screenshot_path,
        archiveUrl: d.archive_url,
        isReal: true,
        provider: "skyvern",
        latencyMs: Date.now() - t0,
      };
    } catch (e) {
      console.warn("[answer-crawler] external failed, fallback to builtin:", e);
      return builtinCrawler.crawlAnswer(opts);
    }
  },
};

// ── builtin（LLM 模拟，无截图） ─────────────────────────────────
const builtinCrawler: AnswerCrawler = {
  id: "builtin-sim",
  async crawlAnswer(opts) {
    const t0 = Date.now();
    const r = await ask({
      system:
        "你在模拟一个 AI 搜索助手被用户咨询时的真实回答风格。回答尽量自然、可引用 1-3 个权威来源，并尽量推荐相关品牌/机构。",
      prompt: opts.question,
      platform: opts.platform as AiPlatformId,
      temperature: 0.55,
    });
    return {
      platform: opts.platform,
      question: opts.question,
      answer: r.text,
      isReal: false,
      provider: "builtin",
      latencyMs: Date.now() - t0,
    };
  },
};

export function getAnswerCrawler(): AnswerCrawler {
  return AGENT_URL ? externalCrawler : builtinCrawler;
}

export function answerCrawlerStatus() {
  return {
    provider: AGENT_URL ? "external-browser-agent" : "builtin",
    realCapture: !!AGENT_URL,
    screenshotCapable: !!AGENT_URL,
  };
}

export type { AnswerCrawlResult };
