import "server-only";
import { randomUUID } from "node:crypto";
import { and, eq, inArray } from "drizzle-orm";
import { db, schema } from "./db";

/**
 * 轻量级 RAG：
 * - 分块：按字符长度（中文 800 字 / chunk，重叠 100 字）
 * - 索引：每个 chunk 提取关键词 + 字符 trigram 集合，存为 JSON
 * - 检索：query 提取关键词 → 与 chunks 计算 Jaccard + 长度倒数加权
 * 这种方式不需要外部 embedding API，纯 SQLite 即可工作。
 */

const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 100;
const STOPWORDS = new Set([
  "的", "了", "和", "是", "在", "我", "有", "也", "就", "不", "人", "都", "一", "一个", "上", "也", "很",
  "到", "说", "要", "去", "你", "会", "着", "没有", "看", "好", "自己", "这", "那", "对", "可以", "但是",
  "这个", "我们", "因为", "所以", "或者", "如果", "什么", "如何", "为什么", "怎么", "哪些", "哪个", "可能",
  "the", "a", "an", "is", "are", "was", "were", "and", "or", "but", "of", "for", "to", "in", "on",
  "at", "by", "with", "as", "be", "this", "that", "it", "from", "have", "has", "had",
]);

function chunkText(text: string): string[] {
  const cleaned = text.replace(/\r\n/g, "\n").trim();
  if (cleaned.length <= CHUNK_SIZE) return [cleaned];
  const chunks: string[] = [];
  let i = 0;
  while (i < cleaned.length) {
    let end = Math.min(i + CHUNK_SIZE, cleaned.length);
    // 优先在段落 / 句子边界切
    if (end < cleaned.length) {
      const slice = cleaned.slice(i, end + 50);
      const lastBreak = Math.max(
        slice.lastIndexOf("\n"),
        slice.lastIndexOf("。"),
        slice.lastIndexOf("！"),
        slice.lastIndexOf("？"),
        slice.lastIndexOf("."),
      );
      if (lastBreak > CHUNK_SIZE / 2) end = i + lastBreak + 1;
    }
    chunks.push(cleaned.slice(i, end).trim());
    i = end - CHUNK_OVERLAP;
    if (i <= 0) i = end;
  }
  return chunks.filter((c) => c.length > 30);
}

/** 抽取关键词 + trigram（用 JSON 存储） */
function indexKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  const tokens = new Set<string>();

  // 中文 / 英文混合分词：先按非字母数字汉字切
  const words = lower.split(/[^a-z0-9一-鿿]+/).filter(Boolean);
  for (const w of words) {
    if (w.length < 2 || STOPWORDS.has(w)) continue;
    tokens.add(w);
  }

  // 中文字符 bigram + trigram
  const chinese = lower.replace(/[^一-鿿]+/g, " ");
  for (let i = 0; i < chinese.length - 1; i++) {
    const c1 = chinese[i];
    const c2 = chinese[i + 1];
    if (c1 !== " " && c2 !== " ") tokens.add(c1 + c2);
    if (i < chinese.length - 2) {
      const c3 = chinese[i + 2];
      if (c1 !== " " && c2 !== " " && c3 !== " ") tokens.add(c1 + c2 + c3);
    }
  }

  return Array.from(tokens).slice(0, 200);
}

export interface IngestInput {
  userId: string;
  projectId?: string;
  title: string;
  sourceUrl?: string;
  sourceType?: "upload" | "url" | "manual";
  text: string;
}

export async function ingestDocument(input: IngestInput) {
  const docId = randomUUID();
  const chunks = chunkText(input.text);
  await db.insert(schema.knowledgeDocs).values({
    id: docId,
    userId: input.userId,
    projectId: input.projectId ?? null,
    title: input.title,
    sourceUrl: input.sourceUrl,
    sourceType: input.sourceType ?? "manual",
    sizeBytes: input.text.length,
    chunkCount: chunks.length,
  });

  await db.insert(schema.knowledgeChunks).values(
    chunks.map((text, i) => ({
      id: randomUUID(),
      docId,
      userId: input.userId,
      chunkIdx: i,
      text,
      tokens: text.length,
      keywords: JSON.stringify(indexKeywords(text)),
    })),
  );

  return { docId, chunkCount: chunks.length };
}

export interface RagHit {
  docId: string;
  chunkId: string;
  chunkIdx: number;
  text: string;
  score: number;
  docTitle?: string;
}

/**
 * 检索：基于关键词 Jaccard 相似度。
 * 限定 userId 范围内的所有 chunks。
 */
export async function retrieve(opts: {
  userId: string;
  query: string;
  topK?: number;
  projectId?: string;
}): Promise<RagHit[]> {
  const queryTokens = new Set(indexKeywords(opts.query));
  if (queryTokens.size === 0) return [];

  // 拉用户所有 chunks（量大时可分页 + 预筛）
  const where = opts.projectId
    ? and(eq(schema.knowledgeChunks.userId, opts.userId))
    : eq(schema.knowledgeChunks.userId, opts.userId);
  const chunks = await db
    .select({
      id: schema.knowledgeChunks.id,
      docId: schema.knowledgeChunks.docId,
      chunkIdx: schema.knowledgeChunks.chunkIdx,
      text: schema.knowledgeChunks.text,
      keywords: schema.knowledgeChunks.keywords,
    })
    .from(schema.knowledgeChunks)
    .where(where)
    .limit(5000);

  // 拉对应 doc 标题
  const docIds = Array.from(new Set(chunks.map((c) => c.docId)));
  const docs =
    docIds.length > 0
      ? await db
          .select({ id: schema.knowledgeDocs.id, title: schema.knowledgeDocs.title, projectId: schema.knowledgeDocs.projectId })
          .from(schema.knowledgeDocs)
          .where(inArray(schema.knowledgeDocs.id, docIds))
      : [];
  const docMap = new Map(docs.map((d) => [d.id, d]));

  const scored: RagHit[] = [];
  for (const c of chunks) {
    const doc = docMap.get(c.docId);
    if (opts.projectId && doc?.projectId !== opts.projectId) continue;
    let tokens: Set<string>;
    try {
      tokens = new Set(JSON.parse(c.keywords ?? "[]") as string[]);
    } catch {
      tokens = new Set();
    }
    let overlap = 0;
    for (const q of queryTokens) if (tokens.has(q)) overlap++;
    if (overlap === 0) continue;
    const union = queryTokens.size + tokens.size - overlap;
    const jaccard = overlap / union;
    scored.push({
      docId: c.docId,
      chunkId: c.id,
      chunkIdx: c.chunkIdx,
      text: c.text,
      score: jaccard,
      docTitle: doc?.title,
    });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, opts.topK ?? 5);
}

/** 把检索结果拼成 system context */
export function buildContext(hits: RagHit[]): string {
  if (hits.length === 0) return "";
  const blocks = hits.map(
    (h, i) =>
      `[${i + 1}] 来源：${h.docTitle ?? "知识库"} (片段 ${h.chunkIdx + 1})\n${h.text}`,
  );
  return `## 品牌知识库参考（请在回答中以事实引用，不要泛泛而谈）\n\n${blocks.join("\n\n---\n\n")}`;
}
