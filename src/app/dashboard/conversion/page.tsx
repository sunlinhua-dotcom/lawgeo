import { desc, eq, and, gte } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ConversionManager } from "@/components/dashboard/conversion-manager";

export const metadata = { title: "转化追踪", robots: { index: false } };

export default async function ConversionPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const links = await db
    .select()
    .from(schema.conversionLinks)
    .where(eq(schema.conversionLinks.userId, session.userId))
    .orderBy(desc(schema.conversionLinks.createdAt));

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const events = await db
    .select()
    .from(schema.conversionEvents)
    .where(and(eq(schema.conversionEvents.userId, session.userId), gte(schema.conversionEvents.createdAt, since)))
    .orderBy(desc(schema.conversionEvents.createdAt))
    .limit(1000);

  return (
    <div className="px-6 py-8 lg:px-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">转化追踪与归因</h1>
        <p className="mt-1 text-sm text-slate-500">
          为 AI 推荐场景生成专属短链，追踪点击 → 留资 → 签约的全链路 ROI。
        </p>
      </div>
      <ConversionManager initialLinks={links} initialEvents={events} />
    </div>
  );
}
