import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getCurrentBrand } from "@/lib/brand";
import { redirect } from "next/navigation";
import { BrandGate } from "@/components/dashboard/brand-gate";
import { InsightManager } from "@/components/dashboard/insight-manager";
import { DashHeader } from "@/components/ui/section";

export const metadata = { title: "洞察与诊断", robots: { index: false } };

export default async function InsightPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const brand = await getCurrentBrand(session.userId);
  if (!brand) return <BrandGate moduleName="洞察与诊断" />;

  const insights = await db
    .select()
    .from(schema.insights)
    .where(eq(schema.insights.userId, session.userId))
    .orderBy(desc(schema.insights.createdAt))
    .limit(20);

  return (
    <div className="px-6 py-8 lg:px-10">
      <DashHeader
        title="洞察与诊断"
        description={`分析「${brand.name}」在 AI 搜索里的可见性缺口：竞品、信源、热词、品牌问题，给出该补什么。`}
      />
      <InsightManager
        brand={{ name: brand.name, industry: brand.industry, website: brand.website }}
        initialInsights={insights}
      />
    </div>
  );
}
