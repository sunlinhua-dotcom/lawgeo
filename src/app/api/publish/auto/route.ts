import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { and, eq, inArray } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getDriver, SUPPORTED_PLATFORMS, type RemotePlatform } from "@/lib/publishers";
import { adaptForPlatform } from "@/lib/publish";
import type { PublishPlatform } from "@/lib/publish-specs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * 真实自动发布：
 * 输入：draftId + 远端平台列表（devto/hashnode/medium）
 * 流程：拉 draft → 拉 credentials → 调 driver.publish() → 落 publish_targets（status: published/failed）
 */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json()) as {
    draftId: string;
    platforms: RemotePlatform[];
    publish?: boolean;
  };
  if (!body.draftId || !Array.isArray(body.platforms) || body.platforms.length === 0) {
    return NextResponse.json({ error: "缺少 draftId 或 platforms" }, { status: 400 });
  }
  const platforms = body.platforms.filter((p) => SUPPORTED_PLATFORMS.includes(p));
  if (platforms.length === 0) {
    return NextResponse.json({ error: "无可用平台（仅支持 devto / hashnode / medium）" }, { status: 400 });
  }

  // 拉 draft
  const drafts = await db
    .select()
    .from(schema.contentDrafts)
    .where(eq(schema.contentDrafts.id, body.draftId))
    .limit(1);
  const draft = drafts[0];
  if (!draft) return NextResponse.json({ error: "draft not found" }, { status: 404 });
  if (draft.userId && draft.userId !== session.userId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // 拉所有 credentials
  const creds = await db
    .select()
    .from(schema.publishCredentials)
    .where(
      and(
        eq(schema.publishCredentials.userId, session.userId),
        inArray(schema.publishCredentials.platform, platforms),
      ),
    );
  const credMap = new Map(creds.map((c) => [c.platform, c]));

  // 对每个平台：先用 publish.ts 改写（标题/字数适配） — 海外平台用 markdown 直接发，无需中文平台改写
  // 这里直接用 draft.body 作为正文
  const canonicalUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://lawgeo.cn"}/blog/draft-${draft.id}`;

  const results = await Promise.all(
    platforms.map(async (platform) => {
      const cred = credMap.get(platform);
      if (!cred) return { platform, ok: false, error: `未配置 ${platform} 的 API token，请在 /dashboard/integrations 添加` };

      const driver = getDriver(platform);
      if (!driver) return { platform, ok: false, error: "driver not implemented" };

      // 简化：直接用 draft 原文（markdown），不需要 LLM 再改写一次
      // 如果你想给每个海外平台再用 MIMO 改写，可以打开下面注释
      // const adapted = await adaptForPlatform(platform as PublishPlatform, { title: draft.title, body: draft.body });

      const result = await driver.publish({
        token: cred.token,
        accountId: cred.accountId ?? undefined,
        title: draft.title,
        body: draft.body,
        tags: [],
        canonicalUrl,
        publish: body.publish !== false,
      });

      // 记录到 publish_targets
      try {
        await db.insert(schema.publishTargets).values({
          id: randomUUID(),
          draftId: draft.id,
          platform,
          title: draft.title,
          body: draft.body,
          status: result.ok ? "published" : "failed",
          publishedUrl: result.url,
          publishedAt: result.ok ? new Date() : null,
          error: result.error,
        });
      } catch (e) {
        console.warn("[auto-publish] persist failed:", e);
      }

      return { platform, ok: result.ok, url: result.url, error: result.error };
    }),
  );

  return NextResponse.json({ draftId: draft.id, results });
}
