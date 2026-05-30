"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { FileUp, Loader2, Trash2, Search, FileText, Sparkles, Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { KnowledgeDoc } from "@/lib/db/schema";

export function KnowledgeManager({ initialDocs }: { initialDocs: KnowledgeDoc[] }) {
  const router = useRouter();
  const [docs, setDocs] = useState(initialDocs);
  const [tab, setTab] = useState<"paste" | "upload" | "qa">("paste");
  const [qaTitle, setQaTitle] = useState("");
  const [qaRaw, setQaRaw] = useState("");
  const [qaBusy, setQaBusy] = useState(false);
  async function submitQa() {
    if (qaRaw.trim().length < 5) return;
    setQaBusy(true);
    try {
      const res = await fetch("/api/knowledge/qa-import", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: qaTitle, raw: qaRaw }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setQaRaw("");
      setQaTitle("");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "导入失败");
    } finally {
      setQaBusy(false);
    }
  }
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Array<{ docId: string; text: string; score: number; docTitle?: string; chunkIdx: number }> | null>(null);
  const [searching, setSearching] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function submitPaste() {
    if (!title.trim() || text.length < 50) {
      setErr("标题或内容缺失（内容至少 50 字）");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title, text }),
      });
      if (!res.ok) throw new Error(await res.text());
      setTitle("");
      setText("");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "保存失败");
    } finally {
      setBusy(false);
    }
  }

  async function submitFile(file: File) {
    setBusy(true);
    setErr(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("title", file.name);
      const res = await fetch("/api/knowledge", { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "上传失败");
    } finally {
      setBusy(false);
    }
  }

  async function search() {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await fetch("/api/knowledge/retrieve", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query, topK: 5 }),
      });
      const data = await res.json();
      setHits(data.hits ?? []);
    } finally {
      setSearching(false);
    }
  }

  async function del(id: string) {
    if (!confirm("删除该文档？所有分块一并删除。")) return;
    await fetch("/api/knowledge", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setDocs((d) => d.filter((x) => x.id !== id));
  }

  const totalChunks = docs.reduce((s, d) => s + d.chunkCount, 0);
  const totalBytes = docs.reduce((s, d) => s + (d.sizeBytes ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* 摘要 */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <div className="text-xs text-slate-500">文档数</div>
            <div className="num mt-1 text-3xl font-semibold">{docs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-xs text-slate-500">分块总数</div>
            <div className="num mt-1 text-3xl font-semibold text-indigo-600">{totalChunks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-xs text-slate-500">总字符数</div>
            <div className="num mt-1 text-3xl font-semibold">{totalBytes.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* 添加文档 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">添加文档</CardTitle>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setTab("paste")}
              className={`rounded-md px-3 py-1 text-xs ${
                tab === "paste" ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "border border-slate-200 dark:border-slate-700"
              }`}
            >
              手动粘贴
            </button>
            <button
              onClick={() => setTab("upload")}
              className={`rounded-md px-3 py-1 text-xs ${
                tab === "upload" ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "border border-slate-200 dark:border-slate-700"
              }`}
            >
              上传文件（.txt / .md）
            </button>
            <button
              onClick={() => setTab("qa")}
              className={`rounded-md px-3 py-1 text-xs ${
                tab === "qa" ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "border border-slate-200 dark:border-slate-700"
              }`}
            >
              QA 批量导入
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {tab === "qa" ? (
            <div className="space-y-3">
              <Input value={qaTitle} onChange={(e) => setQaTitle(e.target.value)} placeholder="文档标题，如「常见问答 FAQ」" />
              <Textarea
                rows={10}
                value={qaRaw}
                onChange={(e) => setQaRaw(e.target.value)}
                placeholder={"从 Excel/CSV 复制粘贴，每行「问题 [Tab或逗号] 答案」：\n离婚律师怎么收费\t一般按标的额 5-10% 风险代理\n抚养权怎么判\t2岁内一般归母亲，8岁以上看孩子意愿"}
                className="font-mono text-sm"
              />
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-500">用 Tab 或逗号分隔问/答，每行一条</div>
                <Button onClick={submitQa} disabled={qaBusy || qaRaw.trim().length < 5} variant="primary">
                  {qaBusy ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}导入问答
                </Button>
              </div>
            </div>
          ) : tab === "paste" ? (
            <div className="space-y-3">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="文档标题，如「律所收费说明 v2」" />
              <Textarea
                rows={10}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="把品牌资料、产品介绍、案例、FAQ 粘贴进来。会自动分块、建立索引。"
                className="font-mono text-sm"
              />
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  当前 <span className="num">{text.length}</span> 字符 · 将分为 ~{Math.max(1, Math.ceil(text.length / 800))} 块
                </div>
                <Button onClick={submitPaste} disabled={busy} variant="primary">
                  {busy ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" />保存中</> : "保存到知识库"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <input
                ref={fileRef}
                type="file"
                accept=".txt,.md,.text,text/plain,text/markdown"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) submitFile(f);
                  e.target.value = "";
                }}
              />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={busy}
                className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-200 p-12 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                {busy ? (
                  <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                ) : (
                  <>
                    <FileUp className="h-10 w-10 text-slate-400" />
                    <div className="text-sm">
                      <span className="font-medium text-indigo-600">点击上传</span>
                      <span className="text-slate-500"> .txt / .md 文件</span>
                    </div>
                    <div className="text-xs text-slate-400">单个文件 ≤ 200KB</div>
                  </>
                )}
              </button>
            </div>
          )}
          {err && <div className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-950 dark:text-rose-300">{err}</div>}
        </CardContent>
      </Card>

      {/* 测试检索 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            <Search className="mr-1 inline h-4 w-4" /> 测试检索（看看 AI 能不能找到对的片段）
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="输入一个问题，如「我们的服务流程是什么」"
              onKeyDown={(e) => e.key === "Enter" && search()}
            />
            <Button onClick={search} disabled={searching || !query} variant="primary">
              {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
          {hits && (
            <div className="mt-4 space-y-2">
              {hits.length === 0 ? (
                <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                  未匹配任何片段。可能是知识库还不够、或问题用词与文档差异较大。
                </div>
              ) : (
                hits.map((h, i) => (
                  <div key={i} className="rounded-lg border border-slate-200 p-3 text-xs dark:border-slate-800">
                    <div className="flex justify-between mb-1">
                      <div className="font-medium">[{i + 1}] {h.docTitle ?? h.docId.slice(0, 6)} · 第 {h.chunkIdx + 1} 块</div>
                      <Badge variant="primary" className="text-[10px]">相似度 <span className="num">{(h.score * 100).toFixed(1)}</span>%</Badge>
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 line-clamp-3">{h.text}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 已有文档 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">已入库文档</CardTitle>
        </CardHeader>
        <CardContent>
          {docs.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              <Database className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3">还没有文档。上传后，AI 生成时会自动引用这些内容作为事实源。</p>
            </div>
          ) : (
            <div className="space-y-2">
              {docs.map((d) => (
                <div key={d.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-indigo-500" />
                    <div>
                      <div className="font-medium text-sm">{d.title}</div>
                      <div className="text-xs text-slate-500">
                        <span className="num">{d.chunkCount}</span> 块 · <span className="num">{d.sizeBytes?.toLocaleString()}</span> 字符 · {d.sourceType}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">{new Date(d.createdAt).toLocaleDateString("zh-CN")}</Badge>
                    <Button size="sm" variant="ghost" className="text-rose-600" onClick={() => del(d.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="rounded-xl bg-indigo-50 p-4 text-sm text-indigo-900 dark:bg-indigo-950 dark:text-indigo-200">
        <Sparkles className="mr-1 inline h-4 w-4" />
        AI 生成内容时（<code>/tools/generate</code>），系统会自动检索知识库的相关片段作为事实依据，让生成的 FAQ / 文章 / HowTo 更具体、更可信、更适合被 AI 引用。
      </div>
    </div>
  );
}
