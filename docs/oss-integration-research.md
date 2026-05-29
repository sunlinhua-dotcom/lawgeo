# AceFlow 各功能模块 → GitHub 开源替代/增强 选型调研

> 调研日期：2026-05-29　|　目标：把 AceFlow（见 `aceflow-deep-clone-spec.md`）的每个功能模块，对应到 GitHub 上最成熟的开源项目，能用的「全部包装进去」。
> 工程策略：**不直接 vendor 5 个重型仓库**，而是建一套 **可插拔 Provider 适配层**（`src/lib/providers/`）——每个能力 = 接口 + 内置实现（现有）+ 外部 OSS 实现（env 开关）+ 优雅降级。这样既能立刻用上最好的 OSS，又不绑死、可渐进部署。

---

## 1. 模块 → OSS 决策总表

| # | AceFlow 模块 | 最佳 OSS | Stars/成熟度 | License | 我们的决策 |
|---|---|---|---|---|---|
| 1 | 多平台 AI 调用 / 模型网关 | **LiteLLM**（BerriAI） | 极高，100+ 模型，生产级 | MIT | 🟢 **立即接入**（gateway adapter，OpenAI 兼容，含成本追踪） |
| 2 | 网站画像 / 竞品抓取 / 域名诊断抓取 | **Firecrawl**（自部署）/ **Crawl4AI** | Firecrawl 110k★ / Crawl4AI 58k★ | AGPL / Apache | 🟢 **立即接入**（scraper adapter，JS 渲染→干净 markdown+截图） |
| 3 | 实时查询 / AI 引用监测（提及/Top1/3/关键词） | **gego**（prompt 调度+关键词抽取）+ **AutoGEO**（改写规则 ICLR'26） | 新但思路成熟 | MIT | 🟡 **借鉴算法 + 自建**（已有 compare/monitor，补 gego 式定时调度 + 关键词抽取） |
| 4 | 真机/云手机截图抓取（可信证据链） | **Skyvern**（视觉 LLM 浏览器）/ **browser-use** / **Steel** | Skyvern 高 / browser-use 极高 | AGPL / MIT | 🟡 **适配接口 + 可选自部署**（默认降级到 LLM 模拟；接 Skyvern 后出真截图） |
| 5 | 品牌知识库 RAG | **RAGFlow**（深度文档理解）/ **Dify** | RAGFlow 极高 | Apache | 🟡 **适配接口 + 可选**（默认用内置 SQLite 关键词 RAG；接 RAGFlow 升级深度文档） |
| 6 | 多平台发布 | **Postiz**（海外 30k★）+ Wechatsync（中文，已接） | Postiz 极活跃 | Apache(AGPL) | 🟡 **adapter 接入 Postiz**（海外）+ 保留 Wechatsync（中文）+ Dev.to/Hashnode/Medium（已接） |
| 7 | 内容改写/GEO 优化规则 | **AutoGEO** rules（ICLR'26，+50% 可见度） | 论文级 | — | 🟢 **借鉴 prompt 规则**注入我们的 7 维评分生成器 |
| 8 | Agent 工作流编排 | **Dify** / n8n / LangGraph | 极高 | — | ⚪ 已有自研 Agent 编排，暂不替换 |

> 图例：🟢 本轮直接实现　🟡 建适配接口+文档（可选自部署）　⚪ 暂不动

---

## 2. 关键项目详情

### 2.1 LiteLLM — 统一模型网关 ⭐ 本轮接入
- repo: `github.com/BerriAI/litellm`
- 价值：一个 OpenAI 兼容端点调 100+ 模型（deepseek/qwen/doubao/claude/gpt/gemini…），自带**成本追踪、限流、负载均衡、虚拟 key、多租户花费统计**——正好补 AceFlow 的 token 计费。
- 接入方式：自托管 LiteLLM Proxy（Docker）→ 我们 `lib/ai.ts` 把 baseURL 指向它即可（已是 OpenAI 协议）。无 key 时降级回 MIMO 直连。
- env：`LLM_GATEWAY_URL`、`LLM_GATEWAY_KEY`。

### 2.2 Firecrawl / Crawl4AI — 网页抓取 ⭐ 本轮接入
- repo: `github.com/firecrawl/firecrawl`（自托管设 `FIRECRAWL_API_URL`）/ `github.com/unclecode/crawl4ai`
- 价值：JS 渲染 SPA → 干净 LLM-ready markdown + **截图** + 结构化抽取。我们的域名诊断、网站画像（`/insight/debug/website-profile`）、竞品页抓取全靠它。
- 接入：scraper adapter。无配置时降级到内置 `fetch + 正则`（现有 audit 逻辑）。
- env：`FIRECRAWL_API_URL`、`FIRECRAWL_API_KEY`。

