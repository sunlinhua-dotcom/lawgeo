"use client";
import { useState } from "react";
import { Send, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";

export function ContactForm() {
  const [form, setForm] = useState({ name: "", contact: "", industry: "beauty", message: "" });
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.contact.trim()) return;
    setState("loading");
    setErr(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      setState("done");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "提交失败");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center dark:border-emerald-900 dark:bg-emerald-950">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
        <h3 className="mt-4 text-xl font-semibold text-emerald-900 dark:text-emerald-100">
          已收到，感谢你的留资
        </h3>
        <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-200">我们会在 1 个工作日内联系你。</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">姓名 *</label>
        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">联系方式（微信 / 电话 / 邮箱）*</label>
        <Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} required />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">行业</label>
        <select
          value={form.industry}
          onChange={(e) => setForm({ ...form, industry: e.target.value })}
          className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <option value="beauty">美妆个护 / 化妆品</option>
          <option value="consumer">消费品 / 零售</option>
          <option value="sme">专业服务 / 中小企业</option>
          <option value="lawyer">律师事务所</option>
          <option value="b2b">B2B / 制造业</option>
          <option value="local">本地生活 / 教育</option>
          <option value="other">其他</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">想了解什么</label>
        <Textarea
          rows={4}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="目前的 GEO 现状、希望优化的方向、关注的指标等"
        />
      </div>
      <Button type="submit" size="lg" variant="primary" className="w-full" disabled={state === "loading"}>
        {state === "loading" ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 提交中…
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" /> 提交并预约
          </>
        )}
      </Button>
      {err && <div className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-950 dark:text-rose-300">{err}</div>}
    </form>
  );
}
