import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getDriver, SUPPORTED_PLATFORMS, type RemotePlatform } from "@/lib/publishers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const rows = await db
    .select({
      id: schema.publishCredentials.id,
      platform: schema.publishCredentials.platform,
      accountId: schema.publishCredentials.accountId,
      accountName: schema.publishCredentials.accountName,
      verifiedAt: schema.publishCredentials.verifiedAt,
      createdAt: schema.publishCredentials.createdAt,
    })
    .from(schema.publishCredentials)
    .where(eq(schema.publishCredentials.userId, session.userId));
  return NextResponse.json({ credentials: rows });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = (await req.json()) as { platform: RemotePlatform; token: string; accountId?: string };
  if (!SUPPORTED_PLATFORMS.includes(body.platform)) {
    return NextResponse.json({ error: "platform 不支持" }, { status: 400 });
  }
  if (!body.token || body.token.length < 10) {
    return NextResponse.json({ error: "token 格式无效" }, { status: 400 });
  }

  const driver = getDriver(body.platform);
  if (!driver) return NextResponse.json({ error: "driver missing" }, { status: 500 });

  // 验证 token
  const verify = await driver.verify(body.token);
  if (!verify.ok) {
    return NextResponse.json({ error: verify.error ?? "token 验证失败" }, { status: 400 });
  }

  // upsert
  const existing = await db
    .select()
    .from(schema.publishCredentials)
    .where(
      and(
        eq(schema.publishCredentials.userId, session.userId),
        eq(schema.publishCredentials.platform, body.platform),
      ),
    )
    .limit(1);

  const accountId = body.accountId ?? verify.accountId;
  if (existing.length > 0) {
    await db
      .update(schema.publishCredentials)
      .set({
        token: body.token,
        accountId,
        accountName: verify.accountName,
        verifiedAt: new Date(),
      })
      .where(eq(schema.publishCredentials.id, existing[0].id));
    return NextResponse.json({ ok: true, accountId, accountName: verify.accountName, accounts: verify.accounts });
  }
  await db.insert(schema.publishCredentials).values({
    id: randomUUID(),
    userId: session.userId,
    platform: body.platform,
    token: body.token,
    accountId,
    accountName: verify.accountName,
    verifiedAt: new Date(),
  });
  return NextResponse.json({ ok: true, accountId, accountName: verify.accountName, accounts: verify.accounts });
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { platform } = (await req.json()) as { platform: RemotePlatform };
  await db
    .delete(schema.publishCredentials)
    .where(
      and(
        eq(schema.publishCredentials.userId, session.userId),
        eq(schema.publishCredentials.platform, platform),
      ),
    );
  return NextResponse.json({ ok: true });
}