### 2.3 Skyvern / browser-use / Steel — 真机/浏览器抓取
- repos: `github.com/Skyvern-AI/skyvern`（视觉，截图驱动）、`github.com/browser-use/browser-use`（DOM，WebVoyager 89%）、`github.com/steel-dev/steel-browser`（浏览器沙箱 API）
- 价值：AceFlow 最硬的「可信证据链」——真实在豆包/元宝里提问→**截图存档**→判断是否 Top1/被提及。
- 接入：`crawlAnswer(platform, question)` adapter 接口。默认实现 = LLM 模拟（现有）；接 Skyvern/Steel 后返回真截图 `screenshot_path` + `archive_url`。
- env：`BROWSER_AGENT_URL`（Skyvern/Steel 自部署地址）。

### 2.4 RAGFlow — 深度知识库
- repo: `github.com/infiniflow/ragflow`
- 价值：深度文档理解（Word/PDF/扫描件/网页/表格），引用接地，RAPTOR/AHC。比我们内置 SQLite 关键词 RAG 强很多。
- 接入：knowledge adapter `ingest/retrieve` 接口；默认内置实现，接 RAGFlow 后走其 API。
- env：`RAGFLOW_API_URL`、`RAGFLOW_API_KEY`、`RAGFLOW_DATASET_ID`。

### 2.5 Postiz — 海外多平台发布
- repo: `github.com/gitroomhq/postiz-app`
- 价值：15+ 海外平台（X/LinkedIn/Reddit/Mastodon/Threads/Bluesky…）排期发布，AI 辅助。补我们 Dev.to/Hashnode/Medium 之外的社媒。
- 接入：publish adapter 增加 `postiz` provider；中文继续走 Wechatsync。
- env：`POSTIZ_API_URL`、`POSTIZ_API_KEY`。

### 2.6 gego / AutoGEO — GEO 算法借鉴
- gego `github.com/AI2HU/gego`：cron 调度 prompts → 跨 LLM → **自动抽取关键词** → 统计哪些品牌/词被提及最多。直接对标 AceFlow 实时查询+监测。借鉴其「prompt 调度 + 关键词抽取 + SQLite 配置」结构。
- AutoGEO `github.com/cxcscmu/AutoGEO`（ICLR'26）：自动学习生成引擎偏好规则，改写内容 +50% 可见度。借鉴其改写规则注入我们的内容生成 prompt。

---

## 3. 适配层架构（src/lib/providers/）

```
src/lib/providers/
  types.ts            # 各能力的统一接口定义
  llm.ts              # LLM 网关：builtin(MIMO) | litellm gateway
  scraper.ts          # 网页抓取：builtin(fetch) | firecrawl | crawl4ai
  answer-crawler.ts   # 真机答案抓取：builtin(LLM 模拟) | skyvern | steel
  knowledge.ts        # RAG：builtin(SQLite) | ragflow
  publisher.ts        # 发布：builtin(devto/hashnode/medium) | postiz | wechatsync
  index.ts            # 按 env 选择 provider + 降级
```

**核心原则**：每个能力都有 `builtin` 兜底，外部 OSS 通过 env 开关激活；任何 OSS 不可用都自动降级，不阻断主流程。这样「全部包装进去」= 全部留好接口 + 高 ROI 的两个（LiteLLM、Firecrawl）本轮直接跑通。

---

## 4. 本轮落地范围

| 任务 | 状态 |
|---|---|
| Provider 适配框架 + 类型 | 本轮 |
| LiteLLM 网关 adapter（接 lib/ai.ts） | 本轮 |
| Firecrawl scraper adapter（接 audit/website-profile） | 本轮 |
| answer-crawler / knowledge / publisher 适配接口 + 降级 + 文档 | 本轮（接口+文档，自部署可选） |
| AutoGEO 改写规则注入内容生成 | 本轮（prompt 增强） |
| Skyvern/RAGFlow/Postiz 真实自部署联调 | 待用户提供自部署地址后启用 |

---

## 信息来源
- LiteLLM: https://github.com/BerriAI/litellm
- Firecrawl: https://github.com/firecrawl/firecrawl ｜ Crawl4AI: https://github.com/unclecode/crawl4ai
- Skyvern: https://github.com/Skyvern-AI/skyvern ｜ browser-use: https://github.com/browser-use/browser-use ｜ Steel: https://github.com/steel-dev/steel-browser
- RAGFlow: https://github.com/infiniflow/ragflow ｜ Dify: https://github.com/langgenius/dify
- Postiz: https://github.com/gitroomhq/postiz-app ｜ Mixpost: https://github.com/inovector/mixpost
- gego: https://github.com/AI2HU/gego ｜ AutoGEO: https://github.com/cxcscmu/AutoGEO ｜ awesome-GEO: https://github.com/DavidHuji/Awesome-GEO
