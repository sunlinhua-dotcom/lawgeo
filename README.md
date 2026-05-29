# lawGEO

> 律所 GEO 优化平台 — 让 AI 在回答法律问题时先推荐你

Next.js 16 + TypeScript + Tailwind v4 + Drizzle SQLite + Sonner + Framer Motion.

## 功能矩阵

- **营销站**（22 个页面）— 首页 / 4 个产品 / 8 大行业案例 / 出海 / 定价（月费 + KPI 按效果付费）/ FAQ / GEO vs SEO / 关于 / 团队 / 服务流程 / 市场洞察 / 博客
- **5 个免费工具** — `/tools/audit` 域名诊断、`/tools/generate` AI 生成、`/tools/intent` 意图聚类、`/tools/matrix` 案由 × 地域矩阵、`/tools/compare` 12 平台对比
- **8 大行业博客** — `/i/[industry]/` 公开博客 + 批量 AI 友好内容产出
- **控制台**（14 个子页）— 项目 / 诊断 / 生成 / 监测 / 关键词 / 知识库 / **行业博客批量发布** / 多平台发布 / 海外 API / 转化 / Agent / 报告 / 告警 / 计费
- **第三方集成** — Dev.to / Hashnode / Medium 真实 API；Wechatsync 浏览器扩展同步 29+ 中文平台
- **GEO 基建** — 完整 schema.org JSON-LD、llms.txt、sitemap.xml、robots.txt

## 本地开发

```bash
pnpm install
cp .env.example .env.local
# 填入 MIMO_API_KEY 和 AUTH_SECRET
pnpm db:push
pnpm dev
```

打开 http://localhost:4648。首次登录任意账号即注册。试试 `admin` / `admin`。

## 数据库

SQLite + Drizzle ORM。21 张表，schema 在 `src/lib/db/schema.ts`。

```bash
pnpm db:push      # 同步 schema 到 SQLite
pnpm db:studio    # 打开 Drizzle Studio
```

## 部署到 Zeabur

1. Zeabur 创建新服务，从这个 GitHub 仓库导入
2. 框架自动识别 Next.js（pnpm + Node 20+）
3. 在 Environment Variables 面板填入 `.env.example` 列出的变量（**必填** `MIMO_API_KEY` + `AUTH_SECRET`）
4. **关键**：挂一个 Persistent Volume 到 `/data`，把 `DATABASE_URL` 改成 `file:/data/lawgeo.db` —— SQLite 数据需要持久化
5. 部署后访问域名，所有功能即可使用

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Next.js 16 App Router + React 19 + TypeScript |
| 样式 | Tailwind v4 + 自定义设计系统 + Framer Motion |
| 后端 | Next.js API Routes + Drizzle ORM |
| 数据库 | SQLite (better-sqlite3, WAL 模式) |
| AI | 小米 MIMO 2.5 Pro 统一接入 + 可选真实多平台 key |
| 认证 | bcrypt + JWT cookie sessions (jose) |
| 通知 | Sonner toast + Resend 邮件 |
| 命令面板 | cmdk |

## License

私有项目，未授权请勿商用。
