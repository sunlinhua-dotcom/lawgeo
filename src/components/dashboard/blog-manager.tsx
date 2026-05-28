"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Sparkles,
  Plus,
  User,
  ExternalLink,
  Trash2,
  Eye,
  FileText,
  Rocket,
  BookOpen,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Author, BlogPost, BulkJob } from "@/lib/db/schema";

interface IndustryLite {
  slug: string;
  name: string;
  pillars: ReadonlyArray<{ slug: string; name: string; description: string }>;
}

export function BlogManager({
  industries,
  authors: initialAuthors,
  posts: initialPosts,
  jobs: initialJobs,
}: {
  industries: IndustryLite[];
  authors: Author[];
  posts: BlogPost[];
  jobs: BulkJob[];
}) {
  const router = useRouter();
  const [authors, setAuthors] = useState(initialAuthors);
  const [posts, setPosts] = useState(initialPosts);
  const [jobs, setJobs] = useState(initialJobs);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  // 轮询 active job 进度
  useEffect(() => {
    if (!activeJobId) return;
    const t = setInterval(async () => {
      try {
        const r = await fetch(`/api/posts/jobs/${activeJobId}`);
        if (!r.ok) return;
        const d = await r.json();
        setJobs((js) => js.map((j) => (j.id === activeJobId ? { ...j, ...d.job } : j)));
        if (d.job.status === "done" || d.job.status === "failed") {
          setActiveJobId(null);
          // 刷新文章列表
          const pr = await fetch("/api/posts");
          if (pr.ok) {
            const pd = await pr.json();
            setPosts(pd.posts ?? []);
          }
          router.refresh();
        }
      } catch {}
    }, 3000);
    return () => clearInterval(t);
  }, [activeJobId, router]);

  return (
    <div className="space-y-6">
      <BulkGenerator
        industries={industries}
        authors={authors}
        onAuthorCreated={(a) => setAuthors((all) => [a, ...all])}
        onJobStarted={(job) => {
          setJobs((js) => [job, ...js]);
          setActiveJobId(job.id);
        }}
      />

      {jobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">📋 批量任务历史</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {jobs.map((j) => {
                const ind = industries.find((i) => i.slug === j.industry);
                const pct = j.totalCount > 0 ? Math.round((j.completedCount / j.totalCount) * 100) : 0;
                return (
                  <div key={j.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            j.status === "done"
                              ? "success"
                              : j.status === "running"
                                ? "primary"
                                : j.status === "failed"
                                  ? "default"
                                  : "outline"
                          }
                        >
                          {j.status === "running" ? (
                            <>
                              <Loader2 className="mr-1 h-3 w-3 animate-spin" /> 运行中
                            </>
                          ) : j.status === "done" ? (
                            <>
                              <CheckCircle2 className="mr-1 h-3 w-3" /> 已完成
                            </>
                          ) : (
                            j.status
                          )}
                        </Badge>
                        <Badge variant="outline">{ind?.name ?? j.industry}</Badge>
                        <span className="text-slate-500">{new Date(j.createdAt).toLocaleString("zh-CN")}</span>
                      </div>
                      <div className="text-xs text-slate-500">
                        <span className="num">{j.completedCount}</span> / <span className="num">{j.totalCount}</span> 篇
                        {j.failedCount > 0 && <span className="ml-1 text-rose-500">（失败 <span className="num">{j.failedCount}</span>）</span>}
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className={`h-full transition-all ${j.status === "done" ? "bg-emerald-500" : "bg-indigo-500"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">📝 已生成文章（最近 200 篇）</CardTitle>
          <Link
            href="/i"
            className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline"
          >
            <BookOpen className="h-3 w-3" /> 浏览公开行业博客
          </Link>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-500">
              <FileText className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3">还没有文章。填上面的表单一键生成。</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2 text-left">标题</th>
                    <th className="px-3 py-2 text-left">行业</th>
                    <th className="px-3 py-2 text-left">状态</th>
                    <th className="px-3 py-2 text-right">字数</th>
                    <th className="px-3 py-2 text-right">浏览</th>
                    <th className="px-3 py-2 text-right">日期</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {posts.slice(0, 200).map((p) => {
                    const ind = industries.find((i) => i.slug === p.industry);
                    return (
                      <tr key={p.id} className="border-t border-slate-100 dark:border-slate-800">
                        <td className="px-3 py-2 font-medium max-w-md truncate">{p.title}</td>
                        <td className="px-3 py-2 text-xs">{ind?.name ?? p.industry}</td>
                        <td className="px-3 py-2">
                          <Badge variant={p.status === "published" ? "success" : "outline"}>
                            {p.status === "published" ? "已发布" : "草稿"}
                          </Badge>
                        </td>
                        <td className="px-3 py-2 text-right num">{p.wordCount ?? 0}</td>
                        <td className="px-3 py-2 text-right num">{p.viewCount}</td>
                        <td className="px-3 py-2 text-right text-xs text-slate-500">
                          {new Date(p.createdAt).toLocaleDateString("zh-CN")}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {p.status === "published" && (
                            <a
                              href={`/i/${p.industry}/${p.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center text-xs text-indigo-600 hover:underline"
                            >
                              <Eye className="h-3 w-3" />
                            </a>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="ml-1 text-rose-600"
                            onClick={async () => {
                              if (!confirm("删除该文章？")) return;
                              await fetch("/api/posts", {
                                method: "DELETE",
                                headers: { "content-type": "application/json" },
                                body: JSON.stringify({ id: p.id }),
                              });
                              setPosts((ps) => ps.filter((x) => x.id !== p.id));
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function BulkGenerator({
  industries,
  authors,
  onAuthorCreated,
  onJobStarted,
}: {
  industries: IndustryLite[];
  authors: Author[];
  onAuthorCreated: (a: Author) => void;
  onJobStarted: (j: BulkJob) => void;
}) {
  const [industry, setIndustry] = useState(industries[0]?.slug ?? "");
  const [pillarSlug, setPillarSlug] = useState("");
  const [authorId, setAuthorId] = useState<string>(authors[0]?.id ?? "");
  const [keywordsText, setKeywordsText] = useState("");
  const [perKeyword, setPerKeyword] = useState(1);
  const [autoPublish, setAutoPublish] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [showNewAuthor, setShowNewAuthor] = useState(false);
  const [newAuthor, setNewAuthor] = useState({ name: "", title: "", bio: "" });
  const [creatingAuthor, setCreatingAuthor] = useState(false);

  const currIndustry = industries.find((i) => i.slug === industry);
  const keywords = keywordsText
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const total = keywords.length * perKeyword;

  async function createAuthor() {
    if (!newAuthor.name.trim()) return;
    setCreatingAuthor(true);
    try {
      const res = await fetch("/api/authors", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: newAuthor.name,
          title: newAuthor.title || undefined,
          bio: newAuthor.bio || undefined,
          industry,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        const a: Author = {
          id: data.id,
          userId: "",
          name: newAuthor.name,
          slug: newAuthor.name,
          title: newAuthor.title || null,
          bio: newAuthor.bio || null,
          expertise: null,
          avatarUrl: null,
          industry,
          socialLinks: null,
          createdAt: new Date(),
        };
        onAuthorCreated(a);
        setAuthorId(data.id);
        setShowNewAuthor(false);
        setNewAuthor({ name: "", title: "", bio: "" });
      }
    } finally {
      setCreatingAuthor(false);
    }
  }

  async function startBulk() {
    if (!keywords.length || !industry) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/posts/bulk-generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          industry,
          authorId: authorId || undefined,
          keywords,
          perKeyword,
          autoPublish,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "启动失败");
      onJobStarted({
        id: data.jobId,
        userId: "",
        industry,
        authorId: authorId || null,
        keywords: JSON.stringify(keywords),
        perKeyword,
        totalCount: data.totalCount,
        completedCount: 0,
        failedCount: 0,
        autoPublish,
        status: "queued",
        error: null,
        startedAt: null,
        finishedAt: null,
        createdAt: new Date(),
      });
      setKeywordsText("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "启动失败");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="border-indigo-300 bg-gradient-to-br from-indigo-50 to-violet-50 dark:border-indigo-800 dark:from-indigo-950 dark:to-violet-950">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Rocket className="h-5 w-5 text-indigo-600" />
          一键批量生成 GEO 友好文章
        </CardTitle>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          填作者名字 + 关键词 → AI 按 GEO 标准批量产出 → 自动发到对应行业博客
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">行业 *</label>
            <select
              value={industry}
              onChange={(e) => {
                setIndustry(e.target.value);
                setPillarSlug("");
              }}
              className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              {industries.map((i) => (
                <option key={i.slug} value={i.slug}>{i.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">支柱主题（可选）</label>
            <select
              value={pillarSlug}
              onChange={(e) => setPillarSlug(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="">— 不限 —</option>
              {currIndustry?.pillars.map((p) => (
                <option key={p.slug} value={p.slug}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">作者署名 *</label>
            <div className="flex gap-1">
              <select
                value={authorId}
                onChange={(e) => setAuthorId(e.target.value)}
                className="flex h-10 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
              >
                <option value="">— 编辑部 —</option>
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}{a.title ? ` · ${a.title}` : ""}
                  </option>
                ))}
              </select>
              <Button size="sm" variant="outline" onClick={() => setShowNewAuthor(!showNewAuthor)}>
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        {showNewAuthor && (
          <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-2 text-xs font-medium text-slate-600">
              <User className="mr-1 inline h-3 w-3" /> 快速新建作者
            </div>
            <div className="grid gap-2 md:grid-cols-3">
              <Input
                placeholder="姓名 *"
                value={newAuthor.name}
                onChange={(e) => setNewAuthor({ ...newAuthor, name: e.target.value })}
              />
              <Input
                placeholder="头衔，如：资深合伙人律师"
                value={newAuthor.title}
                onChange={(e) => setNewAuthor({ ...newAuthor, title: e.target.value })}
              />
              <Input
                placeholder="简介（可选）"
                value={newAuthor.bio}
                onChange={(e) => setNewAuthor({ ...newAuthor, bio: e.target.value })}
              />
            </div>
            <Button onClick={createAuthor} disabled={creatingAuthor || !newAuthor.name} size="sm" variant="primary" className="mt-2">
              {creatingAuthor ? <Loader2 className="h-3 w-3 animate-spin" /> : "保存作者"}
            </Button>
          </div>
        )}

        <div>
          <label className="mb-1 flex justify-between text-xs font-medium text-slate-600">
            <span>关键词清单（每行一个，最多 100 个）*</span>
            <span className="text-slate-400">
              当前 <span className="num">{keywords.length}</span> 个
            </span>
          </label>
          <Textarea
            rows={8}
            value={keywordsText}
            onChange={(e) => setKeywordsText(e.target.value)}
            placeholder={"上海离婚律师怎么收费\n上海离婚案件多久能结案\n离婚财产分割原则\n抚养权归属判定标准\n..."}
            className="font-mono text-sm"
          />
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">每个关键词生成几篇</label>
            <select
              value={perKeyword}
              onChange={(e) => setPerKeyword(Number(e.target.value))}
              className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <option value={1}>1 篇 / 关键词</option>
              <option value={2}>2 篇 / 关键词（不同角度）</option>
              <option value={3}>3 篇 / 关键词</option>
            </select>
          </div>
          <div className="flex items-center pt-5">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoPublish}
                onChange={(e) => setAutoPublish(e.target.checked)}
                className="accent-indigo-600"
              />
              <span>自动发布（关闭则只存草稿）</span>
            </label>
          </div>
          <div className="pt-5 text-right text-sm">
            预计生成 <span className="num text-lg font-semibold text-indigo-600">{total}</span> 篇
            <div className="text-[10px] text-slate-500 mt-0.5">每篇约 1500-2500 字，约 30-60 秒</div>
          </div>
        </div>

        <Button
          onClick={startBulk}
          disabled={busy || total === 0 || total > 100}
          variant="primary"
          size="lg"
          className="w-full"
        >
          {busy ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 启动任务…</>
          ) : (
            <><Sparkles className="mr-2 h-4 w-4" /> 启动批量生成（{total} 篇）</>
          )}
        </Button>

        {total > 100 && (
          <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200">
            ⚠️ 单批最多 100 篇，请减少关键词或每词篇数
          </div>
        )}
        {err && <div className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-950 dark:text-rose-300">{err}</div>}
      </CardContent>
    </Card>
  );
}
