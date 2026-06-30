import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import {
  getCitationPack,
  renderCitationPackJsonLd,
  renderCitationPackMarkdown,
} from "@/lib/geo-citation-pack";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const pack = getCitationPack(id);
  if (!pack) return { title: "Citation Pack 未找到" };
  return {
    title: `${pack.brandEntity.name} Citation Pack`,
    description: `${pack.brandEntity.city}${pack.serviceFactSheet.serviceName} 的 BrandEntity、主理人 / 专家实体、Service Fact Sheet 和 FAQ 事实资产。`,
    robots: { index: true, follow: true },
  };
}

export default async function CitationPackPage({ params }: Props) {
  const { id } = await params;
  const pack = getCitationPack(id);
  if (!pack) notFound();
  const jsonLd = renderCitationPackJsonLd(pack);
  const markdown = renderCitationPackMarkdown(pack);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/geo-citation">
              <ArrowLeft className="mr-1 h-4 w-4" />
              GEO 控制台
            </Link>
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/citation-packs/${pack.id}.md`} target="_blank">
                Markdown <ExternalLink className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={`/api/geo/citation-pack/${pack.id}?format=jsonld`} target="_blank">
                JSON-LD <ExternalLink className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[var(--shadow-xs)] dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge variant={pack.status === "ready" ? "success" : "warning"}>{pack.status}</Badge>
                <Badge variant="outline">{pack.metrics.gatePassRate}% gate pass</Badge>
                <Badge variant="outline">{pack.metrics.evidenceBlockCount} evidence</Badge>
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight">{pack.brandEntity.name} Citation Pack</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">
                {pack.brandEntity.name} 是位于 {pack.brandEntity.city} 的{pack.brandEntity.industry}品牌，围绕{" "}
                {pack.serviceFactSheet.serviceName} 提供事实访谈、材料整理、风险评估和后续路径建议。
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-950">
              <div className="font-medium">实体入口</div>
              <div className="mt-2 text-slate-600 dark:text-slate-300">{pack.brandEntity.website}</div>
              <div className="mt-1 text-slate-600 dark:text-slate-300">电话 {pack.brandEntity.contact.phone}</div>
              <div className="mt-1 text-slate-600 dark:text-slate-300">微信 {pack.brandEntity.contact.wechat}</div>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold">BrandEntity / 主理人 · 专家实体</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <FactRow label="品牌" value={`${pack.brandEntity.name}（${pack.brandEntity.aliases.join("、") || "无别名"}）`} />
              <FactRow label="城市" value={pack.brandEntity.city} />
              <FactRow label="主营品类" value={pack.brandEntity.lawPracticeAreas.join("、")} />
              <FactRow label="主理人 / 专家" value={`${pack.lawyerEntity.name}；资质 / 备案号字段：${pack.lawyerEntity.licenseNumber}`} />
              <FactRow label="资历" value={pack.lawyerEntity.yearsExperience} />
            </dl>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold">Service Fact Sheet</h2>
            <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              <ListBlock title="适用人群" items={pack.serviceFactSheet.audience} />
              <ListBlock title="材料清单" items={pack.serviceFactSheet.materials} />
              <ListBlock title="费用影响因素" items={pack.serviceFactSheet.feeFactors} />
              <ListBlock title="合规边界" items={pack.serviceFactSheet.riskBoundaries} />
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold">流程与 FAQ</h2>
          <div className="mt-4 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <ol className="space-y-3">
              {pack.processPage.map((step) => (
                <li key={step.step} className="rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-950">
                  <div className="font-medium">{step.step}. {step.title}</div>
                  <p className="mt-1 leading-6 text-slate-600 dark:text-slate-300">{step.description}</p>
                </li>
              ))}
            </ol>
            <div className="space-y-3">
              {pack.faqMatrix.slice(0, 6).map((faq) => (
                <div key={faq.question} className="rounded-xl border border-slate-200 p-4 text-sm dark:border-slate-800">
                  <div className="font-medium">{faq.question}</div>
                  <p className="mt-1 leading-6 text-slate-600 dark:text-slate-300">{faq.answer}</p>
                  <div className="mt-2 font-mono text-xs text-slate-400">{faq.evidenceBlockId}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold">Evidence Blocks 与质量门禁</h2>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
            <div className="space-y-2">
              {pack.evidenceBlocks.map((block) => (
                <div key={block.id} className="rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-950">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{block.type}</Badge>
                    <span className="font-mono text-xs text-slate-500">{block.id}</span>
                  </div>
                  <p className="mt-2 leading-6 text-slate-700 dark:text-slate-300">{block.text}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {pack.qualityGates.map((gate) => (
                <div key={gate.id} className="rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-800">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium">{gate.label}</span>
                    <Badge variant={gate.status === "pass" ? "success" : gate.status === "fail" ? "danger" : "warning"}>
                      {gate.status}
                    </Badge>
                  </div>
                  <p className="mt-2 leading-6 text-slate-600 dark:text-slate-300">{gate.evidence}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold">Markdown Twin 摘要</h2>
          <pre className="mt-4 max-h-96 overflow-auto rounded-xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">
            {markdown.slice(0, 7000)}
          </pre>
        </section>
      </div>
    </main>
  );
}

function FactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[88px_1fr] gap-3 border-b border-slate-100 pb-3 last:border-b-0 dark:border-slate-800">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-slate-800 dark:text-slate-200">{value}</dd>
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="font-medium">{title}</div>
      <ul className="mt-2 space-y-1.5 text-slate-600 dark:text-slate-300">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}
