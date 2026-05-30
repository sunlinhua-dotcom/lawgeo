import "server-only";
import { randomUUID } from "node:crypto";
import { eq, desc, sql } from "drizzle-orm";
import { db, schema } from "./db";

/** 取/建用户 token 钱包（首次送 100 万 token） */
export async function getWallet(userId: string) {
  const rows = await db.select().from(schema.tokenWallets).where(eq(schema.tokenWallets.userId, userId)).limit(1);
  if (rows[0]) return rows[0];
  const id = randomUUID();
  await db.insert(schema.tokenWallets).values({ id, userId });
  return (await db.select().from(schema.tokenWallets).where(eq(schema.tokenWallets.id, id)).limit(1))[0];
}

/** 扣费：记一条 consume 流水，扣余额。amount = token 数（正数） */
export async function consumeTokens(userId: string, amount: number, source: string, note?: string) {
  if (!amount || amount <= 0) return;
  const wallet = await getWallet(userId);
  const newBalance = Math.max(0, wallet.balance - amount);
  await db
    .update(schema.tokenWallets)
    .set({
      balance: newBalance,
      totalConsumed: sql`${schema.tokenWallets.totalConsumed} + ${amount}`,
      updatedAt: new Date(),
    })
    .where(eq(schema.tokenWallets.id, wallet.id));
  await db.insert(schema.tokenLedgers).values({
    id: randomUUID(),
    userId,
    amount: -amount,
    balanceAfter: newBalance,
    type: "consume",
    source,
    note,
  });
}

export async function rechargeTokens(userId: string, amount: number, note?: string) {
  const wallet = await getWallet(userId);
  const newBalance = wallet.balance + amount;
  await db
    .update(schema.tokenWallets)
    .set({
      balance: newBalance,
      totalRecharged: sql`${schema.tokenWallets.totalRecharged} + ${amount}`,
      updatedAt: new Date(),
    })
    .where(eq(schema.tokenWallets.id, wallet.id));
  await db.insert(schema.tokenLedgers).values({
    id: randomUUID(),
    userId,
    amount,
    balanceAfter: newBalance,
    type: "recharge",
    note,
  });
}

export async function listLedgers(userId: string, limit = 100) {
  return db
    .select()
    .from(schema.tokenLedgers)
    .where(eq(schema.tokenLedgers.userId, userId))
    .orderBy(desc(schema.tokenLedgers.createdAt))
    .limit(limit);
}
