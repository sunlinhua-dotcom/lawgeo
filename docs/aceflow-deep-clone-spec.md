# AceFlow 深度复刻开发规格书

> 逆向来源：登录 `https://www.aceflow.top` 真实后台（账号「蔡炜 / 代理商」）+ 前端 JS bundle 静态分析
> 抓取日期：2026-05-29　|　线上版本：**v1.3.5**（2026-05-22「加入 AI 指数算法，可评估词的热度」）
> 本文档目标：把 AceFlow 后台的**每一个功能模块、每一条 API、调用的平台、用到的模型、数据结构、权限**记录到可直接复刻的粒度。

---

## 0. 一句话定性

AceFlow 是一套 **多租户 SaaS 的 GEO（生成式引擎优化）全链路系统**，把"让品牌被 AI 搜索（豆包 / DeepSeek / 通义 / 元宝）优先提及、推荐、Top1"做成了一条可量化的工业流水线：

```
洞察诊断 → 定位意图词 → AI 内容创作（7 维打分）→ 多平台发布 → 数据监测追踪（提及率/Top3/情绪/转化漏斗）
                                    ↑ 品牌知识库(RAG) 全程注入
```

并在上面叠了一套 **平台 → 代理商 → 企业 → 品牌** 的四级分销/白标体系 + Token 计费。

---

## 1. 技术栈（线上实测）

| 层 | 实现 | 证据 |
|---|---|---|
| 前端框架 | **React + Vite**（SPA，代码分割 lazy import） | `vendor-react-*.js`、`index-*.js`、每个页面独立 chunk |
| UI 组件库 | **Ant Design**（antd） | `vendor-antd-CipnmHT9.js`（1.4MB） |
| 图标 | **lucide-react** | `createLucideIcon-*.js` + 每图标单独 chunk |
| 路由 | React Router（SPA 客户端路由，`path:"insight/report/:id"` 等） | index.js 路由表 |
| 状态/上下文 | `BrandContext`（当前公司/品牌）、`MessageCenterContext`、`AuthContext` | 独立 chunk |
| 鉴权 | **Bearer Token**，存 `localStorage["geo:authToken"]`，请求头 `Authorization` | uploadKeywordsFile 源码 |
| 白标/OEM | `GET /api/white-label/config?domain=` 按域名返回 logo/配色 | `WhiteLabelLogo` 组件 |
| 流式输出 | SSE/stream（内容生成 onContentChunk、网站画像 stream） | `/generate/content/stream`、`/insight/debug/website-profile/stream` |
| 截图/抓取 | 推测 **云手机集群**（admin 有 `cloudphones` 路由）+ 截图存档 `screenshot_path` | 路由表 + 数据模型 |
| 后端 | （未直接可见）API 全在 `/api/*`，REST 风格 | 全站请求 |

> 我们的 lawgeo 用 Next.js 16 + Drizzle + SQLite。复刻时**前端组件结构可 1:1 参考，后端 API 路径与数据结构按本文档对齐**。

---

## 2. 多租户与权限体系

### 2.1 四级账号模型

```
平台(admin) ── 代理商(agent) ── 企业(company) ── 品牌(brand) ── 行业(industry)
   超管          经销/白标         租户             优化对象        归类
```

- 当前登录账号 **蔡炜** 角色 = **代理商(agent)**，落地页 = `/agents`「代理商工作台」。
- 代理商工作台 4 个 Tab：**下游企业 / 企业账务 / 邀请码 / 下级代理申请**。
- 代理商「新建企业开户」会**同步创建企业 owner 登录账号**（一条龙开户）。
- 顶栏有「**未选择公司 / 未选择品牌**」全局切换器——所有 GEO 模块都被品牌上下文 gate；没选品牌时 GEO 菜单只高亮不进入。
- `POST /api/auth/switch_company` 切换当前公司上下文。

### 2.2 RBAC 权限点（前端路由 guard 实测）

| 权限 key | 控制的功能 |
|---|---|
| `insight.create` | 创建洞察诊断 |
| `insight.view` | 查看洞察报告 |
| `content.generate` | AI 内容生成 |
| `monitoring.view` | 数据监测查看 |
| `realtime_search.use` | 实时查询工具 |

