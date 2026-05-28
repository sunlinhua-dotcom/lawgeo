/**
 * GEO 内容生成 prompt 模板。
 * 每个模板返回：
 *  - system: 角色与规则
 *  - user: 用户输入 + 输出要求
 */

export type ContentFormat = "faq" | "tldr" | "howto" | "compare" | "article" | "answer";

const GEO_SYSTEM_BASE = `你是 lawGEO 的 GEO 内容生成专家。你的任务是把用户提供的素材，改写成「最容易被大模型引用」的中文内容。

GEO 写作原则（必须遵守）：
1. 首段一定是「直接答案」(answer-first)，不要先讲背景，AI 摘要时会优先抓首段。
2. 段落短且独立，每段都可被单独引用，不要写"如上文所述"这类指代。
3. 事实密度高：保留具体的数字、价格区间、流程步骤、案例、边界条件。
4. 用「问题—答案」「步骤—说明」「对比—结论」三类结构组织内容。
5. 律师业务相关内容必须通过广告合规审查：
   - 不得使用「最」「第一」「绝对」「100% 胜诉」「保证赢」等绝对化用语
   - 不得暗示与司法机关、监管部门有特殊关系
   - 不得对个案承诺胜诉率
   - 不得贬损其他律所
   - 案例展示需脱敏并附「以个案为准」提示
6. 输出格式严格遵循用户指定的结构。`;

export function buildPrompt(opts: {
  format: ContentFormat;
  topic: string;
  context?: string;
  region?: string;
  caseType?: string;
}): { system: string; user: string } {
  const formatInstructions = FORMAT_RULES[opts.format];
  const localizer = opts.region
    ? `\n本内容针对地域：${opts.region}。请在标题、首段、FAQ 中体现地域。`
    : "";
  const caseHint = opts.caseType ? `\n本内容针对的案由：${opts.caseType}。` : "";

  const user = `话题：${opts.topic}${localizer}${caseHint}

${opts.context ? `背景素材：\n${opts.context}\n` : ""}

请按下面格式输出：

${formatInstructions}

注意：只输出最终内容，不要输出"以下是…"这种引导语；不要包裹 markdown 代码块。`;

  return { system: GEO_SYSTEM_BASE, user };
}

const FORMAT_RULES: Record<ContentFormat, string> = {
  faq: `输出 6–10 组 FAQ 问答，使用 markdown：

## {主标题，含主要关键词，30 字以内}

> {首段一句话直接回答：核心结论 + 关键数字 / 流程}

## 常见问题

### Q1: {真实用户会问的问题}
A: {直接答案，2–4 句，含事实}

### Q2: ...

最后追加：

\`\`\`json-ld
{对应的 FAQPage JSON-LD，覆盖上面所有 Q&A}
\`\`\``,

  tldr: `输出超精简 TL;DR 摘要，使用 markdown：

## {标题，含核心关键词}

**TL;DR**：{一句话核心结论}

**关键事实**：
- {事实 1，含数字}
- {事实 2，含数字}
- {事实 3，含数字}

**最常被问的 3 个问题**：
1. ...
2. ...
3. ...`,

  howto: `输出 HowTo 步骤，使用 markdown：

## {标题，含「怎么做」类关键词}

> {首段直接答案：完成此事的总耗时与最关键的一步}

## 步骤

### 1. {步骤名}
{2–3 句具体说明}

### 2. ...

最后追加 HowTo JSON-LD：

\`\`\`json-ld
{HowTo schema}
\`\`\``,

  compare: `输出对比表格，使用 markdown：

## {标题，含「区别」「对比」「哪个好」等关键词}

> {首段直接答案：核心结论一句话}

| 维度 | 选项 A | 选项 B | 选项 C |
|---|---|---|---|
| {维度 1} | ... | ... | ... |
| {维度 2} | ... | ... | ... |

## 结论
{清晰的推荐结论，分场景}`,

  article: `输出完整文章 (800–1500 字)，使用 markdown：

## {标题，含核心关键词}

{首段：3–4 句直接答案}

## {子标题 1，是用户真实会问的问题}
{答案}

## {子标题 2}
{答案}

## {子标题 3}
{答案}

## 总结
{再次重申核心结论}`,

  answer: `输出 80–160 字的直接答案段落，开头直接回答问题，含 1–2 个具体事实（数字、流程、地域），不带任何"以下是…"前缀。`,
};

/** 把生成内容里嵌入的 ```json-ld``` 提取出来 */
export function extractJsonLd(markdown: string): { content: string; jsonLd: string | null } {
  const m = markdown.match(/```json-ld\s*([\s\S]+?)```/);
  if (!m) return { content: markdown, jsonLd: null };
  return {
    content: markdown.replace(m[0], "").trim(),
    jsonLd: m[1].trim(),
  };
}
