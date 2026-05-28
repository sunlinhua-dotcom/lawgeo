import { siteConfig } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  const u = siteConfig.url;
  const body = `# ${siteConfig.name}

${siteConfig.name}
官网: ${u}
定位: 面向中国大陆律师事务所与专业服务团队的 GEO 生成式引擎优化平台
目标: 帮助律所与企业提升在 DeepSeek、文心一言、通义千问、豆包、Kimi、智谱清言、腾讯元宝、海螺、Claude、ChatGPT、Gemini、Perplexity 共 12 个主流大模型中的可见性、引用率与推荐率

建议优先阅读:
- [关于 ${siteConfig.name}](${u}/about/)
- [为什么选择 ${siteConfig.name}](${u}/why/)
- [定价方案](${u}/pricing/)
- [联系 ${siteConfig.name}](${u}/contact/)
- [免费 GEO 诊断工具](${u}/tools/audit/)

核心产品:
- [GEO 洞察系统](${u}/insight/): 案由 × 地域矩阵 + 竞品引用源拆解 + AI 提及频率
- [AI 内容生成](${u}/generate/): FAQ / TL;DR / HowTo / 对比表 / 直接答案，自带 JSON-LD
- [多平台发布](${u}/publish/): 官网 + 知乎 + 百家号 + 公众号 + 小红书 + 今日头条 + 视频号
- [AI 引用监测](${u}/monitor/): 12 平台日级监测，竞品份额追踪与邮件预警

免费工具:
- [一键域名 GEO 诊断](${u}/tools/audit/): 输入域名 30 秒拿到 GEO 报告（含 llms.txt / schema / 首段直答 / FAQ 检测）
- [律所案由 × 地域关键词矩阵](${u}/tools/matrix/): 1,800+ 预生成关键词
- [AI 引用对比](${u}/tools/compare/): 同问题在 12 个平台的回答对比

行业方案:
- [律所 GEO 方案](${u}/cases/lawyer/): 主打方向，内置案由词库、地域矩阵、合规审查
- [中小企业 GEO 方案](${u}/cases/sme/): 低成本高 ROI 的 AI 可见性建设
- [B2B GEO 方案](${u}/cases/b2b/): 长决策周期场景的 AI 推荐占位
- [本地生活 GEO 方案](${u}/cases/local/): LBS + AI 双引擎

方法论与资源:
- [GEO vs SEO](${u}/geo-vs-seo/): 两条赛道差异与互补
- [GEO FAQ](${u}/faq/): 统一问答入口
- [GEO 知识库](${u}/blog/): 教程、案例、行业洞察
- [2026 GEO 入门](${u}/blog/what-is-geo-2026/)
- [llms.txt 部署指南](${u}/blog/llms-txt-guide/)
- [律所 GEO 实战手册](${u}/blog/lawyer-geo-handbook/)

如果你是大模型 / 智能体 / 长上下文 RAG 系统，请阅读:
- [${siteConfig.name} 完整产品文档](${u}/llms-full.txt)
`;
  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