- `GET /api/auth/access-context` 返回当前账号的权限集 + 可访问的公司/品牌范围。
- 前端用 `<R permission="insight.create">` 包裹路由做前端 guard（后端必须再校验一次）。

---

## 3. 完整路由表（前端实测）

### 3.1 终端用户/代理商可见

| 路由 | 模块 | 中文菜单 | 分组 |
|---|---|---|---|
| `/aibrand` | AI 品牌资产看板 | AI品牌资产 | AI品牌资产 |
| `/insight` | 洞察列表 | 洞察与诊断 | GEO优化 |
| `/insight/create` | 新建洞察诊断 | — | |
| `/insight/report/:id` | 洞察报告详情 | — | |
| `/insight/search-detail` | 信源/搜索明细 | — | |
| `/insight/website-debug` | 网站画像调试 | — | |
| `/insight/share/:token` | 洞察报告公开分享页 | — | |
| `/intent` | 定位搜索意图（意图词库） | 定位搜索意图 | GEO优化 |
| `/content` | 内容创作列表 | 内容创作及发布 | GEO优化 |
| `/content/create` | 新建内容计划 | — | |
| `/content/:planId/step/:step` | 内容创作分步向导（step 1/2/3） | — | |
| `/content/:id/success` | 内容生成完成页 | — | |
| `/monitoring` | 数据监测追踪 | 数据监测追踪 | GEO优化 |
| `/tools/realtime-search` | 实时查询 | 实时查询 | 工具 |
| `/tools/realtime-search/history` | 实时查询历史 | — | |
| `/knowledge` | 品牌知识库 | （隐藏入口） | |
| `/agents` | 代理商工作台 | — | |
| `/billing` `/recharge` `/subscriptions` | 计费/充值/套餐 | — | |
| `/messages` | 消息中心 | — | |
| `/account` `/users` | 账号/成员 | — | |
| `/s/:code` `/register/agent` `/register/company` | 邀请码注册/代理注册/企业注册 | — | 公开 |

### 3.2 平台 admin 专属（蔡炜无权限，路由存在）

`admin/` 下：`agent/workspace`、`agents`(代理管理)、`companies`、`companies/monitoring`、`customers`、`partners`(合作伙伴)、`orders`、`subscriptions`、`content-publishing`(代发内容运营)、`content-learning`(内容学习/训练)、`media-market`(媒体市场)、`owned-media/accounts`、**`cloudphones`(云手机集群)**、`conversion`(转化)、`alerts`(告警)、`audit-logs`(审计日志)、`diagnosis`、`settings`、`users`。

> **关键发现**：admin 有 `cloudphones`（云手机）——AceFlow 极可能用**真机/云手机农场**去真实地在豆包/DeepSeek/元宝 App 里提问、截图、存档，而不是纯 API。这解释了数据模型里的 `screenshot_path`、`archive_url`、`skip_crawl`。

---

## 4. 监测的 AI 平台（核心！）

默认监测 4 个国内 AI 平台，`app_types` 枚举：

| slug | 中文 | 默认推荐 |
|---|---|---|
| `doubao` | 豆包（字节） | ✅ |
| `deepseek` | DeepSeek | ✅ |
| `qwen` | 通义千问（阿里） | ✅ |
| `yuanbao` | 腾讯元宝 | ✅ |

- 默认 `app_types = ["doubao","deepseek","qwen","yuanbao"]`。
- 每个平台结果存档 `archive_url`（如 `/archive/doubao`），带平台截图。
- **前端 bundle 里没有出现具体大模型名（gpt/claude 等）**——模型调用全在后端，前端只见平台 slug。复刻时这是关键：对外暴露「平台」，模型在后端可换。

---

## 5. 功能模块逐一拆解（API + 参数 + 数据结构）

> API base = `/api`。HTTP helper：`g=GET, p/t=POST, m=PUT, v=DELETE`。
> 所有 GEO 接口都隐含 `brand_id` 上下文。

### 5.1 洞察与诊断 `/insight`

**作用**：回答三个问题——「用户在问什么 / 竞品被谁引用 / 品牌现在该补哪类页面」。是整条流水线的起点。

