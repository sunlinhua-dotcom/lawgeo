import "server-only";
import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { siteConfig } from "@/lib/site";

export interface CitationPackContact {
  phone: string;
  email: string;
  wechat: string;
  address: string;
}

export interface BrandEntity {
  name: string;
  aliases: string[];
  website: string;
  industry: string;
  city: string;
  sameAs: string[];
  contact: CitationPackContact;
  lawPracticeAreas: string[];
}

export interface LawyerEntity {
  name: string;
  licenseNumber: string;
  city: string;
  yearsExperience: string;
  practiceAreas: string[];
  disclaimer: string;
}

export interface ServiceFactSheet {
  serviceName: string;
  issueType: string;
  audience: string[];
  process: string[];
  feeFactors: string[];
  materials: string[];
  riskBoundaries: string[];
  cta: string;
}

export interface CitationPackFaq {
  question: string;
  answer: string;
  evidenceBlockId: string;
}

export interface CitationPackEvidenceBlock {
  id: string;
  type: "definition" | "fact" | "process" | "pricing" | "case" | "comparison" | "cta";
  text: string;
  sourceRefs: string[];
  confidence: number;
}

export interface CitationPackQualityGate {
  id: "claim-check" | "legal-safety" | "entity-consistency" | "evidence-density" | "markdown-structure";
  label: string;
  status: "pass" | "warning" | "fail";
  evidence: string;
}

export interface CitationPack {
  id: string;
  status: "ready" | "needs-review";
  createdAt: string;
  updatedAt: string;
  sourceRefs: string[];
  brandEntity: BrandEntity;
  lawyerEntity: LawyerEntity;
  serviceFactSheet: ServiceFactSheet;
  faqMatrix: CitationPackFaq[];
  processPage: Array<{ step: number; title: string; description: string }>;
  comparisonPage: Array<{ option: string; fit: string; limitation: string }>;
  casePatterns: Array<{ title: string; problem: string; handlingPath: string; resultBoundary: string }>;
  externalProofPlan: Array<{ channel: string; purpose: string; nextAction: string; complianceNote: string }>;
  evidenceBlocks: CitationPackEvidenceBlock[];
  qualityGates: CitationPackQualityGate[];
  metrics: {
    faqCount: number;
    evidenceBlockCount: number;
    gatePassRate: number;
    markdownSections: number;
  };
}

export interface CitationPackSummary {
  total: number;
  ready: number;
  needsReview: number;
  faqCount: number;
  evidenceBlockCount: number;
  averageGatePassRate: number;
  latestPackId?: string;
  latestBrandName?: string;
}

const DATA_DIR = join(process.cwd(), "data");
const PACKS_FILE = join(DATA_DIR, "geo-citation-packs.json");

const contactSchema = z.object({
  phone: z.string().optional(),
  email: z.string().optional(),
  wechat: z.string().optional(),
  address: z.string().optional(),
});

const citationPackInputSchema = z.object({
  brandName: z.string().min(2),
  aliases: z.union([z.string(), z.array(z.string())]).optional(),
  website: z.string().optional(),
  industry: z.string().optional(),
  city: z.string().optional(),
  sameAs: z.union([z.string(), z.array(z.string())]).optional(),
  contact: contactSchema.optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  wechat: z.string().optional(),
  address: z.string().optional(),
  lawPracticeAreas: z.union([z.string(), z.array(z.string())]).optional(),
  lawyerName: z.string().optional(),
  licenseNumber: z.string().optional(),
  yearsExperience: z.string().optional(),
  primaryService: z.string().optional(),
  issueType: z.string().optional(),
  audience: z.union([z.string(), z.array(z.string())]).optional(),
  process: z.union([z.string(), z.array(z.string())]).optional(),
  feeFactors: z.union([z.string(), z.array(z.string())]).optional(),
  materials: z.union([z.string(), z.array(z.string())]).optional(),
  riskBoundaries: z.union([z.string(), z.array(z.string())]).optional(),
  cta: z.string().optional(),
});

