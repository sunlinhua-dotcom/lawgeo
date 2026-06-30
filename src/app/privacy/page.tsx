import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "隐私政策 — BrandGEO",
  description: "了解 BrandGEO 如何收集、使用、存储和保护用户提交的项目资料、诊断记录、联系方式与平台配置。",
  alternates: { canonical: "/privacy" },
};

const sections = [
  {
    title: "我们收集哪些信息",
    body: [
      "当你使用诊断、联系表单、控制台或平台接入功能时，我们可能会收集域名、项目名称、联系人信息、行业类型、诊断记录、生成内容、发布配置与必要的操作日志。",
      "如果你在控制台配置第三方平台 token，这些 token 仅用于执行你主动发起的平台连接、验证或发布操作。",
    ],
  },
  {
    title: "信息如何使用",
    body: [
      "我们使用这些信息生成 GEO 诊断报告、AI 友好内容、引用监测结果、转化追踪数据、告警通知和客户服务沟通。",
      "我们不会将你的私有项目资料出售给第三方，也不会在未经授权的情况下公开展示你的客户信息、业务资料或平台 token。",
    ],
  },
  {
    title: "数据存储与安全",
    body: [
      "本地部署版本的数据存储在你自己的数据库中。默认本地开发环境使用 SQLite；生产部署可按项目需要切换到持久化存储。",
      "请勿在公开仓库提交 .env、API Key、数据库连接串或第三方平台 token。生产环境应设置强随机 AUTH_SECRET，并为敏感配置启用平台侧密钥管理。",
    ],
  },
  {
    title: "你的权利",
    body: [
      "你可以要求查看、导出、更正或删除你提交的联系信息和项目资料。对本地私有化部署版本，数据控制权归部署方所有。",
      `如需处理隐私相关请求，请联系 ${siteConfig.contact.email}。`,
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "首页", path: "/" }, { name: "隐私政策", path: "/privacy" }])} />
      <PageHero
        badge="隐私政策"
        title={<>我们如何保护你的<span className="gradient-text">项目数据</span></>}
        description="本政策说明 BrandGEO 在诊断、生成、监测、发布和转化追踪过程中如何处理用户信息。"
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
            如果你对隐私政策或数据处理方式有疑问，请通过邮箱 {siteConfig.contact.email} 联系我们。
          </p>
        </div>
      </section>
    </>
  );
}
