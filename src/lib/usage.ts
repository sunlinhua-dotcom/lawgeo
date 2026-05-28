import "server-only";
import { randomUUID } from "node:crypto";
import { and, eq, sql } from "drizzle-orm";
import { db, schema } from "./db";

export function yearMonth(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

type UsageField = "generations" | "queries" | "audits";

/** atomic upsert + increment 一次使用计数 */
export async function incUsage(userId: string, field: UsageField, by = 1, costCents = 0) {
  const ym = yearMonth();
  const existing = await db
    .select()
    .from(schema.usageMonth)
    .where(and(eq(schema.usageMonth.userId, userId), eq(schema.usageMonth.yearMonth, ym)))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(schema.usageMonth).values({
      id: randomUUID(),
      userId,
      yearMonth: ym,
      generations: field === "generations" ? by : 0,
      queries: field === "queries" ? by : 0,
      audits: field === "audits" ? by : 0,
      costCents,
    });
    return;
  }
  const fieldCol = schema.usageMonth[field];
  await db
    .update(schema.usageMonth)
    .set({
      [field]: sql`${fieldCol} + ${by}`,
      costCents: sql`${schema.usageMonth.costCents} + ${costCents}`,
    })
    .where(and(eq(schema.usageMonth.userId, userId), eq(schema.usageMonth.yearMonth, ym)));
}

export interface PlanLimits {
  keywords: number;
  generationsPerMonth: number;
  platforms: number;
  label: string;
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  trial: { keywords: 5, generationsPerMonth: 5, platforms: 4, label: "试用版" },
  starter: { keywords: 30, generationsPerMonth: 30, platforms: 4, label: "起步版" },
  standard: { keywords: 100, generationsPerMonth: 200, platforms: 12, label: "标准版" },
  enterprise: { keywords: 99999, generationsPerMonth: 99999, platforms: 12, label: "企业版" },
};

/** 拿当前用户的订阅状态 + 本月用量 */
export async function getUserPlan(userId: string) {
  const subs = await db
    .select()
    .from(schema.subscriptions)
    .where(eq(schema.subscriptions.userId, userId))
    .limit(1);
  let sub = subs[0];
  if (!sub) {
    const id = randomUUID();
    await db.insert(schema.subscriptions).values({ id, userId, plan: "trial" });
    sub = (
      await db
        .select()
        .from(schema.subscriptions)
        .where(eq(schema.subscriptions.id, id))
        .limit(1)
    )[0];
  }
  const usage = await db
    .select()
    .from(schema.usageMonth)
    .where(and(eq(schema.usageMonth.userId, userId), eq(schema.usageMonth.yearMonth, yearMonth())))
    .limit(1);
  return {
    subscription: sub,
    limits: PLAN_LIMITS[sub.plan],
    usage: usage[0] ?? null,
  };
}

/** 检查 quota 是否还有剩余，超额则抛错 */
export async function checkQuota(userId: string, field: UsageField) {
  const { subscription, limits, usage } = await getUserPlan(userId);
  const used = usage?.[field] ?? 0;
  const cap =
    field === "generations" ? limits.generationsPerMonth : field === "queries" ? limits.platforms * 100 : 1000;
  if (used >= cap) {
    throw new Error(
      `本月 ${field} 配额已用完（${used}/${cap}），请升级套餐。当前：${limits.label}`,
    );
  }
  return { subscription, limits, used, cap };
}