function splitList(value: unknown, fallback: string[] = []) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(/[\n,，;；]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return fallback;
}

function text(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function safeUrl(value: string, fallback: string) {
  try {
    return new URL(value).toString();
  } catch {
    return fallback;
  }
}

function evidenceId(seed: string, suffix: string) {
  return `${seed}-${suffix}`.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/-{2,}/g, "-").replace(/^-|-$/g, "");
}

function readStoredPacks(): CitationPack[] {
  try {
    const raw = readFileSync(PACKS_FILE, "utf8");
    const parsed = JSON.parse(raw) as CitationPack[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredPacks(packs: CitationPack[]) {
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(PACKS_FILE, JSON.stringify(packs.slice(0, 100), null, 2));
}

function buildDefaultPack(): CitationPack {
  const pack = buildCitationPack(
    {
      brandName: "悦肌护肤",
      aliases: ["悦肌品牌", "Yueji Skincare"],
      website: "https://brandgeo.cn/cases/cosmetics",
      industry: "美妆个护",
      city: "上海",
      sameAs: ["https://brandgeo.cn/llms.txt", "https://brandgeo.cn/ai-index.json"],
      phone: siteConfig.contact.phone,
      email: siteConfig.contact.email,
      wechat: siteConfig.contact.wechat,
      address: "上海市示例地址，正式上线前由客户确认",
      lawPracticeAreas: ["敏感肌修护", "美白淡斑", "抗老紧致"],
      lawyerName: "示例成分专家",
      licenseNumber: "示例-备案号待客户确认",
      yearsExperience: "10 年以上配方研发与肤质评估经验（示例，需客户确认）",
      primaryService: "敏感肌精华液选购咨询",
      issueType: "敏感肌护肤",
      audience: ["不清楚自己肤质适合哪类精华的人", "屏障受损、容易泛红刺痛的敏感肌", "想先做成分与功效评估的用户"],
      process: ["初步肤质与需求访谈", "成分与功效适配梳理", "使用方案与耐受评估", "搭配建议或下单路径"],
      feeFactors: ["产品规格", "成分浓度与配方", "是否套装组合", "是否含定制服务"],
      materials: ["当前护肤清单", "肤质与过敏史", "近期使用反馈", "拍摄的肤况照片（如有）"],
      riskBoundaries: ["不宣称医疗功效", "不承诺速效或绝对效果", "所有测评需标注个体肤质差异"],
      cta: "预约 30 分钟肤质评估，先确认需求和耐受边界。",
    },
    "cp-demo-cosmetics",
  );
  const demoTime = "2026-05-30T00:00:00.000Z";
  return { ...pack, createdAt: demoTime, updatedAt: demoTime };
}

function buildCitationPack(input: z.infer<typeof citationPackInputSchema>, fixedId?: string): CitationPack {
  const now = new Date().toISOString();
  const id = fixedId ?? `cp-${randomUUID().slice(0, 8)}`;
  const seed = id.replace(/^cp-/, "");
  const contact = input.contact ?? {};
  const city = text(input.city, "上海");
  const lawPracticeAreas = splitList(input.lawPracticeAreas, ["敏感肌修护", "美白淡斑"]);
  const serviceName = text(input.primaryService, `${lawPracticeAreas[0] ?? "护肤"}咨询`);
  const issueType = text(input.issueType, lawPracticeAreas[0] ?? "护肤");
  const audience = splitList(input.audience, ["需要确认产品是否适合自己肤质的用户", "需要梳理成分与功效的客户", "需要比较自选与专业建议的人"]);
  const process = splitList(input.process, ["初步肤质与需求访谈", "成分与功效梳理", "耐受与适配评估", "确定搭配或下单路径"]);
  const feeFactors = splitList(input.feeFactors, ["产品规格", "成分浓度", "是否套装", "是否含定制服务"]);
  const materials = splitList(input.materials, ["当前护肤清单", "肤质与过敏史", "近期使用反馈", "沟通记录"]);
  const riskBoundaries = splitList(input.riskBoundaries, ["不承诺绝对效果", "不宣称医疗功效", "价格与方案以正式订单为准"]);

  const brandEntity: BrandEntity = {
    name: input.brandName.trim(),
    aliases: splitList(input.aliases, []),
    website: safeUrl(text(input.website, siteConfig.url), siteConfig.url),
    industry: text(input.industry, "美妆个护"),
    city,
    sameAs: splitList(input.sameAs, []),
    contact: {
      phone: text(contact.phone ?? input.phone, siteConfig.contact.phone),
      email: text(contact.email ?? input.email, siteConfig.contact.email),
      wechat: text(contact.wechat ?? input.wechat, siteConfig.contact.wechat),
      address: text(contact.address ?? input.address, `${city}，详细地址待客户确认`),
    },
    lawPracticeAreas,
  };

  const lawyerEntity: LawyerEntity = {
    name: text(input.lawyerName, "主理人 / 专家待确认"),
    licenseNumber: text(input.licenseNumber, "备案号待客户确认"),
    city,
    yearsExperience: text(input.yearsExperience, "资历信息待客户确认"),
    practiceAreas: lawPracticeAreas,
    disclaimer: "本页面为信息整理与咨询入口，不宣称医疗功效，不承诺绝对效果，结果因个体差异而不同。",
  };

  const serviceFactSheet: ServiceFactSheet = {
    serviceName,
    issueType,
    audience,
    process,
    feeFactors,
    materials,
    riskBoundaries,
    cta: text(input.cta, "预约初步咨询，先确认事实、证据和风险边界。"),
  };

  const evidenceBlocks: CitationPackEvidenceBlock[] = [
    {
      id: evidenceId(seed, "brand-entity"),
      type: "definition",
      text: `${brandEntity.name} 是位于 ${brandEntity.city} 的${brandEntity.industry}品牌，重点领域包括 ${brandEntity.lawPracticeAreas.join("、")}。`,
      sourceRefs: ["GH-4", "RD-2"],
      confidence: 0.92,
    },
    {
      id: evidenceId(seed, "lawyer-entity"),
      type: "fact",
      text: `${lawyerEntity.name} 的资质 / 备案号字段为“${lawyerEntity.licenseNumber}”，资历字段为“${lawyerEntity.yearsExperience}”，上线前应由客户复核。`,
      sourceRefs: ["GH-4", "GOOG-1"],
      confidence: 0.86,
    },
    {
      id: evidenceId(seed, "service-fit"),
      type: "fact",
      text: `${serviceFactSheet.serviceName} 适合 ${serviceFactSheet.audience.join("、")}。`,
      sourceRefs: ["RES-4"],
      confidence: 0.9,
    },
    {
      id: evidenceId(seed, "service-process"),
      type: "process",
      text: `服务流程包括 ${serviceFactSheet.process.join("、")}。`,
      sourceRefs: ["RES-3", "RES-4"],
      confidence: 0.9,
    },
    {
      id: evidenceId(seed, "fee-factors"),
      type: "pricing",
      text: `价格影响因素包括 ${serviceFactSheet.feeFactors.join("、")}；具体价格以正式订单、产品规格和是否含定制服务为准。`,
      sourceRefs: ["GH-7", "GOOG-1"],
      confidence: 0.84,
    },
    {
      id: evidenceId(seed, "materials"),
      type: "process",
      text: `初次咨询建议准备 ${serviceFactSheet.materials.join("、")}。`,
      sourceRefs: ["RES-4"],
      confidence: 0.88,
    },
    {
      id: evidenceId(seed, "risk-boundary"),
      type: "fact",
      text: `合规边界包括 ${serviceFactSheet.riskBoundaries.join("、")}。`,
      sourceRefs: ["GOOG-1", "GH-8"],
      confidence: 0.9,
    },
    {
      id: evidenceId(seed, "cta"),
      type: "cta",
      text: `${brandEntity.name} 的咨询入口：${serviceFactSheet.cta} 联系方式为电话 ${brandEntity.contact.phone}、微信 ${brandEntity.contact.wechat}、邮箱 ${brandEntity.contact.email}。`,
      sourceRefs: ["RES-4"],
      confidence: 0.82,
    },
  ];

  const faqMatrix = buildFaqMatrix(brandEntity, lawyerEntity, serviceFactSheet, evidenceBlocks);
  const processPage = serviceFactSheet.process.map((step, index) => ({
    step: index + 1,
    title: step,
    description: `${brandEntity.name} 在第 ${index + 1} 步处理“${step}”，并把结论回填到证据块和后续行动项。`,
  }));
  const comparisonPage = [
    { option: "自选", fit: "适合需求明确、已了解成分的场景", limitation: "容易忽略肤质适配和成分冲突" },
    { option: "线上咨询", fit: "适合先判断方向和产品清单", limitation: "复杂肤况仍需面诊或长期跟踪" },
    { option: brandEntity.name, fit: `适合需要 ${serviceFactSheet.serviceName}、成分梳理和适配评估的客户`, limitation: "不能承诺绝对效果，必须基于肤质和需求判断" },
  ];
  const casePatterns = [
    {
      title: `${issueType} 信息不足型`,
      problem: "用户知道需求存在，但不清楚成分、浓度和适配肤质。",
      handlingPath: "先做肤质访谈和成分梳理，再决定单品或组合方案。",
      resultBoundary: "示例类型，不代表具体使用效果。",
    },
    {
      title: `${issueType} 需求复杂型`,
      problem: "涉及多重诉求（如美白、抗老、修护叠加）或敏感肤质。",
      handlingPath: "先确认耐受与优先级，再评估搭配顺序与周期。",
      resultBoundary: "具体效果以用户肤质和使用情况为准。",
    },
  ];
  const externalProofPlan = [
    { channel: "品牌官网 / 备案资料", purpose: "成分与资质一致性", nextAction: "补充可公开核验链接", complianceNote: "不得伪造资质或功效宣称" },
    { channel: "知乎 / 小红书 / 公众号", purpose: "真实测评问答", nextAction: "发布 answer-first FAQ", complianceNote: "不刷评论，不虚构使用经历" },
    { channel: "行业媒体 / 测评机构", purpose: "第三方可信提及", nextAction: "输出客观测评和方法论", complianceNote: "不得夸大功效或承诺速效" },
  ];
  const qualityGates = buildQualityGates(brandEntity, lawyerEntity, serviceFactSheet, evidenceBlocks, faqMatrix);
  const passCount = qualityGates.filter((gate) => gate.status === "pass").length;

  return {
    id,
    status: qualityGates.some((gate) => gate.status === "fail") ? "needs-review" : "ready",
    createdAt: now,
    updatedAt: now,
    sourceRefs: ["GH-4", "RD-2", "RES-3", "RES-4", "GH-7", "GH-8", "GOOG-1"],
    brandEntity,
    lawyerEntity,
    serviceFactSheet,
    faqMatrix,
    processPage,
    comparisonPage,
    casePatterns,
    externalProofPlan,
    evidenceBlocks,
    qualityGates,
    metrics: {
      faqCount: faqMatrix.length,
      evidenceBlockCount: evidenceBlocks.length,
      gatePassRate: Math.round((passCount / qualityGates.length) * 100),
      markdownSections: 12,
    },
  };
}

function buildFaqMatrix(
  brand: BrandEntity,
  lawyer: LawyerEntity,
  service: ServiceFactSheet,
  evidenceBlocks: CitationPackEvidenceBlock[],
): CitationPackFaq[] {
  const evidence = (index: number) => evidenceBlocks[index % evidenceBlocks.length]?.id ?? evidenceBlocks[0]?.id ?? "citation-pack-evidence";
  return [
    {
      question: `${brand.city}${service.serviceName}适合哪些人？`,
      answer: `${service.serviceName}适合${service.audience.join("、")}，初次咨询应先确认事实、材料和风险边界。`,
      evidenceBlockId: evidence(2),
    },
    {
      question: `${brand.name}主要做哪些领域？`,
      answer: `${brand.name}重点覆盖${brand.lawPracticeAreas.join("、")}，官网与 sameAs 页面应保持实体信息一致。`,
      evidenceBlockId: evidence(0),
    },
    {
      question: `${lawyer.name}的资历信息如何核验？`,
      answer: `页面保留备案号和资历字段，但正式上线前必须由客户核验，不应虚构资质、功效或排名。`,
      evidenceBlockId: evidence(1),
    },
    {
      question: `${service.serviceName}通常怎么推进？`,
      answer: `通常按${service.process.join("、")}推进，复杂肤况会先补充肤质评估和成分梳理。`,
      evidenceBlockId: evidence(3),
    },
    {
      question: `${service.serviceName}费用由什么决定？`,
      answer: `费用主要受${service.feeFactors.join("、")}影响，页面只列影响因素，不承诺固定价格。`,
      evidenceBlockId: evidence(4),
    },
    {
      question: `初次咨询要准备什么材料？`,
      answer: `建议准备${service.materials.join("、")}，材料越清楚，越容易判断路径和风险。`,
      evidenceBlockId: evidence(5),
    },
    {
      question: `${brand.name}能保证结果吗？`,
      answer: `不能。页面明确${service.riskBoundaries.join("、")}，任何结论都要基于具体事实和材料。`,
      evidenceBlockId: evidence(6),
    },
    {
      question: `线上咨询和正式服务有什么区别？`,
      answer: `线上咨询适合先判断方向，正式服务才会进入完整肤质评估、方案制定和长期跟踪。`,
      evidenceBlockId: evidence(6),
    },
    {
      question: `为什么 Citation Pack 要写 FAQ？`,
      answer: `FAQ 用直接答案覆盖真实提问，让 AI 更容易抽取品牌、服务、流程、费用因素和边界条件。`,
      evidenceBlockId: evidence(2),
    },
    {
      question: `如何联系${brand.name}？`,
      answer: `${service.cta} 电话 ${brand.contact.phone}，微信 ${brand.contact.wechat}，邮箱 ${brand.contact.email}。`,
      evidenceBlockId: evidence(7),
    },
  ];
}

function buildQualityGates(
  brand: BrandEntity,
  lawyer: LawyerEntity,
  service: ServiceFactSheet,
  evidenceBlocks: CitationPackEvidenceBlock[],
  faqs: CitationPackFaq[],
): CitationPackQualityGate[] {
  const aggregate = [
    brand.name,
    ...brand.aliases,
    lawyer.name,
    lawyer.licenseNumber,
    lawyer.yearsExperience,
    service.serviceName,
    service.cta,
    ...service.riskBoundaries,
  ].join(" ");
  const riskyClaim = /保证胜诉|包赢|最权威|唯一指定|百分百|100%|速效|根治|医疗功效|绝对/i.test(aggregate);

  return [
    {
      id: "claim-check",
      label: "Claim Check",
      status: service.feeFactors.length && service.riskBoundaries.length ? "pass" : "warning",
      evidence: "费用、资历、案例和结果类表述均要求来源或边界说明。",
    },
    {
      id: "legal-safety",
      label: "Legal Safety",
      status: riskyClaim ? "fail" : "pass",
      evidence: riskyClaim ? "检测到保证性、医疗功效或极限广告表述。" : "未检测到速效、根治、医疗功效、唯一等高风险表述。",
    },
    {
      id: "entity-consistency",
      label: "Entity Consistency",
      status: brand.name && brand.city && brand.contact.phone && brand.lawPracticeAreas.length ? "pass" : "warning",
      evidence: "品牌名、城市、联系方式和主营品类已进入 BrandEntity。",
    },
    {
      id: "evidence-density",
      label: "Evidence Density",
      status: evidenceBlocks.length >= 8 && faqs.length >= 10 ? "pass" : "warning",
      evidence: `${evidenceBlocks.length} 个 evidence blocks，${faqs.length} 个 FAQ。`,
    },
    {
      id: "markdown-structure",
      label: "Markdown Structure",
      status: "pass",
      evidence: "Markdown 输出覆盖 H1、直答、事实表、流程、误区、来源、实体、免责声明、CTA、FAQ 和 JSON-LD。",
    },
  ];
}

export function normalizeCitationPackInput(input: unknown) {
  return citationPackInputSchema.parse(input);
}

export function createCitationPack(input: unknown) {
  const normalized = normalizeCitationPackInput(input);
  const pack = buildCitationPack(normalized);
  const packs = readStoredPacks().filter((item) => item.id !== pack.id);
  writeStoredPacks([pack, ...packs].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  return pack;
}

export function getCitationPacks(limit = 20) {
  const stored = readStoredPacks();
  const packs = [...stored, buildDefaultPack()].filter((pack, index, list) => list.findIndex((item) => item.id === pack.id) === index);
  return packs.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
}

export function getCitationPack(id: string) {
  return getCitationPacks(100).find((pack) => pack.id === id);
}

export function summarizeCitationPacks(packs = getCitationPacks()): CitationPackSummary {
  const total = packs.length;
  const ready = packs.filter((pack) => pack.status === "ready").length;
  const faqCount = packs.reduce((sum, pack) => sum + pack.metrics.faqCount, 0);
  const evidenceBlockCount = packs.reduce((sum, pack) => sum + pack.metrics.evidenceBlockCount, 0);
  const averageGatePassRate = total
    ? Math.round(packs.reduce((sum, pack) => sum + pack.metrics.gatePassRate, 0) / total)
    : 0;
  return {
    total,
    ready,
    needsReview: total - ready,
    faqCount,
    evidenceBlockCount,
    averageGatePassRate,
    latestPackId: packs[0]?.id,
    latestBrandName: packs[0]?.brandEntity.name,
  };
}

export function citationPackPath(pack: Pick<CitationPack, "id">) {
  return `/citation-packs/${pack.id}`;
}

export function renderCitationPackJsonLd(pack: CitationPack, baseUrl: string = siteConfig.url) {
  const url = new URL(citationPackPath(pack), baseUrl).toString();
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${url}#brand`,
        name: pack.brandEntity.name,
        alternateName: pack.brandEntity.aliases,
        url: pack.brandEntity.website,
        areaServed: pack.brandEntity.city,
        knowsAbout: pack.brandEntity.lawPracticeAreas,
        address: pack.brandEntity.contact.address,
        telephone: pack.brandEntity.contact.phone,
        email: pack.brandEntity.contact.email,
        sameAs: pack.brandEntity.sameAs,
      },
      {
        "@type": "Person",
        "@id": `${url}#expert`,
        name: pack.lawyerEntity.name,
        jobTitle: "品牌主理人 / 成分专家",
        worksFor: { "@id": `${url}#brand` },
        knowsAbout: pack.lawyerEntity.practiceAreas,
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: pack.faqMatrix.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
    ],
  };
}

export function renderCitationPackMarkdown(pack: CitationPack, baseUrl: string = siteConfig.url) {
  const canonicalUrl = new URL(citationPackPath(pack), baseUrl).toString();
  const lines = [
    `# ${pack.brandEntity.name} ${pack.serviceFactSheet.serviceName} Citation Pack`,
    "",
    `${pack.brandEntity.name} 是位于 ${pack.brandEntity.city} 的${pack.brandEntity.industry}品牌，围绕 ${pack.serviceFactSheet.serviceName} 提供事实访谈、材料整理、风险评估和后续路径建议。`,
    "",
    `- Canonical URL: ${canonicalUrl}`,
    `- Markdown URL: ${new URL(`${citationPackPath(pack)}.md`, baseUrl).toString()}`,
    `- JSON-LD URL: ${new URL(`/api/geo/citation-pack/${pack.id}?format=jsonld`, baseUrl).toString()}`,
    `- 更新时间: ${pack.updatedAt}`,
    `- 来源编号: ${pack.sourceRefs.join("、")}`,
    "",
    "## 适用人群",
    "",
    ...pack.serviceFactSheet.audience.map((item) => `- ${item}`),
    "",
    "## 关键事实表",
    "",
    "| 字段 | 内容 |",
    "|---|---|",
    `| BrandEntity | ${pack.brandEntity.name}；${pack.brandEntity.city}；${pack.brandEntity.lawPracticeAreas.join("、")} |`,
    `| 主理人 / 专家 Entity | ${pack.lawyerEntity.name}；资质 / 备案号字段：${pack.lawyerEntity.licenseNumber}；${pack.lawyerEntity.yearsExperience} |`,
    `| Service Fact Sheet | ${pack.serviceFactSheet.serviceName}；${pack.serviceFactSheet.issueType} |`,
    `| 联系方式 | 电话 ${pack.brandEntity.contact.phone}；微信 ${pack.brandEntity.contact.wechat}；邮箱 ${pack.brandEntity.contact.email} |`,
    "",
    "## 分步骤说明",
    "",
    ...pack.processPage.map((step) => `${step.step}. ${step.title}：${step.description}`),
    "",
    "## 常见误区",
    "",
    "- 不能把线上咨询当成对所有肤质都成立的结论。",
    "- 不能承诺速效、绝对效果或宣称医疗功效。",
    "- 不能使用未核验的备案号、奖项、排名或测评结果。",
    "",
    "## 可验证来源 / 更新时间",
    "",
    `- 官网：${pack.brandEntity.website}`,
    `- sameAs：${pack.brandEntity.sameAs.length ? pack.brandEntity.sameAs.join("、") : "待补充"}`,
    `- 更新时间：${pack.updatedAt}`,
    "",
    "## 品牌或主理人实体信息",
    "",
    `- 品牌 / 团队：${pack.brandEntity.name}`,
    `- 别名：${pack.brandEntity.aliases.length ? pack.brandEntity.aliases.join("、") : "无"}`,
    `- 主理人 / 专家：${pack.lawyerEntity.name}`,
    `- 城市：${pack.brandEntity.city}`,
    `- 领域：${pack.brandEntity.lawPracticeAreas.join("、")}`,
    "",
    "## 合规免责声明",
    "",
    `- ${pack.lawyerEntity.disclaimer}`,
    "",
    "## CTA",
    "",
    `- ${pack.serviceFactSheet.cta}`,
    "",
    "## FAQ",
    "",
    ...pack.faqMatrix.flatMap((faq) => [`### ${faq.question}`, "", `${faq.answer}（Evidence: ${faq.evidenceBlockId}）`, ""]),
    "## Evidence Blocks",
    "",
    ...pack.evidenceBlocks.map((block) => `- ${block.id} (${block.type}, confidence ${block.confidence}): ${block.text}`),
    "",
    "## JSON-LD",
    "",
    "```json",
    JSON.stringify(renderCitationPackJsonLd(pack, baseUrl), null, 2),
    "```",
  ];
  return `${lines.join("\n").replace(/\n{3,}/g, "\n\n").trim()}\n`;
}
