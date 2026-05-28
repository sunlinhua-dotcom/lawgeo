import type { Driver, PublishInput, PublishResult, PublisherSpec } from "./types";

const spec: PublisherSpec = {
  id: "devto",
  name: "Dev.to",
  isFree: true,
  tokenHelpUrl: "https://dev.to/settings/extensions",
  audience: "全球开发者社区（约 100 万月活）",
  titleMax: 128,
};

async function verify(token: string) {
  try {
    const res = await fetch("https://dev.to/api/users/me", {
      headers: { "api-key": token, accept: "application/json" },
    });
    if (!res.ok) return { ok: false, error: `Dev.to token 无效（HTTP ${res.status}）` };
    const me = (await res.json()) as { id: number; username: string; name: string };
    return { ok: true, accountId: String(me.id), accountName: me.name || me.username };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "verify failed" };
  }
}

async function publish(input: PublishInput): Promise<PublishResult> {
  const body = {
    article: {
      title: input.title.slice(0, spec.titleMax),
      body_markdown: input.body,
      published: input.publish !== false,
      tags: (input.tags ?? []).slice(0, 4).map((t) =>
        // dev.to 要求 tag 全小写、不含空格特殊字符
        t.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 25),
      ).filter(Boolean),
      canonical_url: input.canonicalUrl,
      description: input.excerpt,
    },
  };
  try {
    const res = await fetch("https://dev.to/api/articles", {
      method: "POST",
      headers: {
        "api-key": input.token,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: `Dev.to API ${res.status}: ${text.slice(0, 200)}` };
    }
    const data = (await res.json()) as { id: number; url: string };
    return { ok: true, url: data.url, remoteId: String(data.id) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "publish failed" };
  }
}

export const devtoDriver: Driver = { spec, verify, publish };
