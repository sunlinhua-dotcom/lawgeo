import "server-only";
import { Resend } from "resend";
import { siteConfig } from "./site";

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.ALERT_FROM_EMAIL ?? `${siteConfig.name} <no-reply@${siteConfig.domain}>`;

const resend = apiKey ? new Resend(apiKey) : null;

export type AlertType = "citation_drop" | "top3_lost" | "competitor_overtake" | "weekly_digest";

const TEMPLATES: Record<
  AlertType,
  (data: Record<string, unknown>) => { subject: string; html: string }
> = {
  citation_drop: (d) => ({
    subject: `[lawGEO] ${d.project} AI 引用率下跌告警 ⚠️`,
    html: alertHtml({
      title: "AI 引用率显著下跌",
      project: String(d.project ?? "—"),
      lines: [
        `近期引用率从 <b>${d.before}%</b> 跌至 <b>${d.after}%</b>`,
        "可能的原因：竞品发布了新内容、平台模型版本更新、关键词被覆盖。",
        "建议：检查 lawGEO 控制台的引用监测页，找出哪些平台跌得最厉害。",
      ],
      cta: "查看监测面板",
      ctaUrl: `${siteConfig.url}/dashboard/monitor`,
    }),
  }),
  top3_lost: (d) => ({
    subject: `[lawGEO] ${d.project} 跌出 AI Top3 推荐`,
    html: alertHtml({
      title: "跌出 Top 3 推荐位置",
      project: String(d.project ?? "—"),
      lines: [
        `在 <b>${d.platform ?? "多个平台"}</b> 上，「${d.project}」已不再被列入前三推荐。`,
        "建议：核查这些平台上的引用来源，补强 FAQ / 案例 / 收费 等关键页面。",
      ],
      cta: "查看监测面板",
      ctaUrl: `${siteConfig.url}/dashboard/monitor`,
    }),
  }),
  competitor_overtake: (d) => ({
    subject: `[lawGEO] 竞品 ${d.competitor} 在 AI 推荐中反超你`,
    html: alertHtml({
      title: "竞品反超",
      project: String(d.project ?? "—"),
      lines: [
        `<b>${d.competitor}</b> 现在被 AI 推荐的次数已超过你。`,
        "建议：用 lawGEO 对比工具拉一次同问题的回答，分析竞品获胜的具体原因。",
      ],
      cta: "用对比工具分析",
      ctaUrl: `${siteConfig.url}/tools/compare`,
    }),
  }),
  weekly_digest: (d) => ({
    subject: `[lawGEO] 每周 GEO 数据简报 · ${d.weekRange ?? ""}`,
    html: alertHtml({
      title: "每周 GEO 数据简报",
      project: String(d.project ?? "—"),
      lines: [
        `本周引用率：<b>${d.citationRate ?? 0}%</b>`,
        `本周被引用次数：<b>${d.cited ?? 0}</b>`,
        `本周 Top 1 推荐次数：<b>${d.top1 ?? 0}</b>`,
      ],
      cta: "查看完整报告",
      ctaUrl: `${siteConfig.url}/dashboard/monitor`,
    }),
  }),
};

function alertHtml(opts: {
  title: string;
  project: string;
  lines: string[];
  cta: string;
  ctaUrl: string;
}) {
  return `<!doctype html>
<html><body style="font-family: -apple-system, 'PingFang SC', sans-serif; background: #f8fafc; padding: 24px 0; margin: 0;">
<table align="center" width="600" style="background: white; border-radius: 16px; padding: 32px;">
<tr><td>
  <h1 style="font-size: 24px; margin: 0; color: #6366f1;">lawGEO · 告警</h1>
  <h2 style="font-size: 20px; color: #0f172a; margin: 16px 0 8px;">${opts.title}</h2>
  <div style="color: #64748b; font-size: 13px; margin-bottom: 16px;">项目：${opts.project}</div>
  <div style="color: #1e293b; line-height: 1.8;">
    ${opts.lines.map((l) => `<p style="margin: 8px 0;">${l}</p>`).join("")}
  </div>
  <a href="${opts.ctaUrl}" style="display: inline-block; margin-top: 24px; padding: 10px 24px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
    ${opts.cta} →
  </a>
  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
  <div style="color: #94a3b8; font-size: 12px;">
    本邮件由 ${siteConfig.name}（${siteConfig.url}）发送。如需取消订阅，请在控制台「邮件告警」页关闭对应规则。
  </div>
</td></tr></table>
</body></html>`;
}

export async function sendAlert(opts: { to: string; type: AlertType; data: Record<string, unknown> }) {
  const template = TEMPLATES[opts.type];
  if (!template) return { ok: false, error: "unknown alert type" };
  const { subject, html } = template(opts.data);

  if (!resend) {
    console.log(`[lawGEO email] (no RESEND_API_KEY, simulated send)\nTo: ${opts.to}\nSubject: ${subject}\n`);
    return { ok: true, simulated: true };
  }

  try {
    const result = await resend.emails.send({ from, to: opts.to, subject, html });
    return { ok: true, id: result.data?.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "send failed" };
  }
}
