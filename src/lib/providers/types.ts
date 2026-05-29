/**
 * Provider 适配层 —— 统一能力接口。
 *
 * 设计原则：每个能力都有 `builtin` 兜底实现 + 可选的外部 OSS 实现（env 开关）。
 * 任何外部 provider 不可用时自动降级到 builtin，不阻断主流程。
 *
 * 对标 AceFlow 各模块所用的开源替代见 docs/oss-integration-research.md。
 */

// ── 网页抓取（Firecrawl / Crawl4AI / builtin fetch） ──────────────
export interface ScrapeResult {
  url: string;
  /** 干净的正文（markdown 优先，降级为纯文本） */
  markdown: string;
  /** 原始 HTML（builtin 一定有；外部可能省略） */
  html?: string;
  title?: string;
  description?: string;
  /** 截图（外部 provider 提供，base64 或 url） */
  screenshot?: string;
  /** 提供方标识 */
  provider: "builtin" | "firecrawl" | "crawl4ai";
  /** 抓取是否成功（失败时 markdown 可能为空但不抛错） */
  ok: boolean;
  error?: string;
}

export interface Scraper {
  id: string;
  scrape(url: string, opts?: { screenshot?: boolean; timeoutMs?: number }): Promise<ScrapeResult>;
}

// ── 真机/浏览器答案抓取（Skyvern / Steel / browser-use / builtin LLM 模拟） ──
export interface AnswerCrawlResult {
  platform: string;
  question: string;
  answer: string;
  /** 真机截图路径/URL（外部 provider 提供，builtin 无） */
  screenshotPath?: string;
  /** 存档 URL */
  archiveUrl?: string;
  /** 是否真实抓取（false = LLM 模拟） */
  isReal: boolean;
  provider: "builtin" | "skyvern" | "steel" | "browser-use";
  latencyMs: number;
}

export interface AnswerCrawler {
  id: string;
  /** 在某 AI 平台上提问并取回答案（+可选截图） */
  crawlAnswer(opts: {
    platform: string;
    question: string;
    captureScreenshot?: boolean;
  }): Promise<AnswerCrawlResult>;
}

// ── 知识库 RAG（RAGFlow / Dify / builtin SQLite） ─────────────────
export interface RagHit {
  text: string;
  score: number;
  docTitle?: string;
  source?: string;
}

export interface KnowledgeProvider {
  id: string;
  retrieve(opts: { userId: string; query: string; topK?: number; projectId?: string }): Promise<RagHit[]>;
}

// ── 多平台发布（Postiz / Wechatsync / Dev.to·Hashnode·Medium / builtin） ──
export interface PublishProvider {
  id: string;
  /** 该 provider 支持的平台 slug 列表 */
  platforms: string[];
  publish(opts: {
    platform: string;
    title: string;
    body: string;
    tags?: string[];
    token?: string;
    canonicalUrl?: string;
  }): Promise<{ ok: boolean; url?: string; error?: string }>;
}
