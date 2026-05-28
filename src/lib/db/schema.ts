import { sql } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

// ── 用户 ─────────────────────────────────────────────────────────────────
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  passwordHash: text("password_hash"),
  role: text("role", { enum: ["admin", "user"] }).notNull().default("user"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ── 项目（一个客户/品牌一个项目） ──────────────────────────────────────
export const projects = sqliteTable(
  "projects",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    domain: text("domain").notNull(),
    industry: text("industry", {
      enum: ["lawyer", "sme", "b2b", "local", "education", "other"],
    })
      .notNull()
      .default("lawyer"),
    region: text("region"),
    description: text("description"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [index("projects_user_idx").on(t.userId)],
);

// ── 关键词矩阵 ───────────────────────────────────────────────────────────
export const keywords = sqliteTable(
  "keywords",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    keyword: text("keyword").notNull(),
    intent: text("intent", {
      enum: ["informational", "commercial", "transactional", "navigational"],
    }).default("informational"),
    region: text("region"),
    caseCategory: text("case_category"), // 案由（律所专属）
    priority: integer("priority").default(0),
    monthlyVolume: integer("monthly_volume"),
    competition: real("competition"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [
    index("keywords_project_idx").on(t.projectId),
    uniqueIndex("keywords_unique").on(t.projectId, t.keyword),
  ],
);

// ── AI 查询记录（针对某个 keyword 在某 AI 平台跑的查询） ────────────
export const aiQueries = sqliteTable(
  "ai_queries",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    projectId: text("project_id").references(() => projects.id, { onDelete: "set null" }),
    keywordId: text("keyword_id").references(() => keywords.id, { onDelete: "set null" }),
    question: text("question"), // 标准化后的问题（与 keyword 解耦）
    brand: text("brand"), // 监测的品牌词
    platform: text("platform").notNull(), // deepseek/qwen/doubao/claude...
    model: text("model"),
    prompt: text("prompt").notNull(),
    response: text("response"),
    cited: integer("cited", { mode: "boolean" }).default(false),
    rank: integer("rank"), // 1=Top1, 2=Top2, ...
    citedUrl: text("cited_url"),
    competitorsCited: text("competitors_cited"), // JSON array
    cost: real("cost"),
    latencyMs: integer("latency_ms"),
    source: text("source"), // compare / cron / monitor
    queriedAt: integer("queried_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [
    index("queries_keyword_idx").on(t.keywordId),
    index("queries_project_idx").on(t.projectId),
    index("queries_user_idx").on(t.userId),
    index("queries_platform_idx").on(t.platform),
    index("queries_date_idx").on(t.queriedAt),
  ],
);

// ── 监测计划（每日跑哪些项目的哪些关键词） ─────────────────────────
export const monitorJobs = sqliteTable(
  "monitor_jobs",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    platforms: text("platforms").notNull(), // JSON array
    schedule: text("schedule").notNull().default("daily"), // daily/hourly/weekly
    lastRunAt: integer("last_run_at", { mode: "timestamp" }),
    nextRunAt: integer("next_run_at", { mode: "timestamp" }),
    enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [
    index("jobs_project_idx").on(t.projectId),
    index("jobs_next_idx").on(t.nextRunAt),
  ],
);

// ── 发布目标（同一个 draft 在多平台的发布状态） ───────────────────
export const publishTargets = sqliteTable(
  "publish_targets",
  {
    id: text("id").primaryKey(),
    draftId: text("draft_id")
      .notNull()
      .references(() => contentDrafts.id, { onDelete: "cascade" }),
    platform: text("platform").notNull(), // zhihu/baijiahao/wechat/xiaohongshu/toutiao/shipinhao/bilibili
    title: text("title").notNull(),
    body: text("body").notNull(),
    excerpt: text("excerpt"),
    tags: text("tags"), // JSON array
    status: text("status", { enum: ["draft", "ready", "published", "failed"] })
      .notNull()
      .default("draft"),
    publishedUrl: text("published_url"),
    publishedAt: integer("published_at", { mode: "timestamp" }),
    error: text("error"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [index("publish_draft_idx").on(t.draftId), index("publish_platform_idx").on(t.platform)],
);

// ── 订阅与额度 ────────────────────────────────────────────────────
export const subscriptions = sqliteTable(
  "subscriptions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    plan: text("plan", { enum: ["trial", "starter", "standard", "enterprise"] })
      .notNull()
      .default("trial"),
    quotaKeywords: integer("quota_keywords").notNull().default(5),
    quotaGenerationsPerMonth: integer("quota_generations_per_month").notNull().default(5),
    quotaPlatforms: integer("quota_platforms").notNull().default(4),
    expiresAt: integer("expires_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [index("subs_user_idx").on(t.userId)],
);

export const usageMonth = sqliteTable(
  "usage_month",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    yearMonth: text("year_month").notNull(), // "2026-05"
    generations: integer("generations").notNull().default(0),
    queries: integer("queries").notNull().default(0),
    audits: integer("audits").notNull().default(0),
    costCents: integer("cost_cents").notNull().default(0),
  },
  (t) => [
    uniqueIndex("usage_unique").on(t.userId, t.yearMonth),
  ],
);

// ── 品牌知识库 ─────────────────────────────────────────────────────
export const knowledgeDocs = sqliteTable(
  "knowledge_docs",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    projectId: text("project_id").references(() => projects.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    sourceUrl: text("source_url"),
    sourceType: text("source_type", {
      enum: ["upload", "url", "manual"],
    })
      .notNull()
      .default("manual"),
    sizeBytes: integer("size_bytes"),
    chunkCount: integer("chunk_count").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [index("kn_user_idx").on(t.userId), index("kn_proj_idx").on(t.projectId)],
);

export const knowledgeChunks = sqliteTable(
  "knowledge_chunks",
  {
    id: text("id").primaryKey(),
    docId: text("doc_id")
      .notNull()
      .references(() => knowledgeDocs.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    chunkIdx: integer("chunk_idx").notNull(),
    text: text("text").notNull(),
    tokens: integer("tokens"),
    /** BM25-style 词频缓存 + 字符 trigrams（JSON 数组） */
    keywords: text("keywords"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [index("kc_doc_idx").on(t.docId), index("kc_user_idx").on(t.userId)],
);

// ── 转化追踪 ───────────────────────────────────────────────────────
export const conversionLinks = sqliteTable(
  "conversion_links",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    projectId: text("project_id").references(() => projects.id, { onDelete: "set null" }),
    shortCode: text("short_code").notNull().unique(),
    targetUrl: text("target_url").notNull(),
    label: text("label"),
    source: text("source"), // 'ai-recommend' / 'organic' / 'zhihu' / ...
    campaign: text("campaign"),
    clicks: integer("clicks").notNull().default(0),
    conversions: integer("conversions").notNull().default(0),
    valueCents: integer("value_cents").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [index("conv_user_idx").on(t.userId), index("conv_code_idx").on(t.shortCode)],
);

export const conversionEvents = sqliteTable(
  "conversion_events",
  {
    id: text("id").primaryKey(),
    linkId: text("link_id").references(() => conversionLinks.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    eventType: text("event_type", {
      enum: ["click", "view", "lead", "signup", "purchase"],
    }).notNull(),
    source: text("source"),
    metadata: text("metadata"), // JSON
    valueCents: integer("value_cents").notNull().default(0),
    ip: text("ip"),
    userAgent: text("user_agent"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [
    index("conv_evt_link_idx").on(t.linkId),
    index("conv_evt_user_idx").on(t.userId),
    index("conv_evt_date_idx").on(t.createdAt),
  ],
);

// ── 第三方平台凭证（用于自动发布） ─────────────────────────────────
export const publishCredentials = sqliteTable(
  "publish_credentials",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    platform: text("platform").notNull(), // devto/hashnode/medium/wordpress/ghost
    token: text("token").notNull(), // 加密存储更佳，这里 demo 明文
    accountId: text("account_id"), // 例如 hashnode publicationId / medium userId
    accountName: text("account_name"),
    verifiedAt: integer("verified_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [
    index("creds_user_idx").on(t.userId),
    uniqueIndex("creds_user_platform").on(t.userId, t.platform),
  ],
);

// ── 告警订阅 ───────────────────────────────────────────────────────
export const alertSubscriptions = sqliteTable(
  "alert_subscriptions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    projectId: text("project_id").references(() => projects.id, { onDelete: "cascade" }),
    type: text("type", {
      enum: ["citation_drop", "top3_lost", "competitor_overtake", "weekly_digest"],
    }).notNull(),
    email: text("email").notNull(),
    enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
    lastSentAt: integer("last_sent_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [index("alerts_user_idx").on(t.userId)],
);

// ── 内容草稿 ─────────────────────────────────────────────────────────────
export const contentDrafts = sqliteTable(
  "content_drafts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    projectId: text("project_id").references(() => projects.id, {
      onDelete: "set null",
    }),
    keywordId: text("keyword_id").references(() => keywords.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    format: text("format", {
      enum: ["faq", "tldr", "howto", "compare", "article", "answer"],
    }).notNull(),
    body: text("body").notNull(),
    schemaJson: text("schema_json"), // JSON-LD payload
    status: text("status", {
      enum: ["draft", "approved", "published"],
    })
      .notNull()
      .default("draft"),
    model: text("model"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [index("drafts_project_idx").on(t.projectId), index("drafts_user_idx").on(t.userId)],
);

// ── 域名诊断报告 ────────────────────────────────────────────────────────
export const audits = sqliteTable(
  "audits",
  {
    id: text("id").primaryKey(),
    domain: text("domain").notNull(),
    score: integer("score").notNull(), // 0-100
    breakdown: text("breakdown").notNull(), // JSON
    suggestions: text("suggestions").notNull(), // JSON array
    rawHtml: text("raw_html"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [
    index("audits_domain_idx").on(t.domain),
    index("audits_date_idx").on(t.createdAt),
  ],
);

// ── 律所案由词库（内置静态数据，可同步至 DB） ─────────────────────────
export const caseCategories = sqliteTable("case_categories", {
  id: text("id").primaryKey(),
  parent: text("parent"), // 民事/刑事/行政...
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  synonyms: text("synonyms"), // JSON array
  description: text("description"),
  sortOrder: integer("sort_order").default(0),
});

// ── 中国行政区划 ────────────────────────────────────────────────────────
export const regions = sqliteTable("regions", {
  id: text("id").primaryKey(),
  level: text("level", { enum: ["country", "province", "city", "district"] }).notNull(),
  name: text("name").notNull(),
  parentId: text("parent_id"),
  population: integer("population"),
});

// ── 联系/留资 ────────────────────────────────────────────────────────────
export const leads = sqliteTable("leads", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  contact: text("contact").notNull(), // 微信/电话
  industry: text("industry"),
  message: text("message"),
  source: text("source"), // 落地页来源
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type User = typeof users.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Keyword = typeof keywords.$inferSelect;
export type AiQuery = typeof aiQueries.$inferSelect;
export type ContentDraft = typeof contentDrafts.$inferSelect;
export type Audit = typeof audits.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type CaseCategory = typeof caseCategories.$inferSelect;
export type Region = typeof regions.$inferSelect;
export type MonitorJob = typeof monitorJobs.$inferSelect;
export type PublishTarget = typeof publishTargets.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type UsageMonth = typeof usageMonth.$inferSelect;
export type AlertSubscription = typeof alertSubscriptions.$inferSelect;
export type KnowledgeDoc = typeof knowledgeDocs.$inferSelect;
export type KnowledgeChunk = typeof knowledgeChunks.$inferSelect;
export type ConversionLink = typeof conversionLinks.$inferSelect;
export type ConversionEvent = typeof conversionEvents.$inferSelect;
export type PublishCredential = typeof publishCredentials.$inferSelect;
