import type { Driver, PublishInput, PublishResult, PublisherSpec } from "./types";

const spec: PublisherSpec = {
  id: "hashnode",
  name: "Hashnode",
  isFree: true,
  tokenHelpUrl: "https://hashnode.com/settings/developer",
  needsAccountId: true,
  accountIdLabel: "Publication ID（建站后会自动获取）",
  audience: "全球技术博客社区",
  titleMax: 250,
};

const ENDPOINT = "https://gql.hashnode.com/";

async function gql<T>(token: string, query: string, variables: Record<string, unknown>) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { authorization: token, "content-type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Hashnode HTTP ${res.status}：token 可能无效或格式不对（粘贴时勿带 "Bearer " 前缀）`);
  }
  let json: { data?: T; errors?: Array<{ message: string }> };
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error("Hashnode 返回非 JSON，token 可能无效");
  }
  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join("; "));
  }
  if (!json.data) throw new Error("Hashnode 空响应");
  return json.data;
}

async function verify(token: string) {
  try {
    const data = await gql<{ me: { id: string; name: string; publications: { edges: Array<{ node: { id: string; title: string } }> } } }>(
      token,
      `query { me { id name publications(first: 10) { edges { node { id title } } } } }`,
      {},
    );
    const me = data.me;
    const pubs = me.publications.edges.map((e) => ({ id: e.node.id, name: e.node.title }));
    return {
      ok: true,
      accountId: pubs[0]?.id,
      accountName: me.name,
      accounts: pubs,
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "verify failed" };
  }
}

async function publish(input: PublishInput): Promise<PublishResult> {
  if (!input.accountId) return { ok: false, error: "缺少 publicationId" };
  try {
    const data = await gql<{ publishPost: { post: { id: string; url: string } } }>(
      input.token,
      `mutation Publish($input: PublishPostInput!) {
        publishPost(input: $input) {
          post { id url }
        }
      }`,
      {
        input: {
          publicationId: input.accountId,
          title: input.title.slice(0, spec.titleMax),
          contentMarkdown: input.body,
          tags: (input.tags ?? []).slice(0, 5).map((t) => ({ slug: t.toLowerCase().replace(/\s+/g, "-").slice(0, 50), name: t })),
          originalArticleURL: input.canonicalUrl,
          subtitle: input.excerpt,
        },
      },
    );
    return { ok: true, url: data.publishPost.post.url, remoteId: data.publishPost.post.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "publish failed" };
  }
}

export const hashnodeDriver: Driver = { spec, verify, publish };
