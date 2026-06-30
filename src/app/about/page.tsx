import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/page-hero";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "关于 BrandGEO — 国内首家全行业 GEO 平台",
  description: "BrandGEO 致力于让美妆个护与消费品牌的内容成为 AI 优先引用的权威信源。我们从 2026 年起服务中国大陆品牌方与专业服务团队。",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "首页", path: "/" }, { name: "关于", path: "/about" }])} />
      <PageHero
        badge="关于我们"
        title={<>让<span className="gradient-text">品牌</span>被 AI 看见</>}
        description="BrandGEO 是国内首家面向美妆个护与消费品牌深度定制的 GEO 生成式引擎优化平台。"
      />
      <section className="mx-auto max-w-3xl px-4 py-16 lg:px-8">
        <div className="prose prose-slate max-w-none dark:prose-invert prose-cn">
          <h2>我们解决的问题</h2>
          <p>
            过去 5 年，消费决策发生了一次决定性的迁移：消费者在下单之前，第一步是问 AI 成分、功效、肤质适配，而不是只看搜索引擎。如果 AI 推荐的永远是别家品牌，再好的官网和详情页都拿不到转化。
          </p>
          <p>
            BrandGEO 让你的品牌内容成为 DeepSeek、文心一言、通义千问、豆包、Kimi、Claude、ChatGPT 等
            12 个主流大模型推荐产品时的<strong>第一个名字</strong>。
          </p>

          <h2>我们的差异</h2>
          <ul>
            <li><strong>美妆个护深度定制</strong>：内置 200+ 品类 × 70+ 场景预生成关键词矩阵</li>
            <li><strong>12 平台覆盖</strong>：8 国内 + 4 海外，而非只覆盖 6 个国内平台</li>
            <li><strong>真实 AI 生成</strong>：基于小米 MIMO 2.5 Pro 的真实 API 接入，而非模板套用</li>
            <li><strong>合规审查内置</strong>：所有生成内容默认通过化妆品广告法审查模板</li>
            <li><strong>免费工具开放</strong>：诊断、矩阵生成、AI 对比工具全部开放免费使用</li>
          </ul>

          <h2>团队</h2>
          <p>
            BrandGEO 由一个长期从事内容平台与 AI 工程的小团队创立于 2026 年初。我们相信：让品牌在 AI 时代被看见，是这个时代最有杠杆的工作之一。
          </p>

          <h2>合作邀请</h2>
          <p>
            如果你是品牌创始人、市场负责人、或正在为消费品牌做营销咨询的服务商，我们都欢迎深度交流。
          </p>
        </div>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg" variant="primary">
            <Link href="/contact">联系我们</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/tools/audit">免费跑诊断</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