| 方法 | 端点 | 说明 |
|---|---|---|
| POST | `/insight/create` | 创建诊断。参数：`brand_name, industry, customer_keywords, customer_keywords_file, brand_website` |
| POST | `/insight/upload-keywords-file` | 上传关键词文件（multipart `file`） |
| GET | `/insight/list` | 洞察列表 |
| GET | `/insight/{id}` | 报告详情 |
| GET | `/insight/{id}/progress` | 诊断进度（异步任务轮询） |
| POST | `/insight/{id}/retry` | 重试 |
| POST | `/insight/{id}/cancel` | 取消 |
| POST | `/insight/{id}/analyze-competitors` | 竞品分析（谁被 AI 引用） |
| POST | `/insight/{id}/analyze-sentiment` | 情感分析 |
| GET | `/insight/{id}/fallback-keyword` | 兜底关键词建议 |
| GET/POST | `/insight/{id}/brand_issue/tasks` | 品牌问题 → 待办任务 |
| POST | `/insight/{id}/share-link` | 生成公开分享链接 → `/insight/share/:token` |
| GET | `/insight/report/{id}` | 报告页数据 |
| POST | `/insight/debug/website-profile/stream` | 网站画像（流式，爬官网→提炼品牌事实） |

报告内含：竞品分析、信源分析、热词资产（带 AI 热度等级）、品牌问题清单、内容选题建议、发布渠道建议。

### 5.2 定位搜索意图 `/intent`

**作用**：把品牌相关搜索拆成「意图词」，每个意图词带 **AI 热度指数（GEO Index）**，决定优先做哪些。

| 方法 | 端点 | 说明 |
|---|---|---|
| GET | `/intents` | 意图词列表 |
| GET | `/intents/{id}` | 意图详情 |
| POST | `/intents` | 新增意图 |
| POST | `/intents/batch-delete` | 批量删除 |
| POST | `/intent-geo-index/refresh` | **刷新 GEO 指数**（v1.3.5 新算法） |
| GET | `/brands/{id}/intent_stats` | 意图维度统计 |

意图词字段：`intent_text, intent_type(商业/信息意图), geo_index, geo_index_score, geo_index_status, heat_level, search_volume`。

**AI 搜索热度算法（前端 `aiSearchHeat` 实测阈值）：**
```
search_volume ≥ 35000  → 高热度   (红)  "搜索需求强，适合优先布局，竞争也更高"
            ≥ 18000  → 中高热度 (橙)  "需求较明确，较高优先级优化"
            ≥  8000  → 中等热度 (黄)  "稳定长尾需求，精准内容覆盖"
            <  8000  → 长尾热度 (灰)  "需求更窄，结合业务匹配度判断"
```

### 5.3 内容创作及发布 `/content`

**作用**：把意图词 → 生成 AI 友好文章，并用 **7 维 GEO 评分**量化质量；支持流式、改写、批量。

**分步向导**：`/content/create` → `step 1`（选意图/标题）→ `step 2`（生成+评分）→ `step 3`（发布）→ `success`。

| 方法 | 端点 | 参数 / 说明 |
|---|---|---|
| POST | `/generate/titles` | 生成候选标题 |
| POST | `/generate/titles/select` | 选定标题 |
| POST | `/generate/content` | 生成正文。参数：`plan_id, title, intent, keywords[], target_platform_slug` |
| POST | `/generate/content/stream` | **流式**生成（`onContentChunk/onSummary/onKbWarning/onScores`） |
| POST | `/generate/content/rewrite` | 改写。参数：`article_id, original_content, instruction, intent`（流式 `onStep`） |
| POST | `/generate/content/tasks/batch` | **批量**：`plan_id, intent, titles[], keywords[], target_platform_slugs[]`（一次多标题×多平台） |
| GET | `/generate/content/tasks` | 任务列表（`plan_id, task_ids`） |
| GET | `/generate/content/tasks/{id}` | 单任务状态 |

**7 维 GEO 评分（生成结果 `scores`）：**
```
total            总分
title_score      标题分
first_para_score 首段直答分      ← GEO 核心：AI 摘要先抓首段
de_ai_score      去 AI 味分      ← 越像人写越高
structure_score  结构分          ← H2/H3/列点/表格
authority_score  权威性分        ← 事实密度/来源
match_score      匹配分          ← 与意图词匹配
conversion_score 转化分          ← 是否含 CTA/联系方式
```
- `onKbWarning`：生成时若品牌知识库覆盖不足会预警 → 提示上传问答资料（Excel/CSV）。

