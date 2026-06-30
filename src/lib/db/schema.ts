import { sql } from "drizzle-orm";
import {
  index,
  integer,
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
      enum: ["beauty", "fmcg", "consumer-electronics", "sme", "b2b", "local", "education", "lawyer", "other"],
    })
      .notNull()
      .default("beauty"),
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
    caseCategory: text("case_category"), // 品类 / 主题（如美妆品类；律所等行业也可复用为案由）
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

// ── 作者库（行业博客文章的署名人） ─────────────────────────────────
export const authors = sqliteTable(
  "authors",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    title: text("title"), // 头衔：成分专家 / 主笔测评师 / 高级律师 等
    bio: text("bio"), // 简介
    expertise: text("expertise"), // JSON array：擅长领域
    avatarUrl: text("avatar_url"),
    industry: text("industry"), // 关联行业
    socialLinks: text("social_links"), // JSON：{weibo, zhihu, wechat...}
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [
    index("authors_user_idx").on(t.userId),
    uniqueIndex("authors_user_slug").on(t.userId, t.slug),
  ],
);

// ── 行业博客文章（pillar/cluster 结构、AI 友好） ───────────────────
export const blogPosts = sqliteTable(
  "blog_posts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    authorId: text("author_id").references(() => authors.id, { onDelete: "set null" }),
    industry: text("industry").notNull(), // beauty/fmcg/retail/lawyer/education/...
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    excerpt: text("excerpt"),
    body: text("body").notNull(), // markdown
    schemaJson: text("schema_json"), // 完整 JSON-LD: Article + FAQ + Person + Breadcrumb
    /** 文章类型：pillar 是支柱页（覆盖大主题），cluster 是子页（覆盖长尾） */
    postType: text("post_type", { enum: ["pillar", "cluster", "case-study", "howto", "faq"] })
      .notNull()
      .default("cluster"),
    /** 所属 pillar slug（cluster 链回 pillar） */
    pillarSlug: text("pillar_slug"),
    keywords: text("keywords"), // JSON array
    tags: text("tags"), // JSON array
    wordCount: integer("word_count"),
    readMinutes: integer("read_minutes"),
    status: text("status", { enum: ["draft", "scheduled", "published", "archived"] })
      .notNull()
      .default("draft"),
    scheduledAt: integer("scheduled_at", { mode: "timestamp" }),
    publishedAt: integer("published_at", { mode: "timestamp" }),
    viewCount: integer("view_count").notNull().default(0),
    citationCount: integer("citation_count").notNull().default(0), // AI 引用次数
    model: text("model"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [
    index("posts_user_idx").on(t.userId),
    index("posts_industry_idx").on(t.industry),
    index("posts_status_idx").on(t.status),
    index("posts_pillar_idx").on(t.pillarSlug),
    uniqueIndex("posts_industry_slug").on(t.industry, t.slug),
  ],
);

// ── 批量生成任务（异步队列） ───────────────────────────────────────
export const bulkJobs = sqliteTable(
  "bulk_jobs",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    industry: text("industry").notNull(),
    authorId: text("author_id"),
    keywords: text("keywords").notNull(), // JSON array
    /** 每个关键词生成几篇 */
    perKeyword: integer("per_keyword").notNull().default(1),
    /** 文章总数（= keywords.length × perKeyword） */
    totalCount: integer("total_count").notNull(),
    completedCount: integer("completed_count").notNull().default(0),
    failedCount: integer("failed_count").notNull().default(0),
    autoPublish: integer("auto_publish", { mode: "boolean" }).notNull().default(true),
    status: text("status", { enum: ["queued", "running", "done", "failed", "canceled"] })
      .notNull()
      .default("queued"),
    error: text("error"),
    startedAt: integer("started_at", { mode: "timestamp" }),
    finishedAt: integer("finished_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [
    index("bulk_user_idx").on(t.userId),
    index("bulk_status_idx").on(t.status),
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

// ── 品类 / 主题词库（内置静态数据，可同步至 DB；美妆品类、律所案由等通用） ─────────────────────────
export const caseCategories = sqliteTable("case_categories", {
  id: text("id").primaryKey(),
  parent: text("parent"), // 一级分类：护肤/彩妆/个护…（律所行业则为民事/刑事/行政）
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
export type Author = typeof authors.$inferSelect;
export type BlogPost = typeof blogPosts.$inferSelect;
export type BulkJob = typeof bulkJobs.$inferSelect;

// ════════════════════════════════════════════════════════════════════
//  GEO 核心模块（对标 AceFlow，轻量品牌上下文，无多租户分销）
// ════════════════════════════════════════════════════════════════════

// ── 品牌（GEO 模块的操作单元，用户级） ───────────────────────────
export const brands = sqliteTable(
  "brands",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    website: text("website"),
    industry: text("industry"),
    region: text("region"),
    description: text("description"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [index("brands_user_idx").on(t.userId)],
);

// ── 转化画像（品牌的转化目标，供实时查询追问命中匹配） ───────────
export const brandConversionProfiles = sqliteTable("brand_conversion_profiles", {
  id: text("id").primaryKey(),
  brandId: text("brand_id")
    .notNull()
    .references(() => brands.id, { onDelete: "cascade" })
    .unique(),
  phone: text("phone"),
  wechat: text("wechat"),
  ctaText: text("cta_text"),
  /** 命中视为转化的目标词（JSON array：电话/微信/官网等） */
  conversionTargets: text("conversion_targets"),
  followupQuestion: text("followup_question").default("联系方式是什么？"),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ── 洞察任务 + 报告 ──────────────────────────────────────────────
export const insights = sqliteTable(
  "insights",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    brandId: text("brand_id").references(() => brands.id, { onDelete: "set null" }),
    brandName: text("brand_name").notNull(),
    industry: text("industry"),
    website: text("website"),
    keywords: text("keywords"), // JSON array 种子词
    status: text("status", { enum: ["queued", "running", "done", "failed"] }).notNull().default("queued"),
    progress: integer("progress").notNull().default(0),
    /** 报告 JSON：{ websiteProfile, competitors[], sources[], heatKeywords[], brandIssues[] } */
    report: text("report"),
    error: text("error"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
    finishedAt: integer("finished_at", { mode: "timestamp" }),
  },
  (t) => [index("insights_user_idx").on(t.userId), index("insights_brand_idx").on(t.brandId)],
);

// ── 意图词库 ──────────────────────────────────────────────────────
export const intents = sqliteTable(
  "intents",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    brandId: text("brand_id").references(() => brands.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    intentType: text("intent_type", {
      enum: ["informational", "commercial", "transactional", "navigational"],
    }).default("commercial"),
    searchVolume: integer("search_volume"),
    /** GEO 热度等级：高热度/中高热度/中等热度/长尾热度 */
    heatLevel: text("heat_level"),
    /** GEO 指数 0-100：该词在 AI 搜索里被触发的概率 */
    geoIndex: integer("geo_index"),
    priority: integer("priority").notNull().default(5),
    note: text("note"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  },
  (t) => [
    index("intents_user_idx").on(t.userId),
    index("intents_brand_idx").on(t.brandId),
    uniqueIndex("intents_brand_text").on(t.brandId, t.text),
  ],
);

// ── 内容计划 + 文章（含 7 维评分） ───────────────────────────────
export const contentArticles = sqliteTable(
  "content_articles",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    brandId: text("brand_id").references(() => brands.id, { onDelete: "set null" }),
    intentId: text("intent_id").references(() => intents.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    intentText: text("intent_text"),
    keywords: text("keywords"), // JSON array
    body: text("body").notNull(),
    /** 7 维评分 JSON：{ total, title, firstPara, deAi, structure, authority, match, conversion, reasons{} } */
    scores: text("scores"),
    targetPlatform: text("target_platform"),
    status: text("status", { enum: ["draft", "scored", "published"] }).notNull().default("draft"),
    model: text("model"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  },
  (t) => [index("articles_user_idx").on(t.userId), index("articles_brand_idx").on(t.brandId)],
);

// ── 实时查询（主） ───────────────────────────────────────────────
export const realtimeSearches = sqliteTable(
  "realtime_searches",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    brandId: text("brand_id").references(() => brands.id, { onDelete: "set null" }),
    question: text("question").notNull(),
    targetWord: text("target_word").notNull(),
    platforms: text("platforms").notNull(), // JSON array
    followupTriggerWord: text("followup_trigger_word"),
    status: text("status", { enum: ["running", "done", "failed"] }).notNull().default("running"),
    /** 聚合：mentioned/top1/top3/converted 计数 */
    summary: text("summary"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  },
  (t) => [index("rts_user_idx").on(t.userId), index("rts_brand_idx").on(t.brandId)],
);

// ── 实时查询结果（每平台一行，含追问转化） ───────────────────────
export const realtimeResults = sqliteTable(
  "realtime_results",
  {
    id: text("id").primaryKey(),
    searchId: text("search_id").notNull().references(() => realtimeSearches.id, { onDelete: "cascade" }),
    platform: text("platform").notNull(),
    answer: text("answer"),
    isMentioned: integer("is_mentioned", { mode: "boolean" }).default(false),
    isTop1: integer("is_top1", { mode: "boolean" }).default(false),
    isTop3: integer("is_top3", { mode: "boolean" }).default(false),
    rank: integer("rank"),
    sentiment: text("sentiment"), // positive/neutral/negative
    keywords: text("keywords"), // JSON array
    screenshotPath: text("screenshot_path"),
    archiveUrl: text("archive_url"),
    isReal: integer("is_real", { mode: "boolean" }).default(false),
    // 追问转化
    followupTriggered: integer("followup_triggered", { mode: "boolean" }).default(false),
    followupQuestion: text("followup_question"),
    followupAnswer: text("followup_answer"),
    isConverted: integer("is_converted", { mode: "boolean" }).default(false),
    conversionStatus: text("conversion_status"), // followup_hit / none
    matchedTargets: text("matched_targets"), // JSON array
    latencyMs: integer("latency_ms"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  },
  (t) => [index("rtr_search_idx").on(t.searchId), index("rtr_platform_idx").on(t.platform)],
);

// ── Token 钱包 + 流水（计费计量） ────────────────────────────────
export const tokenWallets = sqliteTable("token_wallets", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  /** 余额（token 数；演示按 1 元 = 1000 token） */
  balance: integer("balance").notNull().default(1000000),
  totalRecharged: integer("total_recharged").notNull().default(1000000),
  totalConsumed: integer("total_consumed").notNull().default(0),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const tokenLedgers = sqliteTable(
  "token_ledgers",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    /** 正=充值，负=消耗 */
    amount: integer("amount").notNull(),
    balanceAfter: integer("balance_after").notNull(),
    type: text("type", { enum: ["recharge", "consume"] }).notNull(),
    /** 来源功能：realtime/generate/insight/intent/compare... */
    source: text("source"),
    note: text("note"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  },
  (t) => [index("ledger_user_idx").on(t.userId), index("ledger_date_idx").on(t.createdAt)],
);

export type Brand = typeof brands.$inferSelect;
export type BrandConversionProfile = typeof brandConversionProfiles.$inferSelect;
export type Insight = typeof insights.$inferSelect;
export type Intent = typeof intents.$inferSelect;
export type ContentArticle = typeof contentArticles.$inferSelect;
export type RealtimeSearch = typeof realtimeSearches.$inferSelect;
export type RealtimeResult = typeof realtimeResults.$inferSelect;
export type TokenWallet = typeof tokenWallets.$inferSelect;
export type TokenLedger = typeof tokenLedgers.$inferSelect;
