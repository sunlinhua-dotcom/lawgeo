# 项目上下文

## 项目目标
- `lawGEO` 是律所 GEO 优化平台，目标是帮助律所在 AI 回答法律问题时获得更高推荐概率。

## 架构与目录
- 技术栈：Next.js 16 App Router、React 19、TypeScript、Tailwind v4、Drizzle SQLite。
- 数据库：SQLite + Drizzle ORM，schema 预计位于 `src/lib/db/schema.ts`。
- 认证：bcrypt + JWT cookie sessions。
- AI：README 记录为小米 MIMO 2.5 Pro 统一接入，并可选多平台 key。

## 关键运行命令
- 安装依赖：`pnpm install`
- 启动开发环境：`pnpm dev`
- 构建：`pnpm build`
- Lint：`pnpm lint`
- 数据库同步：`pnpm db:push`

## 关键约束
- 本地开发端口使用 `4648`，符合 46xx 端口命名空间。
- 项目 AGENTS.md 明确要求：这不是常规 Next.js，写代码前需阅读 `node_modules/next/dist/docs/` 的相关指南。
- 默认对外回复、计划与说明使用简体中文。

## 当前阶段状态
- 2026-05-30：完成一轮浏览器功能检查与修复。公开页、工具页、登录和控制台主入口已回测；`pnpm lint` 与 `pnpm build` 均通过。
- 2026-05-30：补做登录态控制台实测。浏览器先退出再用 `admin/admin` 登录，20 个控制台路由可打开；项目、知识库、检索、短链、告警订阅、内容模板标题、博客批量向导完成安全闭环测试；测试数据已清理。
- 2026-05-30：完成 MIMO AI 功能全量实测与修复。AI 内容生成、意图聚类、平台对比、标题生成、正文评分、GEO 指数刷新、洞察、实时查询、发布改写、监测 job、AI Agent、批量博客均已真实调用验证；修复 `/api/generate` 非法 locale 崩溃；完整回归 `27/27` 通过。
- 2026-05-31：进入 `docs/geo-citation-engine-prd.md` 实现阶段。当前已落地 PRD Phase 1 的 AI 可读基础设施纵切：统一内容资产源、Markdown twin、`llms.txt` / `llms-full.txt` / `ai-index.json` / `docs.json`、AI discovery JSON、基础 GEO Audit v2、Absorption 分析 API 和 `/dashboard/geo-citation` 控制台页。
- 2026-05-31：已落地 PRD M3/M4 可运行纵切：Prompt Target Library、fan-out query、CitationRun / CitationSnapshot deterministic runner、跨平台指标、统一 Absorption sub-score 和 dashboard 可视化。当前可在 `/dashboard/geo-citation` 看到 100 个 Prompt Targets、500 个 Fan-out Queries、32 个 Citation Snapshots、Avg Absorption 94/100、Top3 命中 32 条。
- 2026-05-31：已落地 PRD Phase 4/5 与报告基础版：AutoGEO Rewrite Lab、`/api/geo/rewrite/experiment`、Source Mention Tracker、`/api/geo/source-mentions/import`、`/api/geo/report/monthly` JSON / Markdown 月报。当前 `/dashboard/geo-citation` 可见 rewrite delta +11、20 条 source mentions、10 类 source diversity 和月报 action plan。
- 2026-05-31：已落地真实 MIMO CitationRun adapter 与趋势回放纵切。`/api/geo/citation/run?adapter=mimo&platforms=gpt&snapshotPromptLimit=1` 真实调用当前 MIMO provider，生成 run `cr-11z35xb`，`/api/geo/citation/trend` 可回放趋势，`/dashboard/geo-citation` 可见 `MIMO Adapter & Trend Replay`。MIMO provider 明确返回 `model=mimo-v2.5-pro`，本轮未接入 OPENCLAW。
- 2026-05-31：已新增月报 HTML 打印版。`/api/geo/report/monthly?format=html&period=2026-05` 可在浏览器打开并打印 / 另存为 PDF；正式服务端二进制 PDF 导出仍未做。
- 2026-05-31：已落地异步 Citation Job 与 PDF 报告基础版。`POST /api/geo/citation/jobs` 可创建 queued/running/done/failed job，`GET /api/geo/citation/jobs/[id]` 可轮询；MIMO job `cj-1f0f4a5d` 真实完成并生成 run `cr-11z35xb-mpsm36bv`。`/api/geo/report/monthly?format=pdf&period=2026-05` 返回 `application/pdf`，可被 `pdftotext` 与 Quick Look 识别。
- 2026-05-31：已落地 Citation Evidence Capture 与 PRD Completion Audit 基础版。`/api/geo/citation/[id]/capture` 可归档 CitationRun sourceUrls，`/api/geo/citation/captures/[captureId]/artifacts/[artifactId]` 可回放证据文本；run `cr-11z35xb-mpsm36bv` 已生成 capture `cap-daavpj-mpsmm4vw`，3 个 artifact 均成功。`/api/geo/completion-audit` 当前显示 18 项中 9 done、8 partial、0 missing、1 blocked，`canMarkGoalComplete=false`。
- 2026-05-31：已落地 Citation Pack 内容系统纵切。新增 file-backed BrandEntity / LawyerEntity / Service Fact Sheet / FAQ Matrix / Evidence Blocks / Quality Gates，`/api/geo/citation-pack` 可新建并持久化，`/citation-packs/[id]` 可打开公开页面，`/citation-packs/[id].md` 作为 Markdown Twin 并包含 JSON-LD，dashboard 可用表单创建 pack。浏览器实测创建 `cp-6049d3a7`，completion audit 中 Epic F 已变为 done，整体为 18 项中 10 done、7 partial、0 missing、1 blocked，`canMarkGoalComplete=false`。
- 2026-05-31：已落地 Live GEO Audit v2。`/api/geo/audit-v2?siteUrl=...` 会实时抓取 robots、sitemap、HTML、headers/CDN、Markdown twin、llms、llms-full、ai-index、schema、正文结构、证据密度、负面信号并输出 findings；dashboard 新增 `Live GEO Audit v2` 面板，可浏览器点击运行。对 `http://localhost:4648` 实测 score 97、14 checks、sitemap 46 URL、robots/Markdown/llms/ai-index 均 200。completion audit 中 Epic B 已变为 done，整体为 18 项中 11 done、6 partial、0 missing、1 blocked，`canMarkGoalComplete=false`。
- 2026-05-31：已落地 Browser Screenshot Evidence 归档。新增 `/api/geo/browser-captures` 和 `/api/geo/browser-captures/[captureId]/artifact`，支持保存 in-app Browser 实际渲染截图；已归档 dashboard 截图 `bc-w8yvx7-mpso6ord` 和 DuckDuckGo 第三方搜索结果页截图 `bc-x24ndk-mpso754z`。dashboard 新增 `Browser Screenshot Evidence` 面板，completion audit 的 capture-evidence 已只剩数据库级长期保留策略未完成。
- 2026-05-31：已完成 PRD Phase 2 的真实 MIMO 4 平台验收。`POST /api/geo/citation/jobs` 创建 job `cj-a691c0c2`，使用 MIMO 顺序跑完 `deepseek/kimi/gpt/perplexity`，生成 run `cr-1gwiaxm-mpsojxvp`，4 个 snapshots 已持久化到 file-backed run history。completion audit 中 Phase 2 已变为 done，整体为 18 项中 12 done、5 partial、0 missing、1 blocked，`canMarkGoalComplete=false`。
- 2026-05-31：Citation Job 已补取消/重试契约。`DELETE /api/geo/citation/jobs/[id]` 可取消 queued/running job，`POST /api/geo/citation/jobs/[id]` with `{"action":"retry"}` 可创建 retry job；本轮实测 canceled=2、retried=1。
- 2026-05-31：已完成 PRD Epic D 的真实 MIMO 12 平台全量验收。`POST /api/geo/citation/jobs` 创建 job `cj-e59cb818`，使用 MIMO 顺序跑完 `deepseek/qwen/doubao/kimi/zhipu/wenxin/yuanbao/minimax/claude/gpt/gemini/perplexity`，生成 run `cr-qztkv5-mpsovvlq`，12 个 snapshots 已持久化到 file-backed run history；指标为 mentioned 7、top3 7、followupHit 12、averageAbsorption 64。completion audit 已记录 `MIMO 最大平台覆盖 12 个平台 / 12 个 snapshots`，但 Epic D 仍因正式 SQLite/Drizzle 持久化和生产级 worker 保持 partial。
- 2026-05-31：已落地 MVP End-to-End Funnel 单页向导。新增 file-backed `GeoMvpFunnelRun`、`/api/geo/funnel` 和 dashboard `MVP End-to-End Funnel`，可在同一页新建品牌事实资产、运行 Live GEO Audit、生成 CitationRun、汇总 Absorption 并输出月报链接。API 创建 `gf-475c009e`，浏览器点击创建 `gf-41e2cbbf`，五个步骤均为 done；completion audit 中 `mvp-funnel` 已变为 done，整体为 18 项中 13 done、4 partial、0 missing、1 blocked，`canMarkGoalComplete=false`。
- 2026-05-31：已落地 Third-party Search Monitor 纵切。新增 file-backed Search Monitor Run、`/api/geo/search-monitor`、SERP artifact 回放接口和 dashboard `Third-party Search Monitor` 面板；真实请求 DuckDuckGo HTML SERP，API 创建 `smr-24a5552e`，浏览器点击创建 `smr-08071b84`，共保存 6 个 SERP HTML artifact。completion audit 中 Phase 5 已变为 done，整体为 18 项中 14 done、3 partial、0 missing、1 blocked，`canMarkGoalComplete=false`。
- 2026-05-31：已完成中文 PDF 与 dateRange 报表能力。`/api/geo/report/monthly` 支持 `dateFrom/dateTo` 或 `from/to`，报告 JSON 返回 `dateRange` 与 `pdfProfile=zh-cjk-type0`；`format=pdf` 输出中文 CJK PDF，`pdftotext` 可提取中文。completion audit 中 Epic I 已变为 done，整体为 18 项中 15 done、2 partial、0 missing、1 blocked，`canMarkGoalComplete=false`。
- 2026-05-31：已落地 Evidence Retention Manifest。新增 `/api/geo/evidence-retention`，汇总 fetch capture、browser screenshot、SERP HTML artifact、noindex 回放 API、365 天保留策略、100 条索引上限和 SQLite/Drizzle 迁移目标；当前 manifest 记录 8 条记录、20 个 artifact。completion audit 中 `capture-evidence` 已变为 done，整体为 18 项中 16 done、1 partial、0 missing、1 blocked，`canMarkGoalComplete=false`。
- 2026-05-31：已落地 Citation Job Worker Contract。Citation Job 新增 worker lease、heartbeat、lease expiry、stale recovery 和 drain contract；新增 `/api/geo/citation/jobs/worker`。快速 deterministic job `cj-c27e2d24` 完成并写入 worker `lawgeo-citation-worker-82419`、run `cr-medzv3`。completion audit 中 Epic D 已变为 done，整体为 18 项中 17 done、0 partial、0 missing、1 blocked，`canMarkGoalComplete=false`。
- 2026-05-31：PRD 功能项除正式 SQLite/Drizzle 持久化外均已完成并浏览器验收。剩余唯一 blocker 是 `schema-persistence`：项目规则要求修改 `src/lib/db/schema.ts` 前必须先获得用户确认。
