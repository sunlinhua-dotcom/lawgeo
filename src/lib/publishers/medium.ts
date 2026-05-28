import type { Driver, PublishInput, PublishResult, PublisherSpec } from "./types";

const spec: PublisherSpec = {
  id: "medium",
  name: "Medium",
  isFree: true,
  tokenHelpUrl: "https://medium.com/me/settings",
  needsAccountId: false,
  audience: "全球读者社区（约 1 亿月活）",
  titleMax: 100,
};

async function verify(token: string) {
  try {
    const res = await fetch("https://api.medium.com/v1/me", {
      headers: { authorization: `Bearer ${token}`, accept: "application/json" },
    });
    if (!res.ok) return { ok: false, error: `Medium token 无效（HTTP ${res.status}）` };
    const json = (await res.json()) as { data: { id: string; username: string; name: string } };
    return { ok: true, accountId: json.data.id, accountName: json.data.name || json.data.username };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "verify failed" };
  }
}

async function publish(input: PublishInput): Promise<PublishResult> {
  // 先拿 userId（Medium 强制要求）
  let userId = input.accountId;
  if (!userId) {
    const v = await verify(input.token);
    if (!v.ok || !v.accountId) return { ok: false, error: v.error ?? "无法获取 Medium userId" };
    userId = v.accountId;
  }
  try {
    const res = await fetch(`https://api.medium.com/v1/users/${userId}/posts`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${input.token}`,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        title: input.title.slice(0, spec.titleMax),
        contentFormat: "markdown",
        content: input.body,
        tags: (input.tags ?? []).slice(0, 5),
        publishStatus: input.publish !== false ? "public" : "draft",
        canonicalUrl: input.canonicalUrl,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: `Medium API ${res.status}: ${text.slice(0, 200)}` };
    }
    const json = (await res.json()) as { data: { id: string; url: string } };
    return { ok: true, url: json.data.url, remoteId: json.data.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "publish failed" };
  }
}

export const mediumDriver: Driver = { spec, verify, publish };