### 5.4 多平台发布（自有媒体）`/owned-media` `/pfw`

| 方法 | 端点 | 说明 |
|---|---|---|
| GET | `/owned-media/platforms` | 可发布平台枚举（含 163.com / sohu.com / toutiao.com / wechat / wemedia 自媒体） |
| GET/POST | `/owned-media/accounts` | 绑定的自媒体账号 |
| POST | `/owned-media/accounts/{id}/unbind` | 解绑 |
| POST | `/owned-media/accounts/refresh-request` | 刷新账号登录态 |
| GET/POST | `/owned-media/publish-jobs` | 发布任务 |
| GET | `/owned-media/publish-jobs/{id}` | 任务详情 |
| POST | `/owned-media/targets/{id}/retry` | 重试 |
| POST | `/owned-media/targets/{id}/cancel` | 取消 |
| POST | `/owned-media/targets/{id}/capture-url` | 回填已发布 URL |
| POST | `/owned-media/targets/{id}/manual-complete` | 手动标记完成 |
| GET | `/pfw/sources` `/pfw/sources/recommended` `/pfw/sources/recent-published` `/pfw/sources/enum/options` | 信源市场（platform-for-write，推荐信源/已发信源） |
| (admin) | `/admin/content-publishing/orders` `/overview` `/failures` `/media-ranking` `/orders/{id}/refund` | 代发运营后台 |

> 发布既支持**自有账号自动发**，也支持**平台代发（下单付费）**——`content-publishing/orders` + refund。

### 5.5 数据监测追踪 `/monitoring` `/monitor/tasks` `/brands/{id}/*`

**作用**：持续追踪品牌在 4 大 AI 平台的表现，形成可复盘闭环。

| 方法 | 端点 | 说明 |
|---|---|---|
| GET/POST | `/monitor/tasks` | 监测任务 |
| GET | `/monitor/tasks/{id}/details` | 明细 |
| GET | `/monitor/tasks/{id}/sources` | 信源 |
| GET | `/monitor/tasks/{id}/sentiment` | 情绪 |
| POST | `/monitor/tasks/{id}/retry` | 重试 |
| GET | `/brands/{id}/dashboard` | 品牌雷达/核心指标（`time_range, platforms, intent_ids, sections`） |
| GET | `/brands/{id}/trends` | 趋势图 |
| GET | `/brands/{id}/sentiment` + `/sentiment/keyword-records` | 情绪分布 + 关键词记录 |
| GET | `/brands/{id}/media_sources` | 信源资产 |
| GET | `/brands/{id}/assets` + `/assets/history` | 内容资产 + 历史 |
| POST | `/brands/{id}/assets/snapshot` | 资产快照 |
| GET | `/brands/{id}/intent_stats` | 意图统计 |
| GET/POST | `/brands/{id}/daily_monitoring` + `/daily_monitoring/issues` | **定时监测开关** + 每日问题 |
| GET | `/brands/daily_monitoring/list` | 已开启定时监测的品牌 |
| GET/POST | `/brands/{id}/monitoring/(status\|retry)` | 监测状态/重试 |

**核心指标**：`mention_rate`(提及率)、`top1_rate`、`top3_rate`、`visibility`、情绪分布(positive/negative/neutral)、转化漏斗(funnel)、品牌雷达(radar)。

### 5.6 实时查询 `/tools/realtime-search`（最能体现产品力的模块）

**作用**：输入一个问题 + 目标词（品牌/人名），实时在 N 个 AI 平台提问，看是否被提及、排名、情绪，并**追问测转化**。

| 方法 | 端点 | 说明 |
|---|---|---|
| POST | `/realtime_search/run` | 发起。见下方 payload |
| GET | `/realtime_search/tasks` | 历史任务 |
| GET | `/realtime_search/tasks/{id}` `/details` `/sources` `/sentiment` | 详情 |
| POST | `/realtime_search/tasks/{id}/retry` `/cancel` | 重试/取消 |

**`/realtime_search/run` 请求体（实测 demo）：**
```json
{
  "question": "成都离婚律师哪个好",
  "target_word": "李航律师",
  "app_types": ["doubao","deepseek","qwen","yuanbao"],
  "count": 1,                       // 每平台查询次数
  "skip_crawl": false,              // 是否跳过真实抓取
  "brand_id": 123,
  "followup_trigger_word": "李航律师"  // 命中后追问触发词
}
```

