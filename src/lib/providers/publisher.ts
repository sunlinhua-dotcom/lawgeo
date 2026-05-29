import "server-only";
import type { PublishProvider } from "./types";

/**
 * 海外多平台发布 provider —— Postiz（github.com/gitroomhq/postiz-app）。
 *
 * 中文平台仍走 Wechatsync（浏览器扩展，见 lib/wechatsync.ts）；
 * Dev.to / Hashnode / Medium 走 lib/publishers/*（真实 API，已接）；
 * 海外社媒（X / LinkedIn / Reddit / Mastodon / Threads / Bluesky…）走 Postiz。
 */

const POSTIZ_URL = process.env.POSTIZ_API_URL?.trim().replace(/\/+$/, "");
const POSTIZ_KEY = process.env.POSTIZ_API_KEY?.trim();

export const postizPublisher: PublishProvider = {
  id: "postiz",
  platforms: ["x", "linkedin", "reddit", "mastodon", "threads", "bluesky", "facebook", "instagram"],
  async publish(opts) {
    if (!POSTIZ_URL) return { ok: false, error: "Postiz 未配置（POSTIZ_API_URL）" };
    try {
      const res = await fetch(`${POSTIZ_URL}/public/v1/posts`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(POSTIZ_KEY ? { authorization: POSTIZ_KEY } : {}),
        },
        body: JSON.stringify({
          type: "now",
          content: `${opts.title}\n\n${opts.body}`,
          providers: [opts.platform],
          tags: opts.tags,
        }),
        signal: AbortSignal.timeout(30000),
      });
      if (!res.ok) return { ok: false, error: `Postiz HTTP ${res.status}` };
      const d = (await res.json()) as { id?: string; url?: string };
      return { ok: true, url: d.url };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "postiz failed" };
    }
  },
};

export function postizStatus() {
  return { provider: "postiz", enabled: !!POSTIZ_URL, platforms: postizPublisher.platforms };
}
