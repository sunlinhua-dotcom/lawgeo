import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "服务条款 — BrandGEO",
  description: "了解 BrandGEO 诊断、内容生成、AI 引用监测、多平台发布、控制台和私有化部署服务的使用规则。",
  alternates: { canonical: "/terms" },
};

const sections = [
  {
    title: "服务范围",
    body: [
      "BrandGEO 提供 GEO 诊断、关键词矩阵、AI 内容生成、多平台引用对比、行业博客、发布适配、转化追踪、告警和报告等工具。",
      "部分功能依赖第三方模型、浏览器扩展、发布平台或邮件服务。第三方服务的可用性、审核规则和接口限制以其官方规则为准。",
    ],
  },
  {
    title: "用户责任",
    body: [
      "你需要确保提交的域名、业务资料、客户案例、联系方式和第三方 token 具有合法授权。",
      "律师、金融、医疗等专业内容需要由具备资质的人员复核。AI 生成内容只能作为初稿或辅助建议，不构成法律意见、投资建议或医疗建议。",
    ],
  },
  {
    title: "内容合规",
    body: [
      "BrandGEO 会尽量提供广告法、化妆品广告规范、各行业执业规范和 GEO 结构化写作相关的合规提示，但不能替代人工审核。",
      "用户不得使用本服务生成或发布违法、侵权、虚假承诺、恶意攻击、泄露隐私或侵犯第三方权益的内容。",
    ],
  },
  {
    title: "可用性与限制",
    body: [
      "本地开发和私有化部署环境的可用性取决于你的服务器、数据库、环境变量、模型 key、第三方平台 token 和网络条件。",
      "对于第三方接口变更、平台审核拒绝、模型输出偏差、网络中断或用户配置错误造成的影响，BrandGEO 会提供合理排查建议，但不承诺完全控制外部结果。",
    ],
  },
  {
    title: "费用与终止",
    body: [
      "商业合作、套餐额度、KPI 验收与退款规则以双方签署的合同或确认单为准。",
      "如用户违反法律法规、平台规则或本条款，我们可以暂停相关服务或要求用户停止使用特定功能。",
    ],
  },
];

export default function TermsPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "首页", path: "/" }, { name: "服务条款", path: "/terms" }])} />
      <PageHero
        badge="服务条款"
        title={<>使用 BrandGEO 的<span className="gradient-text">基本规则</span></>}
        description="本条款适用于 BrandGEO 的公开工具、控制台、内容生成、监测、发布和私有化部署相关服务。"
      />
      <section className="mx-auto max-w-3xl px-4 py-16 lg:px-8">
        <div className="prose prose-slate max-w-none dark:prose-invert prose-cn">
          <p className="text-sm text-slate-500">最后更新：2026-05-30</p>
          {sections.map((section) => (
            <section key={section.title}>
              <h2>{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}
          <h2>联系我们</h2>
          <p>
            如需确认合同、发票、私有化部署或服务边界，请联系 {siteConfig.contact.email}。
          </p>
        </div>
      </section>
    </>
  );
}
