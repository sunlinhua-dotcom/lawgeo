"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, ExternalLink, Trash2, KeyRound, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const PLATFORMS = [
  {
    id: "devto" as const,
    name: "Dev.to",
    color: "from-slate-900 to-slate-700",
    audience: "全球开发者社区（约 100 万月活）",
    tokenHelp: "https://dev.to/settings/extensions",
    tokenHelpText: "Settings → Extensions → DEV Community API Keys → Generate API Key",
    needsAccountId: false,
    free: true,
  },
  {
    id: "hashnode" as const,
    name: "Hashnode",
    color: "from-blue-600 to-cyan-500",
    audience: "全球技术博客社区",
    tokenHelp: "https://hashnode.com/settings/developer",
    tokenHelpText: "Settings → Developer → Generate New Token",
    needsAccountId: true,
    accountIdHint: "Token 验证后自动填入你的 Publication ID（如有多个会显示选择）",
    free: true,
  },
  {
    id: "medium" as const,
    name: "Medium",
    color: "from-emerald-600 to-emerald-500",
    audience: "全球读者社区（约 1 亿月活）",
    tokenHelp: "https://medium.com/me/settings",
    tokenHelpText: "Settings → Security and apps → Integration tokens → Get integration token",
    needsAccountId: false,
    free: true,
  },
];

interface Cred {
  id: string;
  platform: string;
  accountId: string | null;
  accountName: string | null;
  verifiedAt: Date | null;
}

export function IntegrationsManager({ initialCreds }: { initialCreds: Cred[] }) {
  const router = useRouter();
  const [creds, setCreds] = useState(initialCreds);

  const credMap = new Map(creds.map((c) => [c.platform, c]));

  async function disconnect(platform: string) {
    if (!confirm(`断开 ${platform}？后续将无法自动发布到该平台。`)) return;
    await fetch("/api/integrations", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ platform }),
    });
    setCreds((c) => c.filter((x) => x.platform !== platform));
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
        <ShieldCheck className="mr-1 inline h-4 w-4" />
        Token 仅存储在你自己的数据库（本地 SQLite）。lawGEO 服务端不会上传或外传你的 token。生产环境建议在 .env 配置加密密钥后启用列加密。
      </div>

      <div className="grid gap-4">
        {PLATFORMS.map((p) => {
          const c = credMap.get(p.id);
          return (
            <PlatformCard
              key={p.id}
              platform={p}
              cred={c}
              onConnected={(newCred) => {
                setCreds((all) => {
                  const without = all.filter((x) => x.platform !== p.id);
                  return [...without, newCred];
                });
                router.refresh();
              }}
              onDisconnect={() => disconnect(p.id)}
            />
          );
        })}
      </div>

      <GithubToolsSection />

      <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
        <div className="font-semibold mb-1">⚠️ 关于国内平台的官方 API</div>
        <p>
          知乎、百家号、公众号、小红书、今日头条、视频号官方 API <strong>仅对企业号</strong> 开放，需主体营业执照 + ICP 备案。
          上面的 GitHub 工具（Wechatsync / ArtiPub / social-auto-upload）用 <strong>浏览器自动化 + 本地登录态</strong> 绕过这一限制——
          它们都是开源的、免费的、本地运行的，是个人 / 中小团队的<strong>唯一可行方案</strong>。
        </p>
      </div>
    </div>
  );
}

const GITHUB_TOOLS = [
  {
    id: "wechatsync",
    name: "Wechatsync 文章同步助手",
    repo: "wechatsync/Wechatsync",
    url: "https://github.com/wechatsync/Wechatsync",
    install: "https://chromewebstore.google.com/detail/onpoadmkhcefogpdneghihaegkilfcgg",
    license: "GPL-3.0",
    type: "Chrome 扩展 + MCP Server",
    desc: "29+ 中文平台一键同步：公众号 / 知乎 / 头条 / 百家号 / CSDN / 简书 / 掘金 / SegmentFault / 小红书 / WordPress / typecho。集成方式：网页注入 window.syncPost() — lawGEO 已对接 ✓",
    platforms: "29+",
    integrated: true,
    badge: "已对接",
  },
  {
    id: "artipub",
    name: "ArtiPub 一文多发平台",
    repo: "crawlab-team/artipub",
    url: "https://github.com/crawlab-team/artipub",
    install: "https://github.com/crawlab-team/artipub#getting-started",
    license: "BSD-3",
    type: "Next.js + AI Agent + Playwright",
    desc: "支持知乎 / 掘金 / CSDN / 简书 / SegmentFault / OSCHINA。新版 ArtiPub AI 用 AI Agent 自动适配各平台规范，无需手工配置。",
    platforms: "6+",
    integrated: false,
    badge: "需自部署",
  },
  {
    id: "social-auto-upload",
    name: "social-auto-upload 视频自动上传",
    repo: "dreammis/social-auto-upload",
    url: "https://github.com/dreammis/social-auto-upload",
    install: "https://github.com/dreammis/social-auto-upload#installation",
    license: "MIT",
    type: "Python + Playwright + Vue",
    desc: "视频内容自动上传到抖音 / B 站 / 小红书 / 快手 / 视频号 / 百家号 / TikTok / YouTube。提供 RESTful API、CLI 与 Web UI。",
    platforms: "8+",
    integrated: false,
    badge: "需自部署",
  },
];

