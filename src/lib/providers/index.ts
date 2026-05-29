import "server-only";
import { llmStatus } from "./llm";
import { scraperStatus, getScraper } from "./scraper";
import { answerCrawlerStatus, getAnswerCrawler } from "./answer-crawler";
import { knowledgeStatus, getKnowledgeProvider } from "./knowledge";
import { postizStatus } from "./publisher";

export { getScraper } from "./scraper";
export { getAnswerCrawler } from "./answer-crawler";
export { getKnowledgeProvider, buildKnowledgeContext } from "./knowledge";
export { modelForPlatform, llmStatus } from "./llm";

/** 汇总所有能力当前用的 provider（给 dashboard / admin 看健康度） */
export function providersOverview() {
  return {
    llm: llmStatus(),
    scraper: scraperStatus(),
    answerCrawler: answerCrawlerStatus(),
    knowledge: knowledgeStatus(),
    publisher: postizStatus(),
  };
}

// 触发实例化（确保单例就绪）
void getScraper;
void getAnswerCrawler;
void getKnowledgeProvider;
