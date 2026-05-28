"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, Trash2, Pencil, Building2, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import type { Project } from "@/lib/db/schema";

const INDUSTRIES = [
  { value: "lawyer", label: "律所 / 法律服务" },
  { value: "sme", label: "中小企业 / 专业服务" },
  { value: "b2b", label: "B2B / 制造业" },
  { value: "local", label: "本地生活 / 医美 / 教育" },
  { value: "education", label: "教育培训" },
  { value: "other", label: "其他" },
];

export function ProjectsManager({ initialProjects }: { initialProjects: Project[] }) {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects);
  const [showForm, setShowForm] = useState(initialProjects.length === 0);
  const [editing, setEditing] = useState<Project | null>(null);

  return (
    <div>
      {!showForm && (
        <Button onClick={() => setShowForm(true)} variant="primary" className="mb-6">
          <Plus className="mr-1 h-4 w-4" /> 新建项目
        </Button>
      )}

      {showForm && (
        <ProjectForm
          initial={editing}
          onSaved={(p) => {
            if (editing) {
              setProjects((ps) => ps.map((x) => (x.id === p.id ? p : x)));
            } else {
              setProjects((ps) => [p, ...ps]);
            }
            setShowForm(false);
            setEditing(null);
            router.refresh();
          }}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <Card key={p.id} className="lift">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-indigo-600" />
                  {p.name}
                </CardTitle>
                <Badge variant="primary">{INDUSTRIES.find((i) => i.value === p.industry)?.label.split(" ")[0]}</Badge>
              </div>
              <a
                href={`https://${p.domain}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs text-indigo-600 hover:underline"
              >
                <Globe className="h-3 w-3" /> {p.domain}
              </a>
            </CardHeader>
            <CardContent>
              {p.region && <Badge variant="outline" className="mr-1">{p.region}</Badge>}
              {p.description && <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{p.description}</p>}
              <div className="mt-4 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditing(p);
                    setShowForm(true);
                  }}
                >
                  <Pencil className="mr-1 h-3 w-3" /> 编辑
                </Button>
                <DeleteButton id={p.id} onDeleted={() => setProjects((ps) => ps.filter((x) => x.id !== p.id))} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function DeleteButton({ id, onDeleted }: { id: string; onDeleted: () => void }) {
  const [busy, start] = useTransition();
  const router = useRouter();
  return (
    <Button
      size="sm"
      variant="ghost"
      className="text-rose-600"
      disabled={busy}
      onClick={() => {
        if (!confirm("确定删除该项目？关联的关键词与查询记录将一并删除。")) return;
        start(async () => {
          await fetch(`/api/projects/${id}`, { method: "DELETE" });
          onDeleted();
          router.refresh();
        });
      }}
    >
      {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
    </Button>
  );
}

function ProjectForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial: Project | null;
  onSaved: (p: Project) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    domain: initial?.domain ?? "",
    industry: initial?.industry ?? "lawyer",
    region: initial?.region ?? "",
    description: initial?.description ?? "",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const isEdit = !!initial;
      const res = await fetch(isEdit ? `/api/projects/${initial.id}` : "/api/projects", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      onSaved({
        id: initial?.id ?? data.id,
        userId: initial?.userId ?? "",
        createdAt: initial?.createdAt ?? new Date(),
        ...form,
      } as Project);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "保存失败");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-base">{initial ? "编辑项目" : "新建项目"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">项目名 *</label>
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">域名 *</label>
            <Input required value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} placeholder="example.com" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">行业</label>
            <select
              value={form.industry}
              onChange={(e) => setForm({ ...form, industry: e.target.value as Project["industry"] })}
              className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              {INDUSTRIES.map((i) => (
                <option key={i.value} value={i.value}>
                  {i.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">主营区域</label>
            <Input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} placeholder="如：上海" />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium text-slate-600">描述</label>
            <Textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="简述这个项目的业务方向"
            />
          </div>
          {err && (
            <div className="md:col-span-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-950 dark:text-rose-300">{err}</div>
          )}
          <div className="md:col-span-2 flex gap-3">
            <Button type="submit" variant="primary" disabled={busy}>
              {busy ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" />保存中…</> : "保存"}
            </Button>
            <Button type="button" variant="ghost" onClick={onCancel}>取消</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
