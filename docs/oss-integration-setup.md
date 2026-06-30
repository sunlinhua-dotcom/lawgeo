# OSS 集成接入手册（自部署开关）

> BrandGEO 用「Provider 适配层」把多个成熟开源项目包进来：每个能力都有**内置兜底**，配好对应 env 后**自动切换**到外部 OSS，失败再**自动降级**回内置。无需改任何业务代码。
> 适配层代码：`src/lib/providers/`　|　选型理由：`docs/oss-integration-research.md`

查看当前各能力用的是哪个 provider：登录后访问 `GET /api/providers/status`，或看「数据监测追踪」页底部「OSS 集成状态」卡片。

---

## 1. LiteLLM 统一模型网关（已接，开箱即用）

把所有平台的 AI 调用统一走一个 OpenAI 兼容端点 + 成本追踪。

```bash
# 自托管 LiteLLM Proxy
git clone https://github.com/BerriAI/litellm && cd litellm
# 编辑 config.yaml，配置 model alias（与 BrandGEO modelMap 对齐）：
#   model_list:
#     - model_name: deepseek/deepseek-chat
#       litellm_params: { model: deepseek/deepseek-chat, api_key: os.environ/DEEPSEEK_KEY }
#     - model_name: qwen/qwen-max ...
docker run -p 4000:4000 -v $(pwd)/config.yaml:/app/config.yaml \
  ghcr.io/berriai/litellm:main-latest --config /app/config.yaml
```

BrandGEO 侧 `.env.local`：
```
LLM_GATEWAY_URL="http://localhost:4000/v1"
LLM_GATEWAY_KEY="sk-your-litellm-master-key"
LLM_GATEWAY_MODEL="deepseek/deepseek-chat"
```
→ 平台监测页徽章变「网关接入」。未配置时回落 MIMO 模拟。

---

## 2. Firecrawl 网页抓取（已接，开箱即用）

域名诊断 / 网站画像 / 竞品抓取自动用 Firecrawl 渲染 SPA + 拿截图。

```bash
git clone https://github.com/firecrawl/firecrawl && cd firecrawl
docker compose up -d   # 默认 :3002
```
`.env.local`：
```
FIRECRAWL_API_URL="http://localhost:3002"
FIRECRAWL_API_KEY=""   # 自托管可留空
```
→ 诊断结果里 HTTPS 检测会显示「Firecrawl 渲染」。未配置时回落原生 fetch。

---

## 3. Skyvern / Steel 真机答案抓取（可选，最高价值）

这是对标 AceFlow「可信证据链」的关键：真实在豆包/DeepSeek/元宝里提问 → 截图存档。
需要你自托管一个浏览器 Agent，并暴露一个 `POST /crawl-answer` 端点（约定协议见下）。

```bash
# 方案 A：Skyvern（视觉 LLM 浏览器）
git clone https://github.com/Skyvern-AI/skyvern && cd skyvern && docker compose up -d
# 方案 B：Steel Browser（浏览器沙箱 API）
git clone https://github.com/steel-dev/steel-browser && cd steel-browser && docker compose up -d
```

在其上包一层约定端点（输入 platform+question，输出 answer+screenshot_path+archive_url）：
```
POST {BROWSER_AGENT_URL}/crawl-answer
  body: { platform, question, screenshot }
  resp: { answer, screenshot_path, archive_url }
```
`.env.local`：
```
BROWSER_AGENT_URL="http://localhost:8000"
BROWSER_AGENT_KEY=""
```
→ `/tools/compare`、监测任务自动产出真截图（`isReal:true`）。未配置时 LLM 模拟。

---

## 4. RAGFlow 深度知识库（可选）

比内置 SQLite 关键词 RAG 更强（Word/PDF/扫描件/表格/引用接地）。

```bash
git clone https://github.com/infiniflow/ragflow && cd ragflow/docker
docker compose -f docker-compose.yml up -d   # 默认 :80
# 在 RAGFlow 里建 dataset，拿到 dataset_id 和 API key
```
`.env.local`：
```
RAGFLOW_API_URL="http://localhost:80"
RAGFLOW_API_KEY="ragflow-xxx"
RAGFLOW_DATASET_ID="xxx"
```
→ AI 内容生成检索知识库时走 RAGFlow。未配置时用内置 RAG。

---

## 5. Postiz 海外多平台发布（可选）

海外社媒（X / LinkedIn / Reddit / Mastodon / Threads / Bluesky）排期发布。

```bash
git clone https://github.com/gitroomhq/postiz-app && cd postiz-app
docker compose up -d   # 默认 :5000
# 在 Postiz 里连好社媒账号，生成 API key
```
`.env.local`：
```
POSTIZ_API_URL="http://localhost:5000"
POSTIZ_API_KEY="your-postiz-key"
```
中文平台继续用 Wechatsync 浏览器扩展；Dev.to/Hashnode/Medium 用各自真实 API（已接）。

---

## 降级矩阵

| 能力 | 外部 OSS | 内置兜底 | 失败行为 |
|---|---|---|---|
| LLM 调用 | LiteLLM 网关 | MIMO 直连 | 自动回落 |
| 网页抓取 | Firecrawl | 原生 fetch | 自动回落 |
| 真机答案 | Skyvern/Steel | LLM 模拟 | 自动回落 |
| 知识库 | RAGFlow | SQLite RAG | 自动回落 |
| 海外发布 | Postiz | —（返回未配置错误） | 提示配置 |
| 中文发布 | Wechatsync 扩展 | 复制+打开编辑器 | 用户手动 |

所有外部依赖**全部可选**，不配也能跑全流程（用内置实现）。这就是「全部包装进去」的工程落地：留好接口、配了就用、断了就降级。
