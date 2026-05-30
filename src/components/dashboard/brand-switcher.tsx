"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Building2, ChevronDown, Plus, Check, Loader2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Brand } from "@/lib/db/schema";

export function BrandSwitcher({
  brands,
  currentBrandId,
}: {
  brands: Brand[];
  currentBrandId: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const current = brands.find((b) => b.id === currentBrandId) ?? brands[0];

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function switchTo(id: string) {
    await fetch("/api/brands/switch", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ brandId: id }),
    });
    setOpen(false);
    router.refresh();
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
          <Building2 className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">{current?.name ?? "未选择品牌"}</div>
          <div className="truncate text-[10px] text-slate-500">{current?.industry ?? "点击切换 / 新建"}</div>
        </div>
        <ChevronDown className={cn("h-3.5 w-3.5 text-slate-400 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
          {creating ? (
            <CreateBrandForm
              onDone={() => {
                setCreating(false);
                setOpen(false);
                router.refresh();
              }}
              onCancel={() => setCreating(false)}
            />
          ) : (
            <>
              <div className="max-h-64 overflow-y-auto p-1">
                {brands.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => switchTo(b.id)}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Building2 className="h-3.5 w-3.5 text-slate-400" />
                    <span className="flex-1 truncate">{b.name}</span>
                    {b.id === current?.id && <Check className="h-3.5 w-3.5 text-indigo-600" />}
                  </button>
                ))}
                {brands.length === 0 && (
                  <div className="px-2 py-3 text-center text-xs text-slate-400">还没有品牌</div>
                )}
              </div>
              <button
                onClick={() => setCreating(true)}
                className="flex w-full items-center gap-2 border-t border-slate-100 px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 dark:border-slate-800 dark:hover:bg-indigo-950"
              >
                <Plus className="h-3.5 w-3.5" /> 新建品牌
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function CreateBrandForm({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({ name: "", website: "", industry: "" });
  const [busy, setBusy] = useState(false);
  async function submit() {
    if (!form.name.trim()) return;
    setBusy(true);
    try {
      const res = await fetch("/api/brands", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success(`品牌「${form.name}」已创建`);
      onDone();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "创建失败");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-2 p-3">
      <Input placeholder="品牌名 *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} sizing="sm" />
      <Input
        placeholder="官网（可选）"
        leftIcon={<Globe className="h-3 w-3" />}
        value={form.website}
        onChange={(e) => setForm({ ...form, website: e.target.value })}
        sizing="sm"
      />
      <Input placeholder="行业（可选）" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} sizing="sm" />
      <div className="flex gap-2">
        <Button size="sm" variant="primary" className="flex-1" onClick={submit} disabled={busy || !form.name}>
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "创建"}
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          取消
        </Button>
      </div>
    </div>
  );
}
