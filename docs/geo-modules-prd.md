# GEO 核心模块 PRD（对标 AceFlow，全部建成可跑功能）

> 范围：除「代理商工作台 + 多租户分销」外，AceFlow 登录后的全部 GEO 模块。
> 复用优先：能用成熟 OSS 就用（见 docs/oss-integration-research.md 的适配层）；没有就自建。
> AI 统一走 MIMO（用户唯一 API）。验收：每模块都有 API + Dashboard 页 + 落库 + build 绿 + smoke test。

---

## 0. 品牌上下文（地基，轻量版）

不做多租户分销链，但 GEO 模块需要一个「品牌」作为操作单元。

- `brands`：用户级。字段 name / website / industry / region / description。
- 顶部/侧栏「品牌切换器」选当前品牌，所有 GEO 模块 gate by brand（无品牌则引导建一个）。
- 复用：无需 OSS，自建。

---

## 1. 实时查询 + 追问转化命中（M1，杀手锏）

**PRD**：输入「问句 + 目标词（品牌/人名）」→ 选平台（豆包/DeepSeek/通义/元宝）→ 每平台跑：
1. 提问取答案 → 判断是否提及目标词、是否 Top1/Top3、排名
2. 情感分析（positive/neutral/negative）+ 抽取关键词
3. **追问转化**：若提及，自动追问「联系方式是什么」→ 看 AI 是否吐出品牌的转化目标（电话/微信）→ 命中=`followup_hit`（一次转化）
4. 真截图（配 Skyvern 时）/ 存档 URL

- 数据：`realtime_searches`(主) + `realtime_results`(每平台一行，含 followup 字段)。
- 复用：answer-crawler provider（builtin=MIMO 模拟，配 BROWSER_AGENT_URL=真机截图）。无直接 OSS，自建逻辑。
- UI：`/dashboard/realtime` 表单 + 结果卡（每平台展开答案/情绪/关键词/追问/转化）+ 历史。

## 2. 洞察与诊断引擎（M2）

**PRD**：create(品牌名/行业/种子关键词/官网) → 异步任务 → 报告：
- 网站画像（抓官网→提炼品牌事实）
- 竞品分析（谁在 AI 答案里被引用）
- 信源分析（哪些站点/媒体支撑了竞品）
- 热词资产（关键词 + GEO 热度等级，用 aiSearchHeat 阈值）
- 品牌问题清单 → 转成待办任务/内容选题

- 数据：`insights`(任务+进度+报告 JSON)。
- 复用：Firecrawl 抓官网/竞品页 + MIMO 分析。
- UI：`/dashboard/insight` 列表 + create + 报告详情。

## 3. 定位搜索意图库 + GEO 热度指数（M3）

**PRD**：持久意图词库。每条意图词带 intent_type(信息/商业/导航/交易)、search_volume、geo_index、heat_level、priority。
- 从洞察/关键词矩阵导入；可手动增删。
- 「刷新 GEO 指数」：用 aiSearchHeat 阈值（≥35k高/≥18k中高/≥8k中等/<8k长尾）算 heat_level；geo_index 用 MIMO 评估「该词在 AI 搜索里被触发的概率 0-100」。

- 数据：`intents`。
- UI：`/dashboard/intent` 表格 + 批量导入 + 刷新指数。

## 4. 内容创作分步向导 + 7 维 GEO 评分（M4）

**PRD**：3 步向导：
- step1：选意图词 + 生成/选标题
- step2：生成正文（流式）+ **7 维评分**：标题分 / 首段直答分 / 去AI味分 / 结构分 / 权威性分 / 匹配分 / 转化分 + 总分
- step3：发布（复用已有多平台发布）

- 评分用 MIMO 做 rubric 打分（每维 0-100 + 理由），落 `content_articles.scores`。
- 复用：现有 /api/generate + AutoGEO 改写规则注入 prompt。
- UI：`/dashboard/content`（向导）。

## 5. 数据监测追踪：品牌雷达 + 情绪 + 转化漏斗（M5）

**PRD**：品牌在 4 平台的持续表现看板：
- 核心指标：提及率/Top1率/Top3率/可见度
- 品牌雷达（多维 Radar：可见度/推荐度/情绪/权威/转化）
- 情绪分布（饼/堆叠）
- 转化漏斗（曝光→提及→Top3→追问→命中）
- 每日监测开关 + 信源资产 + 趋势

- 复用：Recharts（RadarChart/PieChart/FunnelChart）+ realtime_results / ai_queries 聚合。
- UI：升级 `/dashboard/monitor`。

## 6. AI 品牌资产看板 + 转化画像（M6）

**PRD**：品牌资产总览（核心资产指标/热词资产/信源资产/内容资产/品牌雷达）+ **转化画像配置**：品牌的转化目标（电话/微信/官网 CTA），供实时查询追问命中匹配。

- 数据：`brand_conversion_profiles`（电话/微信/关键词/CTA 文案）。
- UI：`/dashboard/brand-assets`。

## 7. 知识库增强（M7）

**PRD**：在现有 RAG 上加 QA 批量导入（Excel/CSV 粘贴）、媒体上传占位。复用现有 knowledge provider（builtin/RAGFlow）。

## 8. Token 计费计量（M8）

**PRD**：token 钱包 + 流水。每次 AI 调用按 usage.totalTokens 记一条 `token_ledgers`，扣 `token_wallet.balance`。Dashboard 展示余额/流水/本月消耗。复用现有 usage 表思路扩展。

---

## 复用 OSS 一览

| 模块 | 复用 |
|---|---|
| 洞察抓取 | Firecrawl（已接 scraper adapter）|
| 真机截图 | Skyvern/Steel（已接 answer-crawler adapter）|
| 知识库 | RAGFlow（已接 knowledge adapter）|
| 模型 | MIMO 统一（已接 llm adapter）|
| 图表 | Recharts（已装）|
| 热度算法 | AceFlow aiSearchHeat 阈值（逆向得到）|
| 内容改写规则 | AutoGEO（ICLR'26，prompt 注入）|
| 实时查询追问转化 | 无直接 OSS → 自建 |
| 品牌雷达/转化漏斗 | Recharts 自建 |

每个能用 OSS 的都走适配层（配 env 即启用，否则 builtin）。自建的部分在本 PRD 定义清楚后实现。
