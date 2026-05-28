import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AlertsManager } from "@/components/dashboard/alerts-manager";

export const metadata = { title: "邮件告警", robots: { index: false } };

export default async function AlertsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const subs = await db
    .select()
    .from(schema.alertSubscriptions)
    .where(eq(schema.alertSubscriptions.userId, session.userId));
  const projects = await db.select().from(schema.projects).where(eq(schema.projects.userId, session.userId));

  return (
    <div className="px-6 py-8 lg:px-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">邮件告警</h1>
        <p className="mt-1 text-sm text-slate-500">
          引用率下跌、Top 3 跌出、竞品反超时，向你的邮箱推送告警。
        </p>
      </div>
      <AlertsManager initialSubs={subs} projects={projects} defaultEmail={session.email} />
    </div>
  );
}
