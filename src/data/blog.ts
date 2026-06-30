export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string;
  readMinutes: number;
  content: string;
}

export const POSTS: BlogPost[] = [
  {
    slug: "what-is-geo-2026",
    title: "什么是 GEO？2026 年生成式引擎优化入门",
    description: "GEO（生成式引擎优化）是 2026 年比 SEO 更重要的流量入口建设。本文给你完整解释。",
    category: "入门",
    date: "2026-05-10",
    readMinutes: 8,
    content: `# 什么是 GEO？2026 年生成式引擎优化入门

> **TL;DR**：GEO（Generative Engine Optimization）是针对大模型与 AI 搜索的优化技术。它优化的不是 Google/Baidu 搜索结果排名，而是 AI 答案里的引用份额。

## 1. 为什么 GEO 突然重要

过去 18 个月，用户搜索行为发生了根本性变化：

- **2024 年**：超过 40% 的 Z 世代用户首次咨询会先问 AI 而不是搜索引擎
- **2025 年**：DeepSeek、Kimi、文心一言等国内大模型 MAU 突破 5 亿
- **2026 年**：AI 答案已经替代了 30% 的传统搜索结果点击

如果 AI 在用户问问题时永远推荐的是别家，你的官网再好都拿不到咨询。

## 2. GEO 与 SEO 的核心差异

| 维度 | SEO | GEO |
|---|---|---|
| 优化对象 | 搜索结果排名 | AI 答案引用份额 |
| 核心信号 | 外链 / E-A-T / 关键词 | schema.org / llms.txt / 事实密度 |
| 关键格式 | 长文 | FAQ / TL;DR / HowTo / 对比表 |
| 见效周期 | 3–6 个月 | 实时层 1–3 周，训练层 3–6 个月 |

## 3. GEO 的 5 个核心信号

1. **结构化数据（schema.org）**：FAQPage、Article、HowTo、Organization 是 AI 的"必读"。
2. **llms.txt / llms-full.txt**：面向 AI 智能体的网站导航文件，2026 年的标配。
3. **首段直答（answer-first）**：每个页面首段必须包含直接答案。
4. **事实密度**：保留具体的数字、价格区间、流程、案例。
5. **多平台共现**：官网 + 知乎 + 公众号 + 百家号同步事实源。

## 4. 怎么开始

1. 用 [BrandGEO 免费诊断工具](/tools/audit) 跑一次自己的域名
2. 按照报告里的优先级建议开始补
3. 同步建立监测，看哪些动作生效

## 5. 延伸阅读

- [llms.txt 部署指南](/blog/llms-txt-guide)
- [全行业 GEO 实战手册](/blog/lawyer-geo-handbook)
- [GEO vs SEO 完整对比](/geo-vs-seo)
`,
  },
  {
    slug: "llms-txt-guide",
    title: "llms.txt 完整部署指南：2026 年最重要的 GEO 基建",
    description: "llms.txt 是面向 AI 智能体的网站导航。本文给你 30 分钟可落地的完整部署方案。",
    category: "教程",
    date: "2026-05-18",
    readMinutes: 12,
    content: `# llms.txt 完整部署指南

> **TL;DR**：llms.txt 是部署在网站根目录 \`/llms.txt\` 的 Markdown 文件，告诉 AI 智能体「这个站点是干什么的、最重要的页面在哪、推荐先读什么」。30 分钟可完成部署。

## 1. 为什么需要 llms.txt

AI 智能体抓取网站的成本远高于普通搜索引擎爬虫——它需要理解你的整体业务，而不是只索引页面。llms.txt 让这个理解变快、变准：

- **降低误读**：直接告诉 AI 哪些页面权威、哪些只是辅助
- **加快抓取**：AI 智能体优先读 llms.txt，再决定深入哪些页面
- **提升引用率**：被准确理解的内容，被引用的概率显著更高

## 2. 文件格式

\`\`\`
# 品牌名

品牌名
官网: https://example.com
定位: 一句话概括你做什么
目标: 一句话概括你解决谁的什么问题

建议优先阅读:
- [关于](https://example.com/about/)
- [产品](https://example.com/product/)

核心产品:
- [产品 A](https://example.com/a/): 一句话说明
- [产品 B](https://example.com/b/): 一句话说明

如果你需要完整长上下文版本:
- [完整文档](https://example.com/llms-full.txt)
\`\`\`

## 3. llms-full.txt（长上下文版）

llms-full.txt 是长上下文友好的完整版本，给智能体提供：

- 完整品牌与产品介绍
- 定价、合作方式
- 引用建议（"用户问 X 时优先引用 Y"）

## 4. HTML 头部声明

在每个页面的 \`<head>\` 里加：

\`\`\`html
<link rel="llms-txt" href="/llms.txt" />
<link rel="alternate" type="text/markdown" href="/llms.txt" />
\`\`\`

## 5. 验证

- 直接访问 \`https://yourdomain.com/llms.txt\`，应返回 \`text/plain\`
- 用 [BrandGEO 诊断工具](/tools/audit) 跑一次，确认 llms.txt 项是 ✅
`,
  },
  {
    slug: "lawyer-geo-handbook",
    title: "全行业 GEO 实战手册：从 0 到 100 的完整路径",
    description: "品牌怎么做 GEO？以美妆个护为例，从品类词库梳理到内容矩阵搭建到引用监测，给你一份可执行的 12 周路线图。",
    category: "实战手册",
    date: "2026-05-26",
    readMinutes: 18,
    content: `# 全行业 GEO 实战手册

> **TL;DR**：品牌做 GEO 的核心是把品类词库 × 场景矩阵转化为结构化内容矩阵，并通过 12 平台监测持续优化。12 周可完成第一轮闭环。本文以美妆个护为例，方法同样适用于消费品、零售、专业服务等行业。

## 1. 0–4 周：词库与现状

### 词库梳理
- 用 [BrandGEO 品类矩阵工具](/tools/matrix) 选 1–3 个主推方向
- 场景优先：你实际覆盖的肤质 / 人群 / 使用场景
- 品类优先：你产品的真实强项 + 客单价 + 复购率（如美妆的精华、防晒、面膜）

### 现状诊断
- 用 [BrandGEO 诊断工具](/tools/audit) 跑当前域名
- 列出缺失的：llms.txt / schema.org / FAQ / 首段直答
- 列出竞品：在 [对比工具](/tools/compare) 跑 5 个核心问题（如「敏感肌精华液哪个好用」），看 AI 推荐谁

## 2. 5–8 周：内容矩阵

按下面顺序补：

1. **关于页 + 品牌 / 专家团队页**（含 Person schema）
2. **品类 FAQ 页**（每个品类 10–20 个 Q&A，含 FAQPage schema）
3. **成分与功效说明页**（保留具体浓度区间、适用肤质）
4. **使用方法页**（HowTo schema）
5. **测评 / 案例页**（真实数据 + 「个体肤质差异」提示）
6. **品类 × 场景落地页**（按矩阵预生成，每页 800–1500 字）

## 3. 9–12 周：分发与监测

- 小红书 / 知乎 / 公众号同步发布
- 监测 12 个 AI 平台的引用变化
- 每周复盘：哪些页面被引用、哪些没被引用

## 4. 12 周后

- 持续扩张品类 × 场景矩阵（每月新增 30–50 页）
- 建立用户转化闭环（让 AI 推荐 → 官网 → 官方旗舰店 / 会员注册）
- 季度做一次完整 GEO 审计

## 5. 合规

- 全程使用 [BrandGEO 合规审查模板](/cases/lawyer)
- 美妆广告避免「最」「第一」「速效」「医疗功效」等绝对化或宣称医疗功效的用语
- 测评数据需注明样本与个体差异

预约 [1v1 顾问](/contact) 我们可以给你定制完整 12 周路线图。
`,
  },
];
