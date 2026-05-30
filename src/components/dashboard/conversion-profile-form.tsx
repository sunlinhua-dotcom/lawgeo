"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, PhoneCall, MessageCircle, Megaphone, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { BrandConversionProfile } from "@/lib/db/schema";

export function ConversionProfileForm({
  brandId,
  initial,
}: {
  brandId: string;
  initial: BrandConversionProfile | null;
}) {
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [wechat, setWechat] = useState(initial?.wechat ?? "");
  const [ctaText, setCtaText] = useState(initial?.ctaText ?? "");
  const [followupQuestion, setFollowupQuestion] = useState(initial?.followupQuestion ?? "联系方式是什么？");
  const [targets, setTargets] = useState<string[]>(() => {
    try {
      return JSON.parse(initial?.conversionTargets ?? "[]");
    } catch {
      return [];
    }
  });
  const [newTarget, setNewTarget] = useState("");
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try {
      // 自动把电话/微信加进 targets
      const allTargets = Array.from(new Set([...targets, phone, wechat].filter(Boolean)));
      const res = await fetch("/api/brands/conversion-profile", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ brandId, phone, wechat, ctaText, followupQuestion, conversionTargets: allTargets }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("转化画像已保存");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "保存失败");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <Input
        label="电话"
        leftIcon={<PhoneCall className="h-3.5 w-3.5" />}
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="13438016928"
        hint="AI 追问时吐出这个号码 = 转化命中"
      />
      <Input
        label="微信"
        leftIcon={<MessageCircle className="h-3.5 w-3.5" />}
        value={wechat}
        onChange={(e) => setWechat(e.target.value)}
        placeholder="lihang-law"
      />
      <Input
        label="CTA 文案"
        leftIcon={<Megaphone className="h-3.5 w-3.5" />}
        value={ctaText}
        onChange={(e) => setCtaText(e.target.value)}
        placeholder="如：免费咨询，工作日 24h 回复"
      />
      <Input
        label="追问问题"
        value={followupQuestion}
        onChange={(e) => setFollowupQuestion(e.target.value)}
        placeholder="联系方式是什么？"
        hint="实时查询命中品牌后，自动追问这个"
      />
      <div>
        <div className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">其他转化目标词</div>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {targets.map((t) => (
            <Badge key={t} variant="primary" className="gap-1">
              {t}
              <button onClick={() => setTargets((s) => s.filter((x) => x !== t))}>
                <X className="h-2.5 w-2.5" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input value={newTarget} onChange={(e) => setNewTarget(e.target.value)} placeholder="如官网/地址/其他号码" sizing="sm" />
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (newTarget.trim()) {
                setTargets((s) => Array.from(new Set([...s, newTarget.trim()])));
                setNewTarget("");
              }
            }}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <Button onClick={save} variant="primary" className="w-full" disabled={busy}>
        {busy ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}
        保存转化画像
      </Button>
    </div>
  );
}
