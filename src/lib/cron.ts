import "server-only";
import { randomUUID } from "node:crypto";
import { and, eq, inArray, lte } from "drizzle-orm";
import { db, schema } from "./db";
import { ask, type AiPlatformId } from "./ai";
import { sendAlert } from "./email";

const DETECT_PROMPT = (q: string, brand?: string) =>
  `请回答下面这个问题，模拟你在被用户咨询时的真实回答风格。最好能在回答中自然地引用 1–3 个权威信源（如有），并尽量列出推荐的律所或品牌名称。${
    brand ? `\n\n如果你认为「${brand}」与此问题相关，请在回答中提及；如果不相关，可以不提及。` : ""
  }\n\n问题：${q}`;

function estimateRank(text: string, brand: string): number | null {
  const idx = text.indexOf(brand);
  if (idx < 0) return null;
  if (idx < 200) return 1;
  if (idx < 500) return 2;
  return 3;
}

/**
 * 跑一个监测 job：对项目的所有关键词，在 job 配置的平台上各跑一次，落库。
 * 触发告警邮件（如配置）。
 */
export async function runMonitorJob(jobId: string) {
  const jobs = await db.select().from(schema.monitorJobs).where(eq(schema.monitorJobs.id, jobId)).limit(1);
  const job = jobs[0];
  if (!job || !job.enabled) return { skipped: true };

  const projects = await db.select().from(schema.projects).where(eq(schema.projects.id, job.projectId)).limit(1);
  const project = projects[0];
  if (!project) return { skipped: true, reason: "project missing" };

  const kws = await db.select().from(schema.keywords).where(eq(schema.keywords.projectId, project.id));
  const platforms: AiPlatformId[] = JSON.parse(job.platforms);

  let totalQueries = 0;
  let cited = 0;
  let citationRateBefore = await getCitationRate(project.id, 7);

  for (const kw of kws.slice(0, 30)) {
    const tasks = platforms.map(async (platform) => {
      const t0 = Date.now();
      try {
        const r = await ask({ prompt: DETECT_PROMPT(kw.keyword, project.name), platform, temperature: 0.55 });
        const isCited = r.text.includes(project.name);
        const rank = isCited ? estimateRank(r.text, project.name) : null;
        await db.insert(schema.aiQueries).values({
          id: randomUUID(),
          userId: project.userId,
          projectId: project.id,
          keywordId: kw.id,
          question: kw.keyword,
          brand: project.name,
          platform,
          model: "mimo-v2.5-pro",
          prompt: DETECT_PROMPT(kw.keyword, project.name),
          response: r.text.slice(0, 8000),
          cited: isCited,
          rank,
          latencyMs: Date.now() - t0,
          source: "cron",
        });
        totalQueries++;
        if (isCited) cited++;
      } catch (e) {
        console.warn("[cron] query failed:", e);
      }
    });
    await Promise.all(tasks);
  }

  const citationRateAfter = totalQueries > 0 ? cited / totalQueries : 0;

  // 计算下次运行时间
  const ms = job.schedule === "hourly" ? 60 * 60 * 1000 : job.schedule === "weekly" ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  await db
    .update(schema.monitorJobs)
    .set({ lastRunAt: new Date(), nextRunAt: new Date(Date.now() + ms) })
    .where(eq(schema.monitorJobs.id, job.id));

  // 触发告警判断
  if (citationRateBefore > 0 && citationRateAfter < citationRateBefore * 0.7) {
    await maybeAlert(project.userId, project.id, "citation_drop", {
      project: project.name,
      before: Math.round(citationRateBefore * 100),
      after: Math.round(citationRateAfter * 100),
    });
  }

  return {
    ok: true,
    totalQueries,
    cited,
    citationRate: citationRateAfter,
  };
}

async function getCitationRate(projectId: string, days: number) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const rows = await db
    .select()
    .from(schema.aiQueries)
    .where(and(eq(schema.aiQueries.projectId, projectId)));
  const recent = rows.filter((r) => r.queriedAt >= since);
  if (recent.length === 0) return 0;
  return recent.filter((r) => r.cited).length / recent.length;
}

async function maybeAlert(
  userId: string,
  projectId: string,
  type: "citation_drop" | "top3_lost" | "competitor_overtake",
  data: Record<string, unknown>,
) {
  const subs = await db
    .select()
    .from(schema.alertSubscriptions)
    .where(
      and(
        eq(schema.alertSubscriptions.userId, userId),
        eq(schema.alertSubscriptions.type, type),
        eq(schema.alertSubscriptions.enabled, true),
      ),
    );
  for (const sub of subs) {
    if (sub.projectId && sub.projectId !== projectId) continue;
    // 避免 24 小时内重复发
    if (sub.lastSentAt && Date.now() - sub.lastSentAt.getTime() < 24 * 60 * 60 * 1000) continue;
    await sendAlert({ to: sub.email, type, data });
    await db
      .update(schema.alertSubscriptions)
      .set({ lastSentAt: new Date() })
      .where(eq(schema.alertSubscriptions.id, sub.id));
  }
}

/** 找出所有到期需要跑的 job */
export async function findDueJobs(now: Date = new Date()) {
  const rows = await db
    .select()
    .from(schema.monitorJobs)
    .where(and(eq(schema.monitorJobs.enabled, true)));
  return rows.filter((j) => !j.nextRunAt || j.nextRunAt <= now);
}

/** 一次性跑所有到期 job */
export async function runAllDue() {
  const due = await findDueJobs();
  const results: Array<{ jobId: string; ok: boolean; detail?: unknown }> = [];
  for (const job of due) {
    try {
      const r = await runMonitorJob(job.id);
      results.push({ jobId: job.id, ok: true, detail: r });
    } catch (e) {
      results.push({ jobId: job.id, ok: false, detail: e instanceof Error ? e.message : String(e) });
    }
  }
  return results;
}