**单平台结果数据结构（实测）：**
```json
{
  "platform": "doubao",
  "status": "completed",
  "answer": "成都离婚律师选择时……李航律师在复杂离婚……适合进一步咨询。",
  "screenshot_path": "/output/.../realtime-doubao.png",  // 真机截图
  "archive_url": "https://.../archive/doubao",            // 存档
  "is_mentioned": true, "is_recommended": true,
  "is_top3": true, "is_top1": true, "rank": 1,
  "mention_count": 1,
  "sentiment": "positive",
  "keywords": ["李航律师","证据梳理","财产方案"],
  "collected_at": "...",
  "share_url": "https://.../share/realtime-doubao",
  "followup_triggered": true,
  "followup_question": "李航律师的联系方式是什么？",
  "followup_answer_text": "可以通过 13438016928 咨询李航律师。",
  "followup_screenshot_path": "...-followup.png",
  "conversion_targets_text": "13438016928",
  "conversion_matched_targets": ["13438016928"],
  "is_converted": true,
  "conversion_status": "followup_hit"     // 追问命中联系方式=转化
}
```
> 这是整个产品的"杀手锏"：不只看品牌有没有被提，还**模拟用户追问，验证 AI 会不会把联系方式吐出来 → 定义为一次"转化命中"**。

聚合统计字段：`count, mentioned, mention_count, top1_count, top3_count, correct_entry_count(正确进入率), followup_triggered_count`。

### 5.7 品牌知识库 `/knowledge`（RAG）

**作用**：上传品牌资料/问答，生成内容时自动检索注入，提升 AI 引用准确度与转化。

| 方法 | 端点 | 说明 |
|---|---|---|
| GET/POST | `/knowledge/documents` | 文档 |
| GET | `/knowledge/documents/{id}` + `/qa` | 文档 + 其问答 |
| POST | `/knowledge/upload` `/knowledge/media/upload` | 上传文档/媒体 |
| GET/POST | `/knowledge/qa` | 问答对 |
| POST | `/knowledge/qa/batch-import` | 批量导入问答（Excel/CSV） |
| GET | `/knowledge/search` | 检索（RAG retrieve） |
| GET | `/knowledge/stats` | 统计 |
| (admin) | `/media/assets/{id}/(process\|segments)` `/media/segments` `/media/hit-logs` `/media/ledgers` `/media/retrieval-config` | 媒体素材分块、命中日志、检索配置 |

### 5.8 AI 品牌资产 `/aibrand`

品牌资产总览看板：核心资产指标、热词资产、信源资产、内容资产、品牌雷达、转化总览。数据来自 `/brands/{id}/assets|dashboard|trends|media_sources`。含**转化画像**：`GET/PUT /brands/{id}/conversion-profile`（配置品牌的转化目标，如电话/微信，供实时查询匹配 `conversion_matched_targets`）。

---

## 6. 商业化 / 计费体系

### 6.1 Token 计费（企业侧）
- `GET /company/wallet` 钱包余额
- `GET /company/token-ledgers` Token 流水（每次 AI 调用扣 token）
- `GET /company/recharge/orders` 充值订单
- `GET /company/consumption/history` 消耗历史
- `GET /billing/overview|summary|usage-records|payment-records|subscription-change-records`

### 6.2 套餐订阅
- `GET /subscriptions/plans` `/current` `/orders`
- `POST /subscriptions/orders` + `/orders/{id}/pay {return_url}`（跳第三方支付）

### 6.3 代理商分销
- `/agents/me/companies`（下游企业）
- `/agents/me/invite-codes`（邀请码，注册裂变）
- `/agents/me/sub-agent-applications`（下级代理申请）
- `/agents/me/company-orders` `/company-billing` `/company-recharges`（代理给企业充值）
- admin：`/agents/{id}/(pricing|discount|deactivate)`（给代理定价/折扣）

### 6.4 平台 admin 充值/开通
- `/admin/subscriptions/(plans|provision|recharge|recharge-overview)`
- `/admin/subscriptions/{id}/extend-one-month`

---

## 7. 系统级 API

