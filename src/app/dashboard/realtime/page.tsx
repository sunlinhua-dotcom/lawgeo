import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getCurrentBrand, getConversionProfile } from "@/lib/brand";
import { redirect } from "next/navigation";
import { BrandGate } from "@/components/dashboard/brand-gate";
import { RealtimeTool } from "@/components/dashboard/realtime-tool";
import { DashHeader } from "@/components/ui/section";

export const metadata = { title: "实时查询", robots: { index: false } };

export default async function RealtimePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const brand = await getCurrentBrand(session.userId);
  if (!brand) return <BrandGate moduleName="实时查询" />;

  const profile = await getConversionProfile(brand.id);
  const history = await db
    .select()
    .from(schema.realtimeSearches)
    .where(eq(schema.realtimeSearches.userId, session.userId))
    .orderBy(desc(schema.realtimeSearches.createdAt))
    .limit(20);

  const hasConversionTargets =
    !!profile && (!!profile.phone || !!profile.wechat || (profile.conversionTargets && profile.conversionTargets !== "[]"));

  return (
    <div className="px-6 py-8 lg:px-10">
      <DashHeader
        title={<>实时查询 <span className="gradient-text">+ 追问转化命中</span></>}
        description={`在 4 大 AI 平台实时提问 → 看「${brand.name}」是否被提及、Top1/Top3、情绪 → 追问联系方式测转化。`}
      />
      <RealtimeTool
        brandName={brand.name}
        hasConversionTargets={!!hasConversionTargets}
        initialHistory={history}
      />
    </div>
  );
}
