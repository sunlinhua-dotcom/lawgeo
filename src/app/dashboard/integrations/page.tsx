import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { IntegrationsManager } from "@/components/dashboard/integrations-manager";

export const metadata = { title: "海外平台 API 接入", robots: { index: false } };

export default async function IntegrationsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const creds = await db
    .select({
      id: schema.publishCredentials.id,
      platform: schema.publishCredentials.platform,
      accountId: schema.publishCredentials.accountId,
      accountName: schema.publishCredentials.accountName,
      verifiedAt: schema.publishCredentials.verifiedAt,
    })
    .from(schema.publishCredentials)
    .where(eq(schema.publishCredentials.userId, session.userId));
  return (
    <div className="px-6 py-8 lg:px-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">海外平台 API 接入</h1>
        <p className="mt-1 text-sm text-slate-500">
          配置 Dev.to / Hashnode / Medium 的 API token，<strong>真实</strong>自动发布。
          国内平台（知乎 / 百家号等）因平台未开放 API，仍使用「复制 + 一键打开编辑器」流程。
        </p>
      </div>
      <IntegrationsManager initialCreds={creds} />
    </div>
  );
}
