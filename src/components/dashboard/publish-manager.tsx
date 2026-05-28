"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Share2,
  Loader2,
  Copy,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Rocket,
  Plug,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ContentDraft, PublishTarget } from "@/lib/db/schema";
import { PLATFORM_SPECS, type PublishPlatform } from "@/lib/publish-specs";
import { WechatsyncPublishButton } from "./wechatsync-button";

const ALL_PLATFORMS = Object.values(PLATFORM_SPECS);

export function PublishManager({
  drafts,
  targets,
}: {
  drafts: ContentDraft[];
  targets: PublishTarget[];
}) {
  const [selectedDraft, setSelectedDraft] = useState<string | null>(drafts[0]?.id ?? null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<PublishPlatform[]>([
    "zhihu",
    "baijiahao",
    "wechat",
  ]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  const targetsByDraft = new Map<string, PublishTarget[]>();
  for (const t of targets) {
    const list = targetsByDraft.get(t.draftId) ?? [];
    list.push(t);
    targetsByDraft.set(t.draftId, list);
  }

  async function adapt() {
    if (!selectedDraft || selectedPlatforms.length === 0) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/publish/adapt", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ draftId: selectedDraft, platforms: selectedPlatforms }),
      });
      if (!res.ok) throw new Error(await res.text());
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "改写失败");
    } finally {
      setBusy(false);
    }
  }

  if (drafts.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <Share2 className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm text-slate-500">先生成内容再进行多平台分发。</p>
          <Button asChild variant="primary" className="mt-4">
            <Link href="/tools/generate">
              <Sparkles className="mr-1 h-4 w-4" /> 立即生成
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const activeDraft = drafts.find((d) => d.id === selectedDraft);

  return (
    <div className="space-y-6">
      {activeDraft && (
        <WechatsyncPublishButton
          title={activeDraft.title}
          content={activeDraft.body}
          desc={activeDraft.body.replace(/[#*`>]/g, "").slice(0, 120)}
        />
      )}
      <OverseasAutoPanel drafts={drafts} selectedDraft={selectedDraft} setSelectedDraft={setSelectedDraft} />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">1. 选择要分发的内容</CardTitle>
        </CardHeader>
        <CardContent>
          <select
            value={selectedDraft ?? ""}
            onChange={(e) => setSelectedDraft(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
            {drafts.map((d) => (
              <option key={d.id} value={d.id}>
                [{d.format.toUpperCase()}] {d.title} · {new Date(d.createdAt).toLocaleDateString("zh-CN")}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">2. 选择目标平台</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {ALL_PLATFORMS.map((p) => {
              const on = selectedPlatforms.includes(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() =>
                    setSelectedPlatforms((s) => (s.includes(p.id) ? s.filter((x) => x !== p.id) : [...s, p.id]))
                  }
                  className={`rounded-lg border p-3 text-left text-xs transition-colors ${
                    on
                      ? "border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-950"
                      : "border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="font-medium">{p.name}</div>
                  <div className="mt-1 text-[10px] text-slate-500">{p.bodyTarget[0]}–{p.bodyTarget[1]} 字</div>
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex gap-3">
            <Button onClick={adapt} disabled={busy || !selectedDraft || selectedPlatforms.length === 0} variant="primary">
              {busy ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 改写中…
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> 为 <span className="num mx-1">{selectedPlatforms.length}</span> 个平台改写
                </>
              )}
            </Button>
          </div>
          {err && <div className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-950 dark:text-rose-300">{err}</div>}
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-4 text-lg font-semibold">3. 已改写的发布内容</h2>
        <div className="space-y-3">
          {drafts.map((d) => {
            const list = targetsByDraft.get(d.id) ?? [];
            if (list.length === 0) return null;
            return (
              <Card key={d.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{d.title}</CardTitle>
                  <div className="text-xs text-slate-500">{list.length} 个平台已改写</div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {list.map((t) => <TargetRow key={t.id} target={t} />)}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function OverseasAutoPanel({
  drafts,
  selectedDraft,
  setSelectedDraft,
}: {
  drafts: ContentDraft[];
  selectedDraft: string | null;
  setSelectedDraft: (id: string | null) => void;
}) {
  const router = useRouter();
  const [platforms, setPlatforms] = useState<string[]>(["devto", "hashnode", "medium"]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Array<{ platform: string; ok: boolean; url?: string; error?: string }> | null>(null);

  async function autoPub() {
    if (!selectedDraft || platforms.length === 0) return;
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch("/api/publish/auto", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ draftId: selectedDraft, platforms, publish: true }),
      });
      const data = await res.json();
      setResult(data.results);
      router.refresh();
    } catch (e) {
      setResult([{ platform: "all", ok: false, error: e instanceof Error ? e.message : "失败" }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 dark:border-emerald-900 dark:from-emerald-950 dark:to-teal-950">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-emerald-600" />
            🌍 海外平台一键自动发布（真实 API）
          </span>
          <Link href="/dashboard/integrations" className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
            <Plug className="h-3 w-3" /> 配置 API token
          </Link>
        </CardTitle>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          已对接 Dev.to / Hashnode / Medium 真实 API。先在「海外平台 API」配置 token 后，可直接一键发布。
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">选择 draft</label>
          <select
            value={selectedDraft ?? ""}
            onChange={(e) => setSelectedDraft(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
            {drafts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title} · {d.format.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">目标平台</label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "devto", label: "Dev.to" },
              { id: "hashnode", label: "Hashnode" },
              { id: "medium", label: "Medium" },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPlatforms((s) => (s.includes(p.id) ? s.filter((x) => x !== p.id) : [...s, p.id]))}
                className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${
                  platforms.includes(p.id)
                    ? "border-emerald-500 bg-emerald-100 dark:border-emerald-400 dark:bg-emerald-900"
                    : "border-slate-200 dark:border-slate-700"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <Button
          onClick={autoPub}
          disabled={busy || !selectedDraft || platforms.length === 0}
          variant="primary"
          size="lg"
          className="w-full bg-emerald-600 hover:bg-emerald-700"
        >
          {busy ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 自动发布中…</>
          ) : (
            <><Rocket className="mr-2 h-4 w-4" /> 一键自动发布到 {platforms.length} 个平台</>
          )}
        </Button>
        {result && (
          <div className="space-y-1.5">
            {result.map((r) => (
              <div
                key={r.platform}
                className={`rounded-lg border px-3 py-2 text-xs ${
                  r.ok
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
                    : "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200"
                }`}
              >
                <span className="font-semibold">{r.platform}: </span>
                {r.ok ? (
                  <>
                    ✅ 已发布 ·{" "}
                    <a href={r.url} target="_blank" rel="noreferrer" className="underline">
                      {r.url} <ExternalLink className="inline h-3 w-3" />
                    </a>
                  </>
                ) : (
                  <>❌ {r.error}</>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TargetRow({ target }: { target: PublishTarget }) {
  const [expanded, setExpanded] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState(target.publishedUrl ?? "");
  const [saving, setSaving] = useState(false);
  const spec = PLATFORM_SPECS[target.platform as PublishPlatform];
  const router = useRouter();
  const tags = (() => {
    try {
      return JSON.parse(target.tags ?? "[]") as string[];
    } catch {
      return [];
    }
  })();

  async function copyAll() {
    const text = `${target.title}\n\n${target.body}${tags.length ? "\n\n" + tags.map((t) => "#" + t).join(" ") : ""}`;
    await navigator.clipboard.writeText(text);
  }

  async function markPublished() {
    if (!publishedUrl.trim()) return;
    setSaving(true);
    try {
      await fetch(`/api/publish/${target.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: "published", publishedUrl }),
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Badge variant="primary">{spec?.name ?? target.platform}</Badge>
          <span className="font-medium text-sm">{target.title}</span>
          {target.status === "published" ? (
            <Badge variant="success">
              <CheckCircle2 className="mr-1 h-3 w-3" /> 已发布
            </Badge>
          ) : (
            <Badge variant="warning">待发布</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={copyAll}>
            <Copy className="mr-1 h-3 w-3" /> 复制
          </Button>
          <Button asChild size="sm" variant="primary">
            <a href={spec?.editorUrl ?? "#"} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-1 h-3 w-3" /> 打开编辑器
            </a>
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
        </div>
      </div>
      {expanded && (
        <div className="border-t border-slate-100 px-4 py-4 dark:border-slate-800">
          {target.excerpt && (
            <div className="mb-3">
              <div className="text-xs font-medium text-slate-500">摘要</div>
              <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{target.excerpt}</p>
            </div>
          )}
          <div className="mb-3">
            <div className="text-xs font-medium text-slate-500">正文</div>
            <pre className="mt-1 max-h-72 overflow-auto whitespace-pre-wrap rounded-md bg-slate-50 p-3 text-xs dark:bg-slate-800">
              {target.body}
            </pre>
          </div>
          {tags.length > 0 && (
            <div className="mb-3">
              <div className="text-xs font-medium text-slate-500">标签</div>
              <div className="mt-1 flex flex-wrap gap-1">
                {tags.map((t) => (
                  <Badge key={t} variant="outline">
                    #{t}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          <div className="mt-4 flex items-end gap-2">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-slate-500">发布后的 URL（用于追踪）</label>
              <Input
                value={publishedUrl}
                onChange={(e) => setPublishedUrl(e.target.value)}
                placeholder="https://zhuanlan.zhihu.com/p/xxx"
              />
            </div>
            <Button onClick={markPublished} disabled={saving || !publishedUrl} variant="primary">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "标记已发布"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
