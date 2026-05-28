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

      <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
        <div className="font-semibold mb-1">⚠️ 国内平台为什么不在此列？</div>
        <p>
          知乎、百家号、公众号、小红书、今日头条、视频号<strong>没有开放</strong>公开 API。
          官方仅提供给已通过资质审核的「企业号」，且需要主体营业执照 + ICP 备案。
          因此国内平台仍走「<a href="/dashboard/publish" className="font-semibold underline">改写 + 一键打开编辑器</a>」流程。
        </p>
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
