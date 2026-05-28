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
    keywordId: text("keyword_id")
      .notNull()
      .references(() => keywords.id, { onDelete: "cascade" }),
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
    queriedAt: integer("queried_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [
    index("queries_keyword_idx").on(t.keywordId),
    index("queries_platform_idx").on(t.platform),
    index("queries_date_idx").on(t.queriedAt),
  ],
);

// ── 内容草稿 ─────────────────────────────────────────────────────────────
export const contentDrafts = sqliteTable(
  "content_drafts",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
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
  (t) => [index("drafts_project_idx").on(t.projectId)],
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
