import Database from "better-sqlite3";
import { randomUUID } from "node:crypto";

const BASE = process.env.LAWGEO_BASE_URL ?? "http://localhost:4648";
const stamp = Date.now().toString();
const prefix = `CodexAI测试-${stamp}`;
const brandName = `${prefix}-品牌`;
const db = new Database("data/lawgeo.db");
db.pragma("foreign_keys = ON");

const cookies = new Map();
const results = [];
const ids = {
  brandId: null,
  projectId: null,
  keywordId: null,
  jobId: null,
  insightId: null,
  bulkJobId: null,
  draftId: null,
};

function cookieHeader() {
  return Array.from(cookies.entries()).map(([k, v]) => `${k}=${v}`).join("; ");
}

function storeCookies(res) {
  const values =
    typeof res.headers.getSetCookie === "function"
      ? res.headers.getSetCookie()
      : [res.headers.get("set-cookie")].filter(Boolean);
  for (const value of values) {
    const part = value.split(";")[0];
    const eq = part.indexOf("=");
    if (eq > 0) cookies.set(part.slice(0, eq), part.slice(eq + 1));
  }
}

async function request(name, path, { method = "GET", body, timeoutMs = 180000 } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const started = Date.now();
  try {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        "content-type": "application/json",
        ...(cookieHeader() ? { cookie: cookieHeader() } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
    storeCookies(res);
    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {}
    return {
      name,
      status: res.status,
      ok: res.ok,
      durationMs: Date.now() - started,
      data,
      text,
    };
  } finally {
    clearTimeout(timeout);
  }
}

function record(name, ok, detail, durationMs = 0) {
  results.push({ name, ok: !!ok, detail, durationMs });
  const mark = ok ? "PASS" : "FAIL";
  console.log(`${mark} ${name} ${durationMs ? `(${Math.round(durationMs / 1000)}s)` : ""} - ${detail}`);
}

async function test(name, fn, validate) {
  try {
    const r = await fn();
    const verdict = validate(r);
    record(name, verdict.ok, verdict.detail, r?.durationMs ?? verdict.durationMs ?? 0);
    return r;
  } catch (e) {
    record(name, false, e instanceof Error ? e.message : String(e));
    return null;
  }
}

function adminUser() {
  return db.prepare("select id from users where email = ?").get("admin");
}

function snapshotState(userId) {
  return {
    wallet: db.prepare("select * from token_wallets where user_id = ?").get(userId) ?? null,
    usage: db.prepare("select * from usage_month where user_id = ?").all(userId),
    ledgerIds: new Set(db.prepare("select id from token_ledgers where user_id = ?").all(userId).map((r) => r.id)),
  };
}

function restoreState(userId, snap) {
  if (!snap) return;
  if (snap.wallet) {
    db.prepare(
      "update token_wallets set balance=?, total_recharged=?, total_consumed=?, updated_at=? where id=?",
    ).run(
      snap.wallet.balance,
      snap.wallet.total_recharged,
      snap.wallet.total_consumed,
      snap.wallet.updated_at,
      snap.wallet.id,
    );
  } else {
    db.prepare("delete from token_wallets where user_id = ?").run(userId);
  }

  db.prepare("delete from usage_month where user_id = ?").run(userId);
  for (const row of snap.usage) {
    db.prepare(
      "insert into usage_month (id,user_id,year_month,generations,queries,audits,cost_cents) values (?,?,?,?,?,?,?)",
    ).run(row.id, row.user_id, row.year_month, row.generations, row.queries, row.audits, row.cost_cents);
  }

  const currentLedgers = db.prepare("select id from token_ledgers where user_id = ?").all(userId);
  for (const row of currentLedgers) {
    if (!snap.ledgerIds.has(row.id)) db.prepare("delete from token_ledgers where id = ?").run(row.id);
  }
}

function findLatestDraft(userId) {
  return db
    .prepare("select id from content_drafts where user_id = ? and title like ? order by created_at desc limit 1")
    .get(userId, `${prefix}%`);
}

function insertKeyword(projectId) {
  const id = randomUUID();
  db.prepare(
    "insert into keywords (id, project_id, keyword, intent, region, case_category, priority) values (?,?,?,?,?,?,?)",
  ).run(id, projectId, `${prefix} 上海离婚律师推荐`, "commercial", "上海", "婚姻家事", 8);
  ids.keywordId = id;
  return id;
}

function cleanup(userId, snap) {
  const tx = db.transaction(() => {
    db.prepare("delete from ai_queries where user_id = ? and (question like ? or brand like ? or prompt like ? or response like ?)").run(
      userId,
      `%${prefix}%`,
      `%${prefix}%`,
      `%${prefix}%`,
      `%${prefix}%`,
    );
    db.prepare("delete from publish_targets where draft_id in (select id from content_drafts where user_id = ? and title like ?)").run(
      userId,
      `${prefix}%`,
    );
    db.prepare("delete from content_drafts where user_id = ? and title like ?").run(userId, `${prefix}%`);
    db.prepare("delete from content_articles where user_id = ? and title like ?").run(userId, `${prefix}%`);
    db.prepare("delete from realtime_searches where user_id = ? and (question like ? or target_word like ?)").run(
      userId,
      `%${prefix}%`,
      `%${prefix}%`,
    );
    db.prepare("delete from insights where user_id = ? and (brand_name like ? or keywords like ?)").run(
      userId,
      `${prefix}%`,
      `%${prefix}%`,
    );
    db.prepare("delete from intents where user_id = ? and text like ?").run(userId, `${prefix}%`);
    db.prepare("delete from blog_posts where user_id = ? and (title like ? or keywords like ? or body like ?)").run(
      userId,
      `${prefix}%`,
      `%${prefix}%`,
      `%${prefix}%`,
    );
    db.prepare("delete from bulk_jobs where user_id = ? and keywords like ?").run(userId, `%${prefix}%`);
    db.prepare("delete from projects where user_id = ? and name like ?").run(userId, `${prefix}%`);
    db.prepare("delete from brands where user_id = ? and name like ?").run(userId, `${prefix}%`);
  });
  tx();
  restoreState(userId, snap);
}

async function pollJson(name, path, predicate, timeoutMs = 240000) {
  const start = Date.now();
  let last = null;
  while (Date.now() - start < timeoutMs) {
    const r = await request(name, path, { timeoutMs: 30000 });
    last = r;
    if (r.ok && predicate(r.data)) return r;
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
  return last;
}

let userId = null;
let snap = null;

try {
  await test(
    "登录 admin/admin",
    () => request("login", "/api/auth/login", { method: "POST", body: { email: "admin", password: "admin" }, timeoutMs: 30000 }),
    (r) => ({ ok: r.ok && r.data?.ok === true, detail: `status=${r.status}` }),
  );

  const user = adminUser();
  if (!user) throw new Error("admin user not found after login");
  userId = user.id;
  snap = snapshotState(userId);

  await test(
    "Provider 状态：MIMO",
    () => request("providers", "/api/providers/status", { timeoutMs: 30000 }),
    (r) => ({
      ok: r.ok && r.data?.llm?.provider === "mimo" && !!r.data?.llm?.defaultModel,
      detail: `provider=${r.data?.llm?.provider}, model=${r.data?.llm?.defaultModel}`,
    }),
  );

  const brand = await test(
    "创建测试品牌",
    () =>
      request("brand", "/api/brands", {
        method: "POST",
        body: {
          name: brandName,
          website: "https://example.com",
          industry: "法律服务",
          region: "上海",
          description: "仅用于本地 AI 功能测试，测试结束自动删除。",
        },
        timeoutMs: 30000,
      }),
    (r) => ({ ok: r.ok && !!r.data?.id, detail: `brandId=${r.data?.id ?? ""}` }),
  );
  ids.brandId = brand?.data?.id ?? null;

  const generated = await test(
    "AI 内容生成 /api/generate",
    () =>
      request("generate", "/api/generate", {
        method: "POST",
        body: {
          format: "answer",
          topic: `${prefix} 离婚律师怎么收费`,
          context: "请用简短中文回答，包含测试品牌上下文。",
          locale: "zh-CN",
          useKnowledge: false,
        },
        timeoutMs: 180000,
      }),
    (r) => ({
      ok: r.ok && typeof r.data?.content === "string" && r.data.content.length > 20 && typeof r.data?.raw === "string",
      detail: `status=${r.status}, len=${r.data?.content?.length ?? 0}, latency=${r.data?.latencyMs ?? "n/a"}ms`,
    }),
  );
  ids.draftId = findLatestDraft(userId)?.id ?? null;

  await test(
    "AI 意图聚类 /api/intent",
    () =>
      request("intent", "/api/intent", {
        method: "POST",
        body: {
          industry: "法律服务",
          keywords: [`${prefix} 离婚律师收费`, `${prefix} 上海离婚律师推荐`, `${prefix} 财产分割流程`],
        },
        timeoutMs: 180000,
      }),
    (r) => ({
      ok: r.ok && Array.isArray(r.data?.clusters) && r.data.clusters.length > 0,
      detail: `status=${r.status}, clusters=${r.data?.clusters?.length ?? 0}, latency=${r.data?.latencyMs ?? "n/a"}ms`,
    }),
  );

  await test(
    "AI 平台对比 /api/compare",
    () =>
      request("compare", "/api/compare", {
        method: "POST",
        body: {
          question: `${prefix} 上海离婚律师怎么选？`,
          brand: brandName,
          platforms: ["deepseek"],
        },
        timeoutMs: 180000,
      }),
    (r) => ({
      ok: r.ok && Array.isArray(r.data?.results) && r.data.results[0]?.ok === true && r.data.results[0]?.text?.length > 20,
      detail: `status=${r.status}, ok=${r.data?.results?.[0]?.ok}, len=${r.data?.results?.[0]?.text?.length ?? 0}`,
    }),
  );

  await test(
    "AI 标题生成 /api/content/titles",
    () =>
      request("titles", "/api/content/titles", {
        method: "POST",
        body: { intent: `${prefix} 离婚律师咨询`, brandName },
        timeoutMs: 180000,
      }),
    (r) => ({
      ok: r.ok && Array.isArray(r.data?.titles) && r.data.titles.length >= 3,
      detail: `status=${r.status}, titles=${r.data?.titles?.length ?? 0}`,
    }),
  );

  await test(
    "AI 正文生成 + 7 维评分 /api/content/generate-scored",
    () =>
      request("generate-scored", "/api/content/generate-scored", {
        method: "POST",
        body: {
          title: `${prefix} 离婚律师咨询流程`,
          intent: "离婚律师咨询流程",
          keywords: [`${prefix} 离婚律师咨询`],
        },
        timeoutMs: 240000,
      }),
    (r) => ({
      ok: r.ok && r.data?.content?.length > 100 && Number(r.data?.scores?.total ?? 0) > 0,
      detail: `status=${r.status}, len=${r.data?.content?.length ?? 0}, score=${r.data?.scores?.total ?? 0}`,
    }),
  );

  await test(
    "意图词库：创建意图",
    () =>
      request("intents-create", "/api/intents", {
        method: "POST",
        body: { texts: [`${prefix} 婚姻家事咨询`, `${prefix} 上海离婚律师费用`] },
        timeoutMs: 30000,
      }),
    (r) => ({ ok: r.ok && r.data?.created >= 1, detail: `status=${r.status}, created=${r.data?.created ?? 0}` }),
  );

  await test(
    "AI GEO 指数刷新 /api/intents PATCH",
    () => request("intents-refresh", "/api/intents", { method: "PATCH", timeoutMs: 180000 }),
    (r) => ({ ok: r.ok && Number(r.data?.updated ?? 0) >= 1, detail: `status=${r.status}, updated=${r.data?.updated ?? 0}` }),
  );

  const insight = await test(
    "AI 洞察任务启动 /api/insights",
    () =>
      request("insights-start", "/api/insights", {
        method: "POST",
        body: { keywords: [`${prefix} 离婚律师`, `${prefix} 财产分割`] },
        timeoutMs: 30000,
      }),
    (r) => ({ ok: r.ok && !!r.data?.id, detail: `status=${r.status}, id=${r.data?.id ?? ""}` }),
  );
  ids.insightId = insight?.data?.id ?? null;
  if (ids.insightId) {
    await test(
      "AI 洞察任务完成 /api/insights/[id]",
      () => pollJson("insight-poll", `/api/insights/${ids.insightId}`, (d) => ["done", "failed"].includes(d?.insight?.status), 240000),
      (r) => {
        const ins = r.data?.insight;
        const report = ins?.report ? JSON.parse(ins.report) : null;
        return {
          ok: r.ok && ins?.status === "done" && !!report?.websiteProfile && Array.isArray(report?.heatKeywords),
          detail: `status=${ins?.status}, progress=${ins?.progress}, heat=${report?.heatKeywords?.length ?? 0}, error=${ins?.error ?? ""}`,
        };
      },
    );
  }

  await test(
    "AI 实时查询 /api/realtime",
    () =>
      request("realtime", "/api/realtime", {
        method: "POST",
        body: {
          question: `${prefix} ${brandName} 适合处理离婚咨询吗？`,
          targetWord: brandName,
          platforms: ["deepseek"],
        },
        timeoutMs: 240000,
      }),
    (r) => ({
      ok: r.ok && r.data?.summary?.total === 1 && Array.isArray(r.data?.results),
      detail: `status=${r.status}, summary=${JSON.stringify(r.data?.summary ?? {})}`,
    }),
  );

  if (ids.draftId || generated?.ok) {
    ids.draftId = ids.draftId ?? findLatestDraft(userId)?.id ?? null;
    await test(
      "AI 多平台发布改写 /api/publish/adapt",
      () =>
        request("publish-adapt", "/api/publish/adapt", {
          method: "POST",
          body: { draftId: ids.draftId, platforms: ["zhihu"] },
          timeoutMs: 180000,
        }),
      (r) => ({
        ok: r.ok && r.data?.results?.[0]?.ok === true && r.data.results[0].body?.length > 20,
        detail: `status=${r.status}, ok=${r.data?.results?.[0]?.ok}, len=${r.data?.results?.[0]?.body?.length ?? 0}`,
      }),
    );
  }

  const project = await test(
    "创建监测测试项目",
    () =>
      request("project", "/api/projects", {
        method: "POST",
        body: {
          name: `${prefix}-监测项目`,
          domain: `codex-ai-${stamp}.example.com`,
          industry: "lawyer",
          region: "上海",
          description: "AI 监测任务测试项目。",
        },
        timeoutMs: 30000,
      }),
    (r) => ({ ok: r.ok && !!r.data?.id, detail: `projectId=${r.data?.id ?? ""}` }),
  );
  ids.projectId = project?.data?.id ?? null;
  if (ids.projectId) {
    insertKeyword(ids.projectId);
    const job = await test(
      "创建 AI 监测 job",
      () =>
        request("monitor-job", "/api/jobs", {
          method: "POST",
          body: { projectId: ids.projectId, platforms: ["deepseek"], schedule: "daily" },
          timeoutMs: 30000,
        }),
      (r) => ({ ok: r.ok && !!r.data?.id, detail: `jobId=${r.data?.id ?? ""}` }),
    );
    ids.jobId = job?.data?.id ?? null;
  }
  if (ids.jobId) {
    await test(
      "AI 监测 job 手动触发 /api/jobs PATCH",
      () =>
        request("monitor-run", "/api/jobs", {
          method: "PATCH",
          body: { jobId: ids.jobId },
          timeoutMs: 240000,
        }),
      (r) => ({
        ok: r.ok && r.data?.ok === true && Number(r.data?.totalQueries ?? 0) >= 1,
        detail: `status=${r.status}, totalQueries=${r.data?.totalQueries ?? 0}, cited=${r.data?.cited ?? 0}`,
      }),
    );
  }

  const agentCases = [
    ["Agent 蛋糕调度", "cake-chief", { topic: `${prefix} 上海婚姻家事律师获客` }, (d) => !!d?.output?.plan],
    ["Agent 意图聚类", "insight", { keywords: `${prefix}离婚律师,${prefix}财产分割` }, (d) => !!d?.output],
    ["Agent 内容生成", "generator", { topic: `${prefix} 离婚律师收费`, format: "answer" }, (d) => !!d?.output?.content],
    ["Agent 发布改写", "publisher", { title: `${prefix} 标题`, body: "这是一段用于平台改写的法律服务内容。", platform: "zhihu" }, (d) => !!d?.output?.body],
    ["Agent 监测", "monitor", { question: `${prefix} 上海离婚律师推荐`, brand: brandName }, (d) => typeof d?.output?.text === "string"],
    ["Agent 对比", "compare", { question: `${prefix} 上海离婚律师怎么选`, platforms: "deepseek" }, (d) => Array.isArray(d?.output?.results)],
    ["Agent 翻译", "translator", { text: `${prefix} 离婚律师咨询流程`, targetLocale: "en" }, (d) => !!d?.output?.translation],
    ["Agent 审稿", "reviewer", { text: `${prefix} 离婚咨询首段应直接回答费用、流程和材料。` }, (d) => !!d?.output],
  ];
  for (const [name, agentId, inputs, okFn] of agentCases) {
    await test(
      name,
      () =>
        request("agent", "/api/agents/run", {
          method: "POST",
          body: { agentId, inputs },
          timeoutMs: 180000,
        }),
      (r) => ({
        ok: r.ok && r.data?.ok === true && okFn(r.data),
        detail: `status=${r.status}, apiOk=${r.data?.ok}, latency=${r.data?.latencyMs ?? "n/a"}ms`,
      }),
    );
  }

  const bulk = await test(
    "AI 批量博客任务启动 /api/posts/bulk-generate",
    () =>
      request("bulk-start", "/api/posts/bulk-generate", {
        method: "POST",
        body: { industry: "lawyer", keywords: [`${prefix} 婚姻家事律师怎么选`], perKeyword: 1, autoPublish: false },
        timeoutMs: 30000,
      }),
    (r) => ({ ok: r.ok && !!r.data?.jobId, detail: `status=${r.status}, jobId=${r.data?.jobId ?? ""}` }),
  );
  ids.bulkJobId = bulk?.data?.jobId ?? null;
  if (ids.bulkJobId) {
    await test(
      "AI 批量博客任务完成 /api/posts/jobs/[id]",
      () => pollJson("bulk-poll", `/api/posts/jobs/${ids.bulkJobId}`, (d) => ["done", "failed"].includes(d?.job?.status), 360000),
      (r) => {
        const job = r.data?.job;
        return {
          ok: r.ok && job?.status === "done" && Number(job?.completedCount ?? 0) >= 1,
          detail: `status=${job?.status}, completed=${job?.completedCount ?? 0}, failed=${job?.failedCount ?? 0}, error=${job?.error ?? ""}`,
        };
      },
    );
  }
} finally {
  if (userId) cleanup(userId, snap);
}

const failed = results.filter((r) => !r.ok);
const summary = {
  prefix,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.length,
  failedItems: failed.map((r) => ({ name: r.name, detail: r.detail })),
};
console.log("AI_TEST_SUMMARY " + JSON.stringify(summary));
if (failed.length > 0) process.exitCode = 1;
