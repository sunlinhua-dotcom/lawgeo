import { and, desc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getCurrentBrand } from "@/lib/brand";
import { redirect } from "next/navigation";
import { BrandGate } from "@/components/dashboard/brand-gate";
import { IntentManager } from "@/components/dashboard/intent-manager";
import { DashHeader } from "@/components/ui/section";

export const metadata = { title: "定位搜索意图", robots: { index: false } };

export default async function IntentPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const brand = await getCurrentBrand(session.userId);
  if (!brand) return <BrandGate moduleName="定位搜索意图" />;

  const intents = await db
    .select()
    .from(schema.intents)
    .where(and(eq(schema.intents.userId, session.userId), eq(schema.intents.brandId, brand.id)))
    .orderBy(desc(schema.intents.priority), desc(schema.intents.geoIndex));

  return (
    <div className="px-6 py-8 lg:px-10">
      <DashHeader
        title="定位搜索意图"
        description={`为「${brand.name}」维护意图词库，每个词带 AI 搜索热度（GEO 指数）和触发概率，决定优先做哪些。`}
      />
      <IntentManager initialIntents={intents} brandName={brand.name} />
    </div>
  );
}