| 端点 | 作用 |
|---|---|
| `GET /api/auth/me` | 当前用户 |
| `GET /api/auth/access-context` | 权限 + 公司/品牌范围 |
| `POST /api/auth/login` `/logout` | 登录登出 |
| `POST /api/auth/switch_company` | 切换公司上下文 |
| `GET/POST /api/auth/users` + `/{id}` + `/{id}/password` | 成员管理 |
| `GET /api/white-label/config?domain=` | 白标配置（OEM 按域名换 logo/配色/名称） |
| `GET /api/onboarding/status` | 新手引导进度 |
| `GET /api/releases/latest` | 版本更新弹窗（v1.3.5） |
| `GET /api/messages/unread-count` | 消息中心未读数 |
| `GET /api/industries` + CRUD | 行业字典 |

---

## 8. 端到端工作流（新手引导实测，"李航律师"demo）

> OnboardingGuide 把整个产品旅程做成了带 demo 数据的分步教程：

1. **保存公司与品牌**：品牌名称 / 品牌官网 / 所属行业
2. **实时检测**（先尝鲜）：填提及信息（目标词）+ 查询问题 → 开始实时检测 → 展开平台结果 → 查看档案（截图存档）
3. **开始诊断**（洞察）：查看演示洞察报告 → 竞品分析 → 信源分析 → 热词资产
4. **指定意图词**：查看意图列表（带 GEO 热度）
5. **内容创作**：知识库上传相关文档 → 生成 → 查看文章预览（7 维评分）
6. **发布**：查看发布订单栏 → 媒体资源列表
7. **数据监测**：品牌雷达 → 核心资产指标 → 趋势图 → 情绪分布 → 转化总览 → 平台明细 → 监测明细 → 监测频率 → 定时任务设置
8. **套餐中心**：查看套餐 / 去充值

---

## 9. 复刻到 lawgeo 的差距清单（TODO）

我们当前 lawgeo 已具备：营销站、域名诊断、内容生成(7 格式)、12 平台对比、行业博客批量发布、知识库 RAG、转化短链、Agent 编排、订阅计费骨架。

**对齐 AceFlow 还需补：**

| 优先级 | 差距项 | AceFlow 对应 |
|---|---|---|
| 🔴 高 | **品牌上下文体系**：公司→品牌→行业三级，全模块 gate by brand | `BrandContext` + `/brands/*` |
| 🔴 高 | **实时查询追问转化**：提问→Top1/3→截图→追问联系方式→转化命中 | `/realtime_search/run` 数据模型（§5.6） |
| 🔴 高 | **7 维 GEO 评分**：标题/首段/去AI味/结构/权威/匹配/转化 | `/generate/content` scores（§5.3） |
| 🔴 高 | **GEO 热度指数**：意图词按搜索量分 4 档热度 | `aiSearchHeat` 阈值（§5.2） |
| 🟡 中 | **真机/云手机抓取 + 截图存档**（我们现在是 API 模拟） | admin `cloudphones` + `screenshot_path` |
| 🟡 中 | **定时监测 + 每日问题** | `/brands/{id}/daily_monitoring` |
| 🟡 中 | **代理商分销 + 邀请码 + 白标 OEM** | `/agents/me/*` + `/white-label/config` |
| 🟡 中 | **Token 计费 + 代理给企业充值** | `/company/wallet` `/company/token-ledgers` |
| 🟢 低 | **内容批量任务（多标题×多平台）** | `/generate/content/tasks/batch` |
| 🟢 低 | **信源市场（pfw）+ 平台代发下单** | `/pfw/sources` + `content-publishing/orders` |
| 🟢 低 | **品牌雷达 / 情绪关键词钻取 / 资产快照** | `/brands/{id}/dashboard\|sentiment\|snapshot` |

---

## 10. 监测平台与模型策略（复刻要点）

- 对外只暴露**平台** `doubao/deepseek/qwen/yuanbao`（可扩 kimi/智谱/文心/海外）。
- 模型调用封装在后端，前端不感知具体模型——便于切换 / 降本。
- 我们 lawgeo 已用「小米 MIMO 统一接入 + 可选真实多平台 key」的策略，方向一致；补上 **per-platform 真机抓取 + 截图存档** 才能 100% 对标 AceFlow 的"可信证据链"。

---

*本文档基于线上 v1.3.5 前端 bundle + 真实后台逆向，端点/字段均为实测。后端实现细节（具体 prompt、模型、云手机调度）不可见，需自研。*
