import "server-only";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db, schema } from "./db";
import { ask } from "./ai";
import { findIndustry } from "@/data/industries";
import { retrieve, buildContext } from "./rag";

/**
 * GEO 友好文章批量生成。
 *
 * 设计原则（参考 2026 GEO 最佳实践）：
 * 1. 首段 40-60 字「直接答案」（answer-first），AI 摘要必抓
 * 2. 每 150-200 字嵌入一个具体事实 / 数字 / 来源
 * 3. 文章结构：H2/H3 小标题、问答式、列点、对比表
 * 4. 长尾关键词 1500-2500 字（不堆词，但保持事实密度）
 * 5. 自带 schema.org：Article + Person(作者) + BreadcrumbList + FAQPage
 * 6. 自动按 pillar/cluster 分类
 */

function slugify(s: string): string {
  // 中文：保留汉字 + 数字 + 字母，空格转 -
  const cleaned = s
    .toLowerCase()
    .trim()
    .replace(/[\s/]+/g, "-")
    .replace(/[^\w一-鿿-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  // 加 6 位随机后缀避免碰撞
  return `${cleaned.slice(0, 50)}-${Math.random().toString(36).slice(2, 8)}`;
}

function countWords(s: string): number {
  // 粗略：中文按字 + 英文按词
  const cnChars = (s.match(/[一-鿿]/g) ?? []).length;
  const enWords = (s.replace(/[一-鿿]/g, " ").trim().split(/\s+/).filter(Boolean)).length;
  return cnChars + enWords;
}

function readMinutes(words: number): number {
  return Math.max(1, Math.round(words / 300));
}

function extractJsonLd(text: string): { content: string; jsonLd: string | null } {
  const m = text.match(/```json-ld\s*([\s\S]+?)```/);
  if (!m) return { content: text, jsonLd: null };
  return { content: text.replace(m[0], "").trim(), jsonLd: m[1].trim() };
}

const BASE_SYSTEM = `你是 GEO 内容工厂的资深主笔。你的任务是产出最容易被大模型（DeepSeek/通义/豆包/Kimi/智谱/文心/腾讯元宝/Claude/ChatGPT/Gemini/Perplexity）引用的中文行业文章。

GEO 写作铁律（必须全部遵守）：
1. 首段 40-60 字必须是「直接答案」(answer-first)。不准先讲背景、不准用"近年来"、"随着 XX 发展"开头。AI 摘要 60% 概率只取首段。
2. 事实密度：每 150-200 字必须嵌入一个具体事实（数字 / 价格区间 / 流程节点 / 案例 / 时间）。模糊词扣分。
3. 结构化：用 H2/H3 小标题切分。每个段落都能被独立引用，不要用「如前所述」「综上」这类指代。
4. 问答化：把核心 ROIQ（用户真实会问的问题）改成 H2 小标题。
5. 列点优先：能列点不写段落，AI 抽取更快。
6. 对比表：涉及对比的场景必须用 markdown 表格。
7. 不准虚构事实。如果不确定数字，写区间 / 行业平均，不准编造。
8. 字数控制：1500–2500 字。
9. 美妆个护 / 金融 / 医美 / 律师等敏感行业，禁用「最」「第一」「100%」「速效」「根治」「无效退款」「保证胜诉」等绝对化用语；美妆不得宣称医疗功效。

输出格式：纯 markdown，不要加 \`\`\` 包裹。最后追加一个 \`\`\`json-ld\`\`\` 代码块，内含完整的 schema.org Article JSON-LD。`;

export interface GenInput {
  userId: string;
  industry: string;
  keyword: string;
  authorName: string;
  authorBio?: string;
  authorTitle?: string;
  /** pillar slug：把文章挂到哪个支柱主题下 */
  pillarSlug?: string;
  /** 是否立即发布（默认 true） */
  autoPublish?: boolean;
  /** 行业上下文（可选，extra prompt context） */
  extraContext?: string;
}

export interface GenOutput {
  postId: string;
  slug: string;
  title: string;
  wordCount: number;
  status: "draft" | "published";
}

/** 生成单篇行业博客文章并入库 */
export async function generateBlogPost(input: GenInput): Promise<GenOutput> {
  const industry = findIndustry(input.industry);
  const pillarMeta = industry?.pillars.find((p) => p.slug === input.pillarSlug);

  // 用知识库 RAG 检索相关片段（如果该用户有上传过文档）
  let knowledgeCtx = "";
  try {
    const hits = await retrieve({ userId: input.userId, query: input.keyword, topK: 4 });
    knowledgeCtx = buildContext(hits);
  } catch {
    /* ignore */
  }

  const industryHint = industry
    ? `\n行业上下文：${industry.name} —— ${industry.description}`
    : "";
  const pillarHint = pillarMeta ? `\n所属支柱主题：${pillarMeta.name}（${pillarMeta.description}）` : "";
  const authorHint = `\n作者署名：${input.authorName}${input.authorTitle ? `（${input.authorTitle}）` : ""}${
    input.authorBio ? `，简介：${input.authorBio.slice(0, 100)}` : ""
  }`;

  const prompt = `请围绕长尾关键词「${input.keyword}」写一篇 GEO 友好的行业博客文章。
${industryHint}${pillarHint}${authorHint}

请输出：

# {标题：含关键词，30 字以内，吸引点击}

> **40-60 字直接答案**：直答用户搜这个关键词时最关心的核心问题。包含 1 个具体数字或事实。

## {子标题 1：用户真实会问的问题}
{2-4 段，事实密度高。如有对比可用 markdown 表。}

## {子标题 2}
...

## 常见问题（FAQ）
**Q1：xxx？**
{直接答案，2-3 句}

**Q2：xxx？**
{...}

（输出 5-7 组 FAQ）

## 总结 / 行动建议
{3-5 个 bullet points}

---

> 本文作者：**${input.authorName}**${input.authorTitle ? ` · ${input.authorTitle}` : ""}
${input.authorBio ? `> ${input.authorBio}` : ""}

最后追加 schema.org JSON-LD（必须含 Article + Person 作者 + FAQPage 三类）：

\`\`\`json-ld
{
  "@context": "https://schema.org",
  "@graph": [
    {"@type": "Article", "headline": "...", "author": {"@type": "Person", "name": "${input.authorName}"}, "datePublished": "...", "wordCount": ...},
    {"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "...", "acceptedAnswer": {"@type": "Answer", "text": "..."}}]}
  ]
}
\`\`\`

${input.extraContext ? "\n附加上下文：" + input.extraContext : ""}`;

  const r = await ask({
    system: BASE_SYSTEM + (knowledgeCtx ? "\n\n" + knowledgeCtx : ""),
    prompt,
    temperature: 0.7,
  });

  const { content, jsonLd } = extractJsonLd(r.text);

  // 从首个 H1 提取 title；如果没有 H1 就用 keyword 作为 fallback
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = (titleMatch?.[1] ?? input.keyword).trim().slice(0, 100);

  // 摘要：取 blockquote 第一段（直接答案）
  const excerptMatch = content.match(/^>\s+(.+?)(?:\n|$)/m);
  const excerpt = (excerptMatch?.[1] ?? content.replace(/^#.*$/m, "").trim().slice(0, 180))
    .replace(/[*_`]/g, "")
    .slice(0, 200);

  const words = countWords(content);
  const slug = slugify(input.keyword);
  const postId = randomUUID();

  await db.insert(schema.blogPosts).values({
    id: postId,
    userId: input.userId,
    authorId: null, // 调用方填
    industry: input.industry,
    slug,
    title,
    excerpt,
    body: content,
    schemaJson: jsonLd,
    postType: "cluster",
    pillarSlug: input.pillarSlug,
    keywords: JSON.stringify([input.keyword]),
    tags: JSON.stringify([industry?.name ?? input.industry, pillarMeta?.name ?? ""].filter(Boolean)),
    wordCount: words,
    readMinutes: readMinutes(words),
    status: input.autoPublish !== false ? "published" : "draft",
    publishedAt: input.autoPublish !== false ? new Date() : null,
    model: "mimo-v2.5-pro",
  });

  return {
    postId,
    slug,
    title,
    wordCount: words,
    status: input.autoPublish !== false ? "published" : "draft",
  };
}

/** 批量串行生成。每篇生成完即落库，前端可轮询进度。 */
export async function runBulkJob(jobId: string) {
  const jobs = await db.select().from(schema.bulkJobs).where(eq(schema.bulkJobs.id, jobId)).limit(1);
  const job = jobs[0];
  if (!job || job.status !== "queued") return;

  await db
    .update(schema.bulkJobs)
    .set({ status: "running", startedAt: new Date() })
    .where(eq(schema.bulkJobs.id, jobId));

  // 拉作者信息
  let authorName = "BrandGEO 编辑部";
  let authorBio: string | undefined;
  let authorTitle: string | undefined;
  let authorId: string | null = null;
  if (job.authorId) {
    const authors = await db.select().from(schema.authors).where(eq(schema.authors.id, job.authorId)).limit(1);
    if (authors[0]) {
      authorName = authors[0].name;
      authorBio = authors[0].bio ?? undefined;
      authorTitle = authors[0].title ?? undefined;
      authorId = authors[0].id;
    }
  }

  const keywords = JSON.parse(job.keywords) as string[];
  let completed = 0;
  let failed = 0;

  for (let i = 0; i < keywords.length; i++) {
    for (let j = 0; j < job.perKeyword; j++) {
      const kw = keywords[i];
      try {
        const out = await generateBlogPost({
          userId: job.userId,
          industry: job.industry,
          keyword: kw,
          authorName,
          authorBio,
          authorTitle,
          autoPublish: job.autoPublish,
        });
        // 把 author 关联挂上去
        if (authorId) {
          await db.update(schema.blogPosts).set({ authorId }).where(eq(schema.blogPosts.id, out.postId));
        }
        completed++;
      } catch (e) {
        console.error("[bulk] generate failed for", kw, e);
        failed++;
      }
      await db
        .update(schema.bulkJobs)
        .set({ completedCount: completed, failedCount: failed })
        .where(eq(schema.bulkJobs.id, jobId));
    }
  }

  await db
    .update(schema.bulkJobs)
    .set({ status: "done", finishedAt: new Date(), completedCount: completed, failedCount: failed })
    .where(eq(schema.bulkJobs.id, jobId));
}
