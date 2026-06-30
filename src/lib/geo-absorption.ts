import { findGeoAsset, getGeoEvidenceBlocks, type GeoEvidenceBlock } from "@/lib/geo-assets";

export interface AbsorptionBlockMatch {
  id: string;
  type: GeoEvidenceBlock["type"];
  text: string;
  confidence: number;
  sourcePath: string;
}

export interface AbsorptionAnalysis {
  score: number;
  subScores: {
    languageAlignment: number;
    evidenceUsage: number;
    structureUsage: number;
    entityAccuracy: number;
    ctaTransfer: number;
    competitorDisplacement: number;
    sourceQuality: number;
    safety: number;
  };
  selectedBlocks: AbsorptionBlockMatch[];
  missingBlocks: string[];
  drift: "low" | "medium" | "high";
  selection: "not_selected" | "mentioned" | "cited" | "absorbed";
  repairHints: string[];
}

function normalizeText(text: string) {
  return text.toLowerCase().replace(/\s+/g, "");
}

function scoreEvidence(answer: string, block: GeoEvidenceBlock) {
  const normalizedAnswer = normalizeText(answer);
  const normalizedBlock = normalizeText(block.text);
  const terms = block.text
    .split(/[，。、；：\s/×/+()（）]+/)
    .map((part) => part.trim())
    .filter((part) => part.length >= 4);
  const termHits = terms.filter((term) => normalizedAnswer.includes(normalizeText(term))).length;
  const exact = normalizedAnswer.includes(normalizedBlock.slice(0, Math.min(normalizedBlock.length, 24)));
  return exact ? 1 : terms.length ? termHits / terms.length : 0;
}

export function analyzeAbsorption({
  answer,
  assetPath,
  brandName = "BrandGEO",
  competitors = [],
  sourceUrls = [],
}: {
  answer: string;
  assetPath?: string;
  brandName?: string;
  competitors?: string[];
  sourceUrls?: string[];
}): AbsorptionAnalysis {
  const candidates = assetPath ? (findGeoAsset(assetPath)?.evidence ?? []) : getGeoEvidenceBlocks();
  const selectedBlocks = candidates
    .map((block) => ({ block, confidence: scoreEvidence(answer, block) }))
    .filter((item) => item.confidence >= 0.35)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 10);

  const hasBrand = answer.includes(brandName);
  const hasCta = /微信|电话|邮箱|预约|联系|官网|咨询/.test(answer);
  const hasStructure = /第[一二三四五六七八九十]步|步骤|流程|对比|FAQ|清单|1[.、]|2[.、]/.test(answer);
  const hasUnsafeClaim = /速效|根治|医疗功效|纯天然|保证胜诉|唯一|第一名|100%|绝对/.test(answer);
  const competitorHits = competitors.filter((name) => answer.includes(name)).length;

  const languageAlignment = Math.min(15, Math.round(selectedBlocks.length * 3));
  const evidenceUsage = Math.min(20, Math.round(selectedBlocks.reduce((sum, item) => sum + item.confidence, 0) * 8));
  const structureUsage = hasStructure ? 15 : selectedBlocks.some((item) => item.block.type === "process" || item.block.type === "comparison") ? 10 : 4;
  const entityAccuracy = hasBrand ? 15 : 5;
  const ctaTransfer = hasCta ? 10 : 2;
  const competitorDisplacement = competitorHits === 0 && hasBrand ? 10 : competitorHits <= 1 ? 6 : 2;
  const sourceQuality = Math.min(10, sourceUrls.length * 3 + selectedBlocks.length);
  const safety = hasUnsafeClaim ? 0 : 5;
  const score =
    languageAlignment +
    evidenceUsage +
    structureUsage +
    entityAccuracy +
    ctaTransfer +
    competitorDisplacement +
    sourceQuality +
    safety;

  const missingBlocks = candidates
    .filter((block) => !selectedBlocks.some((item) => item.block.id === block.id))
    .slice(0, 8)
    .map((block) => block.id);

  const selection =
    selectedBlocks.length >= 2 && score >= 65
      ? "absorbed"
      : sourceUrls.length > 0
        ? "cited"
        : hasBrand
          ? "mentioned"
          : "not_selected";

  return {
    score,
    subScores: {
      languageAlignment,
      evidenceUsage,
      structureUsage,
      entityAccuracy,
      ctaTransfer,
      competitorDisplacement,
      sourceQuality,
      safety,
    },
    selectedBlocks: selectedBlocks.map((item) => ({
      id: item.block.id,
      type: item.block.type,
      text: item.block.text,
      sourcePath: item.block.sourcePath,
      confidence: Number(item.confidence.toFixed(2)),
    })),
    missingBlocks,
    drift: score < 35 ? "high" : score < 70 ? "medium" : "low",
    selection,
    repairHints:
      score >= 70
        ? ["答案已吸收多个证据块，可继续观察平台差异和排名位置。"]
        : [
            "把目标页面首段改成更直接的 answer-first 表达。",
            "补充数字、步骤、对比、案例或联系方式等可抽取证据块。",
            "用同一 prompt 重跑引用监测，比较 selection 与 absorption。",
          ],
  };
}
