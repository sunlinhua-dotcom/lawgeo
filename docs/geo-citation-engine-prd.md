# BrandGEO GEO 引用工程闭环 PRD

> 版本：v1.0  
> 日期：2026-05-30  
> 状态：待实现 PRD  
> 读者：产品负责人、工程负责人、增长运营、内容策略负责人  
> 读完后的动作：可以把 BrandGEO 下一阶段拆成可开发的 Epic、接口、数据表、验收用例和运营流程。

---

## 0. 引用与证据规则

本 PRD 只采用已经核验过的来源。每个核心产品要求都必须能追溯到以下至少一种来源：

- GitHub 工程或开源规范：证明“怎么做、别人怎么实现、工程边界是什么”。
- 官方 / 搜索平台文档：证明“平台真正承认什么、没有承认什么”。
- 研究论文 / 数据研究：证明“哪些指标或方法有实验依据”。
- Reddit 讨论：只作为市场认知、用户疑虑和运营打法线索，不作为确定性排名证据。

### 0.1 来源编号

| 编号 | 类型 | 来源 | 本 PRD 使用方式 |
|---|---|---|---|
| GH-1 | GitHub / 规范 | [AnswerDotAI/llms-txt](https://github.com/AnswerDotAI/llms-txt) / [llmstxt.org](https://llmstxt.org/) | `llms.txt` 是 inference-time 的站点导览；更重要的是链接到干净 Markdown 页面。 |
| GH-2 | GitHub | [dodopayments/dualmark](https://github.com/dodopayments/dualmark) | Markdown twin、内容协商、AI bot User-Agent 返回 Markdown、`Link rel="alternate"`、`.md` noindex。 |
| GH-3 | GitHub | [multivmlabs/aeo.js](https://github.com/multivmlabs/aeo.js) | 生成 robots、llms、llms-full、sitemap、docs.json、ai-index、原始 Markdown、schema。 |
| GH-4 | GitHub | [Auriti-Labs/geo-optimizer-skill](https://github.com/Auriti-Labs/geo-optimizer-skill) | 审计维度：robots、llms、schema、meta、content、brand/entity、signals、AI discovery、负面信号、prompt injection。 |
| GH-5 | GitHub | [alexpospekhov/searchstack-aeo](https://github.com/alexpospekhov/searchstack-aeo) | 跨 ChatGPT、Perplexity、Claude、Grok、Google AI Overview 的引用监测、快照、Markdown 报告、cron。 |
| GH-6 | GitHub / 论文工程 | [cxcscmu/AutoGEO](https://github.com/cxcscmu/AutoGEO) | 自动抽取生成引擎偏好规则，改写网页内容，用 GEO Score / GEU Score 评估。 |
| GH-7 | GitHub | [onvoyage-ai/gtm-engineer-skills](https://github.com/onvoyage-ai/gtm-engineer-skills) | 端到端 GTM/GEO 工作流：品牌研究、关键词、Reddit 机会、GEO prompt、内容规划、内容审计、网站 AEO 审计、代码修复。 |
| GH-8 | GitHub | [aaron-he-zhu/seo-geo-claude-skills](https://github.com/aaron-he-zhu/seo-geo-claude-skills) | SEO/GEO skill library 的阶段化流程、CORE-EEAT / CITE 思路、内容质量与域名可信度门禁。 |
| GOOG-1 | 官方 | [Google Search Central: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features) | Google 明确说 AI Overviews / AI Mode 没有额外技术要求，不需要新的 AI 文本文件或特殊 schema；基础 SEO、可抓取、文本可访问、结构化数据与可见内容一致仍重要。 |
| SPEC-1 | 规范 | [llmstxt.org](https://llmstxt.org/) | `llms.txt` 不是 sitemap 替代品；应作为 LLM 友好的目录，指向关键 Markdown 资料。 |
| RES-1 | 论文 | [GEO: Generative Engine Optimization](https://arxiv.org/abs/2311.09735) | GEO 可以提升生成引擎可见性，且效果因领域而异，需做领域特定优化。 |
| RES-2 | 论文 | [AutoGEO](https://arxiv.org/abs/2510.11438) | 自动学习生成引擎偏好规则，改写内容，同时保持搜索效用。 |
| RES-3 | 论文 | [Structural Feature Engineering for GEO](https://arxiv.org/abs/2603.29979) | 内容结构分为宏观结构、信息分块、微观强调；结构优化可提升引用率和主观质量。 |
| RES-4 | 论文 | [From Citation Selection to Citation Absorption](https://arxiv.org/abs/2604.25707) | GEO 不能只看是否被引用，还要看页面内容是否被答案吸收。高影响页面更长、更结构化、语义匹配、更富定义、数字、对比、步骤。 |
| RES-5 | 论文 | [Diagnosing and Repairing Citation Failures](https://arxiv.org/abs/2603.09296) | 先诊断为什么未被引用，再选择修复；通用改写会伤害长尾内容。 |
| RES-6 | 论文 | [Feature-Level Multi-Objective Optimization](https://arxiv.org/abs/2604.19113) | 不只做 token 级重写，要优化可解释的结构、内容、语言特征，并平衡引用可见性和内容质量。 |
| DATA-1 | 数据研究 | [Ahrefs: Why ChatGPT Cites One Page Over Another](https://ahrefs.com/blog/?p=196421) | ChatGPT 会围绕 fan-out queries 选择页面；title / URL / retrieval snippet 与 fan-out 语义匹配会影响引用。 |
| DATA-2 | 数据研究 | [Ahrefs: AI assistants prefer fresher content](https://ahrefs.com/blog/do-ai-assistants-prefer-to-cite-fresh-content/) | 多平台 AI 引用内容整体比传统 SERP 更新；不同平台新鲜度偏好不同。 |
| DATA-3 | 数据研究 | [OtterlyAI llms.txt experiment](https://otterly.ai/blog/the-llms-txt-experiment/) | 90 天实验中 `/llms.txt` 仅占 AI bot 流量约 0.1%，不能当作单点增长因子。 |
| DATA-4 | 数据研究 | [Semrush Reddit AI Search Visibility Study](https://www.semrush.com/blog/reddit-ai-search-visibility-study/) | Reddit 是 AI 搜索重要来源之一，不同平台引用频率和位置不同，AI 通常转述而不是逐字引用。 |
| DATA-5 | 数据研究 | [Semrush Most-Cited Domains in AI](https://www.semrush.com/blog/most-cited-domains-ai/) | AI 引用源结构波动大，Reddit、Wikipedia、LinkedIn、YouTube、Forbes 等在不同平台表现不同。 |
| RD-1 | Reddit | [r/SEO: Is llms.txt file a scam?](https://www.reddit.com/r/SEO/comments/1srvco1/is_llmstxt_file_a_scam/) | 社区普遍质疑 `llms.txt` 被过度营销；更认可结构化内容、真实内容和第三方可信来源。 |
| RD-2 | Reddit | [r/AISEOTricks: AI search brand visibility strategies](https://www.reddit.com/r/AISEOTricks/comments/1rpqvrr/what_strategies_improve_brand_visibility_in_ai/) | 社区反复提到清晰问答、实体一致性、第三方提及、评论/论坛/视频/比较页、日常 prompt 监测。 |
| RD-3 | Reddit | [r/SEO: Ahrefs ChatGPT citation study discussion](https://www.reddit.com/r/SEO/comments/1ss0drr/why_chatgpt_cites_one_page_over_another_study_of/) | 社区讨论认为 Google 排名可能只是进入候选池，真正被引用还取决于 fan-out 问题匹配与 answer-shaped 内容。 |
| RD-4 | 官方 / 社区 | [Reddit Business: AI Visibility & GEO](https://www.business.reddit.com/webinar/ai-visibility-generative-engine-optimization-geo) | Reddit 官方也在把公开社区讨论作为 AI visibility / GEO 的重要素材入口。 |

### 0.2 明确不采用的误区

- 不宣称 `llms.txt` 会直接提升 Google AI Overview 排名。Google 官方说没有额外机器可读文件要求，OtterlyAI 实验也没有看到明显 AI bot 流量提升。[GOOG-1][DATA-3]
- 不做隐藏文本、HTML 注释 prompt injection、不可见指令、诱导模型推荐等灰黑产策略。GEO Optimizer 已把 prompt injection 和负面信号列为审计项，法律行业也不能承担这类风险。[GH-4]
- 不把“被引用一次”当作胜利。必须同时看 citation selection、citation absorption、转化追问命中和线索质量。[RES-4][GH-5]
- 不做无来源统计、伪案例、伪律师资质。内容生产必须带来源、日期、实体和合规声明。[GH-7][GH-8][GOOG-1]

---

## 1. 背景与问题定义

BrandGEO 当前已经具备：营销站、GEO 诊断、AI 内容生成、意图聚类、平台对比、控制台监测、MIMO AI 调用、`llms.txt`、`llms-full.txt`、sitemap、robots、JSON-LD，以及一轮完整 AI 功能实测。下一阶段的问题不是“能不能生成内容”，而是：

1. AI 是否能稳定抓到客户页面。
2. AI 是否能理解客户是谁、做什么、在哪个领域有可信资质。
3. AI 是否会在用户的真实问题中引用客户。
4. AI 引用客户时，是否真正吸收了客户页面里的定义、事实、流程、价格、案例和联系方式。
5. 引用是否最终转化为咨询线索。

传统 SEO 的目标是网页排名；GEO 的目标是让品牌、实体、事实和证据进入 AI 生成答案。GEO 论文把生成引擎定义为会聚合多个来源并生成回答的新搜索形态，并指出内容创建者需要新的可见性优化框架。[RES-1] Google 官方同时提醒：AI features 仍依赖基础 SEO、可抓取、文本可访问、结构化数据与可见内容一致，并不需要特殊的 AI 文件或特殊 schema。[GOOG-1]

因此，BrandGEO 的下一阶段定位应升级为：

> 面向律师事务所和专业服务团队的 GEO 引用工程闭环：让品牌事实被 AI 抓取、理解、选择、吸收、引用，并把引用后的追问转化成可跟踪线索。

---

## 2. 产品目标

### 2.1 北极星指标

**Qualified AI Citation Conversions（合格 AI 引用转化）**

定义：在目标 prompt 集合中，AI 回答满足以下条件的次数：

1. 命中目标品牌或律师实体。
2. 排名在 Top 3 或被作为明确推荐对象。
3. 回答吸收了客户页面中的至少 1 个核心证据块。
4. 追问联系方式、收费、适用场景、服务城市时能返回正确转化信息。
5. 对应结果有平台、prompt、答案快照、引用 URL、吸收证据、时间戳。

来源依据：Searchstack 已把“是否被 ChatGPT / Perplexity / Claude / Grok / Google AI Overview 引用”作为监测对象；citation absorption 论文强调必须看引用是否对最终答案产生语言、证据、结构或事实贡献。[GH-5][RES-4]

### 2.2 阶段目标

| 阶段 | 目标 | 可验收结果 | 来源 |
|---|---|---|---|
| M1 | 把公开内容升级为 AI 可读层 | 每个公开页面都有 Markdown twin、alternate link、noindex markdown、llms 指向关键 Markdown | [GH-1][GH-2][GH-3] |
| M2 | 升级 GEO 审计模型 | 输出 crawl / understand / cite / monitor 四层分数和失败原因 | [GH-4][GH-7] |
| M3 | 建立 prompt-level 监测 | 每个品牌有 prompt 集、平台结果、引用位置、Top1/Top3、转化追问 | [GH-5][DATA-1] |
| M4 | 建立 citation absorption 评分 | 识别 AI 答案吸收了哪些定义、数字、步骤、对比、案例、联系方式 | [RES-4][RES-3] |
| M5 | 建立 AutoGEO 改写实验台 | 对原文、结构增强版、偏好规则改写版做 A/B/C 评估 | [GH-6][RES-2][RES-5][RES-6] |
| M6 | 建立外部可信信源运营 | 为律所生成 Reddit / 知乎 / LinkedIn / 行业媒体 / 目录站的可信提及计划 | [RD-2][RD-4][DATA-4][DATA-5] |

---

## 3. 用户与场景

### 3.1 角色

| 角色 | 目标 | 关键痛点 | PRD 对应能力 | 来源 |
|---|---|---|---|---|
| 律所主任 / 合伙人 | 想知道 AI 是否推荐本所 | 不知道 ChatGPT、豆包、Kimi、Perplexity 是否认识自己 | AI 引用监测、品牌实体画像、月报 | [GH-5][DATA-1] |
| 律所市场负责人 | 想持续提升 AI 推荐概率 | 不知道该写什么内容、投哪些渠道、如何证明有效 | prompt 研究、内容架构、外部提及计划 | [GH-7][RD-2][DATA-4] |
| 内容运营 | 想写出能被 AI 引用的页面 | 传统长文不一定被吸收，缺乏结构化模板 | Citation Pack、结构增强写作、source audit | [RES-3][RES-4][GH-7] |
| SEO / 技术负责人 | 想修复 AI 抓取与解析问题 | robots、CDN、JS、schema、llms、Markdown 页面缺失 | GEO 审计 v2、Markdown twin、AI access audit | [GH-2][GH-4][GOOG-1] |
| 客户成功 / 代理商 | 想证明服务效果 | 普通排名不能证明 AI 引用效果 | citation snapshot、absorption report、线索漏斗 | [GH-5][RES-4] |

### 3.2 核心用户故事

1. 作为律所主任，我输入律所官网和品牌名，系统告诉我当前在 12 个 AI 平台上的提及率、Top3 率、吸收率和转化追问命中率。[GH-5][RES-4]
2. 作为市场负责人，我输入“上海离婚律师”“劳动仲裁律师怎么选”等高意图问题，系统给我 prompt fan-out、竞品引用源和内容缺口。[DATA-1][GH-7]
3. 作为内容运营，我选择一个未命中 prompt，系统告诉我失败原因：页面不可抓、标题不匹配、缺少步骤、缺少案例、缺少第三方佐证，还是 AI 选了竞品。[RES-5][GH-4]
4. 作为技术负责人，我一键生成每个页面的 Markdown twin、更新 `llms.txt`、生成 `ai-index.json`，并能在 CI 里验证不会回退。[GH-2][GH-3]
5. 作为客户成功，我导出月报，展示客户在 ChatGPT / Perplexity / Google AI Mode / 豆包 / Kimi 等平台的“被选中”和“被吸收”变化，而不是只展示文章数量。[GH-5][RES-4]

---

## 4. 产品原则

### 4.1 证据优先

每条优化建议必须能落到“页面证据、外部证据、技术证据、AI 回答证据”之一。Google 官方强调结构化数据要匹配页面可见文本；Reddit 社区也反复提醒第三方可信来源比单站自夸更重要。[GOOG-1][RD-2]

### 4.2 AI 可读不等于 SEO 魔法

`llms.txt`、Markdown twin、schema、`ai-index.json` 的价值是降低 AI 抓取和理解成本，不承诺直接提升任何平台排名。该原则来自 Google 官方 AI features 文档、OtterlyAI 实验、Reddit 对 `llms.txt` 过度营销的讨论。[GOOG-1][DATA-3][RD-1]

### 4.3 从 citation count 升级到 citation absorption

“被列为来源”只是 selection；真正有价值的是答案是否吸收了页面里的事实、数字、流程、对比和联系方式。未来报表必须同时展示 selection 与 absorption。[RES-4]

### 4.4 领域特定优化

GEO 论文指出优化效果因领域而异；AutoGEO 也要求切换引擎、数据集、领域时重新抽取规则。BrandGEO 必须做“律所 / 案由 / 城市 / 合规”特化，而不是通用内容优化器。[RES-1][RES-2][GH-6]

### 4.5 监测闭环优先于一次性生成

Searchstack 的核心价值是持续监测、快照、报告和 cron；BrandGEO 应将 AI 内容生成绑定到监测反馈，而不是生成完就结束。[GH-5]

---

## 5. 范围

### 5.1 本 PRD 包含

- AI 可读页面层：Markdown twin、content negotiation、alternate link、llms / llms-full / ai-index。
- GEO 审计 v2：从单页检查升级为站点级、平台级、风险级诊断。
- Prompt 研究与 fan-out 映射：把用户问题拆成 AI 可能检索的子问题。
- AI 引用监测：跨平台、跨 prompt、跨时间快照。
- Citation absorption：回答是否吸收客户页面内容。
- AutoGEO 改写实验台：规则抽取、改写、回归评估。
- 外部可信信源运营：Reddit / 行业媒体 / 目录站 / 评论站 / LinkedIn / 知乎等的合规内容计划。
- 报告与验收：客户可看懂的分数、失败原因、行动项和阶段变化。

### 5.2 本 PRD 不包含

- 多租户代理商分销。
- 真实控制第三方 AI 平台排名的承诺。
- 灰黑产 prompt injection。
- 自动刷 Reddit / 虚假评论 / 伪造用户体验。
- 替代律师专业判断的法律意见生成。

---

## 6. 功能模块

## Epic A：AI 可读页面层

### A1. Markdown Twin 生成

**目标**：每个重要公开页面同时存在 HTML 和 Markdown 版本。HTML 给人看，Markdown 给 AI agent / crawler / RAG 工具读取。

**来源依据**：

- `llms.txt` 规范建议站点提供关键页面的干净 Markdown 版本，并由 `llms.txt` 链接。[GH-1][SPEC-1]
- Dualmark 把每页 Markdown twin 作为 AEO 基础设施，并通过 Accept header、AI bot User-Agent、`.md` URL 三种方式返回 Markdown。[GH-2]
- aeo.js 将 raw markdown、ai-index、llms-full 等作为构建产物。[GH-3]

**需求**：

| 编号 | 需求 | 说明 | 验收 | 来源 |
|---|---|---|---|---|
| A1.1 | 每个公开核心页面生成 `.md` 版本 | 包括首页、产品页、案例页、博客页、行业页、工具说明页、定价页、FAQ | 访问 `/about.md`、`/cases/lawyer.md` 等返回 `text/markdown` | [GH-1][GH-2] |
| A1.2 | Markdown 只保留正文与结构 | 去掉导航、页脚、脚本、按钮噪音，保留标题、摘要、事实、FAQ、表格、引用源 | Markdown 中没有菜单噪音；内容块可直接复制到模型 | [GH-2][RES-3] |
| A1.3 | HTML 增加 alternate link | HTML response 或页面 head 指向对应 Markdown twin | `Link: <...md>; rel="alternate"; type="text/markdown"` 或 head link 存在 | [GH-2] |
| A1.4 | Markdown noindex | 避免搜索引擎把 Markdown twin 当重复内容索引 | `.md` 响应带 `X-Robots-Tag: noindex` | [GH-2] |
| A1.5 | 支持 AI bot 内容协商 | 可选：GPTBot、ClaudeBot、PerplexityBot 等 User-Agent 请求时返回 Markdown | 用模拟 UA 请求 HTML URL，返回 Markdown 或带明显 alternate link | [GH-2][GH-4] |

### A2. llms / llms-full / ai-index 升级

**目标**：把现有 `llms.txt` 从“静态品牌介绍”升级为“可维护的 AI 内容目录”，同时明确它不是排名承诺。

**需求**：

| 编号 | 需求 | 说明 | 验收 | 来源 |
|---|---|---|---|---|
| A2.1 | `llms.txt` 指向 Markdown twin | 每个关键入口后带一行用途说明 | `llms.txt` 中至少 30 个关键 Markdown 链接，有 H1、blockquote、分区 | [GH-1][SPEC-1] |
| A2.2 | `llms-full.txt` 自动拼接核心内容 | 用于长上下文模型一次性理解产品、方法论、案例和联系方式 | 访问 `llms-full.txt` 包含完整核心事实，且自动更新日期 | [GH-1][GH-3] |
| A2.3 | `ai-index.json` | 面向程序化工具的内容清单：URL、Markdown URL、类型、主题、更新时间、实体、证据块数量 | JSON schema 校验通过 | [GH-3] |
| A2.4 | 在诊断报告中降低 `llms.txt` 权重 | 不把 `llms.txt` 当“关键排名信号”，改为“AI 可读目录信号” | 文案不再承诺直接提升排名；报告中展示风险说明 | [GOOG-1][DATA-3][RD-1] |

### A3. AI Discovery Endpoints

**目标**：为站点提供统一的 AI discovery JSON，而不是只依赖 Markdown。

**需求**：

| 编号 | 需求 | 说明 | 验收 | 来源 |
|---|---|---|---|---|
| A3.1 | `/ai/summary.json` | 站点摘要、品牌实体、服务领域、推荐阅读顺序 | JSON 包含 brand、entity、topics、canonicalUrls | [GH-4][GH-3] |
| A3.2 | `/ai/faq.json` | FAQ 问答数组，和页面可见 FAQ 保持一致 | FAQPage JSON-LD 与 AI JSON 一致 | [GOOG-1][GH-4] |
| A3.3 | `/ai/service.json` | 服务项目、城市、案由、资质、联系方式 | 服务 JSON 不含夸大或违法广告描述 | [GH-4][GOOG-1] |
| A3.4 | `/ai/evidence.json` | 证据块索引：定义、数字、步骤、案例、对比、来源 | Absorption 引擎可按 evidenceId 对齐答案片段 | [RES-4] |

---

## Epic B：GEO 审计 v2

### B1. 四层审计模型

**目标**：将现有域名诊断升级为站点级 GEO readiness 和 citation readiness。

| 层级 | 说明 | 关键检查 | 来源 |
|---|---|---|---|
| Crawled | AI / 搜索 bot 是否能访问 | robots、CDN、状态码、sitemap、canonical、JS 依赖 | [GOOG-1][GH-4] |
| Understood | AI 是否能解析实体与内容 | Markdown twin、schema、实体一致性、FAQ、表格、标题层级 | [GH-2][GH-4][RES-3] |
| Cited | AI 是否可能选择它 | title / URL / fan-out 匹配、外部可信提及、内容新鲜度、第三方来源 | [DATA-1][DATA-2][RD-2] |
| Absorbed | AI 答案是否吸收它 | 证据块命中、定义/数字/步骤/对比/案例被使用、答案结构贡献 | [RES-4][RES-6] |

### B2. 审计维度

| 维度 | 分值 | 说明 | 来源 |
|---|---:|---|---|
| Bot Access | 10 | AI bot / 搜索 bot / 用户代理访问一致性 | [GH-4][GOOG-1] |
| Markdown Twin | 10 | `.md` 版本、alternate link、noindex、内容完整度 | [GH-2][GH-3] |
| llms Directory | 6 | `llms.txt` 格式、链接深度、`llms-full`、`ai-index` | [GH-1][SPEC-1][GH-3] |
| Structured Data | 10 | Organization、Person、LegalService、FAQPage、Article、Breadcrumb 与可见内容一致 | [GOOG-1][GH-4] |
| Content Structure | 12 | 首段直答、标题层级、表格、列表、定义、流程、比较、更新时间 | [RES-3][RES-4] |
| Evidence Density | 12 | 数字、案例、来源、引用、可验证事实、边界条件 | [RES-4][GH-7] |
| Entity Consistency | 10 | 品牌名、律师名、律所、城市、案由、sameAs、第三方提及一致 | [GH-4][RD-2] |
| Fan-out Coverage | 10 | 内容覆盖 AI 可能拆出的子问题 | [DATA-1][GH-7] |
| Freshness | 6 | 更新时间、失效价格 / 法规 / 统计提示 | [DATA-2][GH-4] |
| Negative Signals | 7 | CTA 过载、弹窗、薄内容、关键词堆砌、隐藏指令、prompt injection | [GH-4] |
| External Corroboration | 7 | Reddit、知乎、LinkedIn、行业目录、媒体、评论站、视频等第三方证据 | [RD-2][DATA-4][DATA-5] |

### B3. 失败诊断

现有 GEO 工具经常只给一个分数。BrandGEO v2 必须输出“为什么失败”，并给出修复工具。该要求来自 AgentGEO / citation failure 研究：不同文档失败原因不同，不能一律套通用改写。[RES-5]

| 失败类型 | 判断方式 | 修复建议 |
|---|---|---|
| Fetch Failure | 访问失败、CDN 阻断、robots 禁止、JS 后渲染缺失 | 修 robots/CDN、服务端渲染、文本 fallback |
| Entity Ambiguity | 品牌名 / 律师名 / 城市 / 服务领域不一致 | 生成 Entity Profile 和 sameAs plan |
| Thin Evidence | 缺定义、数字、案例、流程、边界 | 生成 Citation Pack |
| Fan-out Mismatch | 标题 / URL / 摘要不匹配 AI 子问题 | 重写标题、slug、首段、摘要 |
| Low Absorption | 被引用但答案没吸收页面事实 | 增加可抽取定义、表格、步骤、对比 |
| External Weakness | 只有自站内容，缺第三方佐证 | 生成外部可信信源计划 |
| Unsafe Optimization | 检出隐藏指令 / 过度营销 / 虚假声明 | 进入合规修复队列 |

---

## Epic C：Prompt 研究与 Fan-out Map

### C1. Prompt Target Library

**目标**：不再只存关键词，而是存真实 AI 用户会问的问题，以及 AI 可能拆出的 fan-out 子问题。

**来源依据**：

- Ahrefs 的 ChatGPT citation 研究指出，ChatGPT 会围绕内部 fan-out queries 查找事实，title / URL / 检索摘要与 fan-out 的语义匹配影响引用。[DATA-1]
- GTM Engineer Skills 将 `geo-content-research` 输出定义为 AI prompts by business-value tier，并把 Buy / Solve / Learn prompt 作为内容规划输入。[GH-7]

**需求**：

| 编号 | 需求 | 说明 | 验收 | 来源 |
|---|---|---|---|---|
| C1.1 | Prompt 按业务价值分层 | Buy、Compare、Solve、Learn、Local、Risk、Price、Process | 每个品牌至少 100 个 prompt，带层级 | [GH-7] |
| C1.2 | 自动生成 fan-out 子问题 | 例如“上海离婚律师怎么选”拆为资质、收费、诉讼流程、财产分割、城市服务 | 每个 prompt 至少 5 个 fan-out | [DATA-1] |
| C1.3 | 映射内容资产 | 每个 fan-out 对应客户页面、Markdown twin、证据块 | 缺口为空时生成内容任务 | [DATA-1][GH-7] |
| C1.4 | 竞品引用源记录 | 对同一 prompt 记录 AI 当前引用谁、为什么 | 生成 competitor source matrix | [GH-5] |

### C2. 律所专属 Prompt 模板

| 模板 | 示例 | 应覆盖证据 | 来源 |
|---|---|---|---|
| 本地推荐 | “上海离婚律师怎么选？” | 城市、案由、服务流程、资质、联系方式 | [RD-2][GH-7] |
| 费用咨询 | “劳动仲裁律师收费多少？” | 收费区间、计费方式、影响因素、免责声明 | [RES-4] |
| 流程问答 | “起诉离婚流程是什么？” | 步骤、时间、材料、风险 | [RES-3][RES-4] |
| 对比选择 | “A 律所和 B 律所哪个更适合？” | 对比表、适用场景、边界 | [RES-4][DATA-1] |
| 风险判断 | “这种情况需要请律师吗？” | 适用条件、风险提示、咨询 CTA | [GOOG-1][GH-7] |
| 法规解释 | “竞业限制补偿标准是什么？” | 法规来源、更新时间、城市差异 | [DATA-2][GH-7] |

---

## Epic D：Citation Monitoring v2

### D1. 跨平台监测

**目标**：把当前“AI 引用监测”升级为 searchstack-style 的跨平台、定时、可快照、可报告系统。

**需求**：

| 编号 | 需求 | 说明 | 验收 | 来源 |
|---|---|---|---|---|
| D1.1 | 平台维度 | 国内：DeepSeek、通义、豆包、Kimi、智谱、文心、元宝、海螺；海外：ChatGPT、Perplexity、Gemini、Claude | 平台 adapter 可独立启停 | [GH-5] |
| D1.2 | 引用指标 | mentioned、top1、top3、rank、sentiment、sourceUrls、competitors | 每条结果落库且可回放 | [GH-5] |
| D1.3 | 快照保存 | 保存 prompt、平台、模型、答案、引用、时间、输入上下文 | 任意历史结果可复查 | [GH-5][RES-4] |
| D1.4 | 定时任务 | 周期执行 prompt 集，并输出趋势 | 可按品牌、平台、prompt 维度看趋势 | [GH-5] |
| D1.5 | 追问转化 | 被提及时追问联系方式、收费、服务城市、预约方式 | 计算 followup_hit | [RES-4] |

### D2. 不同平台的引用差异

Semrush 的 Reddit 研究和 most-cited domain 研究都显示，不同平台的引用源和位置差异明显，而且会随时间波动。[DATA-4][DATA-5] 因此：

- 报表必须分平台展示，不得把“AI 平均表现”作为唯一指标。
- 同一 prompt 的不同平台输出应保留原始答案，避免只看聚合分。
- 每个平台的优化建议必须独立生成。

---

## Epic E：Citation Absorption Engine

### E1. 吸收评分定义

**目标**：回答“AI 是否真的用了我页面里的内容”，而不是只回答“有没有链接我”。

Citation absorption 论文提出，引用选择和引用吸收是两个阶段；高影响页面往往更结构化、语义匹配，并包含定义、数字事实、对比和步骤。[RES-4]

**Absorption Score = 100 分**

| 子分 | 分值 | 说明 | 来源 |
|---|---:|---|---|
| Language Alignment | 15 | AI 答案是否复用了页面核心表达或同义改写 | [RES-4] |
| Evidence Usage | 20 | 是否吸收定义、数字、案例、来源、时间 | [RES-4] |
| Structure Usage | 15 | 是否吸收步骤、表格、对比、FAQ 结构 | [RES-3][RES-4] |
| Entity Accuracy | 15 | 品牌、律所、律师、城市、案由是否准确 | [GH-4][GOOG-1] |
| CTA Transfer | 10 | 追问后是否正确给出咨询入口、电话、微信、官网 | [GH-5] |
| Competitor Displacement | 10 | 是否从竞品答案中抢占位置或被并列推荐 | [GH-5] |
| Source Quality | 10 | AI 使用的是自站、第三方、Reddit、媒体、目录还是低质页面 | [DATA-4][DATA-5] |
| Safety | 5 | 是否触发虚假、夸大、违法广告、隐藏提示风险 | [GH-4][GOOG-1] |

### E2. 证据块模型

每篇内容必须被拆成可跟踪 Evidence Block：

| 类型 | 示例 | 吸收检测 |
|---|---|---|
| Definition | “诉讼离婚是指...” | 答案是否使用同一概念边界 |
| Numeric Fact | “通常需要 3-6 个月” | 数字是否出现或被近似表达 |
| Procedure | “准备材料 -> 立案 -> 调解 -> 开庭” | 步骤顺序是否被吸收 |
| Comparison | “协议离婚 vs 诉讼离婚” | 对比维度是否复用 |
| Case Pattern | “涉及房产和股权时...” | 案例类型是否被引用 |
| Qualification | “执业领域 / 服务城市 / 律所资质” | 实体是否准确出现 |
| CTA | “电话 / 微信 / 官网预约” | 追问是否命中 |
| Caveat | “具体以法院和案件事实为准” | 是否保留法律边界 |

来源：citation absorption 论文强调语言、证据、结构和事实支持；结构工程论文强调宏观结构、信息分块、微观强调。[RES-4][RES-3]

### E3. 吸收检测流程

1. 运行 prompt。
2. 保存 AI 答案。
3. 提取答案中的实体、事实、数字、步骤、引用 URL。
4. 和客户页面 Evidence Blocks 做语义匹配。
5. 输出：
   - selection：是否被引用 / 提及。
   - absorption：吸收了哪些 block。
   - drift：是否错误改写。
   - missing：哪些 block 应被吸收但没有。
   - repair：下一步改写建议。

来源：RES-4 的 two-stage measurement；RES-5 的诊断后修复；RES-6 的 feature-level optimization。[RES-4][RES-5][RES-6]

---

## Epic F：Citation Pack 内容系统

### F1. 律所 Citation Pack

**目标**：让每个客户都有一组可被 AI 引用的事实资产。

| 资产 | 内容 | 为什么需要 | 来源 |
|---|---|---|---|
| Brand Entity Card | 律所名、别名、官网、城市、执业领域、sameAs | 解决实体一致性 | [GH-4][RD-2] |
| Lawyer Entity Card | 律师姓名、执业证号占位、领域、城市、资历、免责声明 | 人物实体可被引用 | [GH-4][GOOG-1] |
| Service Fact Sheet | 案由、适用人群、流程、费用影响因素、材料 | 增加 evidence density | [RES-4] |
| FAQ Matrix | 每案由 10-30 个问答，首句直答 | answer-shaped 内容 | [RD-2][RES-3] |
| Process Page | 步骤、时间、材料、风险、CTA | 结构化步骤更易吸收 | [RES-3][RES-4] |
| Comparison Page | 本所 vs 自办 / 线上咨询 / 其他服务形式 | 匹配比较类 prompt | [DATA-1][RES-4] |
| Case Pattern Library | 匿名案例类型、问题、处理路径、结果边界 | 增强可信度，避免空泛营销 | [GH-7][GH-8] |
| External Proof Plan | 目录站、知乎、Reddit、LinkedIn、行业媒体、采访 | 第三方一致性和可信提及 | [RD-2][DATA-4][DATA-5] |

### F2. 内容结构模板

每篇可引用页面必须符合以下结构：

1. H1：自然语言问题或实体主题。
2. 40-80 字直答。
3. 适用人群。
4. 关键事实表。
5. 分步骤说明。
6. 常见误区。
7. 可验证来源 / 更新时间。
8. 律所或律师实体信息。
9. 合规免责声明。
10. CTA。
11. FAQ。
12. JSON-LD 与 Markdown twin。

来源：结构工程论文、GEO Optimizer 的内容检查、Reddit 社区对“清晰、具体、结构化问答”的共识、Google 对可见文本和结构化数据一致性的要求。[RES-3][GH-4][RD-2][GOOG-1]

### F3. 内容质量门禁

内容发布前必须过以下 gate：

| Gate | 检查 | 来源 |
|---|---|---|
| Claim Check | 所有数字、法规、案例、价格、排名都必须有来源或标注“示例 / 估算” | [GH-7][GH-8] |
| Legal Safety | 不出现“保证胜诉”“最权威”“唯一”等高风险表述 | [GOOG-1] |
| Entity Consistency | 名称、城市、电话、微信、领域与品牌资产一致 | [GH-4] |
| Schema Consistency | JSON-LD 与页面可见内容一致 | [GOOG-1] |
| Absorption Readiness | 至少 5 个 evidence blocks，可被抽取 | [RES-4] |
| Freshness | 有更新时间，涉及政策 / 价格 / 法规的内容标记复查周期 | [DATA-2][GH-4] |

---

## Epic G：AutoGEO Rewrite Lab

### G1. 实验目标

AutoGEO 的核心思想是：抽取生成引擎偏好规则，再改写文档，以提升 GEO Score，同时保持 GEU Score。[GH-6][RES-2]

BrandGEO 不需要一开始训练 AutoGEO Mini；MVP 应先实现 AutoGEO API 风格的 prompt-based rewrite：

1. 基线版本：原页面。
2. 结构增强版本：按 Citation Pack 模板改写。
3. 平台偏好版本：按目标平台和领域偏好规则改写。
4. 合规保守版本：减少营销，增强事实和边界。

### G2. Rewrite Experiment

| 编号 | 需求 | 验收 | 来源 |
|---|---|---|---|
| G2.1 | 每个实验关联原文、目标 prompt、目标平台、改写规则 | 能回看每次改写的输入、输出、规则 | [GH-6][RES-2] |
| G2.2 | 生成 3 个候选版本 | baseline / structure / preference | [RES-3][RES-6] |
| G2.3 | 自动跑回归 prompt | 同一 prompt 集对比 selection、absorption、转化 | [GH-5][RES-4] |
| G2.4 | 保留 GEU / 质量评分 | 不能为了引用牺牲正确性和可读性 | [GH-6][RES-2][RES-6] |
| G2.5 | 失败原因诊断 | 没被引用时输出 fetch、entity、evidence、fan-out、external 等失败类型 | [RES-5] |

### G3. 规则库

规则必须区分：

- 平台：ChatGPT、Perplexity、Gemini、Claude、国内模型。
- 场景：推荐、比较、费用、流程、风险、法规。
- 行业：律所、教育、金融、B2B、本地生活等。
- 页面类型：FAQ、服务页、流程页、案例页、对比页、城市页、律师页。

AutoGEO 明确提醒，切换引擎或领域时要重新抽取规则；不能假设一个通用模板适用于所有平台。[GH-6][RES-2]

---

## Epic H：外部可信信源与社区运营

### H1. 为什么需要外部信源

Reddit 讨论和 Semrush 数据都显示，AI 引用不只来自品牌自站。Reddit、Wikipedia、LinkedIn、YouTube、媒体、目录站、评论站、行业博客等都可能成为 AI 答案来源，且不同平台占比波动明显。[RD-2][DATA-4][DATA-5]

### H2. 外部信源计划

| 渠道 | 目标 | 具体动作 | 风险控制 | 来源 |
|---|---|---|---|---|
| Reddit / 中文社区类比 | 真实问答与口碑线索 | 找到相关问题，提供不硬广的专业解释 | 禁止刷帖、虚假账号、引流过度 | [RD-1][RD-2][DATA-4] |
| 知乎 / 小红书 / 公众号 | 中文高意图内容分发 | 复用官网事实，适配平台语气，回链官网 | 不改核心事实 | [RD-2] |
| LinkedIn / 律师协会 / 目录站 | 实体一致性 | 建立 sameAs、个人资料、机构资料 | 信息必须一致 | [DATA-5][GH-4] |
| 行业媒体 / 客户案例 | 第三方佐证 | 发布匿名案例、方法论、访谈 | 不虚构客户或结果 | [GH-7][GH-8] |
| YouTube / 视频号 | 多模态信源 | 把流程、FAQ、案例做成短视频与文字稿 | 文字稿和官网一致 | [DATA-4][RD-2] |
| 评论 / 评价平台 | 服务可信度 | 鼓励真实评价，沉淀常见问题 | 禁止伪造评价 | [RD-2] |

### H3. Community Mention Tracker

系统应支持：

- 记录外部提及 URL。
- 标注提及类型：评论、问答、媒体、目录、视频、社交、论坛。
- 记录实体一致性：品牌名、城市、领域、联系方式是否一致。
- 记录是否被 AI 引用或转述。
- 生成“下一批可信提及任务”。

来源：Reddit 社区认为外部提及、真实讨论、目录/评论/比较页会增强 AI 对品牌的理解；Semrush 研究显示 Reddit 等 UGC 平台在 AI 搜索中有高引用地位。[RD-2][DATA-4][DATA-5]

---

## Epic I：报表与客户可解释性

### I1. 报表结构

| 报表模块 | 内容 | 来源 |
|---|---|---|
| Executive Summary | 本月 selection、absorption、Top3、转化追问、线索变化 | [GH-5][RES-4] |
| Prompt Performance | 每类 prompt 的平台表现、竞品、失败原因 | [DATA-1][GH-5] |
| Content Asset Score | 每个页面的 crawl / understand / cite / absorb 分数 | [GH-4][RES-4] |
| Source Influence Map | 哪些自站 / 外部来源被 AI 引用或转述 | [DATA-4][DATA-5] |
| Rewrite Experiment | 原文 vs 改写版的指标变化 | [GH-6][RES-2] |
| Action Plan | 下月要修哪些页面、发哪些内容、补哪些外部信源 | [GH-7][RES-5] |

### I2. 指标定义

| 指标 | 定义 |
|---|---|
| Mention Rate | 目标品牌被提及的 prompt / 总 prompt |
| Top3 Rate | 被列入前三推荐的 prompt / 总 prompt |
| Selection Rate | 被明确引用或作为来源的 prompt / 总 prompt |
| Absorption Rate | AI 答案吸收至少 1 个证据块的 prompt / 总 prompt |
| Evidence Coverage | 被吸收 evidence blocks / 应覆盖 evidence blocks |
| Fan-out Coverage | 页面覆盖 fan-out 子问题数量 / 总 fan-out |
| Conversion Follow-up Hit | 追问联系方式 / 收费 / 城市服务时命中正确 CTA |
| Source Diversity | AI 使用的来源类型数量：自站、Reddit、媒体、目录、视频、LinkedIn 等 |
| Drift Rate | AI 错误改写、夸大、遗漏合规边界的次数 / 被吸收次数 |

来源：Searchstack 的 prompt 级引用监测、citation absorption 的两阶段框架、Ahrefs fan-out 研究和 Semrush 多平台引用研究。[GH-5][RES-4][DATA-1][DATA-4]

---

## 7. 数据模型草案

> 以下为产品层数据实体，不绑定具体 ORM 字段。

| 实体 | 关键字段 | 用途 | 来源 |
|---|---|---|---|
| BrandEntity | name、aliases、website、industry、city、sameAs、contact、lawPracticeAreas | 品牌实体统一来源 | [GH-4][RD-2] |
| ContentAsset | brandId、url、type、title、summary、markdownUrl、lastModified、schemaTypes | 页面资产清单 | [GH-2][GH-3] |
| MarkdownTwin | assetId、markdown、tokens、headers、noindex、alternateLinkStatus | AI 可读页面 | [GH-2][GH-3] |
| EvidenceBlock | assetId、type、text、sourceUrl、confidence、expiresAt | absorption 对齐对象 | [RES-4] |
| PromptTarget | brandId、prompt、tier、intent、platforms、fanoutQueries | prompt 库 | [DATA-1][GH-7] |
| FanoutQuery | promptId、query、coveredAssetIds、gapStatus | 子问题覆盖 | [DATA-1] |
| CitationRun | brandId、platform、model、promptSet、startedAt、status | 一次监测任务 | [GH-5] |
| CitationSnapshot | runId、promptId、answer、sourceUrls、mentioned、rank、top3、sentiment | AI 答案快照 | [GH-5] |
| AbsorptionResult | snapshotId、selectedBlocks、score、drift、missingBlocks、repairHints | 吸收评分 | [RES-4][RES-5] |
| RewriteExperiment | assetId、platform、ruleSet、variant、beforeScore、afterScore、GEU、status | AutoGEO 实验 | [GH-6][RES-2] |
| SourceMention | brandId、url、platform、type、entityConsistency、aiCited | 外部可信信源 | [RD-2][DATA-4] |
| AuditFinding | assetId、layer、severity、reason、sourceIds、fixPlan | 诊断与修复 | [GH-4][RES-5] |

---

## 8. API 草案

| API | 方法 | 输入 | 输出 | 来源 |
|---|---|---|---|---|
| `/api/geo/assets/crawl` | POST | brandId、siteUrl | ContentAsset[] | [GH-4][GH-7] |
| `/api/geo/markdown/generate` | POST | assetId / url | MarkdownTwin | [GH-2][GH-3] |
| `/api/geo/llms/rebuild` | POST | brandId | llms、llmsFull、aiIndex | [GH-1][GH-3] |
| `/api/geo/audit-v2` | POST | brandId、url / sitemap | audit score、findings | [GH-4] |
| `/api/geo/prompts/research` | POST | brandId、industry、seedKeywords | PromptTarget[]、FanoutQuery[] | [GH-7][DATA-1] |
| `/api/geo/citation/run` | POST | brandId、promptSetId、platforms | CitationRun | [GH-5] |
| `/api/geo/citation/[id]` | GET | runId | snapshots、metrics | [GH-5] |
| `/api/geo/absorption/analyze` | POST | snapshotId | AbsorptionResult | [RES-4] |
| `/api/geo/rewrite/experiment` | POST | assetId、promptSetId、platform、strategy | RewriteExperiment | [GH-6][RES-2] |
| `/api/geo/source-mentions/import` | POST | URL list / CSV | SourceMention[] | [RD-2][DATA-4] |
| `/api/geo/report/monthly` | POST | brandId、dateRange | Markdown / PDF report | [GH-5] |

---

## 9. 页面与交互

### 9.1 控制台新增页面

| 页面 | 功能 | 核心状态 | 来源 |
|---|---|---|---|
| GEO 引用工程总览 | 北极星指标、selection、absorption、转化、趋势 | empty / loading / partial / healthy / critical | [GH-5][RES-4] |
| AI 可读层 | Markdown twin 覆盖率、llms、ai-index、schema 状态 | missing / generated / stale / error | [GH-2][GH-3] |
| Prompt 研究 | prompt 分层、fan-out、竞品引用、内容缺口 | draft / researched / monitored | [DATA-1][GH-7] |
| 引用监测 | 跨平台答案快照、提及、Top3、来源、情绪 | queued / running / done / failed | [GH-5] |
| 吸收分析 | evidence blocks 命中、drift、missing、repair hints | selected / absorbed / drift / missing | [RES-4][RES-5] |
| 改写实验 | 原文和改写版本对比、GEU、GEO score | baseline / candidate / winner / rejected | [GH-6][RES-2] |
| 外部信源 | 第三方提及、实体一致性、社区任务 | pending / verified / cited | [RD-2][DATA-4] |

### 9.2 关键 UX 要求

- 所有 AI 长任务必须后台化并可轮询。之前实测 MIMO 慢请求可达几十秒到两分钟，不能让用户停在不确定 loading。
- 所有来源、答案、引用 URL、证据块必须可展开查看，避免“黑盒分数”。
- 所有自动建议必须附带来源编号或检测依据。
- 对 `llms.txt` 必须展示“不是 Google 官方排名因子”的说明，防止销售误导。[GOOG-1][DATA-3][RD-1]

---

## 10. 实施阶段

### Phase 1：AI 可读基础设施

**目标**：让站点可被 AI 干净读取。

任务：

- Markdown twin 生成器。
- alternate link / noindex / content-type。
- `llms.txt` 自动重建。
- `llms-full.txt` 自动拼接。
- `ai-index.json`。
- GEO Audit v2 的技术层检查。

验收：

- 公开核心页面 95% 有 Markdown twin。
- `llms.txt` 100% 指向有效 Markdown URL。
- Audit v2 能识别 robots、CDN、JS、schema、markdown、llms 问题。

来源：[GH-1][GH-2][GH-3][GH-4][GOOG-1]

### Phase 2：Prompt 和引用监测

**目标**：让每个品牌知道 AI 在哪些问题里提到自己。

任务：

- Prompt Target Library。
- Fan-out Map。
- 跨平台 citation run。
- 答案快照。
- Top1 / Top3 / sentiment / sourceUrls。
- 追问转化。

验收：

- 每品牌默认生成 100 个 prompt。
- 至少 4 个平台能跑完并落库。
- 报表能展示 prompt 级趋势。

来源：[GH-5][DATA-1][GH-7]

### Phase 3：Citation Absorption

**目标**：把“有没有引用”升级为“有没有吸收”。

任务：

- Evidence Block 抽取。
- Absorption Score。
- Drift 检测。
- Missing Blocks。
- Repair Hints。

验收：

- 任意 AI 答案能显示吸收了哪些证据块。
- 能区分“被提到但没被吸收”和“被答案深度使用”。

来源：[RES-4][RES-3][RES-5]

### Phase 4：AutoGEO 改写实验

**目标**：用实验找到每个平台、每个领域的有效写法。

任务：

- Rule Set 管理。
- Rewrite variants。
- 回归 prompt。
- GEO / GEU / Absorption 对比。
- 胜出版本发布建议。

验收：

- 单页面可跑 baseline / structure / preference 三版本。
- 生成对比报告，并给出 winner / rejected 理由。

来源：[GH-6][RES-2][RES-6]

### Phase 5：外部可信信源闭环

**目标**：让品牌不只在自站可见，也在 AI 信任的外部语料中一致出现。

任务：

- Source Mention Tracker。
- Reddit / 知乎 / LinkedIn / 目录站 / 媒体 / 视频内容任务。
- Entity consistency 检查。
- 外部来源被 AI 引用监测。

验收：

- 每品牌至少 20 个外部信源记录。
- 每个信源可标注是否被 AI 引用或转述。

来源：[RD-2][RD-4][DATA-4][DATA-5]

---

## 11. 成功指标

| 指标 | MVP 目标 | 成熟目标 | 来源 |
|---|---:|---:|---|
| Markdown Twin 覆盖率 | 80% 核心页 | 95% 全公开页 | [GH-2][GH-3] |
| AI Readability Score | 平均 70+ | 平均 85+ | [GH-4] |
| Prompt 覆盖 | 每品牌 100 条 | 每品牌 500 条 | [GH-7][DATA-1] |
| Platform Coverage | 4 平台 | 12 平台 | [GH-5] |
| Mention Rate | 基线 +20% | 基线 +50% | [GH-5] |
| Top3 Rate | 基线 +10% | 基线 +30% | [GH-5] |
| Absorption Rate | 建立基线 | 基线 +30% | [RES-4] |
| Drift Rate | <10% | <3% | [RES-4][GOOG-1] |
| Rewrite Win Rate | 20% 页面有提升 | 50% 页面有提升 | [GH-6][RES-2] |
| External Source Diversity | 3 类 | 6 类 | [DATA-4][DATA-5] |

---

## 12. 风险与对策

| 风险 | 说明 | 对策 | 来源 |
|---|---|---|---|
| `llms.txt` 被误卖为排名因子 | 市场上有过度营销倾向 | 文案明确写“AI 可读目录，不是保证引用信号” | [GOOG-1][DATA-3][RD-1] |
| AI 平台波动 | Reddit / Wikipedia / LinkedIn 等引用源会快速变化 | 分平台趋势，不做全局平均结论 | [DATA-5] |
| 改写伤害长尾内容 | 通用 GEO 改写可能伤害某些页面 | 先诊断失败类型，再选修复方式 | [RES-5] |
| 虚假或夸大法律内容 | 律所行业合规要求高 | claim check、合规词库、免责声明、人工审核 | [GH-7][GOOG-1] |
| 外部社区运营变成垃圾推广 | Reddit 社区排斥硬广 | 只做真实专业回答，不自动刷帖 | [RD-1][RD-2] |
| MIMO / AI 调用慢 | 已实测长请求较慢 | 后台任务、队列、进度、重试、缓存 | 项目实测 |
| Prompt injection 风险 | 隐藏指令可能损害信誉 | 负面信号与 prompt injection 检测 | [GH-4] |

---

## 13. 验收清单

### 13.1 PRD 完成标准

- 每个 Epic 都有来源编号。
- 每个来源编号都能追溯到具体 GitHub / Reddit / 官方 / 论文 / 数据研究页面。
- 明确区分“有实验证据”“官方确认”“社区观点”“工程实践”。
- 明确写出 `llms.txt` 的边界。
- 明确写出 BrandGEO 的下一阶段实现顺序。

### 13.2 产品 MVP 验收

- 新建品牌后，可以完成：抓站 -> 生成 Markdown twin -> 重建 llms -> 审计 -> 生成 prompt -> 运行监测 -> 分析 absorption -> 给出修复建议。
- 任意报告可以追溯到原始 AI 答案、原始页面、证据块、来源编号。
- 任何优化建议都不能只写“优化内容”，必须写清：修哪个页面、补哪个 evidence block、解决哪个 prompt/fan-out、预期改善哪个指标。

---

## 14. 来源到需求追踪矩阵

| 来源 | 落地到哪些需求 |
|---|---|
| GH-1 AnswerDotAI/llms-txt | A2、A3、AI 可读目录 |
| GH-2 dualmark | A1、Phase 1、Markdown twin |
| GH-3 aeo.js | A2、A3、构建产物 |
| GH-4 geo-optimizer-skill | B1、B2、B3、风险检测 |
| GH-5 searchstack-aeo | D1、D2、I1、I2、报告 |
| GH-6 AutoGEO | G1、G2、G3、Phase 4 |
| GH-7 gtm-engineer-skills | C1、F1、F3、Phase 2 |
| GH-8 seo-geo-claude-skills | 内容质量、可信度、门禁 |
| GOOG-1 Google AI features | 不神化 AI 文件、基础 SEO、结构化数据一致性、文本可访问 |
| RES-1 GEO KDD | GEO 正当性、领域特定优化 |
| RES-2 AutoGEO paper | 引擎偏好规则、GEO/GEU |
| RES-3 GEO-SFE | 结构优化、分块、视觉强调 |
| RES-4 Citation Absorption | selection / absorption、证据块 |
| RES-5 Citation Failure | 失败诊断、针对性修复 |
| RES-6 FeatGEO | feature-level 多目标优化 |
| DATA-1 Ahrefs fan-out | prompt fan-out、title / URL / snippet 匹配 |
| DATA-2 Ahrefs freshness | 更新周期、新鲜度指标 |
| DATA-3 OtterlyAI llms | `llms.txt` 边界与权重下调 |
| DATA-4 Semrush Reddit | 外部社区信源、Reddit 监测 |
| DATA-5 Semrush domains | 多平台来源差异和波动 |
| RD-1 Reddit llms debate | 销售边界、不要神化 llms |
| RD-2 Reddit AI visibility strategies | 第三方提及、清晰问答、实体一致性 |
| RD-3 Reddit Ahrefs thread | Google 候选池 vs fan-out 引用选择的社区判断 |
| RD-4 Reddit Business GEO | 社区内容作为 AI visibility 素材入口 |

---

## 15. 下一步建议

建议先实现 Phase 1 和 Phase 3 的最小组合：

1. Markdown twin。
2. `llms.txt` 自动重建。
3. Evidence Block 抽取。
4. Absorption Score。
5. Audit v2 把 `llms.txt` 从“关键排名信号”改成“AI 可读目录信号”。

理由：

- BrandGEO 当前已经有 AI 调用、监测和内容生成；最缺的是“页面能否被 AI 干净读取”和“AI 是否吸收了页面事实”。
- 这两个能力可以显著区别于市面上只做 `llms.txt` 检查或只做 AI 内容生成的工具。
- 这两个能力都有明确 GitHub 工程参考和论文支撑。[GH-2][GH-3][RES-4][GOOG-1]
