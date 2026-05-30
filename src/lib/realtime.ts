import "server-only";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db, schema } from "./db";
import { getAnswerCrawler } from "./providers";
import { getConversionProfile } from "./brand";
import { ask } from "./ai";
import { estimateRank, quickSentiment, extractKeywords, matchConversion } from "./geo-analyze";
import { consumeTokens } from "./tokens";

const DETECT_PROMPT = (q: string, target: string) =>
  `请像被用户咨询时一样真实回答下面的问题，自然地推荐相关品牌/机构/人，可引用 1-3 个权威来源。\n\n问题：${q}`;

/**
 * 跑一次实时查询：N 平台 → 提及/Top1/3 → 情感 → 关键词 → 追问转化命中。
 * 落库 realtime_searches + realtime_results。
 */
export async function runRealtimeSearch(opts: {
  userId: string;
  brandId?: string | null;
  question: string;
  targetWord: string;
  platforms: string[];
  followupTriggerWord?: string;
}) {
  const searchId = randomUUID();
  await db.insert(schema.realtimeSearches).values({
    id: searchId,
    userId: opts.userId,
    brandId: opts.brandId ?? null,
    question: opts.question,
    targetWord: opts.targetWord,
    platforms: JSON.stringify(opts.platforms),
    followupTriggerWord: opts.followupTriggerWord ?? opts.targetWord,
    status: "running",
  });

  // 转化目标（电话/微信等）
  let conversionTargets: string[] = [];
  let followupQuestion = "联系方式是什么？";
  if (opts.brandId) {
    const profile = await getConversionProfile(opts.brandId);
    if (profile) {
      try {
        conversionTargets = JSON.parse(profile.conversionTargets ?? "[]");
      } catch {}
      if (profile.phone) conversionTargets.push(profile.phone);
      if (profile.wechat) conversionTargets.push(profile.wechat);
      if (profile.followupQuestion) followupQuestion = profile.followupQuestion;
      conversionTargets = Array.from(new Set(conversionTargets.filter(Boolean)));
    }
  }

  const crawler = getAnswerCrawler();
  let totalTokens = 0;

  const results = await Promise.all(
    opts.platforms.map(async (platform) => {
      const t0 = Date.now();
      try {
        // 1. 主问
        const r = await crawler.crawlAnswer({
          platform,
          question: DETECT_PROMPT(opts.question, opts.targetWord),
          captureScreenshot: true,
        });
        const answer = r.answer;
        const mentioned = answer.includes(opts.targetWord);
        const rank = mentioned ? estimateRank(answer, opts.targetWord) : null;
        const isTop1 = rank === 1;
        const isTop3 = rank != null && rank <= 3;
        const sentiment = mentioned ? quickSentiment(answer, opts.targetWord) : "neutral";
        const keywords = mentioned ? await extractKeywords(answer) : [];
        totalTokens += Math.ceil(answer.length / 2);

        // 2. 追问转化（仅当提及 + 配了转化目标）
        let followupTriggered = false;
        let followupAnswer: string | undefined;
        let isConverted = false;
        let matched: string[] = [];
        if (mentioned && conversionTargets.length > 0) {
          followupTriggered = true;
          const fq = `${opts.targetWord}的${followupQuestion}`;
          const fr = await crawler.crawlAnswer({ platform, question: fq, captureScreenshot: false });
          followupAnswer = fr.answer;
          const mc = matchConversion(fr.answer, conversionTargets);
          isConverted = mc.hit;
          matched = mc.matched;
          totalTokens += Math.ceil(fr.answer.length / 2);
        }

        const resultId = randomUUID();
        await db.insert(schema.realtimeResults).values({
          id: resultId,
          searchId,
          platform,
          answer: answer.slice(0, 8000),
          isMentioned: mentioned,
          isTop1,
          isTop3,
          rank,
          sentiment,
          keywords: JSON.stringify(keywords),
          screenshotPath: r.screenshotPath,
          archiveUrl: r.archiveUrl,
          isReal: r.isReal,
          followupTriggered,
          followupQuestion: followupTriggered ? `${opts.targetWord}的${followupQuestion}` : null,
          followupAnswer: followupAnswer?.slice(0, 4000),
          isConverted,
          conversionStatus: isConverted ? "followup_hit" : followupTriggered ? "none" : null,
          matchedTargets: JSON.stringify(matched),
          latencyMs: Date.now() - t0,
        });

        // 同时写一条 ai_queries 给监测聚合用
        try {
          await db.insert(schema.aiQueries).values({
            id: randomUUID(),
            userId: opts.userId,
            projectId: null,
            brand: opts.targetWord,
            question: opts.question,
            platform,
            model: r.isReal ? `real:${platform}` : "mimo-v2.5-pro",
            prompt: opts.question,
            response: answer.slice(0, 4000),
            cited: mentioned,
            rank,
            latencyMs: Date.now() - t0,
            source: "realtime",
          });
        } catch {}

        return { platform, mentioned, isTop1, isTop3, sentiment, isConverted };
      } catch (e) {
        return { platform, mentioned: false, isTop1: false, isTop3: false, sentiment: "neutral", isConverted: false, error: String(e) };
      }
    }),
  );

  // 聚合
  const summary = {
    total: results.length,
    mentioned: results.filter((r) => r.mentioned).length,
    top1: results.filter((r) => r.isTop1).length,
    top3: results.filter((r) => r.isTop3).length,
    converted: results.filter((r) => r.isConverted).length,
  };
  await db
    .update(schema.realtimeSearches)
    .set({ status: "done", summary: JSON.stringify(summary) })
    .where(eq(schema.realtimeSearches.id, searchId));

  // token 计费
  try {
    await consumeTokens(opts.userId, totalTokens, "realtime", `实时查询 ${opts.platforms.length} 平台`);
  } catch {}

  return { searchId, summary, results };
}
