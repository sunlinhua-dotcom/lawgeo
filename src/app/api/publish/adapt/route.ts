import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { adaptForPlatform, PLATFORM_SPECS, type PublishPlatform } from "@/lib/publish";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 90;

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json()) as {
    draftId: string;
    platforms: PublishPlatform[];
  };
  if (!body.draftId || !Array.isArray(body.platforms) || body.platforms.length === 0) {
    return NextResponse.json({ error: "缺少 draftId 或 platforms" }, { status: 400 });
  }

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

  const validPlatforms = body.platforms.filter((p) => p in PLATFORM_SPECS);
  const results = await Promise.all(
    validPlatforms.map(async (platform) => {
      try {
        const adapted = await adaptForPlatform(platform, { title: draft.title, body: draft.body });
        const id = randomUUID();
        await db.insert(schema.publishTargets).values({
          id,
          draftId: draft.id,
          platform,
          title: adapted.title,
          body: adapted.body,
          excerpt: adapted.excerpt,
          tags: JSON.stringify(adapted.tags),
          status: "ready",
        });
        return { platform, ok: true, id, ...adapted, editorUrl: PLATFORM_SPECS[platform].editorUrl };
      } catch (e) {
        return {
          platform,
          ok: false,
          error: e instanceof Error ? e.message : "adapt failed",
        };
      }
    }),
  );

  return NextResponse.json({ draftId: draft.id, results });
}
