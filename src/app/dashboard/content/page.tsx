import { and, desc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getCurrentBrand } from "@/lib/brand";
import { redirect } from "next/navigation";
import { BrandGate } from "@/components/dashboard/brand-gate";
import { ContentWizard } from "@/components/dashboard/content-wizard";
import { DashHeader } from "@/components/ui/section";

export const metadata = { title: "内容创作及发布", robots: { index: false } };

export default async function ContentPage({
  searchParams,
}: {
  searchParams: Promise<{ intent?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const brand = await getCurrentBrand(session.userId);
  if (!brand) return <BrandGate moduleName="内容创作及发布" />;

  const sp = await searchParams;
  const intents = await db
    .select()
    .from(schema.intents)
    .where(and(eq(schema.intents.userId, session.userId), eq(schema.intents.brandId, brand.id)))
    .orderBy(desc(schema.intents.priority));
  const articles = await db
    .select()
    .from(schema.contentArticles)
    .where(and(eq(schema.contentArticles.userId, session.userId), eq(schema.contentArticles.brandId, brand.id)))
    .orderBy(desc(schema.contentArticles.createdAt))
    .limit(30);

  return (
    <div className="px-6 py-8 lg:px-10">
      <DashHeader
        title={<>内容创作及发布 <span className="gradient-text">· 7 维 GEO 评分</span></>}
        description={`为「${brand.name}」生成 AI 友好内容，自动按标题/首段直答/去AI味/结构/权威/匹配/转化 7 维打分。`}
      />
      <ContentWizard
        brandName={brand.name}
        intents={intents.map((i) => ({ id: i.id, text: i.text, geoIndex: i.geoIndex }))}
        presetIntent={sp.intent}
        initialArticles={articles}
      />
    </div>
  );
}
