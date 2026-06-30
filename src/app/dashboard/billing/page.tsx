import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getUserPlan, PLAN_LIMITS, yearMonth } from "@/lib/usage";
import { getWallet, listLedgers } from "@/lib/tokens";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import { TokenPanel } from "@/components/dashboard/token-panel";

export const metadata = { title: "套餐 / Token", robots: { index: false } };

export default async function BillingPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const plan = await getUserPlan(session.userId);
  const [wallet, ledgers] = await Promise.all([getWallet(session.userId), listLedgers(session.userId, 50)]);
  const limits = plan.limits;
  const usage = plan.usage;
  const pct = (used: number, cap: number) => Math.min(100, Math.round((used / cap) * 100));

  return (
    <div className="px-6 py-8 lg:px-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">套餐 / Token</h1>
        <p className="mt-1 text-sm text-slate-500">本月：{yearMonth()}</p>
      </div>

      {/* Token 钱包 */}
      <div className="mb-6">
        <TokenPanel wallet={wallet} ledgers={ledgers} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 当前套餐 */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              当前套餐
              <Badge variant="primary">{limits.label}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <Row label="关键词额度" value={`${limits.keywords} 个`} />
              <Row label="本月生成额度" value={`${limits.generationsPerMonth} 篇`} />
              <Row label="监测平台数" value={`${limits.platforms} 个`} />
              {plan.subscription.expiresAt && (
                <Row label="到期时间" value={new Date(plan.subscription.expiresAt).toLocaleDateString("zh-CN")} />
              )}
            </dl>
            <Button asChild variant="primary" className="mt-6 w-full">
              <Link href="/pricing">升级套餐</Link>
            </Button>
          </CardContent>
        </Card>

        {/* 本月用量 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">本月用量</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              <UsageBar
                label="AI 内容生成"
                used={usage?.generations ?? 0}
                cap={limits.generationsPerMonth}
                pct={pct(usage?.generations ?? 0, limits.generationsPerMonth)}
              />
              <UsageBar
                label="AI 引用查询"
                used={usage?.queries ?? 0}
                cap={limits.platforms * 100}
                pct={pct(usage?.queries ?? 0, limits.platforms * 100)}
              />
              <UsageBar
                label="GEO 诊断"
                used={usage?.audits ?? 0}
                cap={1000}
                pct={pct(usage?.audits ?? 0, 1000)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 套餐对比 */}
      <div className="mt-12">
        <h2 className="mb-4 text-lg font-semibold">所有套餐</h2>
        <div className="grid gap-4 md:grid-cols-4">
          {Object.entries(PLAN_LIMITS).map(([key, lim]) => (
            <Card
              key={key}
              className={`lift ${plan.subscription.plan === key ? "border-indigo-500" : ""}`}
            >
              <CardHeader>
                <CardTitle className="text-base">{lim.label}</CardTitle>
                {plan.subscription.plan === key && (
                  <Badge variant="success" className="self-start">
                    <CheckCircle2 className="mr-1 h-3 w-3" /> 当前
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <li>· <span className="num">{lim.keywords}</span> 关键词</li>
                  <li>· <span className="num">{lim.generationsPerMonth}</span> 篇 / 月</li>
                  <li>· <span className="num">{lim.platforms}</span> 平台</li>
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-6 rounded-xl bg-indigo-50 p-4 text-sm text-indigo-900 dark:bg-indigo-950 dark:text-indigo-200">
          💡 升级请联系销售：<Link href="/contact" className="font-semibold underline">hi@brandgeo.cn</Link>
          或微信 <span className="num">lawgeo-001</span>。年付享 8 折优惠。
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function UsageBar({ label, used, cap, pct }: { label: string; used: number; cap: number; pct: number }) {
  const tone = pct >= 90 ? "rose" : pct >= 70 ? "amber" : "indigo";
  const colorClass = {
    rose: "bg-rose-500",
    amber: "bg-amber-500",
    indigo: "bg-indigo-500",
  }[tone];
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-sm">
        <span>{label}</span>
        <span className="num text-slate-500">
          {used.toLocaleString()} / {cap.toLocaleString()}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div className={`h-full ${colorClass} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
