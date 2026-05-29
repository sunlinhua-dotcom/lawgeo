import "server-only";
import type { KnowledgeProvider, RagHit } from "./types";
import { retrieve as builtinRetrieve, buildContext } from "../rag";

/**
 * 知识库 RAG provider。
 *   - ragflow：自托管 RAGFlow（github.com/infiniflow/ragflow），深度文档理解 + 引用接地
 *   - builtin：内置 SQLite 关键词 + 中文 bi/tri-gram Jaccard 检索（当前默认）
 *
 * 配 RAGFLOW_API_URL + RAGFLOW_DATASET_ID 后自动切到 RAGFlow。
 */

const RF_URL = process.env.RAGFLOW_API_URL?.trim().replace(/\/+$/, "");
const RF_KEY = process.env.RAGFLOW_API_KEY?.trim();
const RF_DATASET = process.env.RAGFLOW_DATASET_ID?.trim();

const ragflowProvider: KnowledgeProvider = {
  id: "ragflow",
  async retrieve(opts) {
    try {
      const res = await fetch(`${RF_URL}/api/v1/retrieval`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(RF_KEY ? { authorization: `Bearer ${RF_KEY}` } : {}),
        },
        body: JSON.stringify({
          question: opts.query,
          dataset_ids: RF_DATASET ? [RF_DATASET] : [],
          top_k: opts.topK ?? 5,
          similarity_threshold: 0.2,
        }),
        signal: AbortSignal.timeout(20000),
      });
      if (!res.ok) throw new Error(`ragflow HTTP ${res.status}`);
      const json = (await res.json()) as {
        data?: { chunks?: Array<{ content?: string; similarity?: number; document_keyword?: string }> };
      };
      const chunks = json.data?.chunks ?? [];
      return chunks.map<RagHit>((c) => ({
        text: c.content ?? "",
        score: c.similarity ?? 0,
        docTitle: c.document_keyword,
        source: "ragflow",
      }));
    } catch (e) {
      console.warn("[knowledge] ragflow failed, fallback to builtin:", e);
      return builtinProvider.retrieve(opts);
    }
  },
};

const builtinProvider: KnowledgeProvider = {
  id: "builtin",
  async retrieve(opts) {
    const hits = await builtinRetrieve({
      userId: opts.userId,
      query: opts.query,
      topK: opts.topK ?? 5,
      projectId: opts.projectId,
    });
    return hits.map<RagHit>((h) => ({
      text: h.text,
      score: h.score,
      docTitle: h.docTitle,
      source: "builtin",
    }));
  },
};

export function getKnowledgeProvider(): KnowledgeProvider {
  return RF_URL ? ragflowProvider : builtinProvider;
}

/** 统一拼上下文（复用 rag.buildContext） */
export function buildKnowledgeContext(hits: RagHit[]): string {
  return buildContext(
    hits.map((h) => ({ docId: "", chunkId: "", chunkIdx: 0, text: h.text, score: h.score, docTitle: h.docTitle })),
  );
}

export function knowledgeStatus() {
  return { provider: RF_URL ? "ragflow" : "builtin", ragflowEnabled: !!RF_URL };
}
