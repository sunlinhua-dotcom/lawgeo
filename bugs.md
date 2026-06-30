# 问题记录

## 当前问题
- 暂无已确认阻塞问题。

## 已修复
- 页脚“内容矩阵审计”指向不存在的 `/audit`，已改为 `/tools/audit`。
- 页脚“隐私政策” `/privacy` 与“服务条款” `/terms` 404，已新增对应页面。
- 12 平台对比工具会把“不相关”品牌提及误判为“已引用”，已改为只统计正向/相关提及。
- React 19 / Next 16 lint 硬错误：`Date.now()` 渲染期调用、`useId` 短路调用、effect 内同步 setState、JSX 注释文本等，已修复。
- unused imports / unused vars lint warnings，已清理。
- `/api/generate` 收到运行时 `locale: "zh-CN"` 时会因 `LOCALES[locale].nativeName` 访问 undefined 返回 500。已在 `src/lib/prompts.ts` 增加 `normalizeLocale()`，将 `zh-CN` / `zh_Hans` / `cn` / 未知 locale 回退到 `zh`；AI 全量回归 `27/27` 通过。
- CitationRun deterministic runner 初版 CTA 只输出联系方式值，没有“微信/邮箱/电话”语义标签，导致 `followupHit` 指标为 0。已把 CTA 改为显式标签化，重测 `/api/geo/citation/run?snapshotPromptLimit=8` 返回 `followupHit: 32`。
- MIMO CitationRun 初版 runId 只由 brand / platforms / promptLimit / snapshotPromptLimit 生成，导致同配置多次真实运行会覆盖历史 run。已为 MIMO runId 增加时间后缀，并把 `getRecordedCitationRuns()` 收窄为真正的持久化 history，不再混入 dashboard 示例 cache。
- 月报 PDF 初版尝试直接输出中文文本，但未嵌入 CJK 字体时浏览器 PDF 预览会出现乱码。已把服务端 PDF 改为英文 ASCII 摘要版，中文完整报告继续使用 HTML / Markdown。
- `/dashboard/geo-citation` 曾使用 Next `Link` 指向 `GET /api/geo/citation/{runId}/capture?refresh=1` 等副作用 API，打开 dashboard 后可能被预取并自动新增 capture。已把这些 API 入口改为普通 `<a>`，复测页面打开前后 capture 总数不再变化。

## 待复查
- MIMO 相关接口功能已确认可用，并已新增 Citation Job 后台任务与轮询 API；仍需把其它长耗时 GEO 任务统一迁移到同一 job contract。
- GEO CitationRun 的 `adapter=mimo` 单平台单快照实测约 18-43 秒；4 平台 job `cj-a691c0c2` 顺序跑完约 2 分钟，12 平台 job `cj-e59cb818` 顺序跑完约 6 分钟并生成 run `cr-qztkv5-mpsovvlq`。功能已通过；多 prompt / 多客户批量场景仍需要生产级队列 worker、超时恢复和限流。
- Citation Job 已补 worker lease、heartbeat、stale recovery 和 drain contract；这仍是 Next 进程内 file-backed worker，不是多实例队列服务。正式生产化需要 SQLite/Drizzle 或外部队列，并需先获得 schema 变更确认。
- 当前 MIMO CitationRun provider 返回 `realCapture=false`，表示 provider 自身仍未直接产出 AI 平台截图；已另行补服务端 fetch 证据归档和 Browser Screenshot Evidence 截图归档，后续需要把真实第三方监测 / 搜索 API 接入同一证据链。
- 月报 PDF 已改为中文 CJK Type0 字体输出，`pdftotext` 可提取中文；仍需注意个别 PDF 渲染器可能缺少标准 CJK 字体，完整中文兜底仍是 HTML 打印版。
- Citation Pack 已具备 file-backed 持久化、公开页、Markdown Twin 和 JSON-LD；但正式 SQLite/Drizzle 客户数据表仍未做，且新品牌抓站 -> 监测 -> absorption -> 报告还没有串成一个单页向导。
- MVP End-to-End Funnel 已把新品牌抓站 -> Citation Pack -> 监测 -> absorption -> 报告串成单页向导，并通过 API 与浏览器点击验收；当前仍使用 file-backed `data/geo-mvp-funnel-runs.json`，正式客户数据落库需要 schema 确认。
- Third-party Search Monitor 已真实抓取 DuckDuckGo HTML SERP，并保存 SERP HTML artifact；但它是无 key 搜索页抓取，结构可能受搜索引擎更新影响。若客户需要商业 SLA，应接 SerpAPI / Bing Web Search / Brave Search 等正式搜索 API。
- Live GEO Audit v2 已具备实时 fetch 审计；但 JS-only 页面仍未执行完整浏览器渲染。第三方搜索结果页已有浏览器截图样本和 DuckDuckGo HTML Search Monitor artifact；若要生产化，需要稳定搜索 API key 与后台调度器。
- Browser Screenshot Evidence 已补浏览器渲染截图归档和一个第三方搜索结果页截图样本；第三方搜索监测与 retention manifest 已补，后续缺口收敛为生产级搜索 API / 调度器和正式数据库持久化。
- Evidence Retention Manifest 已汇总 fetch capture、browser screenshot、SERP HTML artifact 和 noindex 回放 API；正式数据库级长期检索、权限和清理任务仍需等待 SQLite/Drizzle schema 确认。
- `/api/geo/completion-audit` 当前明确显示 `canMarkGoalComplete=false`；不要在 6 partial + 1 blocked 清零前把目标标记完成。
- 2026-05-31 复核：当前唯一 blocker 已收敛为 `schema-persistence`。正式修复需要修改 `src/lib/db/schema.ts` 并执行 Drizzle SQLite 迁移；未经用户确认前只能做方案准备和状态记录，不能落库。
- Codex in-app Browser 当前会拦截直接导航到 raw `.md` / `.json` 端点，表现为 `net::ERR_BLOCKED_BY_CLIENT`。本轮已用 `curl` 验证 `/index.md`、`/llms.txt`、`/ai-index.json`、`/ai/summary.json`、`/api/geo/audit-v2` 等端点真实返回；浏览器侧通过登录后的 `/dashboard/geo-citation` 页面完成可视验收。后续若要在浏览器直接看 raw 文件，可继续使用普通 HTML 包装页或禁用相关拦截扩展。
- in-app Browser 的 Playwright `fill/type` 在本轮触发虚拟剪贴板限制；页面按钮提交本身正常，已通过浏览器真实点击提交默认 Citation Pack 表单并生成 `cp-6049d3a7`。后续如需强制改中文字段值，可优先用页面自身按钮/默认值或 DOM 坐标输入方案。
