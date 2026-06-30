# 项目进度

## 已完成
- 读取项目 README、package.json、AGENTS.md、next.config.ts。
- 确认项目端口为 `4648`。
- 创建项目上下文三件套与本次检查日志占位。
- 使用浏览器检查公开页面、工具页、登录与控制台主要入口。
- 修复 3 个 404 入口：`/audit`、`/privacy`、`/terms`。
- 修复平台对比引用误判。
- 清理 lint 错误与警告。
- 完成 `pnpm lint` 与 `pnpm build` 验证。
- 2026-05-30：按用户补充要求，用浏览器显式退出后输入 `admin/admin` 登录，逐一检查 20 个登录态控制台路由。
- 2026-05-30：完成登录态安全闭环测试：项目新建、知识库新增、知识库检索、短链生成、告警订阅、内容模板标题、博客批量向导。
- 2026-05-30：清理本轮登录态测试数据，确认测试项目、测试文档、测试短链、测试告警订阅剩余数量均为 0。
- 2026-05-30：完成 MIMO AI 功能全量实测。新增 `scripts/test-ai-functions.mjs`，覆盖内容生成、意图聚类、平台对比、标题生成、正文评分、GEO 指数、洞察、实时查询、发布改写、监测 job、AI Agent、批量博客。
- 2026-05-30：修复 `/api/generate` 在收到 `zh-CN` 等运行时 locale 时崩溃的问题；完整 AI 回归 `27/27` 通过，`pnpm lint` 与 `pnpm build` 通过。
- 2026-05-30：完成 GitHub 全域 GEO/AEO/AI Search Visibility 方法调研。结论是下一阶段应优先升级为“AI 可读 Markdown twin + 结构化可引用内容 + 跨平台引用监测 + 自动改写回归”的闭环，而不是只强化 `llms.txt` 单点。
- 2026-05-30：完成 `docs/geo-citation-engine-prd.md`。PRD 将下一阶段定义为“GEO 引用工程闭环”，并用 GitHub 工程、Google 官方文档、arXiv 论文、Ahrefs / Semrush / OtterlyAI 数据研究和 Reddit 讨论建立来源编号、需求追溯、Epic、数据模型、API 草案、验收标准与实施阶段。
- 2026-05-30：已在 `README.md` 的产品文档区链接 GEO 引用工程闭环 PRD。
- 2026-05-31：完成 PRD Phase 1 / M1 的可验证纵切。新增统一 GEO 内容资产源，覆盖 42 个公开内容资产、42 个 Markdown twin、74 个 Evidence Blocks，并生成 `llms.txt`、`llms-full.txt`、`ai-index.json`、`docs.json`、`/ai/summary.json`、`/ai/faq.json`、`/ai/service.json`、`/ai/evidence.json`。
- 2026-05-31：新增 `/api/geo/assets/crawl`、`/api/geo/markdown/generate`、`/api/geo/llms/rebuild`、`/api/geo/audit-v2`、`/api/geo/absorption/analyze`，作为 PRD 中 M1 与 citation absorption 的基础 API。
- 2026-05-31：新增 `/dashboard/geo-citation` 控制台页面，展示 GEO 引用工程闭环状态、资产类型、Markdown twin、AI discovery 端点和 PRD 阶段状态。
- 2026-05-31：`pnpm lint` 与 `pnpm build` 通过；已用 HTTP 验证 raw AI 端点，并用 in-app Browser 登录 `admin/admin` 验收 `/dashboard/geo-citation`。
- 2026-05-31：完成 PRD M3/M4 可运行纵切。新增 Prompt Target Library（100 prompt / 500 fan-out）、CitationRun / CitationSnapshot deterministic runner（DeepSeek、Kimi、ChatGPT、Perplexity 4 平台 / 32 snapshots）、统一 Absorption sub-score 评分器和 dashboard 可视化。
- 2026-05-31：新增 `/api/geo/prompts/research`、`/api/geo/citation/run`、`/api/geo/citation/[id]`；扩展 `/api/geo/absorption/analyze`。HTTP 验证与 in-app Browser 实测通过，截图保存在 `test-results/geo-citation-m3m4-*.jpg`。
- 2026-05-31：完成 PRD Phase 4 / Epic G 可运行纵切。新增 AutoGEO Rewrite Lab、`/api/geo/rewrite/experiment`、RuleSet、baseline / structure / preference / conservative 四版本改写、GEO / GEU / Absorption / Citation 对比、winner / rejected reasons 和 comparison report。
- 2026-05-31：完成 PRD Phase 5 / Epic H 与 Epic I 基础版。新增 Source Mention Tracker（默认 20 条、10 类 source diversity）、`/api/geo/source-mentions/import`、`/api/geo/report/monthly` JSON / Markdown 月报，并在 `/dashboard/geo-citation` 完成可视化和浏览器验收。
- 2026-05-31：完成真实 MIMO CitationRun adapter 与趋势回放纵切。`/api/geo/citation/run?adapter=mimo&platforms=gpt&snapshotPromptLimit=1` 已真实调用 MIMO，生成 run `cr-11z35xb`；新增 `/api/geo/citation/trend`、run history、`/dashboard/geo-citation` 的 `MIMO Adapter & Trend Replay` 区块，并完成浏览器验收。
- 2026-05-31：完成月报 HTML 打印版。`/api/geo/report/monthly?format=html&period=2026-05` 可在浏览器打开，包含打印 / 另存为 PDF 按钮、Prompt Performance、Source Influence Map 和 Action Plan；截图已保存到 `test-results/geo-citation-printable-report.jpg`。
- 2026-05-31：完成异步 Citation Job 纵切。新增 file-backed job queue、`/api/geo/citation/jobs`、`/api/geo/citation/jobs/[id]`、job 进度回调和 dashboard `Async Citation Jobs` 区块；MIMO job `cj-1f0f4a5d` 已真实运行完成，生成 run `cr-11z35xb-mpsm36bv`。
- 2026-05-31：完成月报 PDF 下载基础版。`/api/geo/report/monthly?format=pdf&period=2026-05` 返回 `application/pdf`，文件头 `%PDF-1.4`，`pdftotext` 可提取 Executive Summary / Prompt Performance / Source Influence Map / Action Plan，Quick Look 缩略图保存为 `test-results/lawgeo-report.pdf.png`。
- 2026-05-31：完成 Citation Evidence Capture 基础版。新增 `/api/geo/citation/[id]/capture`、`/api/geo/citation/captures`、artifact 回放 API；对 run `cr-11z35xb-mpsm36bv` 生成 capture `cap-daavpj-mpsmm4vw`，归档 3 个 Markdown 证据，artifact 可在浏览器打开。
- 2026-05-31：完成 PRD Completion Audit 基础版。新增 `/api/geo/completion-audit` 和 dashboard `PRD Completion Audit` 区块；当前审计结果为 18 项中 9 done、8 partial、0 missing、1 blocked，`canMarkGoalComplete=false`。
- 2026-05-31：完成 Citation Pack 内容系统纵切。新增 `src/lib/geo-citation-pack.ts`、`/api/geo/citation-pack`、`/api/geo/citation-pack/[id]`、`/citation-packs/[id]` 和 dashboard `Citation Pack Builder`；支持 BrandEntity / LawyerEntity / Service Fact Sheet / FAQ Matrix / Evidence Blocks / Quality Gates，公开页内嵌 JSON-LD，`.md` Markdown Twin 包含 JSON-LD / LegalService / FAQPage / Evidence Blocks。
- 2026-05-31：用 API 和 in-app Browser 完成 Citation Pack 验收。API 创建 `cp-0cfe13c0`，浏览器控制台表单创建 `cp-6049d3a7`；`/ai-index.json` 已纳入 Citation Pack asset；`/api/geo/completion-audit` 当前为 18 项中 10 done、7 partial、0 missing、1 blocked，`completionRate=56`，`canMarkGoalComplete=false`。
- 2026-05-31：完成 Live GEO Audit v2 纵切。新增 `src/lib/geo-live-audit.ts` 与 dashboard `Live GEO Audit v2` 面板；`/api/geo/audit-v2?siteUrl=...` 会实时抓取 robots、sitemap、HTML、headers/CDN、Markdown twin、llms、llms-full、ai-index、schema、正文结构、证据密度、负面信号并输出 14 个 liveChecks / findings。
- 2026-05-31：用 HTTP 和 in-app Browser 完成 Live GEO Audit v2 验收。对 `http://localhost:4648` 实测 score 97，Crawled 93 / Understood 100 / Cited 94 / Absorbed 100，sitemap 46 URL，robots/Markdown/llms/ai-index 均 200；dashboard 点击运行成功，`/api/geo/completion-audit` 当前为 18 项中 11 done、6 partial、0 missing、1 blocked，`completionRate=61`，`canMarkGoalComplete=false`。
- 2026-05-31：完成 Browser Screenshot Evidence 纵切。新增 file-backed 浏览器截图证据库、`/api/geo/browser-captures`、artifact 回放接口和 dashboard `Browser Screenshot Evidence` 面板；已用 in-app Browser 归档 dashboard 全页截图和 DuckDuckGo 第三方搜索结果页截图。
- 2026-05-31：修复 `/dashboard/geo-citation` 中指向副作用 API 的 Next `Link` 预取问题，改为普通 `<a>`，避免打开页面时自动触发 capture / MIMO run 等真实任务。复测打开 dashboard 前后 fetch capture 计数保持 `4 -> 4`、artifact 计数保持 `12 -> 12`。
- 2026-05-31：完成真实 MIMO 4 平台 Citation Job 验收。job `cj-a691c0c2` 已跑完 `deepseek/kimi/gpt/perplexity`，生成并持久化 run `cr-1gwiaxm-mpsojxvp`，4 个 snapshots，model 为 `mimo-v2.5-pro`，completion audit 中 Phase 2 已变为 done。
- 2026-05-31：补强 Citation Job 取消/重试契约并实测。`DELETE /api/geo/citation/jobs/[id]` 可取消任务，`POST /api/geo/citation/jobs/[id]` with `{"action":"retry"}` 可生成 retry job；本轮实测 `canceled=2`、`retried=1`。
- 2026-05-31：完成真实 MIMO 12 平台 Citation Job 全量验收。job `cj-e59cb818` 已跑完 `deepseek/qwen/doubao/kimi/zhipu/wenxin/yuanbao/minimax/claude/gpt/gemini/perplexity`，生成并持久化 run `cr-qztkv5-mpsovvlq`，12 个 snapshots，model 为 `mimo-v2.5-pro`，指标为 mentioned 7、top3 7、followupHit 12、averageAbsorption 64。
- 2026-05-31：用 HTTP 与 in-app Browser 验收 12 平台结果。`/api/geo/citation/jobs/cj-e59cb818`、`/api/geo/citation/cr-qztkv5-mpsovvlq`、`/api/geo/completion-audit` 均能打开并显示 12 平台证据；截图保存到 `test-results/geo-mimo-12-platform-*.png`，浏览器控制台 error 数为 0。
- 2026-05-31：完成 MVP End-to-End Funnel 纵切。新增 `src/lib/geo-mvp-funnel.ts`、`/api/geo/funnel` 和 dashboard `MVP End-to-End Funnel` 组件，把新品牌 Citation Pack、Live GEO Audit、CitationRun、Absorption 摘要和月报链接串成一页式流程。
- 2026-05-31：用 API 和 in-app Browser 验收 MVP Funnel。API 创建 `gf-475c009e`，浏览器点击创建 `gf-41e2cbbf`，均包含 intake / crawl / monitor / absorption / report 五个 done 步骤；completion audit 中 `mvp-funnel` 已变为 done，整体为 18 项中 13 done、4 partial、0 missing、1 blocked。
- 2026-05-31：完成 Third-party Search Monitor 纵切。新增 `src/lib/geo-search-monitor.ts`、`/api/geo/search-monitor`、SERP artifact 回放接口和 dashboard `Third-party Search Monitor` 面板；默认真实抓取 DuckDuckGo HTML SERP，并记录 cadence / nextRunAt。
- 2026-05-31：用 API 和 in-app Browser 验收搜索监测。API 创建 `smr-24a5552e`，浏览器点击创建 `smr-08071b84`；共 2 个 run、6 个 SERP HTML artifact、60 条搜索结果，artifact 可浏览器回放。completion audit 中 Phase 5 已变为 done，整体为 18 项中 14 done、3 partial、0 missing、1 blocked。
- 2026-05-31：完成中文 PDF 与 dateRange 报表。`/api/geo/report/monthly` 支持 `dateFrom/dateTo` 或 `from/to`，JSON 返回 `dateRange` 与 `pdfProfile=zh-cjk-type0`；PDF 改为中文 CJK Type0 字体输出。
- 2026-05-31：用 HTTP、本机工具和 in-app Browser 验收报表。`test-results/geo-report-zh-date-range.pdf` 为 PDF 1.4，`pdftotext` 可提取中文；浏览器打开 PDF、dateRange JSON 和 completion audit 均正常。completion audit 中 Epic I 已变为 done，整体为 18 项中 15 done、2 partial、0 missing、1 blocked。
- 2026-05-31：完成 Evidence Retention Manifest。新增 `src/lib/geo-evidence-retention.ts` 与 `/api/geo/evidence-retention`，汇总 fetch capture、browser screenshot、SERP HTML artifact、365 天保留策略、100 条索引上限、noindex 回放 API 和 SQLite/Drizzle 迁移目标。
- 2026-05-31：用 HTTP 和 in-app Browser 验收 retention。`/api/geo/evidence-retention?refresh=1` 返回 8 records、20 artifacts、retentionDays 365；completion audit 中 `capture-evidence` 已变为 done，整体为 18 项中 16 done、1 partial、0 missing、1 blocked。
- 2026-05-31：完成 Citation Job Worker Contract。Citation Job 新增 worker lease、heartbeat、lease expiry、stale recovery 和 drain endpoint；新增 `/api/geo/citation/jobs/worker`，dashboard `Async Citation Jobs` 展示 worker contract。
- 2026-05-31：用快速 deterministic job 与 in-app Browser 验收 worker。job `cj-c27e2d24` 生成 run `cr-medzv3`，worker `lawgeo-citation-worker-82419` 写入 heartbeat；`/api/geo/citation/jobs/worker` 显示 ready、lease 900000ms、supportsDrain true、supportsStaleRecovery true。completion audit 中 Epic D 已变为 done，整体为 18 项中 17 done、0 partial、0 missing、1 blocked。
- 2026-05-31：续跑复核 schema-persistence。HTTP 与 in-app Browser 均确认 `/api/geo/completion-audit` 仍为 18 项中 17 done、0 partial、0 missing、1 blocked；唯一未完成项是正式 SQLite/Drizzle 持久化。已检查当前 `src/lib/db/schema.ts`：现有早期 GEO 表覆盖 brands / insights / intents / realtime 等，但 PRD 新增的 Citation Pack、CitationRun/Snapshot、Citation Job、fetch/browser capture、Search Monitor、MVP Funnel、Retention Manifest 仍使用 `data/*.json`。

## 进行中
- PRD 剩余阶段：正式 SQLite/Drizzle 持久化 schema。项目规则要求修改 `src/lib/db/schema.ts` 前必须先获得用户确认。
- 已完成 schema 落库准备：下一步应在用户确认后新增 PRD GEO 持久化表、生成/应用 Drizzle SQLite 迁移，并把 completion audit 的 `schema-persistence` 从 blocked 改为 done。

## 下一步
- 可继续做性能与体验优化，例如 MIMO 长请求后台化、工具页进度提示优化、控制台移动端导航增强。
- MIMO 已确认可用，并已具备 file-backed job 队列与轮询 API；下一步可把更多 GEO 长任务统一接入同一 job contract。
- GEO 产品升级下一步：把当前 file-backed job/run/capture/citation-pack/funnel/search-monitor history 升级为经确认的 SQLite/Drizzle 持久化方案，并补正式 capture adapter、生产级队列 worker 和报表 dateRange 查询。
- 下一步继续按 `/api/geo/completion-audit` 的 partial / blocked 清单逐项补齐；全部 done 前不能标记 goal complete。