function GithubToolsSection() {
  return (
    <div>
      <h2 className="mb-2 text-lg font-semibold">⭐ GitHub 推荐工具（开源、免费、能用）</h2>
      <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
        我们调研了 GitHub 上的中文媒体发布开源项目，这是<strong>真正能用</strong>的三个。它们绕过「无开放 API + 需企业资质」的核心方案，都是用 <strong>浏览器自动化 + 本地登录态</strong>。
      </p>
      <div className="grid gap-3">
        {GITHUB_TOOLS.map((t) => (
          <div
            key={t.id}
            className={`rounded-xl border p-5 ${
              t.integrated
                ? "border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50 dark:border-emerald-800 dark:from-emerald-950 dark:to-teal-950"
                : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            }`}
            id={t.id}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-semibold">{t.name}</h3>
                  <a
                    href={t.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-xs text-indigo-600 hover:underline"
                  >
                    {t.repo}
                  </a>
                </div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-medium text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200">
                    {t.type}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {t.platforms} 平台
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {t.license}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      t.integrated
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200"
                    }`}
                  >
                    {t.badge}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{t.desc}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={t.install}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
              >
                安装 / 部署
              </a>
              <a
                href={t.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                查看源码
              </a>
              {t.integrated && (
                <a
                  href="/dashboard/publish"
                  className="inline-flex items-center gap-1 rounded-md border border-emerald-300 px-3 py-1.5 text-xs text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-200 dark:hover:bg-emerald-950"
                >
                  → 去多平台发布页使用
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlatformCard({
  platform,
  cred,
  onConnected,
  onDisconnect,
}: {
  platform: (typeof PLATFORMS)[number];
  cred?: Cred;
  onConnected: (c: Cred) => void;
  onDisconnect: () => void;
}) {
  const [token, setToken] = useState("");
  const [accountId, setAccountId] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Array<{ id: string; name: string }> | null>(null);
  const [expanded, setExpanded] = useState(!cred);

  async function connect() {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/integrations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ platform: platform.id, token, accountId: accountId || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "连接失败");
      if (data.accounts && data.accounts.length > 1 && !accountId) {
        setAccounts(data.accounts);
        setErr("请选择要使用的 Publication 后再次保存");
        return;
      }
      onConnected({
        id: "new",
        platform: platform.id,
        accountId: data.accountId ?? null,
        accountName: data.accountName ?? null,
        verifiedAt: new Date(),
      });
      setToken("");
      setAccountId("");
      setAccounts(null);
      setExpanded(false);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "连接失败");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${platform.color} text-white font-semibold`}>
              {platform.name.slice(0, 1)}
            </div>
            <div>
              <CardTitle className="text-base">{platform.name}</CardTitle>
              <p className="text-xs text-slate-500">{platform.audience}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {cred?.verifiedAt ? (
              <>
                <Badge variant="success">
                  <CheckCircle2 className="mr-1 h-3 w-3" /> 已连接
                </Badge>
                {cred.accountName && <Badge variant="outline">{cred.accountName}</Badge>}
                <Button size="sm" variant="ghost" onClick={() => setExpanded(!expanded)}>
                  {expanded ? "收起" : "重新连接"}
                </Button>
                <Button size="sm" variant="ghost" className="text-rose-600" onClick={onDisconnect}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </>
            ) : (
              <Badge variant="default">未连接</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="mb-1 flex justify-between text-xs">
                <label className="font-medium text-slate-600">API Token</label>
                <a
                  href={platform.tokenHelp}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  从这里获取 <ExternalLink className="ml-0.5 inline h-3 w-3" />
                </a>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <Input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="粘贴 token"
                  className="pl-9 font-mono"
                />
              </div>
              <div className="mt-1 text-xs text-slate-500">📍 {platform.tokenHelpText}</div>
            </div>

            {platform.needsAccountId && (accounts ? accounts.length > 1 : false) && (
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">选择 Publication</label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                >
                  <option value="">— 请选择 —</option>
                  {accounts!.map((a) => (
                    <option key={a.id} value={a.id}>{a.name} ({a.id.slice(0, 8)}…)</option>
                  ))}
                </select>
              </div>
            )}

            {err && (
              <div className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-950 dark:text-rose-300">{err}</div>
            )}

            <Button onClick={connect} disabled={busy || !token} variant="primary">
              {busy ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" />验证中…</> : "验证并连接"}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
